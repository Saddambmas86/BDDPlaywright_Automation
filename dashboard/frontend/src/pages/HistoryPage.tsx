import React, { useEffect, useState } from 'react';
import { 
  History, 
  Download, 
  Trash2, 
  Eye, 
  FileCode, 
  ArrowLeftRight, 
  X,
  FileSpreadsheet,
  CheckCircle,
  XCircle
} from 'lucide-react';
import axios from 'axios';
import { useExecution } from '../context/ExecutionContext';

export const HistoryPage: React.FC = () => {
  const { currentUser } = useExecution();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Selection for comparison
  const [selectedRuns, setSelectedRuns] = useState<string[]>([]);
  const [comparisonModal, setComparisonModal] = useState<boolean>(false);
  const [viewingLogsRun, setViewingLogsRun] = useState<any | null>(null);
  const [logsContent, setLogsContent] = useState<string>('');
  const [logsLoading, setLogsLoading] = useState<boolean>(false);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/history');
      setHistory(res.data);
    } catch (e) {
      console.error('Error fetching history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUser?.role !== 'Admin') return;
    
    if (window.confirm(`Are you sure you want to delete execution run ${id}?`)) {
      try {
        await axios.delete(`/api/history/${id}`);
        fetchHistory();
      } catch (err) {
        console.error('Failed to delete history item:', err);
      }
    }
  };

  const handleViewLogs = async (run: any) => {
    setViewingLogsRun(run);
    setLogsLoading(true);
    try {
      const res = await axios.get(run.logsPath);
      setLogsContent(res.data);
    } catch (e) {
      setLogsContent('Failed to load logs. Log file may have been deleted.');
    } finally {
      setLogsLoading(false);
    }
  };

  const handleSelectCompare = (id: string) => {
    const next = [...selectedRuns];
    const idx = next.indexOf(id);
    if (idx > -1) {
      next.splice(idx, 1);
    } else {
      if (next.length >= 2) {
        next.shift(); // Keep max 2
      }
      next.push(id);
    }
    setSelectedRuns(next);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (history.length === 0) return;
    
    const headers = ['Execution ID', 'Timestamp', 'Duration (s)', 'Environment', 'Browser', 'Suite', 'Target', 'Result', 'Total Scenarios', 'Passed', 'Failed', 'Skipped'];
    const rows = history.map(item => [
      item.id,
      item.timestamp,
      (item.duration / 1000).toFixed(2),
      item.environment,
      item.browser,
      item.suiteType,
      item.targetValue || '',
      item.result,
      item.metrics.total,
      item.metrics.passed,
      item.metrics.failed,
      item.metrics.skipped
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Playwright_BDD_History_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Get compared objects
  const getComparedItems = () => {
    if (selectedRuns.length < 2) return null;
    const runA = history.find(h => h.id === selectedRuns[0]);
    const runB = history.find(h => h.id === selectedRuns[1]);
    return { runA, runB };
  };

  const comparison = getComparedItems();

  if (loading) {
    return (
      <div className="h-100 d-flex align-items-center justify-content-center flex-column gap-3 py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="text-muted">Loading execution registry logs...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Top Controls Bar */}
      <div className="dashboard-card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h6 className="m-0 fw-bold">Historical Test Reports</h6>
            <small className="text-muted">Logged runs: {history.length} | Selected for comparison: {selectedRuns.length} of 2</small>
          </div>

          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-info btn-sm d-flex align-items-center gap-2"
              disabled={selectedRuns.length < 2}
              onClick={() => setComparisonModal(true)}
            >
              <ArrowLeftRight size={14} />
              <span>Compare Results</span>
            </button>
            <button 
              className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
              onClick={handleExportCSV}
              disabled={history.length === 0}
            >
              <FileSpreadsheet size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Execution History list */}
      <div className="dashboard-card p-4">
        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
          <History size={18} className="text-primary" />
          <span>Execution Log Archive</span>
        </h5>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr className="text-muted" style={{ fontSize: '12px' }}>
                <th style={{ width: '40px' }}>Select</th>
                <th>Run ID</th>
                <th>Timestamp</th>
                <th>Browser</th>
                <th>Env</th>
                <th>Suite Type</th>
                <th>Scenarios (P / F / S)</th>
                <th>Duration</th>
                <th>Result</th>
                <th style={{ width: '100px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map((run) => (
                  <tr 
                    key={run.id} 
                    style={{ fontSize: '13px', cursor: 'pointer' }}
                    onClick={() => handleViewLogs(run)}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="form-check-input"
                        checked={selectedRuns.includes(run.id)}
                        onChange={() => handleSelectCompare(run.id)}
                      />
                    </td>
                    <td className="fw-bold text-primary">{run.id}</td>
                    <td>{new Date(run.timestamp).toLocaleString()}</td>
                    <td className="text-uppercase">{run.browser}</td>
                    <td className="text-uppercase">{run.environment}</td>
                    <td>
                      <span className="badge bg-secondary text-uppercase">{run.suiteType}</span>
                      {run.targetValue && <span className="text-muted text-truncate d-block mt-1" style={{ maxWidth: '140px', fontSize: '10px' }}>{run.targetValue}</span>}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2 fw-semibold">
                        <span className="text-success">{run.metrics.passed}</span> /
                        <span className="text-danger">{run.metrics.failed}</span> /
                        <span className="text-warning">{run.metrics.skipped}</span>
                        <small className="text-muted" style={{ fontSize: '10px' }}>(Total: {run.metrics.total})</small>
                      </div>
                    </td>
                    <td>{(run.duration / 1000).toFixed(1)}s</td>
                    <td>
                      <span className={`status-pill status-${run.result}`}>
                        {run.result}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleViewLogs(run)}
                          title="View console logs"
                        >
                          <Eye size={12} />
                        </button>
                        {currentUser?.role === 'Admin' && (
                          <button 
                            className="btn btn-outline-danger btn-sm"
                            onClick={(e) => handleDelete(run.id, e)}
                            title="Delete Run"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center py-5 text-muted">
                    No run logs found in framework database
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Modal */}
      {comparisonModal && comparison && (
        <div className="modal d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 0, 0, 0.75)', zIndex: 1050, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
          <div className="modal-dialog modal-lg w-100" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-secondary bg-dark bg-opacity-95" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div className="modal-header border-secondary p-4 bg-secondary bg-opacity-10 d-flex justify-content-between align-items-center">
                <h5 className="modal-title fw-bold text-light d-flex align-items-center gap-2">
                  <ArrowLeftRight size={18} className="text-info" />
                  <span>Compare Execution Run Metrics</span>
                </h5>
                <button className="btn btn-link p-0 text-light border-0" onClick={() => setComparisonModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body p-4 text-light">
                <div className="row g-4">
                  {/* Side A */}
                  <div className="col-md-6 border-end border-secondary">
                    <h6 className="fw-bold text-info mb-3">Execution A ({comparison.runA.id})</h6>
                    <ul className="list-group list-group-flush" style={{ background: 'transparent' }}>
                      <li className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between">
                        <span>Timestamp</span>
                        <span>{new Date(comparison.runA.timestamp).toLocaleString()}</span>
                      </li>
                      <li className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between">
                        <span>Status</span>
                        <span className={`status-pill status-${comparison.runA.result}`}>{comparison.runA.result}</span>
                      </li>
                      <li className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between">
                        <span>Browser</span>
                        <span className="text-uppercase">{comparison.runA.browser}</span>
                      </li>
                      <li className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between">
                        <span>Environment</span>
                        <span className="text-uppercase">{comparison.runA.environment}</span>
                      </li>
                      <li className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between">
                        <span>Duration</span>
                        <span>{(comparison.runA.duration / 1000).toFixed(1)}s</span>
                      </li>
                      <li className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between">
                        <span>Total Scenarios</span>
                        <span>{comparison.runA.metrics.total}</span>
                      </li>
                      <li className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between">
                        <span>Passed Scenarios</span>
                        <span className="text-success">{comparison.runA.metrics.passed}</span>
                      </li>
                      <li className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between">
                        <span>Failed Scenarios</span>
                        <span className="text-danger">{comparison.runA.metrics.failed}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Side B */}
                  <div className="col-md-6">
                    <h6 className="fw-bold text-primary mb-3">Execution B ({comparison.runB.id})</h6>
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between">
                        <span>Timestamp</span>
                        <span>{new Date(comparison.runB.timestamp).toLocaleString()}</span>
                      </li>
                      <li className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between">
                        <span>Status</span>
                        <span className={`status-pill status-${comparison.runB.result}`}>{comparison.runB.result}</span>
                      </li>
                      <li className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between">
                        <span>Browser</span>
                        <span className="text-uppercase">{comparison.runB.browser}</span>
                      </li>
                      <li className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between">
                        <span>Environment</span>
                        <span className="text-uppercase">{comparison.runB.environment}</span>
                      </li>
                      <li className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between">
                        <span>Duration</span>
                        <span>{(comparison.runB.duration / 1000).toFixed(1)}s</span>
                      </li>
                      <li className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between">
                        <span>Total Scenarios</span>
                        <span>{comparison.runB.metrics.total}</span>
                      </li>
                      <li className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between">
                        <span>Passed Scenarios</span>
                        <span className="text-success">{comparison.runB.metrics.passed}</span>
                      </li>
                      <li className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between">
                        <span>Failed Scenarios</span>
                        <span className="text-danger">{comparison.runB.metrics.failed}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Analytical summary */}
                <div className="mt-4 p-3 border rounded border-secondary bg-secondary bg-opacity-10">
                  <h6 className="fw-bold text-info">Comparison Summary</h6>
                  <div style={{ fontSize: '13px' }} className="d-flex flex-column gap-1 mt-2">
                    <div>
                      ⚡ <strong>Duration Difference:</strong>{' '}
                      {Math.abs(comparison.runA.duration - comparison.runB.duration) / 1000}s ({comparison.runA.duration > comparison.runB.duration ? 'Run A was slower' : 'Run B was slower'})
                    </div>
                    <div>
                      🎯 <strong>Failed Scenarios Delta:</strong>{' '}
                      {Math.abs(comparison.runA.metrics.failed - comparison.runB.metrics.failed)} scenarios
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terminal Log Modal */}
      {viewingLogsRun && (
        <div className="modal d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 0, 0, 0.75)', zIndex: 1050, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }} onClick={() => setViewingLogsRun(null)}>
          <div className="modal-dialog modal-lg w-100" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-secondary bg-dark" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div className="modal-header border-secondary p-4 bg-secondary bg-opacity-10 d-flex justify-content-between align-items-center">
                <h5 className="modal-title fw-bold text-light d-flex align-items-center gap-2">
                  <FileCode size={18} className="text-primary" />
                  <span>Execution Logs: {viewingLogsRun.id}</span>
                </h5>
                <button className="btn btn-link p-0 text-light border-0" onClick={() => setViewingLogsRun(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body p-4">
                {logsLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm mb-2" />
                    <div className="text-muted">Loading logs...</div>
                  </div>
                ) : (
                  <div className="terminal-window" style={{ height: '400px' }}>
                    {logsContent ? (
                      logsContent.split('\n').map((line, idx) => (
                        <div key={idx} className="terminal-line">{line}</div>
                      ))
                    ) : (
                      <div className="text-center py-5 text-muted">No logs recorded for this execution.</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
