import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Database, Download, Search } from 'lucide-react';

export const FeatureSummaryPage: React.FC = () => {
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const res = await axios.get('/api/reports/features');
      setFeatures(res.data);
    } catch (e) {
      console.error('Error fetching features:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeatures = useMemo(() => {
    return features.filter(feature =>
      feature.featureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.tags.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [features, searchTerm]);

  const totalPages = Math.ceil(filteredFeatures.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFeatures = filteredFeatures.slice(startIndex, startIndex + itemsPerPage);

  const exportToCSV = () => {
    const headers = ['Feature Name', 'Total Scenarios', 'Passed', 'Failed', 'Skipped', 'Duration (s)', 'Status', 'Tags'];
    const csvContent = [
      headers.join(','),
      ...filteredFeatures.map(f => [
        `"${f.featureName}"`,
        f.totalScenarios,
        f.passed,
        f.failed,
        f.skipped,
        (f.duration / 1000).toFixed(2),
        f.status,
        `"${f.tags}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feature-summary-${new Date().toISOString().split('T')[0]}.csv`;
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
            <Database size={18} className="text-primary" />
            <span>Feature Summary</span>
            <span className="badge bg-info ms-2">{filteredFeatures.length} Features</span>
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
              placeholder="Search features or tags..."
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
                <th>Feature Name</th>
                <th>Total Scenarios</th>
                <th>Passed</th>
                <th>Failed</th>
                <th>Skipped</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Tags</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFeatures.length > 0 ? (
                paginatedFeatures.map((feature, idx) => (
                  <tr key={idx}>
                    <td className="fw-semibold">{feature.featureName}</td>
                    <td>{feature.totalScenarios}</td>
                    <td><span className="badge bg-success">{feature.passed}</span></td>
                    <td><span className="badge bg-danger">{feature.failed}</span></td>
                    <td><span className="badge bg-warning">{feature.skipped}</span></td>
                    <td>{(feature.duration / 1000).toFixed(2)}s</td>
                    <td>
                      {feature.status === 'passed' ? (
                        <span className="badge bg-success">PASSED</span>
                      ) : (
                        <span className="badge bg-danger">FAILED</span>
                      )}
                    </td>
                    <td>
                      {feature.tags.split(',').map((tag: string, i: number) => (
                        <span key={i} className="badge bg-secondary me-1">{tag.trim()}</span>
                      ))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-muted">
                    No features found
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
