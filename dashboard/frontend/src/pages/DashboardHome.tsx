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
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useExecution } from '../context/ExecutionContext';
import { DashboardCharts } from '../components/DashboardCharts';

export const DashboardHome: React.FC = () => {
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
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/dashboard');
      setStats(res.data);
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
    if (stats.trend && stats.trend.length > 0) {
      // Use the last execution metrics as summary
      const last = stats.lastExecution;
      if (last && last.metrics) {
        totalMetrics.passed = last.metrics.passed;
        totalMetrics.failed = last.metrics.failed;
        totalMetrics.skipped = last.metrics.skipped;
      }
    }
    return totalMetrics;
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
                  Running: {status.currentFeature || 'Hooks'} &gt; {status.currentScenario || 'Setting up browser...'}
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
