import * as fs from 'fs';
import * as path from 'path';
import { FeatureInfo, ScenarioInfo } from '../../shared/types';

/**
 * Parse Cucumber JSON report and extract comprehensive metrics
 */
export class ReportParser {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Parse cucumber-report.json and return structured data
   */
  parseCucumberReport(): any {
    const reportPath = path.join(this.projectRoot, 'reports', 'cucumber-report.json');
    
    if (!fs.existsSync(reportPath)) {
      return this.getEmptyReport();
    }

    try {
      const content = fs.readFileSync(reportPath, 'utf-8');
      const rawData = JSON.parse(content);
      
      return this.transformCucumberData(rawData);
    } catch (error) {
      console.error('Error parsing cucumber report:', error);
      return this.getEmptyReport();
    }
  }

  /**
   * Transform raw Cucumber JSON to structured format
   */
  private transformCucumberData(rawData: any[]): any {
    const features: any[] = [];
    let totalScenarios = 0;
    let passedScenarios = 0;
    let failedScenarios = 0;
    let skippedScenarios = 0;
    const tagStats: Map<string, { passed: number; failed: number; skipped: number }> = new Map();
    const scenarioDetails: any[] = [];
    const failedTests: any[] = [];

    rawData.forEach((feature: any) => {
      const featureScenarios: any[] = [];
      let featurePassed = 0;
      let featureFailed = 0;
      let featureSkipped = 0;

      feature.elements?.forEach((element: any) => {
        totalScenarios++;
        const scenario = this.parseScenario(element, feature);
        featureScenarios.push(scenario);
        scenarioDetails.push(scenario);

        // Update counters
        if (scenario.status === 'passed') {
          passedScenarios++;
          featurePassed++;
        } else if (scenario.status === 'failed') {
          failedScenarios++;
          featureFailed++;
          
          // Add to failed tests
          failedTests.push({
            feature: feature.name,
            scenario: scenario.name,
            tags: scenario.tags,
            errorMessage: scenario.errorMessage,
            errorStackTrace: scenario.errorStackTrace,
            duration: scenario.duration,
            screenshot: this.findScreenshot(feature.name, scenario.name),
            video: this.findVideo(feature.name, scenario.name),
            trace: this.findTrace(feature.name, scenario.name),
            retryCount: scenario.retryCount || 0
          });
        } else {
          skippedScenarios++;
          featureSkipped++;
        }

        // Update tag stats
        scenario.tags.forEach((tag: string) => {
          const tagName = tag.replace('@', '');
          if (!tagStats.has(tagName)) {
            tagStats.set(tagName, { passed: 0, failed: 0, skipped: 0 });
          }
          const stats = tagStats.get(tagName)!;
          if (scenario.status === 'passed') stats.passed++;
          else if (scenario.status === 'failed') stats.failed++;
          else stats.skipped++;
        });
      });

      features.push({
        name: feature.name,
        uri: feature.uri,
        description: feature.description || '',
        tags: feature.tags?.map((t: any) => t.name) || [],
        totalScenarios: featureScenarios.length,
        passed: featurePassed,
        failed: featureFailed,
        skipped: featureSkipped,
        duration: this.calculateFeatureDuration(featureScenarios),
        status: featureFailed > 0 ? 'failed' : 'passed',
        scenarios: featureScenarios
      });
    });

    return {
      features,
      summary: {
        totalScenarios,
        passed: passedScenarios,
        failed: failedScenarios,
        skipped: skippedScenarios,
        passPercentage: totalScenarios > 0 ? Math.round((passedScenarios / totalScenarios) * 100) : 0
      },
      tagAnalytics: Array.from(tagStats.entries()).map(([tag, stats]) => ({
        tag,
        ...stats,
        total: stats.passed + stats.failed + stats.skipped
      })),
      scenarioDetails,
      failedTests,
      executionTime: this.calculateExecutionTime(rawData)
    };
  }

