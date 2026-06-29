import React, { useEffect, useState } from 'react';
import { 
  Settings, 
  Save, 
  Bell, 
  FolderLock, 
  Sliders, 
  Compass,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { useExecution } from '../context/ExecutionContext';

export const SettingsPage: React.FC = () => {
  const { currentUser } = useExecution();
  const [config, setConfig] = useState<any>({
    frameworkPath: '',
    playwrightPath: '',
    reportPath: '',
    defaultBrowser: 'chromium',
    defaultEnvironment: 'qa',
    defaultTimeout: 30000,
    defaultHeadless: true,
    theme: 'dark',
    notifications: {
      desktop: true,
      slackWebhook: '',
      teamsWebhook: '',
      emailRecipient: ''
    }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [alert, setAlert] = useState<{ type: string; text: string } | null>(null);

  const fetchConfig = async () => {
    try {
      const res = await axios.get('/api/config');
      setConfig(res.data);
    } catch (e) {
      console.error('Error loading configurations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role !== 'Admin') return;
    setAlert(null);

    try {
      await axios.post('/api/config', config);
      setAlert({ type: 'success', text: 'Settings updated successfully' });
      // Apply theme immediately
      localStorage.setItem('dashboard_theme', config.theme);
      document.documentElement.setAttribute('data-theme', config.theme);
    } catch (err) {
      setAlert({ type: 'danger', text: 'Failed to save settings' });
    }
  };

  if (loading) {
    return (
      <div className="h-100 d-flex align-items-center justify-content-center flex-column gap-3 py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="text-muted">Loading framework configuration...</p>
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'Admin';

  return (
    <div className="row g-4 justify-content-center">
      <div className="col-xl-8 col-lg-10">
        {alert && (
          <div className={`alert alert-${alert.type} alert-dismissible fade show mb-4`} role="alert">
            {alert.text}
            <button type="button" className="btn-close" onClick={() => setAlert(null)} />
          </div>
        )}

        <form onSubmit={handleSave} className="d-flex flex-column gap-4">
          {/* Section 1: Directory Configurations */}
          <div className="dashboard-card p-4">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <FolderLock size={18} className="text-primary" />
              <span>Workspace Directory Settings</span>
            </h5>

            <div className="row g-3">
              <div className="col-12">
                <label className="form-label" style={{ fontSize: '13px' }}>Framework Path</label>
                <input 
                  type="text" 
                  className="form-control text-secondary bg-dark bg-opacity-25" 
                  value={config.frameworkPath}
                  onChange={(e) => setConfig({ ...config, frameworkPath: e.target.value })}
                  disabled={!isAdmin}
                  required
                />
                <small className="text-muted">Absolute directory path of the Playwright BDD TypeScript repository.</small>
              </div>

              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: '13px' }}>Playwright Command Location</label>
                <input 
                  type="text" 
                  className="form-control text-secondary bg-dark bg-opacity-25" 
                  value={config.playwrightPath}
                  onChange={(e) => setConfig({ ...config, playwrightPath: e.target.value })}
                  disabled={!isAdmin}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: '13px' }}>Reports Root Directory</label>
                <input 
                  type="text" 
                  className="form-control text-secondary bg-dark bg-opacity-25" 
                  value={config.reportPath}
                  onChange={(e) => setConfig({ ...config, reportPath: e.target.value })}
                  disabled={!isAdmin}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Suite Defaults */}
          <div className="dashboard-card p-4">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <Sliders size={18} className="text-primary" />
              <span>Suite Defaults Options</span>
            </h5>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label" style={{ fontSize: '13px' }}>Default Browser</label>
                <select 
                  className="form-select" 
                  value={config.defaultBrowser}
                  onChange={(e) => setConfig({ ...config, defaultBrowser: e.target.value })}
                  disabled={!isAdmin}
                >
                  <option value="chromium">Chromium</option>
                  <option value="firefox">Firefox</option>
                  <option value="webkit">Webkit</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label" style={{ fontSize: '13px' }}>Default Environment</label>
                <select 
                  className="form-select text-uppercase" 
                  value={config.defaultEnvironment}
                  onChange={(e) => setConfig({ ...config, defaultEnvironment: e.target.value })}
                  disabled={!isAdmin}
                >
                  <option value="dev">dev</option>
                  <option value="qa">qa</option>
                  <option value="sit">sit</option>
                  <option value="uat">uat</option>
                  <option value="prod">prod</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label" style={{ fontSize: '13px' }}>Default Theme UI</label>
                <select 
                  className="form-select text-capitalize" 
                  value={config.theme}
                  onChange={(e) => setConfig({ ...config, theme: e.target.value })}
                  disabled={!isAdmin}
                >
                  <option value="dark">Dark Theme</option>
                  <option value="light">Light Theme</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: '13px' }}>Default Timeout (ms)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={config.defaultTimeout}
                  onChange={(e) => setConfig({ ...config, defaultTimeout: parseInt(e.target.value) || 30000 })}
                  disabled={!isAdmin}
                />
              </div>

              <div className="col-md-6 form-check form-switch d-flex align-items-end justify-content-between pb-2 ps-0 pe-3" style={{ height: '70px' }}>
                <label className="form-label m-0 fw-semibold" style={{ fontSize: '13px' }} htmlFor="defaultHeadlessCheck">Run Headless by default</label>
                <input 
                  type="checkbox" 
                  className="form-check-input m-0" 
                  id="defaultHeadlessCheck"
                  checked={config.defaultHeadless}
                  onChange={(e) => setConfig({ ...config, defaultHeadless: e.target.checked })}
                  disabled={!isAdmin}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Notification Alerts */}
          <div className="dashboard-card p-4">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <Bell size={18} className="text-primary" />
              <span>Notification Integration Webhooks</span>
            </h5>

            <div className="row g-3">
              <div className="col-12 form-check form-switch d-flex justify-content-between p-0 align-items-center mb-3">
                <label className="form-label m-0" style={{ fontSize: '13px' }} htmlFor="desktopNotifyCheck">Enable Local Desktop Banners</label>
                <input 
                  type="checkbox" 
                  className="form-check-input m-0" 
                  id="desktopNotifyCheck"
                  checked={config.notifications.desktop}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    notifications: { ...config.notifications, desktop: e.target.checked } 
                  })}
                  disabled={!isAdmin}
                />
              </div>

              <div className="col-12">
                <label className="form-label" style={{ fontSize: '13px' }}>Slack Webhook Channel URL</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="https://hooks.slack.com/services/..."
                  value={config.notifications.slackWebhook}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    notifications: { ...config.notifications, slackWebhook: e.target.value } 
                  })}
                  disabled={!isAdmin}
                />
              </div>

              <div className="col-12">
                <label className="form-label" style={{ fontSize: '13px' }}>Microsoft Teams Incoming Webhook URL</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="https://outlook.office.com/webhook/..."
                  value={config.notifications.teamsWebhook}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    notifications: { ...config.notifications, teamsWebhook: e.target.value } 
                  })}
                  disabled={!isAdmin}
                />
              </div>

              <div className="col-12">
                <label className="form-label" style={{ fontSize: '13px' }}>Email Recipient (comma separated)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="lead@company.com, team@company.com"
                  value={config.notifications.emailRecipient}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    notifications: { ...config.notifications, emailRecipient: e.target.value } 
                  })}
                  disabled={!isAdmin}
                />
              </div>
            </div>
          </div>

          {/* Action button */}
          {!isAdmin ? (
            <div className="alert alert-warning py-3 text-center d-flex align-items-center justify-content-center gap-2">
              <AlertCircle size={16} />
              <span>Only users with <strong>Admin</strong> access rights can modify configurations.</span>
            </div>
          ) : (
            <button 
              type="submit" 
              className="btn btn-primary d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold"
            >
              <Save size={16} />
              <span>Save System Settings</span>
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
