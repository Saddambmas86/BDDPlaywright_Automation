import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Cpu, Monitor, GitBranch, Package, HardDrive, Calendar } from 'lucide-react';

export const EnvironmentInfoPage: React.FC = () => {
  const [envInfo, setEnvInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchEnvironmentInfo();
  }, []);

  const fetchEnvironmentInfo = async () => {
    try {
      const res = await axios.get('/api/reports/environment');
      setEnvInfo(res.data);
    } catch (e) {
      console.error('Error fetching environment info:', e);
    } finally {
      setLoading(false);
    }
  };

  const InfoCard: React.FC<{ icon: React.ReactNode; title: string; value: string; color: string }> = ({ icon, title, value, color }) => (
    <div className="col-md-6 col-lg-4">
      <div className="card h-100 border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex align-items-center gap-3">
            <div className={`p-3 rounded ${color}`}>
              {icon}
            </div>
            <div>
              <div className="text-muted small">{title}</div>
              <div className="fw-bold fs-6">{value}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
          <Monitor size={18} className="text-primary" />
          <span>Environment Information</span>
        </h5>

        {envInfo ? (
          <div className="row g-4">
            <InfoCard
              icon={<Monitor size={24} className="text-white" />}
              title="Operating System"
              value={envInfo.os || 'N/A'}
              color="bg-primary"
            />
            <InfoCard
              icon={<Package size={24} className="text-white" />}
              title="Node.js Version"
              value={envInfo.nodeVersion || 'N/A'}
              color="bg-success"
            />
            <InfoCard
              icon={<Package size={24} className="text-white" />}
              title="Playwright Version"
              value={envInfo.playwrightVersion || 'N/A'}
              color="bg-info"
            />
            <InfoCard
              icon={<Cpu size={24} className="text-white" />}
              title="Browser Version"
              value={envInfo.browserVersion || 'N/A'}
              color="bg-warning"
            />
            <InfoCard
              icon={<HardDrive size={24} className="text-white" />}
              title="CPU Architecture"
              value={envInfo.cpu || 'N/A'}
              color="bg-danger"
            />
            <InfoCard
              icon={<HardDrive size={24} className="text-white" />}
              title="Memory Usage"
              value={envInfo.memory || 'N/A'}
              color="bg-secondary"
            />
            <InfoCard
              icon={<GitBranch size={24} className="text-white" />}
              title="Git Commit"
              value={envInfo.gitCommit || 'N/A'}
              color="bg-dark"
            />
            <InfoCard
              icon={<Calendar size={24} className="text-white" />}
              title="Build Number"
              value={envInfo.buildNumber || 'N/A'}
              color="bg-primary"
            />
          </div>
        ) : (
          <div className="text-center py-5 text-muted">
            <Monitor size={48} className="mb-2 opacity-50" />
            <div>No environment information available</div>
          </div>
        )}

        {envInfo && envInfo.timestamp && (
          <div className="mt-4 pt-3 border-top">
            <div className="text-muted small">
              Last updated: {new Date(envInfo.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* System Details Table */}
      {envInfo && (
        <div className="dashboard-card p-4">
          <h5 className="fw-bold mb-3">Detailed System Information</h5>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Property</th>
                  <th>Value</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="fw-semibold">Operating System</td>
                  <td>{envInfo.os}</td>
                  <td className="text-muted">Platform where tests are executed</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Node.js Version</td>
                  <td>{envInfo.nodeVersion}</td>
                  <td className="text-muted">JavaScript runtime version</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Playwright Version</td>
                  <td>{envInfo.playwrightVersion}</td>
                  <td className="text-muted">Test automation framework version</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Browser Version</td>
                  <td>{envInfo.browserVersion}</td>
                  <td className="text-muted">Chromium browser version</td>
                </tr>
                <tr>
                  <td className="fw-semibold">CPU Architecture</td>
                  <td>{envInfo.cpu}</td>
                  <td className="text-muted">Processor architecture (x64/arm64)</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Memory Usage</td>
                  <td>{envInfo.memory}</td>
                  <td className="text-muted">Current heap memory usage</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Git Commit</td>
                  <td>
                    <code>{envInfo.gitCommit}</code>
                  </td>
                  <td className="text-muted">Short commit hash (first 8 characters)</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Build Number</td>
                  <td>{envInfo.buildNumber}</td>
                  <td className="text-muted">CI/CD build identifier</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};