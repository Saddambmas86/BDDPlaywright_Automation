import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Play, 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  HelpCircle,
  X,
  Sliders
} from 'lucide-react';
import axios from 'axios';
import { useExecution } from '../context/ExecutionContext';
import { CronSchedule, TestRunRequest } from '../../../shared/types';

export const SchedulerPage: React.FC = () => {
  const { currentUser } = useExecution();
  const [schedules, setSchedules] = useState<CronSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Form modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [scheduleName, setScheduleName] = useState<string>('');
  const [cronExpr, setCronExpr] = useState<string>('0 0 * * *');
  const [cronPreset, setCronPreset] = useState<string>('daily');
  
  // Execution options inside schedule
  const [suiteType, setSuiteType] = useState<TestRunRequest['suiteType']>('smoke');
  const [targetValue, setTargetValue] = useState<string>('@smoke');
  const [browser, setBrowser] = useState<TestRunRequest['browser']>('chromium');
  const [environment, setEnvironment] = useState<TestRunRequest['environment']>('qa');
  const [headless, setHeadless] = useState<boolean>(true);

  const fetchSchedules = async () => {
    try {
      const res = await axios.get('/api/schedules');
      setSchedules(res.data);
    } catch (e) {
      console.error('Error fetching schedules:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Update cron expression based on preset selection
  useEffect(() => {
    if (cronPreset === 'daily') setCronExpr('0 0 * * *');
    else if (cronPreset === 'morning') setCronExpr('0 9 * * *');
    else if (cronPreset === 'weekly') setCronExpr('0 9 * * 1');
    else if (cronPreset === 'monthly') setCronExpr('0 0 1 * *');
  }, [cronPreset]);

  // Update targetValue default if suiteType changes
  useEffect(() => {
    if (suiteType === 'smoke') setTargetValue('@smoke');
    else if (suiteType === 'regression') setTargetValue('@regression');
    else if (suiteType === 'sanity') setTargetValue('@sanity');
    else if (suiteType === 'critical') setTargetValue('@critical');
    else setTargetValue('');
  }, [suiteType]);

  const handleToggleActive = async (id: string) => {
    if (currentUser?.role === 'Viewer') return;
    try {
      await axios.post(`/api/schedules/${id}/toggle`);
      fetchSchedules();
    } catch (err) {
      console.error('Failed to toggle schedule:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (currentUser?.role === 'Viewer') return;
    if (window.confirm('Delete this cron schedule?')) {
      try {
        await axios.delete(`/api/schedules/${id}`);
        fetchSchedules();
      } catch (err) {
        console.error('Failed to delete schedule:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role === 'Viewer') return;

    const request: TestRunRequest = {
      suiteType,
      targetValue,
      browser,
      environment,
      headless,
      parallel: false,
      workers: 1,
      retries: 0,
      timeout: 30000,
      slowMo: 0,
      video: 'retain-on-failure',
      trace: 'retain-on-failure',
      screenshot: 'only-on-failure'
    };

    const newSchedule = {
      name: scheduleName,
      cronExpression: cronExpr,
      request,
      active: true
    };

    try {
      await axios.post('/api/schedules', newSchedule);
      setModalOpen(false);
      setScheduleName('');
      fetchSchedules();
    } catch (err) {
      alert('Error creating schedule. Verify cron expression format.');
    }
  };

  if (loading) {
    return (
      <div className="h-100 d-flex align-items-center justify-content-center flex-column gap-3 py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="text-muted">Initializing cron scheduler registries...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Top Banner and Actions */}
      <div className="dashboard-card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h6 className="m-0 fw-bold">Automated Test Execution Scheduler</h6>
            <small className="text-muted">Active schedules: {schedules.filter(s => s.active).length} | Total: {schedules.length}</small>
          </div>
          
          {currentUser?.role !== 'Viewer' && (
            <button 
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={() => setModalOpen(true)}
            >
              <Plus size={16} />
              <span>Create Schedule</span>
            </button>
          )}
        </div>
      </div>

      {/* Schedules List Grid */}
      <div className="dashboard-card p-4">
        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
          <Calendar size={18} className="text-primary" />
          <span>Registered Cron Schedules</span>
        </h5>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr className="text-muted" style={{ fontSize: '12px' }}>
                <th>Active</th>
                <th>Schedule Name</th>
                <th>Cron Expression</th>
                <th>TestSuite Configuration</th>
                <th>Browser</th>
                <th>Last Triggered</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length > 0 ? (
                schedules.map((sch) => (
                  <tr key={sch.id} style={{ fontSize: '13px' }}>
                    <td>
                      <button
                        className="btn p-0 border-0"
                        onClick={() => handleToggleActive(sch.id)}
                        disabled={currentUser?.role === 'Viewer'}
                        title={sch.active ? 'Disable Schedule' : 'Enable Schedule'}
                      >
                        {sch.active ? (
                          <ToggleRight size={32} className="text-success" />
                        ) : (
                          <ToggleLeft size={32} className="text-secondary" />
                        )}
                      </button>
                    </td>
                    <td className="fw-bold">{sch.name}</td>
                    <td>
                      <code className="text-info bg-dark bg-opacity-25 py-1 px-2 rounded" style={{ fontSize: '12px' }}>
                        {sch.cronExpression}
                      </code>
                    </td>
                    <td>
                      <span className="badge bg-secondary text-uppercase">{sch.request.suiteType}</span>
                      {sch.request.targetValue && <span className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>{sch.request.targetValue}</span>}
                    </td>
                    <td className="text-capitalize">{sch.request.browser} ({sch.request.environment})</td>
                    <td>
                      {sch.lastRun ? (
                        new Date(sch.lastRun).toLocaleString()
                      ) : (
                        <span className="text-muted">Never Triggered</span>
                      )}
                    </td>
                    <td>
                      <button 
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(sch.id)}
                        disabled={currentUser?.role === 'Viewer'}
                        title="Delete schedule"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    No active cron schedules. Create one to schedule runs.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Schedule Modal */}
      {modalOpen && (
        <div className="modal d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 0, 0, 0.75)', zIndex: 1050, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
          <div className="modal-dialog modal-md w-100" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit} className="modal-content border-secondary bg-dark" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div className="modal-header border-secondary p-4 bg-secondary bg-opacity-10 d-flex justify-content-between align-items-center">
                <h5 className="modal-title fw-bold text-light d-flex align-items-center gap-2">
                  <Clock size={18} className="text-primary" />
                  <span>Create Cron Execution Schedule</span>
                </h5>
                <button type="button" className="btn btn-link p-0 text-light border-0" onClick={() => setModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body p-4 text-light">
                {/* Name */}
                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: '13px' }}>Schedule Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Daily Regression Check"
                    value={scheduleName}
                    onChange={(e) => setScheduleName(e.target.value)}
                    required
                  />
                </div>

                {/* Preset Crons */}
                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: '13px' }}>Cron Schedule Preset</label>
                  <select 
                    className="form-select"
                    value={cronPreset}
                    onChange={(e) => setCronPreset(e.target.value)}
                  >
                    <option value="daily">Daily at Midnight (0 0 * * *)</option>
                    <option value="morning">Daily at 9:00 AM (0 9 * * *)</option>
                    <option value="weekly">Weekly on Mondays 9 AM (0 9 * * 1)</option>
                    <option value="monthly">Monthly on 1st at Midnight (0 0 1 * *)</option>
                    <option value="custom">Custom Cron Expression</option>
                  </select>
                </div>

                {/* Custom Expression */}
                {cronPreset === 'custom' && (
                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '13px' }}>Custom Cron Expression</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. */15 * * * * (Every 15 min)"
                      value={cronExpr}
                      onChange={(e) => setCronExpr(e.target.value)}
                      required
                    />
                    <small className="text-muted d-block mt-1">Format: minute hour day-of-month month day-of-week</small>
                  </div>
                )}

                {/* Divider */}
                <hr className="border-secondary my-3" />
                <h6 className="fw-bold text-info mb-3 d-flex align-items-center gap-1">
                  <Sliders size={14} />
                  <span>Execution Configs</span>
                </h6>

                {/* Suite */}
                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: '13px' }}>TestSuite Target</label>
                  <select 
                    className="form-select"
                    value={suiteType}
                    onChange={(e) => setSuiteType(e.target.value as any)}
                  >
                    <option value="all">Entire Suite</option>
                    <option value="smoke">Smoke Tests (@smoke)</option>
                    <option value="regression">Regression Tests (@regression)</option>
                    <option value="sanity">Sanity Tests (@sanity)</option>
                    <option value="critical">Critical Tests (@critical)</option>
                  </select>
                </div>

                {/* Browser & Env */}
                <div className="row g-3">
                  <div className="col-6">
                    <div className="mb-3">
                      <label className="form-label" style={{ fontSize: '13px' }}>Browser</label>
                      <select 
                        className="form-select"
                        value={browser}
                        onChange={(e) => setBrowser(e.target.value as any)}
                      >
                        <option value="chromium">Chromium</option>
                        <option value="firefox">Firefox</option>
                        <option value="webkit">Webkit</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="mb-3">
                      <label className="form-label" style={{ fontSize: '13px' }}>Environment</label>
                      <select 
                        className="form-select text-uppercase"
                        value={environment}
                        onChange={(e) => setEnvironment(e.target.value as any)}
                      >
                        <option value="dev">dev</option>
                        <option value="qa">qa</option>
                        <option value="sit">sit</option>
                        <option value="uat">uat</option>
                        <option value="prod">prod</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Headless check */}
                <div className="mb-3 form-check form-switch d-flex justify-content-between p-0 align-items-center">
                  <label className="form-label m-0" style={{ fontSize: '13px' }} htmlFor="headlessCheck">Headless Mode</label>
                  <input 
                    type="checkbox" 
                    className="form-check-input m-0" 
                    id="headlessCheck"
                    checked={headless}
                    onChange={(e) => setHeadless(e.target.checked)}
                  />
                </div>
              </div>

              <div className="modal-footer border-secondary p-3">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule Job</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
