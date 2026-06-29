import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  Settings, 
  Terminal, 
  Download, 
  Search, 
  XCircle,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useExecution } from '../context/ExecutionContext';
import { TestRunRequest } from '../../../shared/types';
import axios from 'axios';

export const ExecutePage: React.FC = () => {
  const { status, runTest, stopTest, logs, clearLogs, currentUser } = useExecution();

  // Wizard state
  const [suiteType, setSuiteType] = useState<TestRunRequest['suiteType']>('smoke');
  const [targetValue, setTargetValue] = useState<string>('');
  const [browser, setBrowser] = useState<TestRunRequest['browser']>('chromium');
  const [environment, setEnvironment] = useState<TestRunRequest['environment']>('qa');
  const [headless, setHeadless] = useState<boolean>(true);
  
  // Advanced state
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [parallel, setParallel] = useState<boolean>(false);
  const [workers, setWorkers] = useState<number>(4);
  const [retries, setRetries] = useState<number>(0);
  const [timeout, setTimeoutVal] = useState<number>(30000);
  const [slowMo, setSlowMo] = useState<number>(0);
  const [video, setVideo] = useState<TestRunRequest['video']>('retain-on-failure');
  const [trace, setTrace] = useState<TestRunRequest['trace']>('retain-on-failure');
  const [screenshot, setScreenshot] = useState<TestRunRequest['screenshot']>('only-on-failure');

  // Parsed framework options from backend
  const [features, setFeatures] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [wizardLoading, setWizardLoading] = useState<boolean>(true);

  // Terminal preferences
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<'all' | 'errors' | 'warnings'>('all');
  const [wrapLines, setWrapLines] = useState<boolean>(true);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Fetch target list options
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, scenRes, configRes] = await axios.all([
          axios.get('/api/features'),
          axios.get('/api/scenarios'),
          axios.get('/api/config')
        ]);
        
        setFeatures(featRes.data);
        setScenarios(scenRes.data);
        
        // Parse configurations for wizard defaults
        if (configRes.data) {
          setBrowser(configRes.data.defaultBrowser);
          setEnvironment(configRes.data.defaultEnvironment);
          setHeadless(configRes.data.defaultHeadless);
          setTimeoutVal(configRes.data.defaultTimeout);
        }

        // Collect unique tags
        const allTags: string[] = [];
        featRes.data.forEach((f: any) => allTags.push(...f.tags));
        scenRes.data.forEach((s: any) => allTags.push(...s.tags));
        setTags(Array.from(new Set(allTags)));
      } catch (e) {
        console.error('Failed to load target selector options:', e);
      } finally {
        setWizardLoading(false);
      }
    };
    fetchData();
  }, []);

  // Update targetValue default if suiteType changes
  useEffect(() => {
    if (suiteType === 'feature' && features.length > 0) {
      setTargetValue(features[0].file);
    } else if (suiteType === 'scenario' && scenarios.length > 0) {
      setTargetValue(scenarios[0].name);
    } else if (suiteType === 'tag' && tags.length > 0) {
      setTargetValue(tags[0]);
    } else if (suiteType === 'smoke') {
      setTargetValue('@smoke');
    } else if (suiteType === 'regression') {
      setTargetValue('@regression');
    } else if (suiteType === 'sanity') {
      setTargetValue('@sanity');
    } else if (suiteType === 'critical') {
      setTargetValue('@critical');
    } else {
      setTargetValue('');
    }
  }, [suiteType, features, scenarios, tags]);

  // Terminal scroll to bottom
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role === 'Viewer') return;

    const request: TestRunRequest = {
      suiteType,
      targetValue,
      browser,
      environment,
      headless,
      parallel,
      workers,
      retries,
      timeout,
      slowMo,
      video,
      trace,
      screenshot
    };

    const queued = await runTest(request);
    if (queued) {
      clearLogs();
    }
  };

  const handleDownloadLogs = () => {
    if (!logs) return;
    const blob = new Blob([logs], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${status.runId || 'execution'}_console.log`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter terminal outputs
  const getFilteredLogs = () => {
    if (!logs) return [];
    let lines = logs.split('\n');

    if (searchTerm) {
      lines = lines.filter(line => line.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (filterType === 'errors') {
      lines = lines.filter(line => 
        line.toLowerCase().includes('failed') || 
        line.toLowerCase().includes('error') || 
        line.toLowerCase().includes('exception') ||
        line.includes('❌')
      );
    } else if (filterType === 'warnings') {
      lines = lines.filter(line => 
        line.toLowerCase().includes('warn') || 
        line.toLowerCase().includes('skipped') ||
        line.includes('⚠️')
      );
    }

    return lines;
  };

  const filteredLines = getFilteredLogs();

  return (
    <div className="row g-4">
      {/* Wizard Column */}
      <div className="col-lg-5 col-xl-4">
        <div className="dashboard-card p-4">
          <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
            <Settings size={18} className="text-primary" />
            <span>Execution Wizard</span>
          </h5>

          {wizardLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary spinner-border-sm mb-2" role="status" />
              <div>Analyzing features folder...</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Target Suite Selection */}
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Target Suite</label>
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
                  <option value="tag">Custom Tag (@tag)</option>
                  <option value="feature">Specific Feature File</option>
                  <option value="scenario">Specific Scenario Name</option>
                  <option value="custom">Custom CLI Arguments</option>
                </select>
              </div>

              {/* Dynamic inputs based on target selection */}
              {suiteType === 'tag' && (
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Select Tag</label>
                  <select 
                    className="form-select"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                  >
                    {tags.map((t, idx) => (
                      <option key={idx} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              )}

              {suiteType === 'feature' && (
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Select Feature File</label>
                  <select 
                    className="form-select"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                  >
                    {features.map((f, idx) => (
                      <option key={idx} value={f.file}>{f.name} ({f.file})</option>
                    ))}
                  </select>
                </div>
              )}

              {suiteType === 'scenario' && (
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Select Scenario</label>
                  <select 
                    className="form-select text-truncate"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    style={{ maxWidth: '100%' }}
                  >
                    {scenarios.map((s, idx) => (
                      <option key={idx} value={s.name}>{s.name} ({s.featureFile})</option>
                    ))}
                  </select>
                </div>
              )}

              {suiteType === 'custom' && (
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Custom Command / Arguments</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. cucumber-js --tags '@auth and not @slow'"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    required
                  />
                  <small className="text-muted d-block mt-1">E.g., cucumber-js options or tag selectors.</small>
                </div>
              )}

              {/* Browser Option */}
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Browser Engine</label>
                <div className="btn-group w-100" role="group">
                  {(['chromium', 'firefox', 'webkit'] as const).map(b => (
                    <React.Fragment key={b}>
                      <input 
                        type="radio" 
                        className="btn-check" 
                        name="browserOptions" 
                        id={`browser_${b}`}
                        checked={browser === b}
                        onChange={() => setBrowser(b)}
                      />
                      <label className="btn btn-outline-primary text-capitalize" htmlFor={`browser_${b}`}>
                        {b === 'chromium' ? 'Chrome' : b}
                      </label>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Environment Option */}
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Environment Stage</label>
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

              {/* Headless Toggles */}
              <div className="mb-4 form-check form-switch d-flex align-items-center justify-content-between p-0">
                <label className="form-label fw-semibold m-0" style={{ fontSize: '13px' }} htmlFor="headlessToggle">
                  Headless Mode
                </label>
                <input 
                  className="form-check-input m-0" 
                  type="checkbox" 
                  id="headlessToggle"
                  checked={headless}
                  onChange={(e) => setHeadless(e.target.checked)}
                />
              </div>

              {/* Advanced Accordion Toggle */}
              <button 
                type="button"
                className="btn btn-link p-0 mb-3 text-decoration-none d-flex align-items-center gap-1 w-100 justify-content-between text-secondary"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <span className="fw-bold" style={{ fontSize: '13px' }}>Advanced Settings</span>
                {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {/* Advanced Configurations */}
              {showAdvanced && (
                <div className="p-3 border rounded mb-4 bg-dark bg-opacity-10">
                  {/* Parallel Execution */}
                  <div className="mb-3 form-check form-switch d-flex align-items-center justify-content-between p-0">
                    <label className="form-label m-0" style={{ fontSize: '12px' }} htmlFor="parallelToggle">
                      Parallel Execution
                    </label>
                    <input 
                      className="form-check-input m-0" 
                      type="checkbox" 
                      id="parallelToggle"
                      checked={parallel}
                      onChange={(e) => setParallel(e.target.checked)}
                    />
                  </div>

                  {parallel && (
                    <div className="mb-3">
                      <label className="form-label d-flex justify-content-between" style={{ fontSize: '12px' }}>
                        <span>Worker Threads</span>
                        <span className="fw-bold">{workers}</span>
                      </label>
                      <input 
                        type="range" 
                        className="form-range" 
                        min="2" 
                        max="16" 
                        value={workers} 
                        onChange={(e) => setWorkers(parseInt(e.target.value))}
                      />
                    </div>
                  )}

                  {/* Retries */}
                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '12px' }}>Test Retries (Flaky handling)</label>
                    <input 
                      type="number" 
                      className="form-control form-control-sm" 
                      min="0" 
                      max="5"
                      value={retries}
                      onChange={(e) => setRetries(parseInt(e.target.value) || 0)}
                    />
                  </div>

                  {/* Timeout */}
                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '12px' }}>Timeout (ms)</label>
                    <input 
                      type="number" 
                      className="form-control form-control-sm" 
                      value={timeout}
                      onChange={(e) => setTimeoutVal(parseInt(e.target.value) || 30000)}
                    />
                  </div>

                  {/* SlowMo */}
                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '12px' }}>Slow Motion (ms)</label>
                    <input 
                      type="number" 
                      className="form-control form-control-sm" 
                      value={slowMo}
                      onChange={(e) => setSlowMo(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="d-flex flex-column gap-2">
                {currentUser?.role === 'Viewer' ? (
                  <div className="alert alert-info py-2 text-center" style={{ fontSize: '12px' }}>
                    Viewer role cannot queue runs
                  </div>
                ) : (
                  <button 
                    type="submit" 
                    className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                    disabled={status.status === 'running'}
                  >
                    <Play size={16} />
                    <span>Run Automation Suite</span>
                  </button>
                )}

                {status.status === 'running' && currentUser?.role !== 'Viewer' && (
                  <button 
                    type="button" 
                    className="btn btn-danger d-flex align-items-center justify-content-center gap-2"
                    onClick={stopTest}
                  >
                    <Square size={16} />
                    <span>Force Stop Run</span>
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Live Console Output Column */}
      <div className="col-lg-7 col-xl-8">
        <div className="dashboard-card p-4 h-100 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <h5 className="m-0 fw-bold d-flex align-items-center gap-2">
              <Terminal size={18} className="text-primary" />
              <span>Live Console Output</span>
            </h5>
            
            <div className="d-flex gap-2">
              <button 
                onClick={handleDownloadLogs} 
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                disabled={!logs}
              >
                <Download size={14} />
                <span>Save Logs</span>
              </button>
              <button 
                onClick={clearLogs} 
                className="btn btn-outline-secondary btn-sm"
                disabled={!logs && status.status !== 'running'}
              >
                Clear Terminal
              </button>
            </div>
          </div>

          {/* Running progress stats overlay */}
          {status.status === 'running' && (
            <div className="p-3 border rounded mb-3 bg-dark bg-opacity-20 d-flex flex-column gap-2">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2" style={{ fontSize: '13px' }}>
                <span className="text-muted">
                  <strong>Current Feature:</strong> {status.currentFeature || 'Parsing...'}
                </span>
                <span className="text-muted">
                  <strong>Elapsed:</strong> {status.elapsed || 0}s {status.eta ? `| ETA: ${status.eta}s` : ''}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '13px' }}>
                <span className="text-info fw-semibold">
                  🎯 Scenario: {status.currentScenario || 'Starting...'}
                </span>
                <span className="badge bg-secondary">
                  {status.completedScenarios} / {status.totalScenarios} Scenarios
                </span>
              </div>
              {status.currentStep && (
                <div className="text-muted text-truncate" style={{ fontSize: '11px' }}>
                  ⚡ Step: {status.currentStep}
                </div>
              )}
              <div className="progress" style={{ height: '6px' }}>
                <div 
                  className="progress-bar progress-bar-striped progress-bar-animated bg-success" 
                  role="progressbar" 
                  style={{ width: `${status.progress}%` }} 
                />
              </div>
            </div>
          )}

          {/* Terminal Filters bar */}
          <div className="d-flex gap-2 mb-3 align-items-center flex-wrap justify-content-between">
            <div className="d-flex gap-2 align-items-center flex-wrap">
              <div className="btn-group btn-group-sm" role="group">
                <button 
                  type="button" 
                  className={`btn ${filterType === 'all' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                  onClick={() => setFilterType('all')}
                >
                  All Logs
                </button>
                <button 
                  type="button" 
                  className={`btn ${filterType === 'errors' ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={() => setFilterType('errors')}
                >
                  Errors Only
                </button>
                <button 
                  type="button" 
                  className={`btn ${filterType === 'warnings' ? 'btn-warning' : 'btn-outline-warning'}`}
                  onClick={() => setFilterType('warnings')}
                >
                  Warnings
                </button>
              </div>

              <div className="form-check form-check-inline m-0">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="autoScrollCheck" 
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                />
                <label className="form-check-label text-muted" htmlFor="autoScrollCheck" style={{ fontSize: '12px' }}>
                  Auto-Scroll
                </label>
              </div>

              <div className="form-check form-check-inline m-0">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="wrapLinesCheck" 
                  checked={wrapLines}
                  onChange={(e) => setWrapLines(e.target.checked)}
                />
                <label className="form-check-label text-muted" htmlFor="wrapLinesCheck" style={{ fontSize: '12px' }}>
                  Wrap text
                </label>
              </div>
            </div>

            <div className="position-relative" style={{ minWidth: '180px' }}>
              <Search size={14} className="position-absolute text-muted" style={{ left: '10px', top: '10px' }} />
              <input 
                type="text" 
                className="form-control form-control-sm ps-4" 
                placeholder="Search outputs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Terminal Box */}
          <div className="terminal-window flex-grow-1" style={{ minHeight: '350px' }}>
            {filteredLines.length > 0 ? (
              filteredLines.map((line, idx) => {
                let colorClass = '';
                if (line.toLowerCase().includes('failed') || line.toLowerCase().includes('error') || line.includes('❌') || line.toLowerCase().includes('stderr')) {
                  colorClass = 'text-danger';
                } else if (line.toLowerCase().includes('warn') || line.toLowerCase().includes('skipped') || line.includes('⚠️')) {
                  colorClass = 'text-warning';
                } else if (line.includes('📋 Scenario:') || line.includes('Feature:')) {
                  colorClass = 'text-info fw-bold';
                } else if (line.includes('✅') || line.includes('✓') || line.includes('Completed')) {
                  colorClass = 'text-success';
                }

                return (
                  <div 
                    key={idx} 
                    className={`terminal-line ${colorClass} ${wrapLines ? '' : 'text-nowrap'}`}
                  >
                    {line}
                  </div>
                );
              })
            ) : (
              <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                {status.status === 'running' ? 'Running execution hooks...' : 'Terminal ready. Queue a suite to stream console logs.'}
              </div>
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};
