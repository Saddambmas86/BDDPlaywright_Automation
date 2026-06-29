import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { TestRunRequest, TestRunStatus, ExecutionHistoryItem } from '../../shared/types';
import { HistoryStore } from './historyStore';
import { scanFeatures } from './featuresParser';
import { sendNotifications } from './notifications';

export class TestExecutor {
  private static queue: TestRunRequest[] = [];
  private static currentRun: TestRunStatus = { status: 'idle', progress: 0, completedScenarios: 0, totalScenarios: 0 };
  private static activeProcess: ChildProcess | null = null;
  private static broadcastCallback: ((data: any) => void) | null = null;
  private static logBuffer: string = '';
  private static activeRunRequest: TestRunRequest | null = null;
  private static timer: NodeJS.Timeout | null = null;

  /**
   * Set callback for WebSocket broadcasting
   */
  static setBroadcastCallback(callback: (data: any) => void): void {
    this.broadcastCallback = callback;
  }

  /**
   * Get current execution status
   */
  static getStatus(): { current: TestRunStatus; queue: TestRunRequest[] } {
    return {
      current: this.currentRun,
      queue: this.queue
    };
  }

  /**
   * Add execution request to the queue
   */
  static enqueue(request: TestRunRequest): void {
    this.queue.push(request);
    this.broadcast({ type: 'queue_update', queue: this.queue });
    
    if (this.currentRun.status === 'idle') {
      this.processNext();
    } else {
      // If idle or queued, update client
      this.updateStatus({ status: 'queued' });
    }
  }

