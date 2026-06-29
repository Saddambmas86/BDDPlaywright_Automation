import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Download, TrendingUp } from 'lucide-react';

export const TagAnalyticsPage: React.FC = () => {
  const [tagData, setTagData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchTagAnalytics();
  }, []);

  const fetchTagAnalytics = async () => {
    try {
      const res = await axios.get('/api/reports/tags');
      setTagData(res.data);
    } catch (e) {
      console.error('Error fetching tag analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Tag', 'Total', 'Passed', 'Failed', 'Skipped', 'Pass Rate %'];
    const csvContent = [
      headers.join(','),
      ...tagData.map(t => [
        t.tag,
        t.total,
        t.passed,
        t.failed,
        t.skipped,
        t.total > 0 ? Math.round((t.passed / t.total) * 100) : 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tag-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getPassRateColor = (rate: number) => {
    if (rate >= 80) return 'text-success';
    if (rate >= 50) return 'text-warning';
    return 'text-danger';
  };

  if (loading) {
    return (
      <div className="h-100 d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <Calendar size={18} className="text-primary" />
            <span>Tag Analytics</span>
            <span className="badge bg-info ms-2">{tagData.length} Tags</span>
          </h5>
          <button className="btn btn-success btn-sm d-flex align-items-center gap-2" onClick={exportToCSV}>
            <Download size={14} />
            Export CSV
          </button>
        </div>

        {tagData.length > 0 ? (
          <div className="row g-4">
            {tagData.map((tag, idx) => {
              const passRate = tag.total > 0 ? Math.round((tag.passed / tag.total) * 100) : 0;
              return (
                <div key={idx} className="col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h6 className="card-title fw-bold mb-0">@{tag.tag}</h6>
                        <span className={`badge fs-6 ${getPassRateColor(passRate)}`}>
                          {passRate}%
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="progress" style={{ height: '8px' }}>
                          <div 
                            className={`progress-bar ${passRate >= 80 ? 'bg-success' : passRate >= 50 ? 'bg-warning' : 'bg-danger'}`}
                            style={{ width: `${passRate}%` }}
                          />
                        </div>
                      </div>

                      <div className="row g-2 text-center">
                        <div className="col-4">
                          <div className="text-muted small">Total</div>
                          <div className="fw-bold fs-5">{tag.total}</div>
                        </div>
                        <div className="col-4">
                          <div className="text-success small">Passed</div>
                          <div className="fw-bold fs-5 text-success">{tag.passed}</div>
                        </div>
                        <div className="col-4">
                          <div className="text-danger small">Failed</div>
                          <div className="fw-bold fs-5 text-danger">{tag.failed}</div>
                        </div>
                      </div>

                      {tag.skipped > 0 && (
                        <div className="mt-2 text-center">
                          <span className="badge bg-warning">{tag.skipped} Skipped</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-5 text-muted">
            <Calendar size={48} className="mb-2 opacity-50" />
            <div>No tag analytics available</div>
          </div>
        )}
      </div>

      {/* Tag Summary Table */}
      {tagData.length > 0 && (
        <div className="dashboard-card p-4">
          <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            <span>Tag Summary</span>
          </h5>
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Tag</th>
                  <th>Total Scenarios</th>
                  <th>Passed</th>
                  <th>Failed</th>
                  <th>Skipped</th>
                  <th>Pass Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tagData.map((tag, idx) => {
                  const passRate = tag.total > 0 ? Math.round((tag.passed / tag.total) * 100) : 0;
                  return (
                    <tr key={idx}>
                      <td className="fw-semibold">@{tag.tag}</td>
                      <td>{tag.total}</td>
                      <td><span className="badge bg-success">{tag.passed}</span></td>
                      <td><span className="badge bg-danger">{tag.failed}</span></td>
                      <td><span className="badge bg-warning">{tag.skipped}</span></td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: '6px' }}>
                            <div 
                              className={`progress-bar ${passRate >= 80 ? 'bg-success' : passRate >= 50 ? 'bg-warning' : 'bg-danger'}`}
                              style={{ width: `${passRate}%` }}
                            />
                          </div>
                          <span className={`fw-semibold ${getPassRateColor(passRate)}`}>{passRate}%</span>
                        </div>
                      </td>
                      <td>
                        {passRate === 100 ? (
                          <span className="badge bg-success">HEALTHY</span>
                        ) : passRate >= 80 ? (
                          <span className="badge bg-info">STABLE</span>
                        ) : passRate >= 50 ? (
                          <span className="badge bg-warning">WARNING</span>
                        ) : (
                          <span className="badge bg-danger">CRITICAL</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};