  /**
   * Parse individual scenario from Cucumber element
   */
  private parseScenario(element: any, feature: any): any {
    const result = element.steps?.find((s: any) => s.result?.status === 'failed') || 
                   element.steps?.find((s: any) => s.result?.status === 'passed');
    
    let status = 'passed';
    let errorMessage = '';
    let errorStackTrace = '';
    let duration = 0;

    if (element.steps) {
      element.steps.forEach((step: any) => {
        const stepDuration = step.result?.duration || 0;
        duration += this.parseDuration(stepDuration);
        
        if (step.result?.status === 'failed') {
          status = 'failed';
          errorMessage = step.result?.error_message || 'Step failed';
          errorStackTrace = step.result?.error_message || '';
        } else if (step.result?.status === 'skipped' && status !== 'failed') {
          status = 'skipped';
        }
      });
    }

    return {
      id: `${feature.name}-${element.name}-${element.line}`,
      name: element.name,
      feature: feature.name,
      featureFile: feature.uri,
      line: element.line,
      tags: element.tags?.map((t: any) => t.name) || [],
      type: element.keyword?.trim() || 'Scenario',
      status,
      duration,
      errorMessage,
      errorStackTrace,
      retryCount: element.retryCount || 0,
      steps: element.steps?.map((s: any) => ({
        name: s.name,
        keyword: s.keyword,
        status: s.result?.status,
        duration: this.parseDuration(s.result?.duration || 0),
        error: s.result?.error_message
      })) || []
    };
  }

  /**
   * Parse ISO 8601 duration to milliseconds
   */
  private parseDuration(duration: string): number {
    if (!duration) return 0;
    
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  }

  /**
   * Calculate total duration for a feature
   */
  private calculateFeatureDuration(scenarios: any[]): number {
    return scenarios.reduce((sum, s) => sum + s.duration, 0);
  }

  /**
   * Calculate total execution time
   */
  private calculateExecutionTime(rawData: any[]): number {
    let totalTime = 0;
    rawData.forEach((feature: any) => {
      feature.elements?.forEach((element: any) => {
        element.steps?.forEach((step: any) => {
          totalTime += this.parseDuration(step.result?.duration || 0);
        });
      });
    });
    return totalTime;
  }

  /**
   * Find screenshot for scenario
   */
  private findScreenshot(featureName: string, scenarioName: string): string | null {
    const screenshotsDir = path.join(this.projectRoot, 'reports', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) return null;

    const files = fs.readdirSync(screenshotsDir);
    const sanitizedScenario = scenarioName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const screenshot = files.find(f => f.includes(sanitizedScenario));
    
    return screenshot ? `/reports/screenshots/${screenshot}` : null;
  }

  /**
   * Find video for scenario
   */
  private findVideo(featureName: string, scenarioName: string): string | null {
    const videosDir = path.join(this.projectRoot, 'reports', 'videos');
    if (!fs.existsSync(videosDir)) return null;

    const files = fs.readdirSync(videosDir);
    const sanitizedScenario = scenarioName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const video = files.find(f => f.includes(sanitizedScenario));
    
    return video ? `/reports/videos/${video}` : null;
  }

  /**
   * Find trace file for scenario
   */
  private findTrace(featureName: string, scenarioName: string): string | null {
    const tracesDir = path.join(this.projectRoot, 'reports', 'traces');
    if (!fs.existsSync(tracesDir)) return null;

    const files = fs.readdirSync(tracesDir);
    const sanitizedScenario = scenarioName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const trace = files.find(f => f.includes(sanitizedScenario));
    
    return trace ? `/reports/traces/${trace}` : null;
  }

  /**
   * Get empty report structure
   */
  private getEmptyReport(): any {
    return {
      features: [],
      summary: {
        totalScenarios: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        passPercentage: 0
      },
      tagAnalytics: [],
      scenarioDetails: [],
      failedTests: [],
      executionTime: 0
    };
  }

  /**
   * Scan features directory and return feature info
   */
  scanFeatures(): FeatureInfo[] {
    const featuresDir = path.join(this.projectRoot, 'features');
    if (!fs.existsSync(featuresDir)) return [];

    const features: FeatureInfo[] = [];
    const featureFiles = this.findFeatureFiles(featuresDir);

    featureFiles.forEach(file => {
      const feature = this.parseFeatureFile(file);
      if (feature) features.push(feature);
    });

    return features;
  }

