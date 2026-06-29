import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { AlertTriangle, Download, Search, ExternalLink, Play, FileText, Bug, RefreshCw } from 'lucide-react';

export const FailedTestsPage: React.FC = () => {
  const [failedTests, setFailedTests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchFailedTests();
  }, []);

  const fetchFailedTests = async () => {
    try {
      const res = await axios.get('/api/reports/failed');
      setFailedTests(res.data);
    } catch (e) {
      console.error('Error fetching failed tests:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = useMemo(() => {
    return failedTests.filter(test =>
      test.scenario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.feature.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.errorMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [failedTests, searchTerm]);

  const totalPages = Math.ceil(filteredTests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTests = filteredTests.slice(startIndex, startIndex + itemsPerPage);

  const exportToCSV = () => {
    const headers = ['Feature', 'Scenario', 'Tags', 'Error Message', 'Duration (ms)', 'Retry Count', 'Screenshot', 'Video', 'Trace'];
    const csvContent = [
      headers.join(','),
      ...filteredTests.map(t => [
        `"${t.feature}"`,
        `"${t.scenario}"`,
        `"${t.tags.join(';')}"`,
        `"${(t.errorMessage || '').replace(/"/g, '""')}"`,
        t.duration,
        t.retryCount,
        t.screenshot || '',
        t.video || '',
        t.trace || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `failed-tests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
            <AlertTriangle size={18} className="text-danger" />
            <span>Failed Tests</span>
            <span className="badge bg-danger ms-2">{filteredTests.length} Failures</span>
          </h5>
          <button className="btn btn-success btn-sm d-flex align-items-center gap-2" onClick={exportToCSV}>
            <Download size={14} />
            Export CSV
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-3">
          <div className="input-group">
            <span className="input-group-text"><Search size={16} /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search failed tests by scenario, feature, or error..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover table-striped align-middle">
            <thead className="table-dark">
              <tr>
                <th>Feature</th>
                <th>Scenario</th>
                <th>Tags</th>
                <th>Error Message</th>
                <th>Duration</th>
                <th>Retries</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTests.length > 0 ? (
                paginatedTests.map((test, idx) => (
                  <tr key={idx} className="table-danger">
                    <td className="fw-semibold" style={{ maxWidth: '200px' }}>
                      {test.feature}
                    </td>
                    <td style={{ maxWidth: '250px' }}>
                      {test.scenario}
                    </td>
                    <td>
                      {test.tags.map((tag: string, i: number) => (
                        <span key={i} className="badge bg-dark me-1 mb-1">{tag}</span>
                      ))}
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      <span className="text-danger small" title={test.errorMessage}>
                        {test.errorMessage.substring(0, 60)}{test.errorMessage.length > 60 ? '...' : ''}
                      </span>
                    </td>
                    <td>{(test.duration / 1000).toFixed(2)}s</td>
                    <td>
                      <span className="badge bg-warning">{test.retryCount || 0}</span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button 
                          className="btn btn-sm btn-outline-primary" 
                          title="View Details"
                          onClick={() => setSelectedTest(test)}
                        >
                          <FileText size={14} />
                        </button>
                        {test.screenshot && (
                          <a href={test.screenshot} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary" title="Screenshot">
                            <FileText size={14} />
                          </a>
                        )}
                        {test.video && (
                          <a href={test.video} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-danger" title="Video">
                            <Play size={14} />
                          </a>
                        )}
                        {test.trace && (
                          <a href={test.trace} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-info" title="Trace">
                            <Bug size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <AlertTriangle size={48} className="mb-2 opacity-50" />
                    <div>No failed tests found! All tests passed successfully.</div>
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

      {/* Error Details Modal */}
      {selectedTest && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Failure Details</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedTest(null)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>Feature:</strong> {selectedTest.feature}
                </div>
                <div className="mb-3">
                  <strong>Scenario:</strong> {selectedTest.scenario}
                </div>
                <div className="mb-3">
                  <strong>Tags:</strong> {selectedTest.tags.join(', ')}
                </div>
                <div className="mb-3">
                  <strong>Error Message:</strong>
                  <pre className="bg-dark text-danger p-3 rounded mt-2" style={{ maxHeight: '300px', overflow: 'auto' }}>
                    {selectedTest.errorStackTrace || selectedTest.errorMessage}
                  </pre>
                </div>
                <div className="mb-3">
                  <strong>Duration:</strong> {(selectedTest.duration / 1000).toFixed(2)}s
                </div>
                <div className="mb-3">
                  <strong>Retry Count:</strong> {selectedTest.retryCount || 0}
                </div>
                <div className="d-flex gap-2 mt-4">
                  {selectedTest.screenshot && (
                    <a href={selectedTest.screenshot} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                      <FileText size={16} className="me-2" />
                      View Screenshot
                    </a>
                  )}
                  {selectedTest.video && (
                    <a href={selectedTest.video} target="_blank" rel="noopener noreferrer" className="btn btn-danger">
                      <Play size={16} className="me-2" />
                      Watch Video
                    </a>
                  )}
                  {selectedTest.trace && (
                    <a href={selectedTest.trace} target="_blank" rel="noopener noreferrer" className="btn btn-info">
                      <Bug size={16} className="me-2" />
                      View Trace
                    </a>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedTest(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};