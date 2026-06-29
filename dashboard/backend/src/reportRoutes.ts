import { Router, Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { ReportParser } from './reportParser';
import { HistoryStore } from './historyStore';

const router = Router();

/**
 * Helper to get project root
 */
function getProjectRoot(): string {
  return HistoryStore.getSettings().frameworkPath;
}

/**
 * GET /api/reports/summary - Get comprehensive execution summary
 */
router.get('/reports/summary', (req: Request, res: Response) => {
  try {
    const projectRoot = getProjectRoot();
    const parser = new ReportParser(projectRoot);
    const report = parser.parseCucumberReport();
    const history = HistoryStore.getHistory();

    // Get last execution details
    const lastRun = history.length > 0 ? history[0] : null;

    res.json({
      ...report.summary,
      executionDuration: report.executionTime,
      startTime: lastRun?.timestamp || new Date().toISOString(),
      endTime: lastRun ? new Date(new Date(lastRun.timestamp).getTime() + lastRun.duration).toISOString() : new Date().toISOString(),
      browser: lastRun?.browser || 'chromium',
      environment: lastRun?.environment || 'qa',
      buildNumber: lastRun?.id || 'N/A',
      gitBranch: process.env.GIT_BRANCH || 'main'
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/reports/features - Get feature-wise results
 */
router.get('/reports/features', (req: Request, res: Response) => {
  try {
    const projectRoot = getProjectRoot();
    const parser = new ReportParser(projectRoot);
    const report = parser.parseCucumberReport();

    // Transform for DataTables
    const features = report.features.map((f: any) => ({
      featureName: f.name,
      totalScenarios: f.totalScenarios,
      passed: f.passed,
      failed: f.failed,
      skipped: f.skipped,
      duration: f.duration,
      status: f.status,
      tags: f.tags.join(', ')
    }));

    res.json(features);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/reports/scenarios - Get all scenario details
 */
router.get('/reports/scenarios', (req: Request, res: Response) => {
  try {
    const projectRoot = getProjectRoot();
    const parser = new ReportParser(projectRoot);
    const report = parser.parseCucumberReport();

    // Transform for DataTables with all required columns
    const scenarios = report.scenarioDetails.map((s: any) => ({
      feature: s.feature,
      scenario: s.name,
      tags: s.tags.join(', '),
      browser: req.query.browser as string || 'chromium',
      environment: req.query.environment as string || 'qa',
      status: s.status,
      duration: s.duration,
      retryCount: s.retryCount || 0,
      screenshot: s.screenshot || null,
      video: s.video || null,
      trace: s.trace || null,
      errorMessage: s.errorMessage || '',
      type: s.type
    }));

    res.json(scenarios);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/reports/failed - Get failed test details
 */
router.get('/reports/failed', (req: Request, res: Response) => {
  try {
    const projectRoot = getProjectRoot();
    const parser = new ReportParser(projectRoot);
    const report = parser.parseCucumberReport();

    res.json(report.failedTests);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/reports/tags - Get tag analytics
 */
router.get('/reports/tags', (req: Request, res: Response) => {
  try {
    const projectRoot = getProjectRoot();
    const parser = new ReportParser(projectRoot);
    const report = parser.parseCucumberReport();

    res.json(report.tagAnalytics);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/reports/timeline - Get execution timeline
 */
router.get('/reports/timeline', (req: Request, res: Response) => {
  try {
    const projectRoot = getProjectRoot();
    const parser = new ReportParser(projectRoot);
    const timeline = parser.getExecutionTimeline();

    res.json(timeline);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/reports/environment - Get environment information
 */
router.get('/reports/environment', (req: Request, res: Response) => {
  try {
    const projectRoot = getProjectRoot();
    const parser = new ReportParser(projectRoot);
    const envInfo = parser.getEnvironmentInfo();

    res.json(envInfo);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/reports/trend - Get execution trend data
 */
router.get('/reports/trend', (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const projectRoot = getProjectRoot();
    const parser = new ReportParser(projectRoot);
    const trend = parser.getTrendData(days);

    res.json(trend);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/reports/charts/pie - Get data for pie chart
 */
router.get('/reports/charts/pie', (req: Request, res: Response) => {
  try {
    const projectRoot = getProjectRoot();
    const parser = new ReportParser(projectRoot);
    const report = parser.parseCucumberReport();

    res.json({
      labels: ['Passed', 'Failed', 'Skipped'],
      data: [
        report.summary.passed,
        report.summary.failed,
        report.summary.skipped
      ],
      colors: [
        'rgba(52, 199, 89, 0.85)',
        'rgba(255, 59, 48, 0.85)',
        'rgba(255, 149, 0, 0.85)'
      ]
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/reports/charts/bar - Get data for bar chart (feature-wise)
 */
router.get('/reports/charts/bar', (req: Request, res: Response) => {
  try {
    const projectRoot = getProjectRoot();
    const parser = new ReportParser(projectRoot);
    const report = parser.parseCucumberReport();

    const labels = report.features.map((f: any) => f.name.substring(0, 20) + (f.name.length > 20 ? '...' : ''));
    const passedData = report.features.map((f: any) => f.passed);
    const failedData = report.features.map((f: any) => f.failed);

    res.json({
      labels,
      datasets: [
        {
          label: 'Passed',
          data: passedData,
          backgroundColor: 'rgba(52, 199, 89, 0.8)'
        },
        {
          label: 'Failed',
          data: failedData,
          backgroundColor: 'rgba(255, 59, 48, 0.8)'
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/reports/charts/line - Get trend data for line chart
 */
router.get('/reports/charts/line', (req: Request, res: Response) => {
  try {
    const history = HistoryStore.getHistory();
    const days = parseInt(req.query.days as string) || 30;

    // Filter last N days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filteredHistory = history
      .filter(item => new Date(item.timestamp) >= cutoffDate)
      .reverse();

    const labels = filteredHistory.map(item => 
      new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    );

    const passRates = filteredHistory.map(item => {
      const total = item.metrics.total;
      return total > 0 ? Math.round((item.metrics.passed / total) * 100) : 0;
    });

    res.json({
      labels: labels.length > 0 ? labels : ['No Data'],
      data: passRates.length > 0 ? passRates : [0]
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/reports/charts/browser - Get browser execution distribution
 */
router.get('/reports/charts/browser', (req: Request, res: Response) => {
  try {
    const history = HistoryStore.getHistory();

    const browserStats: Map<string, { passed: number; failed: number; total: number }> = new Map();

    history.forEach(item => {
      if (!browserStats.has(item.browser)) {
        browserStats.set(item.browser, { passed: 0, failed: 0, total: 0 });
      }
      const stats = browserStats.get(item.browser)!;
      stats.passed += item.metrics.passed;
      stats.failed += item.metrics.failed;
      stats.total += item.metrics.total;
    });

    const labels = Array.from(browserStats.keys());
    const data = Array.from(browserStats.values()).map(s => s.total);

    res.json({
      labels,
      data,
      colors: [
        'rgba(88, 86, 214, 0.8)',
        'rgba(255, 149, 0, 0.8)',
        'rgba(52, 199, 89, 0.8)'
      ]
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/reports/charts/daily - Get daily execution trend
 */
router.get('/reports/charts/daily', (req: Request, res: Response) => {
  try {
    const history = HistoryStore.getHistory();
    const days = parseInt(req.query.days as string) || 7;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const dailyStats: Map<string, { passed: number; failed: number; skipped: number; total: number }> = new Map();

    history
      .filter(item => new Date(item.timestamp) >= cutoffDate)
      .forEach(item => {
        const dateKey = new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (!dailyStats.has(dateKey)) {
          dailyStats.set(dateKey, { passed: 0, failed: 0, skipped: 0, total: 0 });
        }
        const stats = dailyStats.get(dateKey)!;
        stats.passed += item.metrics.passed;
        stats.failed += item.metrics.failed;
        stats.skipped += item.metrics.skipped;
        stats.total += item.metrics.total;
      });

    const labels = Array.from(dailyStats.keys()).reverse();
    const passedData = Array.from(dailyStats.values()).reverse().map(s => s.passed);
    const failedData = Array.from(dailyStats.values()).reverse().map(s => s.failed);

    res.json({
      labels,
      datasets: [
        {
          label: 'Passed',
          data: passedData,
          backgroundColor: 'rgba(52, 199, 89, 0.8)'
        },
        {
          label: 'Failed',
          data: failedData,
          backgroundColor: 'rgba(255, 59, 48, 0.8)'
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;