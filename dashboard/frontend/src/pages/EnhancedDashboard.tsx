import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Play, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Database,
  Calendar,
  Layers,
  ChevronRight,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  SkipForward
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useExecution } from '../context/ExecutionContext';
import { DashboardCharts } from '../components/DashboardCharts';

export const EnhancedDashboard: React.FC = () => {
  const { status, queue } = useExecution();
  const [stats, setStats] = useState<any>({
    totalRuns: 0,
    passedRuns: 0,
    failedRuns: 0,
    avgDuration: 0,
    totalAutomatedScenarios: 0,
    lastExecution: null,
    trend: []
  });
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    try {
      const [dashboardRes, summaryRes] = await Promise.all([
        axios.get('/api/dashboard'),
        axios.get('/api/reports/summary')
      ]);
      setStats(dashboardRes.data);
      setSummary(summaryRes.data);
    } catch (e) {
      console.error('Error fetching dashboard statistics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    let interval: number | null = null;
    if (status.status === 'running') {
      interval = window.setInterval(fetchStats, 5000);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [status.status]);

  const getPassRatePercent = () => {
    if (stats.totalRuns === 0) return 0;
    return Math.round((stats.passedRuns / stats.totalRuns) * 100);
  };

  const getOverallMetrics = () => {
    const totalMetrics = { passed: 0, failed: 0, skipped: 0 };
    if (summary) {
      totalMetrics.passed = summary.passed || 0;
      totalMetrics.failed = summary.failed || 0;
      totalMetrics.skipped = summary.skipped || 0;
    }
    return totalMetrics;
  };

  const formatDuration = (ms: number) => {
    if (!ms) return '0s';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <div className="h-100 d-flex align-items-center justify-content-center flex-column gap-3 py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted fw-semibold">Aggregating framework analytics...</p>
      </div>
    );
  }

  const overallMetrics = getOverallMetrics();

  return (
    <div>
      {/* Running Execution Alert bar */}
      {status.status === 'running' && (
        <div className="dashboard-card border-warning mb-4 bg-warning bg-opacity-10 p-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="spinner-border spinner-border-sm text-warning" role="status" />
              <div>
                <h6 className="m-0 fw-bold text-warning">Executing Test Run {status.runId}</h6>
                <small className="text-secondary">
                  Running: {status.currentFeature || 'Hooks'} {'>'} {status.currentScenario || 'Setting up browser...'}
                </small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-4">
              <div className="text-end">
                <div className="fw-semibold text-warning" style={{ fontSize: '14px' }}>Progress: {status.progress}%</div>
                <small className="text-muted">{status.completedScenarios} of {status.totalScenarios} Scenarios completed</small>
              </div>
              <Link to="/execute" className="btn btn-warning btn-sm d-flex align-items-center gap-2">
                <Eye size={14} />
                <span>Watch Console</span>
              </Link>
            </div>
          </div>
          <div className="progress mt-3" style={{ height: '6px' }}>
            <div 
              className="progress-bar bg-warning progress-bar-striped progress-bar-animated" 
              role="progressbar" 
              style={{ width: `${status.progress}%` }} 
            />
          </div>
        </div>
      )}

      {/* Executive Summary Section */}
      {summary && (
        <div className="dashboard-card p-4 mb-4">
          <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <BarChart3 size={18} className="text-primary" />
            <span>Executive Summary</span>
          </h5>
          <div className="row g-3">
            <div className="col-md-3">
              <div className="p-3 border rounded">
                <div className="text-muted small mb-1">Total Scenarios</div>
                <div className="fw-bold fs-4">{summary.totalScenarios || 0}</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 border rounded bg-success-subtle">
                <div className="text-success small mb-1 d-flex align-items-center gap-1">
                  <CheckCircle size={14} /> Passed
                </div>
                <div className="fw-bold fs-4 text-success">{summary.passed || 0}</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 border rounded bg-danger-subtle">
                <div className="text-danger small mb-1 d-flex align-items-center gap-1">
                  <XCircle size={14} /> Failed
                </div>
                <div className="fw-bold fs-4 text-danger">{summary.failed || 0}</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 border rounded bg-warning-subtle">
                <div className="text-warning small mb-1 d-flex align-items-center gap-1">
                  <SkipForward size={14} /> Skipped
                </div>
                <div className="fw-bold fs-4 text-warning">{summary.skipped || 0}</div>
              </div>
            </div>
          </div>
          <div className="row g-3 mt-2">
            <div className="col-md-3">
              <div className="p-3 border rounded bg-info-subtle">
                <div className="text-info small mb-1">Pass Percentage</div>
                <div className="fw-bold fs-4 text-info">{summary.passPercentage || 0}%</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 border rounded">
                <div className="text-muted small mb-1">Execution Duration</div>
                <div className="fw-bold fs-4">{formatDuration(summary.executionDuration || 0)}</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 border rounded">
                <div className="text-muted small mb-1">Browser</div>
                <div className="fw-bold fs-4 text-uppercase">{summary.browser || 'N/A'}</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 border rounded">
                <div className="text-muted small mb-1">Environment</div>
                <div className="fw-bold fs-4 text-uppercase">{summary.environment || 'N/A'}</div>
              </div>
            </div>
          </div>
          <div className="row g-3 mt-2">
            <div className="col-md-4">
              <div className="p-3 border rounded">
                <div className="text-muted small mb-1">Start Time</div>
                <div className="fw-bold">{summary.startTime ? new Date(summary.startTime).toLocaleString() : 'N/A'}</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 border rounded">
                <div className="text-muted small mb-1">End Time</div>
                <div className="fw-bold">{summary.endTime ? new Date(summary.endTime).toLocaleString() : 'N/A'}</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 border rounded">
                <div className="text-muted small mb-1">Build / Git Branch</div>
                <div className="fw-bold">{summary.buildNumber || 'N/A'} / {summary.gitBranch || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="row g-4 mb-4">
        {/* KPI 1: Automated Scenarios */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="dashboard-card p-4">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="text-secondary fw-semibold d-block mb-1" style={{ fontSize: '13px' }}>Scenarios Found</span>
                <h2 className="m-0 fw-bold">{stats.totalAutomatedScenarios}</h2>
              </div>
              <div className="metric-badge bg-primary bg-opacity-10 text-primary">
                <Database size={24} />
              </div>
            </div>
            <div className="mt-3">
              <span className="badge bg-success-subtle text-success me-1">Parsed</span>
              <span className="text-muted" style={{ fontSize: '12px' }}>from features/</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Runs */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="dashboard-card p-4">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="text-secondary fw-semibold d-block mb-1" style={{ fontSize: '13px' }}>Total Runs</span>
                <h2 className="m-0 fw-bold">{stats.totalRuns}</h2>
              </div>
              <div className="metric-badge bg-info bg-opacity-10 text-info">
                <Layers size={24} />
              </div>
            </div>
            <div className="mt-3">
              <span className="badge bg-info-subtle text-info me-1">{stats.passedRuns} Passed</span>
              <span className="text-muted" style={{ fontSize: '12px' }}>{stats.failedRuns} Failed</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Avg Pass Rate */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="dashboard-card p-4">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="text-secondary fw-semibold d-block mb-1" style={{ fontSize: '13px' }}>Run Pass Rate</span>
                <h2 className="m-0 fw-bold">{getPassRatePercent()}%</h2>
              </div>
              <div className="metric-badge bg-success bg-opacity-10 text-success">
                <TrendingUp size={24} />
              </div>
            </div>
            <div className="mt-3">
              <div className="progress" style={{ height: '6px', borderRadius: '10px' }}>
                <div className="progress-bar bg-success" style={{ width: `${getPassRatePercent()}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* KPI 4: Average Duration */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="dashboard-card p-4">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="text-secondary fw-semibold d-block mb-1" style={{ fontSize: '13px' }}>Avg Duration</span>
                <h2 className="m-0 fw-bold">{(stats.avgDuration / 1000).toFixed(1)}s</h2>
              </div>
              <div className="metric-badge bg-warning bg-opacity-10 text-warning">
                <Clock size={24} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-muted" style={{ fontSize: '12px' }}>Avg execution time per run</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <DashboardCharts metrics={overallMetrics} trend={stats.trend} />

      {/* Quick Links to Detailed Reports */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="dashboard-card p-4">
            <h5 className="fw-bold mb-3">Detailed Reports</h5>
            <div className="row g-3">
              <div className="col-md-3">
                <Link to="/reports/features" className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2">
                  <Database size={16} />
                  Feature Summary
                </Link>
              </div>
              <div className="col-md-3">
                <Link to="/reports/scenarios" className="btn btn-outline-info w-100 d-flex align-items-center justify-content-center gap-2">
                  <BarChart3 size={16} />
                  Scenario Details
                </Link>
              </div>
              <div className="col-md-3">
                <Link to="/reports/failed" className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2">
                  <AlertTriangle size={16} />
                  Failed Tests
                </Link>
              </div>
              <div className="col-md-3">
                <Link to="/reports/tags" className="btn btn-outline-success w-100 d-flex align-items-center justify-content-center gap-2">
                  <Calendar size={16} />
                  Tag Analytics
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History and Queue grids */}
      <div className="row g-4">
        {/* Recent Executions Table */}
        <div className="col-lg-8">
          <div className="dashboard-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="m-0 fw-bold d-flex align-items-center gap-2">
                <BarChart3 size={18} className="text-primary" />
                <span>Recent Runs</span>
              </h5>
              <Link to="/history" className="btn btn-link btn-sm d-flex align-items-center gap-1 text-decoration-none">
                <span>View All History</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr className="text-muted" style={{ fontSize: '12px' }}>
                    <th>Run ID</th>
                    <th>Date</th>
                    <th>Browser</th>
                    <th>Env</th>
                    <th>Result</th>
                    <th>Duration</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.trend && stats.trend.length > 0 ? (
                    stats.trend.slice(-5).reverse().map((run: any) => (
                      <tr key={run.id} style={{ fontSize: '13px' }}>
                        <td className="fw-semibold text-primary">{run.id}</td>
                        <td>{new Date(run.date).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td className="text-uppercase">{run.browser}</td>
                        <td className="text-uppercase">{run.environment}</td>
                        <td>
                          <span className={`status-pill status-${run.result}`}>
                            {run.result}
                          </span>
                        </td>
                        <td>{(run.duration / 1000).toFixed(1)}s</td>
                        <td>
                          <Link to="/reports" className="btn btn-outline-primary btn-xs py-1 px-2" style={{ fontSize: '11px' }}>
                            View Reports
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-muted">
                        No previous runs logged. Go to "Execute Tests" to start.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Execution Queue Column */}
        <div className="col-lg-4">
          <div className="dashboard-card p-4 h-100">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <Layers size={18} className="text-primary" />
              <span>Queue Status</span>
              {queue.length > 0 && <span className="badge bg-info">{queue.length}</span>}
            </h5>

            <div className="d-flex flex-column gap-3">
              {/* If test is running currently */}
              {status.status === 'running' && (
                <div className="p-3 border border-primary rounded d-flex align-items-center justify-content-between bg-primary bg-opacity-5">
                  <div>
                    <span className="badge bg-primary text-uppercase mb-1">Running</span>
                    <div className="fw-bold" style={{ fontSize: '13px' }}>{status.runId}</div>
                    <small className="text-muted">Started: {new Date(status.startTime || Date.now()).toLocaleTimeString()}</small>
                  </div>
                  <div className="spinner-border spinner-border-sm text-primary" role="status" />
                </div>
              )}

              {/* Queued Items */}
              {queue.length > 0 ? (
                queue.map((req, index) => (
                  <div key={index} className="p-3 border border-secondary rounded d-flex align-items-center justify-content-between bg-dark bg-opacity-25">
                    <div>
                      <span className="badge bg-secondary text-uppercase mb-1">Queued (Pos {index + 1})</span>
                      <div className="fw-bold text-secondary" style={{ fontSize: '13px' }}>
                        Suite: {req.suiteType.toUpperCase()} {req.targetValue ? `(${req.targetValue})` : ''}
                      </div>
                      <small className="text-muted">Browser: {req.browser} | Env: {req.environment}</small>
                    </div>
                  </div>
                ))
              ) : status.status !== 'running' ? (
                <div className="text-center py-5 text-muted border border-dashed rounded">
                  <Play size={24} className="mb-2 text-secondary opacity-50" />
                  <div>Execution Queue Empty</div>
                  <Link to="/execute" className="btn btn-primary btn-sm mt-3">
                    Trigger Test
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};