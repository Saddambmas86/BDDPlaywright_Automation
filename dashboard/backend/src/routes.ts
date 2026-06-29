import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { HistoryStore } from './historyStore';
import { TestExecutor } from './executor';
import { scanFeatures, scanScenarios } from './featuresParser';
import { TestRunRequest, CronSchedule } from '../../shared/types';
import { getSchedules, saveSchedules, startCronTask } from './scheduler';

const router = Router();

/**
 * Helper to get project root
 */
function getProjectRoot(): string {
  return HistoryStore.getSettings().frameworkPath;
}

/**
 * GET /api/dashboard - Dashboard summary statistics
 */
router.get('/dashboard', (req: Request, res: Response) => {
  try {
    const history = HistoryStore.getHistory();
    const projectRoot = getProjectRoot();

    // Scan features for project metrics
    const features = scanFeatures(projectRoot);
    const totalAutomatedScenarios = features.reduce((sum, f) => sum + f.scenarioCount, 0);

    const totalRuns = history.length;
    const passedRuns = history.filter(item => item.result === 'passed').length;
    const failedRuns = history.filter(item => item.result === 'failed').length;
    
    // Average duration of runs
    const totalDuration = history.reduce((sum, item) => sum + item.duration, 0);
    const avgDuration = totalRuns > 0 ? Math.round(totalDuration / totalRuns) : 0;

    // Get last run
    const lastRun = history.length > 0 ? history[0] : null;

    // Aggregates over history
    const historyTrend = history.slice(0, 15).reverse().map(item => ({
      id: item.id,
      date: item.timestamp,
      passed: item.metrics.passed,
      failed: item.metrics.failed,
      skipped: item.metrics.skipped,
      result: item.result,
      duration: item.duration,
      browser: item.browser,
      environment: item.environment
    }));

    res.json({
      totalRuns,
      passedRuns,
      failedRuns,
      avgDuration,
      totalAutomatedScenarios,
      lastExecution: lastRun,
      trend: historyTrend
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * POST /api/execute - Queue a test run
 */
router.post('/execute', (req: Request, res: Response) => {
  try {
    const runRequest: TestRunRequest = req.body;
    
    // Validate request
    if (!runRequest || !runRequest.suiteType) {
      res.status(400).json({ error: 'Invalid execution parameters' });
      return;
    }

    TestExecutor.enqueue(runRequest);
    res.json({ success: true, message: 'Execution added to the queue' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * POST /api/stop - Stop currently running process
 */
router.post('/stop', (req: Request, res: Response) => {
  try {
    const success = TestExecutor.stopActiveRun();
    res.json({ success, message: success ? 'Execution stopped' : 'No active run found' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/history - Get all run history
 */
router.get('/history', (req: Request, res: Response) => {
  try {
    const history = HistoryStore.getHistory();
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * DELETE /api/history/:id - Delete a history run item
 */
router.delete('/history/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    HistoryStore.deleteHistoryItem(id);
    res.json({ success: true, message: `Run ${id} history cleared` });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/logs/:id - Download or view logs
 */
router.get('/logs/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const logs = HistoryStore.readLog(id);
    if (!logs) {
      res.status(404).json({ error: `No log found for execution ${id}` });
      return;
    }
    res.header('Content-Type', 'text/plain');
    res.send(logs);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/features - List features
 */
router.get('/features', (req: Request, res: Response) => {
  try {
    const projectRoot = getProjectRoot();
    const features = scanFeatures(projectRoot);
    res.json(features);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/scenarios - List scenarios
 */
router.get('/scenarios', (req: Request, res: Response) => {
  try {
    const projectRoot = getProjectRoot();
    const scenarios = scanScenarios(projectRoot);
    res.json(scenarios);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/status - Current runner and queue status
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    res.json(TestExecutor.getStatus());
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/config - Get current configurations
 */
router.get('/config', (req: Request, res: Response) => {
  try {
    res.json(HistoryStore.getSettings());
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * POST /api/config - Save configurations
 */
router.post('/config', (req: Request, res: Response) => {
  try {
    const config = req.body;
    HistoryStore.saveSettings(config);
    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/reports - Scan and return screenshots/videos files list
 */
router.get('/reports', (req: Request, res: Response) => {
  try {
    const projectRoot = getProjectRoot();
    
    const getFilesList = (subDirName: string): any[] => {
      const fullDir = path.join(projectRoot, 'reports', subDirName);
      if (!fs.existsSync(fullDir)) return [];
      
      const files = fs.readdirSync(fullDir);
      return files
        .map(file => {
          const filePath = path.join(fullDir, file);
          const stat = fs.statSync(filePath);
          return {
            name: file,
            size: stat.size,
            mtime: stat.mtime,
            url: `/reports/${subDirName}/${file}`
          };
        })
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime()); // Newest first
    };

    const screenshots = getFilesList('screenshots');
    const videos = getFilesList('videos');

    res.json({
      allureAvailable: fs.existsSync(path.join(projectRoot, 'allure-report/index.html')),
      cucumberHtmlAvailable: fs.existsSync(path.join(projectRoot, 'reports/cucumber-report.html')),
      screenshots,
      videos
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/schedules - List schedules
 */
router.get('/schedules', (req: Request, res: Response) => {
  try {
    res.json(getSchedules());
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * POST /api/schedules - Create new schedule
 */
router.post('/schedules', (req: Request, res: Response) => {
  try {
    const newSchedule: CronSchedule = req.body;
    if (!newSchedule.name || !newSchedule.cronExpression || !newSchedule.request) {
      res.status(400).json({ error: 'Missing schedule parameters' });
      return;
    }

    const schedules = getSchedules();
    newSchedule.id = `sch_${Date.now()}`;
    schedules.push(newSchedule);
    saveSchedules(schedules);
    startCronTask(newSchedule);

    res.json({ success: true, schedule: newSchedule });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * PUT /api/schedules/:id - Edit schedule
 */
router.put('/schedules/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated: CronSchedule = req.body;
    
    let schedules = getSchedules();
    const idx = schedules.findIndex(s => s.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Schedule not found' });
      return;
    }

    schedules[idx] = { ...schedules[idx], ...updated, id }; // Ensure id doesn't change
    saveSchedules(schedules);
    startCronTask(schedules[idx]);

    res.json({ success: true, schedule: schedules[idx] });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * DELETE /api/schedules/:id - Delete schedule
 */
router.delete('/schedules/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let schedules = getSchedules();
    const match = schedules.find(s => s.id === id);
    
    if (match) {
      // Stop the running task if any
      const updated = { ...match, active: false };
      startCronTask(updated);
      
      schedules = schedules.filter(s => s.id !== id);
      saveSchedules(schedules);
      res.json({ success: true, message: `Schedule ${id} deleted` });
    } else {
      res.status(404).json({ error: 'Schedule not found' });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * POST /api/schedules/:id/toggle - Toggle active state
 */
router.post('/schedules/:id/toggle', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const schedules = getSchedules();
    const match = schedules.find(s => s.id === id);
    if (!match) {
      res.status(404).json({ error: 'Schedule not found' });
      return;
    }

    match.active = !match.active;
    saveSchedules(schedules);
    startCronTask(match);

    res.json({ success: true, active: match.active });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
