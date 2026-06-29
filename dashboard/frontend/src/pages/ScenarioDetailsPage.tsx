import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { BarChart3, Download, Search, ExternalLink, Play, FileText, Bug } from 'lucide-react';

export const ScenarioDetailsPage: React.FC = () => {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      const res = await axios.get('/api/reports/scenarios');
      setScenarios(res.data);
    } catch (e) {
      console.error('Error fetching scenarios:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredScenarios = useMemo(() => {
    return scenarios.filter(scenario => {
      const matchesSearch = 
        scenario.scenario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scenario.feature.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scenario.tags.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || scenario.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [scenarios, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredScenarios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedScenarios = filteredScenarios.slice(startIndex, startIndex + itemsPerPage);

  const exportToCSV = () => {
    const headers = ['Feature', 'Scenario', 'Tags', 'Status', 'Duration (ms)', 'Error Message', 'Screenshot', 'Video', 'Trace'];
    const csvContent = [
      headers.join(','),
      ...filteredScenarios.map(s => [
        `"${s.feature}"`,
        `"${s.scenario}"`,
        `"${s.tags}"`,
        s.status,
        s.duration,
        `"${(s.errorMessage || '').replace(/"/g, '""')}"`,
        s.screenshot || '',
        s.video || '',
        s.trace || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scenario-details-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed': return <span className="badge bg-success">PASSED</span>;
      case 'failed': return <span className="badge bg-danger">FAILED</span>;
      case 'skipped': return <span className="badge bg-warning">SKIPPED</span>;
      default: return <span className="badge bg-secondary">{status.toUpperCase()}</span>;
    }
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
            <BarChart3 size={18} className="text-primary" />
            <span>Scenario Details</span>
            <span className="badge bg-info ms-2">{filteredScenarios.length} Scenarios</span>
          </h5>
          <button className="btn btn-success btn-sm d-flex align-items-center gap-2" onClick={exportToCSV}>
            <Download size={14} />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text"><Search size={16} /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search scenarios, features, or tags..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Status</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="skipped">Skipped</option>
            </select>
          </div>
          <div className="col-md-3">
            <div className="text-muted small pt-2">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredScenarios.length)} of {filteredScenarios.length} scenarios
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover table-striped align-middle">
            <thead className="table-dark">
              <tr>
                <th>Feature</th>
                <th>Scenario</th>
                <th>Tags</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Error Message</th>
                <th>Media</th>
              </tr>
            </thead>
            <tbody>
              {paginatedScenarios.length > 0 ? (
                paginatedScenarios.map((scenario, idx) => (
                  <tr key={idx}>
                    <td className="fw-semibold" style={{ maxWidth: '200px' }}>
                      {scenario.feature}
                    </td>
                    <td style={{ maxWidth: '250px' }}>
                      {scenario.scenario}
                    </td>
                    <td>
                      {scenario.tags.split(',').map((tag: string, i: number) => (
                        <span key={i} className="badge bg-secondary me-1 mb-1">{tag.trim()}</span>
                      ))}
                    </td>
                    <td>{getStatusBadge(scenario.status)}</td>
                    <td>{(scenario.duration / 1000).toFixed(2)}s</td>
                    <td style={{ maxWidth: '300px' }}>
                      {scenario.errorMessage ? (
                        <span className="text-danger small" title={scenario.errorMessage}>
                          {scenario.errorMessage.substring(0, 50)}{scenario.errorMessage.length > 50 ? '...' : ''}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        {scenario.screenshot && (
                          <a href={scenario.screenshot} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary" title="Screenshot">
                            <FileText size={14} />
                          </a>
                        )}
                        {scenario.video && (
                          <a href={scenario.video} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-danger" title="Video">
                            <Play size={14} />
                          </a>
                        )}
                        {scenario.trace && (
                          <a href={scenario.trace} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-info" title="Trace">
                            <Bug size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    No scenarios found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-3">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(p => p - 1)}>Previous</button>
              </li>
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(page => (
                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(p => p + 1)}>Next</button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
};