  /**
   * Stop currently running execution
   */
  static stopActiveRun(): boolean {
    if (this.activeProcess) {
      // On Windows, child process spawning with shell: true creates a cmd wrapper.
      // We may need to kill the process tree. A taskkill is standard on Windows.
      const pid = this.activeProcess.pid;
      if (pid) {
        try {
          spawn('taskkill', ['/pid', pid.toString(), '/f', '/t'], { shell: true });
          this.log(`\n🛑 Test execution manually cancelled by user.\n`);
          this.updateStatus({ status: 'idle', progress: 0 });
          this.activeProcess = null;
          this.activeRunRequest = null;
          if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
          }
          this.processNext();
          return true;
        } catch (e) {
          console.error('Failed to kill process tree:', e);
        }
      }
      
      // Fallback
      let killed = false;
      if (this.activeProcess) {
        killed = this.activeProcess.kill('SIGKILL');
        this.activeProcess = null;
      }
      this.activeRunRequest = null;
      this.updateStatus({ status: 'idle', progress: 0 });
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      this.processNext();
      return killed;
    }
    return false;
  }

  /**
   * Broadcast state update over WebSocket
   */
  private static broadcast(data: any): void {
    if (this.broadcastCallback) {
      this.broadcastCallback(data);
    }
  }

  /**
   * Update running status and broadcast to clients
   */
  private static updateStatus(updates: Partial<TestRunStatus>): void {
    this.currentRun = { ...this.currentRun, ...updates };
    this.broadcast({ type: 'status_update', status: this.currentRun });
  }

  /**
   * Log line in active execution
   */
  private static log(line: string): void {
    this.logBuffer += line;
    this.broadcast({ type: 'log', data: line });
  }

  /**
   * Process next item in the queue
   */
  private static async processNext(): Promise<void> {
    if (this.queue.length === 0) {
      this.updateStatus({ status: 'idle', progress: 0, currentFeature: undefined, currentScenario: undefined, currentStep: undefined });
      return;
    }

    const request = this.queue.shift()!;
    this.activeRunRequest = request;
    this.broadcast({ type: 'queue_update', queue: this.queue });

    const runId = `run_${Date.now()}`;
    this.logBuffer = '';

    const settings = HistoryStore.getSettings();
    const projectRoot = settings.frameworkPath;

    // Estimate total scenarios
    const totalScenarios = this.estimateTotalScenarios(request, projectRoot);

    this.updateStatus({
      status: 'running',
      progress: 0,
      completedScenarios: 0,
      totalScenarios,
      runId,
      startTime: Date.now(),
      elapsed: 0,
      currentFeature: 'Initializing...',
      currentScenario: '',
      currentStep: ''
    });

    this.log(`🚀 Starting Test Execution: Run ID ${runId}\n`);
    this.log(`📅 Date: ${new Date().toLocaleString()}\n`);
    this.log(`🖥️ Browser: ${request.browser.toUpperCase()} | Env: ${request.environment.toUpperCase()} | Headless: ${request.headless}\n`);
    this.log(`🔧 Suite: ${request.suiteType.toUpperCase()} ${request.targetValue ? `(${request.targetValue})` : ''}\n`);
    this.log(`----------------------------------------------------------------------\n\n`);

    // Prepare commands and args
    let command = 'npx';
    let args: string[] = ['cucumber-js'];

    // Map suite parameters to Cucumber command args
    if (request.suiteType === 'smoke') {
      args.push('--tags', '@smoke');
    } else if (request.suiteType === 'regression') {
      args.push('--tags', '@regression');
    } else if (request.suiteType === 'sanity') {
      args.push('--tags', '@sanity');
    } else if (request.suiteType === 'critical') {
      args.push('--tags', '@critical');
    } else if (request.suiteType === 'tag' && request.targetValue) {
      args.push('--tags', request.targetValue);
    } else if (request.suiteType === 'feature' && request.targetValue) {
      args.push(request.targetValue);
    } else if (request.suiteType === 'scenario' && request.targetValue) {
      // For scenario execution, find the feature file AND use --name flag together
      const featureFile = this.findFeatureFileForScenario(request.targetValue, projectRoot);
      if (featureFile) {
        // Execute specific feature file with --name filter
        args.push(featureFile);
        args.push('--name', request.targetValue);
        this.log(`  ℹ️  Found scenario in: ${featureFile}\n`);
        this.log(`  ℹ️  Executing with feature file + name filter for precise matching\n`);
        this.log(`  💡 This ensures only the selected scenario runs\n\n`);
      } else {
        // Fallback to --name only if feature file not found
        args.push('--name', request.targetValue);
        this.log(`  ⚠️  Could not find feature file, using --name only\n`);
        this.log(`  ℹ️  Looking for scenario: "${request.targetValue}"\n\n`);
      }
    } else if (request.suiteType === 'custom' && request.targetValue) {
      // Split custom command
      const customParts = request.targetValue.split(/\s+/);
      if (customParts[0] === 'npm' || customParts[0] === 'npx' || customParts[0] === 'node') {
        command = customParts[0];
        args = customParts.slice(1);
      } else {
        // e.g. "cucumber-js --tags @foo"
        command = 'npx';
        args = customParts;
      }
    }

    // Parallel options
    if (request.parallel && request.workers > 1) {
      args.push('--parallel', request.workers.toString());
    }

    // Retries
    if (request.retries > 0) {
      args.push('--retry', request.retries.toString());
    }

    // Timeout
    if (request.timeout) {
      // Pass via CLI or custom env
    }

    // Setup Environment Variables
    const runEnv = {
      ...process.env,
      NODE_ENV: request.environment,
      BROWSER: request.browser,
      HEADLESS: request.headless.toString(),
      SLOW_MO: request.slowMo.toString(),
      TIMEOUT: request.timeout.toString()
    };

    // Clean Allure results before execution
    this.log(`🧹 Cleaning previous Allure results...\n`);
    await this.cleanAllureResults(projectRoot);

    // Build command string with proper quoting for display
    const cmdString = `${command} ${args.map(arg => arg.includes(' ') ? `"${arg}"` : arg).join(' ')}`;
    this.log(`👉 Running Command: ${cmdString}\n`);
    this.log(`📂 Working Directory: ${projectRoot}\n`);
    this.log(`🔧 Environment: NODE_ENV=${request.environment}, BROWSER=${request.browser}, HEADLESS=${request.headless}\n\n`);

    const startTime = Date.now();

    // Start timer for duration/ETA tracking
    this.timer = setInterval(() => {
      if (this.currentRun.status === 'running' && this.currentRun.startTime) {
        const elapsed = Math.floor((Date.now() - this.currentRun.startTime) / 1000);
        
        let eta: number | undefined;
        if (this.currentRun.completedScenarios > 0 && this.currentRun.totalScenarios > this.currentRun.completedScenarios) {
          const avgTimePerScenario = elapsed / this.currentRun.completedScenarios;
          const remainingScenarios = this.currentRun.totalScenarios - this.currentRun.completedScenarios;
          eta = Math.floor(avgTimePerScenario * remainingScenarios);
        }

        this.updateStatus({ elapsed, eta });
      }
    }, 1000);

    // Spawn process
    try {
      this.activeProcess = spawn(command, args, {
        cwd: projectRoot,
        env: runEnv,
        shell: true // Required for Windows npx/npm
      });

      let lineRemainder = '';

      this.activeProcess.stdout?.on('data', (data) => {
        const text = data.toString();
        this.log(text);

        // Process line-by-line for progress parsing
        const chunk = lineRemainder + text;
        const lines = chunk.split(/\r?\n/);
        lineRemainder = lines.pop() || '';

        lines.forEach(line => this.parseLogLineForProgress(line));
      });

      this.activeProcess.stderr?.on('data', (data) => {
        const text = data.toString();
        this.log(`⚠️ stderr: ${text}`);
      });

      this.activeProcess.on('close', async (code) => {
        if (this.timer) {
          clearInterval(this.timer);
          this.timer = null;
        }

        this.log(`\n----------------------------------------------------------------------\n`);
        this.log(`🏁 Command completed with code ${code}\n`);

        const duration = Date.now() - startTime;
        this.log(`⏱️ Duration: ${(duration / 1000).toFixed(2)} seconds\n`);

        // Post-execution: Convert and Generate Allure Reports
        this.log(`📊 Processing test reports...\n`);
        await this.postExecutionReportGeneration(projectRoot);

        // Parse Results from JSON report
        const metrics = this.parseExecutionMetrics(projectRoot);
        
        let result: 'passed' | 'failed' | 'broken' = 'passed';
        if (code !== 0 && code !== null) {
          result = 'failed';
        }
        if (metrics.failed > 0) {
          result = 'failed';
        }
        if (code === null) {
          result = 'broken'; // Manually cancelled
        }

        this.log(`\n✅ Results parsed: Total: ${metrics.total}, Passed: ${metrics.passed}, Failed: ${metrics.failed}, Skipped: ${metrics.skipped}\n`);

        const hasScreenshots = fs.existsSync(path.join(projectRoot, 'reports/screenshots')) && 
                              fs.readdirSync(path.join(projectRoot, 'reports/screenshots')).length > 0;
        const hasVideos = fs.existsSync(path.join(projectRoot, 'reports/videos')) && 
                          fs.readdirSync(path.join(projectRoot, 'reports/videos')).length > 0;

        const historyItem: ExecutionHistoryItem = {
          id: runId,
          timestamp: new Date().toISOString(),
          duration,
          environment: request.environment,
          browser: request.browser,
          suiteType: request.suiteType,
          targetValue: request.targetValue,
          result,
          metrics,
          command: cmdString,
          executedBy: 'Admin', // Default
          reportPath: '/reports/cucumber-report.html',
          allurePath: '/allure-report/index.html',
          logsPath: `/api/logs/${runId}`,
          hasScreenshots,
          hasVideos,
          hasTraces: false
        };

        // Write log and history
        HistoryStore.writeLog(runId, this.logBuffer);
        HistoryStore.addHistoryItem(historyItem);

        this.log(`📁 Saved execution history item and console logs.\n`);

        // Trigger Notifications
        try {
          await sendNotifications(historyItem, settings);
        } catch (err) {
          console.error('Notification error:', err);
        }

        // Clean up
        this.activeProcess = null;
        this.activeRunRequest = null;
        this.updateStatus({ status: 'idle', progress: 100 });
        
        // Run next queued test
        this.processNext();
      });

    } catch (err) {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      this.log(`❌ Failed to spawn process: ${(err as Error).message}\n`);
      this.updateStatus({ status: 'idle', progress: 0 });
      this.activeProcess = null;
      this.activeRunRequest = null;
      this.processNext();
    }
  }

  /**
   * Parse stdout lines in real-time to track current running scenario
   */
  private static parseLogLineForProgress(line: string): void {
    const trimmed = line.trim();
    
    // Check scenario indicators from hooks.ts: "📋 Scenario: Login with User"
    if (trimmed.includes('📋 Scenario:')) {
      const parts = trimmed.split('📋 Scenario:');
      const scenarioName = parts[1]?.trim() || 'Unknown';
      this.updateStatus({ currentScenario: scenarioName, currentStep: 'Running hooks...' });
    }
    // Check scenario completion result from hooks.ts: "📊 Scenario Result: PASSED" or "📊 Scenario Result: FAILED"
    else if (trimmed.includes('📊 Scenario Result:')) {
      const parts = trimmed.split('📊 Scenario Result:');
      const status = parts[1]?.trim() || '';
      
      const completed = this.currentRun.completedScenarios + 1;
      const total = Math.max(completed, this.currentRun.totalScenarios);
      const progress = Math.min(Math.round((completed / total) * 100), 99);

      this.updateStatus({
        completedScenarios: completed,
        totalScenarios: total,
        progress,
        currentStep: `Finished scenario: ${status}`
      });
    }
    // Check feature name indicators: "Feature: Login Feature" or similar
    else if (trimmed.startsWith('Feature:')) {
      const featureName = trimmed.substring(8).trim();
      this.updateStatus({ currentFeature: featureName });
    }
    // Check generic step indicators in cucumber-js logs
    else if (trimmed.match(/^(Given|When|Then|And|But)\s+/)) {
      this.updateStatus({ currentStep: trimmed });
    }
  }

  /**
   * Find the feature file that contains a specific scenario
   */
  private static findFeatureFileForScenario(scenarioName: string, projectRoot: string): string | null {
    try {
      const features = scanFeatures(projectRoot);
      for (const feature of features) {
        for (const scenario of feature.scenarios) {
          if (scenario.name === scenarioName) {
            // Return the full path to the feature file
            return path.join(projectRoot, feature.file);
          }
        }
      }
    } catch (e) {
      console.error('Error finding feature file for scenario:', e);
    }
    return null;
  }

  /**
   * Pre-calculate the total number of scenarios matching the target filter
   */
  private static estimateTotalScenarios(request: TestRunRequest, projectRoot: string): number {
    try {
      const features = scanFeatures(projectRoot);
      if (request.suiteType === 'all' || request.suiteType === 'custom') {
        return features.reduce((sum, f) => sum + f.scenarioCount, 0);
      }
      if (request.suiteType === 'feature' && request.targetValue) {
        const relativeTarget = request.targetValue.replace(/\\/g, '/');
        const match = features.find(f => f.file === relativeTarget);
        return match ? match.scenarioCount : 0;
      }
      if (request.suiteType === 'scenario' && request.targetValue) {
        return 1;
      }
      if (request.suiteType === 'smoke' || request.suiteType === 'regression' || request.suiteType === 'sanity' || request.suiteType === 'critical' || request.suiteType === 'tag') {
        let tagFilter = '';
        if (request.suiteType === 'smoke') tagFilter = '@smoke';
        else if (request.suiteType === 'regression') tagFilter = '@regression';
        else if (request.suiteType === 'sanity') tagFilter = '@sanity';
        else if (request.suiteType === 'critical') tagFilter = '@critical';
        else tagFilter = request.targetValue || '';

        if (!tagFilter) return features.reduce((sum, f) => sum + f.scenarioCount, 0);

        let count = 0;
        features.forEach(feature => {
          const featureHasTag = feature.tags.includes(tagFilter);
          feature.scenarios.forEach(scen => {
            if (featureHasTag || scen.tags.includes(tagFilter)) {
              count++;
            }
          });
        });
        return count;
      }
    } catch (e) {
      console.error('Error estimating scenario count:', e);
    }
    return 10; // Default estimate
  }

  /**
   * Clean Allure results directory before test execution
   */
  private static async cleanAllureResults(projectRoot: string): Promise<void> {
    const allureResultsPath = path.join(projectRoot, 'allure-results');
    
    // Use rimraf for reliable cross-platform directory removal
    const { execSync } = require('child_process');
    
    try {
      this.log(`  Cleaning directory: ${allureResultsPath}\n`);
      
      // Try using rimraf (already in dependencies)
      try {
        execSync('npx rimraf "' + allureResultsPath + '"', { 
          cwd: projectRoot, 
          shell: true, 
          stdio: 'pipe' 
        });
        this.log(`  ✓ Allure results cleaned successfully\n\n`);
        return;
      } catch (rimrafError) {
        this.log(`  ⚠️  rimraf failed, trying manual cleanup...\n`);
      }
      
      // Fallback: Manual directory removal
      if (fs.existsSync(allureResultsPath)) {
        fs.rmSync(allureResultsPath, { recursive: true, force: true });
        this.log(`  ✓ Allure results cleaned (manual)\n\n`);
      } else {
        this.log(`  ✓ Allure results directory doesn't exist (already clean)\n\n`);
      }
    } catch (err) {
      this.log(`  ⚠️  Warning: Could not clean Allure results: ${(err as Error).message}\n`);
      this.log(`  ℹ️  Continuing with execution...\n\n`);
    }
  }

  /**
   * Convert reports and generate allure directories
   */
  private static async postExecutionReportGeneration(projectRoot: string): Promise<void> {
    const executeCmd = async (cmd: string, args: string[], description: string): Promise<void> => {
      const cmdString = `${cmd} ${args.join(' ')}`;
      this.log(`  Executing: ${cmdString}\n`);
      return new Promise((resolve, reject) => {
        const proc = spawn(cmd, args, { cwd: projectRoot, shell: true });
        proc.on('close', (code) => {
          if (code === 0) {
            this.log(`  ✓ ${description} completed successfully\n\n`);
            resolve();
          } else {
            reject(new Error(`Command failed with exit code ${code}`));
          }
        });
        proc.on('error', (err) => {
          this.log(`  ❌ ${description} failed: ${err.message}\n\n`);
          reject(err);
        });
      });
    };

    // Run convert script: convert cucumber json to allure results
    this.log(`  - Converting Cucumber JSON to Allure formats...\n`);
    await executeCmd('node', ['convert-cucumber-to-allure.js'], 'Cucumber to Allure conversion');

    // Generate Allure HTML report: allure generate ./allure-results --clean -o ./allure-report
    this.log(`  - Generating Allure static web HTML report...\n`);
    await executeCmd('npx', ['allure', 'generate', './allure-results', '--clean', '-o', './allure-report'], 'Allure report generation');
  }

  /**
   * Read the JSON file report and parse passed/failed counters
   */
  private static parseExecutionMetrics(projectRoot: string): { total: number; passed: number; failed: number; skipped: number } {
    const reportPath = path.join(projectRoot, 'allure-results/cucumber-report.json');
    const result = { total: 0, passed: 0, failed: 0, skipped: 0 };

    if (!fs.existsSync(reportPath)) {
      // Try fallback from run log parsing
      if (this.currentRun.completedScenarios > 0) {
        result.total = this.currentRun.completedScenarios;
        result.passed = this.currentRun.completedScenarios; // Assume passed
      }
      return result;
    }

    try {
      const data = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
      data.forEach((feature: any) => {
        feature.elements?.forEach((scenario: any) => {
          if (scenario.type !== 'scenario') return;
          result.total++;
          
          let status = 'passed';
          scenario.steps?.forEach((step: any) => {
            if (step.result?.status === 'failed') {
              status = 'failed';
            } else if (step.result?.status === 'skipped' && status !== 'failed') {
              status = 'skipped';
            }
          });

          if (status === 'failed') result.failed++;
          else if (status === 'skipped') result.skipped++;
          else result.passed++;
        });
      });
    } catch (e) {
      console.error('Failed to parse cucumber report json for metrics:', e);
      result.total = this.currentRun.completedScenarios;
      result.passed = this.currentRun.completedScenarios;
    }

    return result;
  }
}