  /**
   * Find all .feature files
   */
  private findFeatureFiles(dir: string): string[] {
    let files: string[] = [];
    
    if (!fs.existsSync(dir)) return files;

    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files = files.concat(this.findFeatureFiles(fullPath));
      } else if (item.endsWith('.feature')) {
        files.push(fullPath);
      }
    });

    return files;
  }

  /**
   * Parse feature file
   */
  private parseFeatureFile(filePath: string): FeatureInfo | null {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(this.projectRoot, filePath);
      
      // Extract feature name
      const featureMatch = content.match(/^Feature:\s*(.+)$/m);
      if (!featureMatch) return null;

      const featureName = featureMatch[1].trim();
      
      // Extract tags
      const tagsMatch = content.match(/^@(\w+)/gm);
      const tags = tagsMatch ? tagsMatch.map(t => t.replace('@', '')) : [];

      // Extract scenarios
      const scenarios: ScenarioInfo[] = [];
      const scenarioRegex = /^Scenario(?:\s+Outline)?:\s*(.+)$/gm;
      let scenarioMatch;

      while ((scenarioMatch = scenarioRegex.exec(content)) !== null) {
        const scenarioName = scenarioMatch[1].trim();
        const lineNumber = content.substring(0, scenarioMatch.index).split('\n').length;
        
        // Find tags for this scenario
        const beforeScenario = content.substring(0, scenarioMatch.index);
        const scenarioTagsMatch = beforeScenario.match(/@(\w+)/g);
        const scenarioTags = scenarioTagsMatch ? scenarioTagsMatch.map(t => t.replace('@', '')) : [];

        scenarios.push({
          name: scenarioName,
          line: lineNumber,
          tags: scenarioTags,
          type: scenarioMatch[0].startsWith('Scenario Outline') ? 'Scenario Outline' : 'Scenario',
          featureName,
          featureFile: relativePath
        });
      }

      return {
        file: relativePath,
        name: featureName,
        description: '',
        scenarioCount: scenarios.length,
        tags,
        scenarios
      };
    } catch (error) {
      console.error(`Error parsing feature file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Get environment information
   */
  getEnvironmentInfo(): any {
    return {
      os: process.platform,
      nodeVersion: process.version,
      playwrightVersion: this.getPackageVersion('playwright'),
      browserVersion: this.getBrowserVersion(),
      cpu: process.arch,
      memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      gitCommit: this.getGitCommit(),
      buildNumber: process.env.BUILD_NUMBER || 'N/A',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get package version from package.json
   */
  private getPackageVersion(packageName: string): string {
    try {
      const packagePath = path.join(this.projectRoot, 'node_modules', packageName, 'package.json');
      if (fs.existsSync(packagePath)) {
        const content = fs.readFileSync(packagePath, 'utf-8');
        const pkg = JSON.parse(content);
        return pkg.version || 'N/A';
      }
    } catch (error) {
      // Ignore
    }
    return 'N/A';
  }

  /**
   * Get browser version
   */
  private getBrowserVersion(): string {
    try {
      const chromiumPath = path.join(this.projectRoot, 'node_modules', 'playwright', 'core', 'browserVersions.json');
      if (fs.existsSync(chromiumPath)) {
        const content = fs.readFileSync(chromiumPath, 'utf-8');
        const versions = JSON.parse(content);
        return versions.chromium || 'N/A';
      }
    } catch (error) {
      // Ignore
    }
    return 'N/A';
  }

  /**
   * Get git commit hash
   */
  private getGitCommit(): string {
    try {
      const { execSync } = require('child_process');
      return execSync('git rev-parse HEAD', { cwd: this.projectRoot, encoding: 'utf-8' }).trim().substring(0, 8);
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * Get execution timeline
   */
  getExecutionTimeline(): any[] {
    const report = this.parseCucumberReport();
    const timeline: any[] = [];

    report.features.forEach((feature: any) => {
      feature.scenarios.forEach((scenario: any) => {
        timeline.push({
          feature: feature.name,
          scenario: scenario.name,
          status: scenario.status,
          duration: scenario.duration,
          startTime: new Date().toISOString(), // Would need actual timestamps from report
          endTime: new Date().toISOString(),
          tags: scenario.tags
        });
      });
    });

    return timeline.sort((a, b) => a.duration - b.duration);
  }

  /**
   * Get trend data for charts
   */
  getTrendData(days: number = 30): any[] {
    // This would typically come from history store
    // For now, return current execution data
    const report = this.parseCucumberReport();
    
    return [{
      date: new Date().toISOString(),
      passed: report.summary.passed,
      failed: report.summary.failed,
      skipped: report.summary.skipped,
      total: report.summary.totalScenarios,
      passPercentage: report.summary.passPercentage,
      duration: report.executionTime
    }];
  }
}

export default ReportParser;