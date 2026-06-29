import React, { useEffect, useState } from 'react';
import { 
  Folder, 
  FileText, 
  Play, 
  Tag, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Layers,
  HelpCircle
} from 'lucide-react';
import axios from 'axios';
import { useExecution } from '../context/ExecutionContext';
import { useNavigate } from 'react-router-dom';

export const FeatureBrowser: React.FC = () => {
  const { runTest, status, currentUser } = useExecution();
  const navigate = useNavigate();

  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // States
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [alertMsg, setAlertMsg] = useState<{ type: string; text: string } | null>(null);

  const fetchFeatures = async () => {
    try {
      const res = await axios.get('/api/features');
      setFeatures(res.data);

      // Collect tags list
      const tags = new Set<string>();
      res.data.forEach((f: any) => {
        f.tags.forEach((t: string) => tags.add(t));
        f.scenarios.forEach((s: any) => s.tags.forEach((t: string) => tags.add(t)));
      });
      setTagsList(Array.from(tags));
    } catch (e) {
      console.error('Error fetching features list:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const toggleExpand = (filePath: string) => {
    const next = new Set(expandedFeatures);
    if (next.has(filePath)) {
      next.delete(filePath);
    } else {
      next.add(filePath);
    }
    setExpandedFeatures(next);
  };

  const handleRunFeature = async (filePath: string) => {
    if (currentUser?.role === 'Viewer') return;
    setAlertMsg(null);

    const success = await runTest({
      suiteType: 'feature',
      targetValue: filePath,
      browser: 'chromium',
      environment: 'qa',
      headless: true,
      parallel: false,
      workers: 1,
      retries: 0,
      timeout: 30000,
      slowMo: 0,
      video: 'retain-on-failure',
      trace: 'retain-on-failure',
      screenshot: 'only-on-failure'
    });

    if (success) {
      setAlertMsg({ type: 'success', text: `Successfully queued Feature: ${filePath}` });
      setTimeout(() => navigate('/execute'), 1000);
    } else {
      setAlertMsg({ type: 'danger', text: `Failed to queue execution for Feature ${filePath}` });
    }
  };

  const handleRunScenario = async (scenarioName: string) => {
    if (currentUser?.role === 'Viewer') return;
    setAlertMsg(null);

    const success = await runTest({
      suiteType: 'scenario',
      targetValue: scenarioName,
      browser: 'chromium',
      environment: 'qa',
      headless: true,
      parallel: false,
      workers: 1,
      retries: 0,
      timeout: 30000,
      slowMo: 0,
      video: 'retain-on-failure',
      trace: 'retain-on-failure',
      screenshot: 'only-on-failure'
    });

    if (success) {
      setAlertMsg({ type: 'success', text: `Successfully queued Scenario: ${scenarioName}` });
      setTimeout(() => navigate('/execute'), 1000);
    } else {
      setAlertMsg({ type: 'danger', text: `Failed to queue execution for Scenario ${scenarioName}` });
    }
  };

  // Filter features based on search terms and tags
  const getFilteredFeatures = () => {
    return features.filter(feature => {
      // 1. Tag filter
      const matchesTag = selectedTag === 'all' || 
                         feature.tags.includes(selectedTag) || 
                         feature.scenarios.some((s: any) => s.tags.includes(selectedTag));
      
      if (!matchesTag) return false;

      // 2. Search query filter
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const matchesFeatureName = feature.name.toLowerCase().includes(term) || feature.file.toLowerCase().includes(term);
      const matchesScenarioName = feature.scenarios.some((s: any) => s.name.toLowerCase().includes(term));
      
      return matchesFeatureName || matchesScenarioName;
    });
  };

  const filteredFeatures = getFilteredFeatures();

  if (loading) {
    return (
      <div className="h-100 d-flex align-items-center justify-content-center flex-column gap-3 py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="text-muted">Loading feature structures...</p>
      </div>
    );
  }

  return (
    <div>
      {alertMsg && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show mb-4`} role="alert">
          {alertMsg.text}
          <button type="button" className="btn-close" onClick={() => setAlertMsg(null)} />
        </div>
      )}

      {/* Tags and Search Controls */}
      <div className="dashboard-card p-4 mb-4">
        <div className="row g-3 align-items-center">
          {/* Search box */}
          <div className="col-md-5">
            <div className="position-relative">
              <Search className="position-absolute text-muted" size={16} style={{ left: '12px', top: '12px' }} />
              <input 
                type="text" 
                className="form-control ps-5" 
                placeholder="Search features or scenarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Tags list */}
          <div className="col-md-5">
            <div className="d-flex align-items-center gap-2">
              <Tag size={16} className="text-secondary" />
              <span className="text-muted" style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>Filter by Tag:</span>
              <select 
                className="form-select form-select-sm"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option value="all">All Tags</option>
                {tagsList.map((tag, idx) => (
                  <option key={idx} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="col-md-2 text-md-end text-muted" style={{ fontSize: '13px' }}>
            <strong>{filteredFeatures.length}</strong> of {features.length} Features
          </div>
        </div>

        {/* Favorite Tags list */}
        {tagsList.length > 0 && (
          <div className="mt-3 d-flex flex-wrap align-items-center gap-2">
            <small className="text-muted">Favorite Tags:</small>
            <button 
              className={`btn btn-xs py-1 px-2 border-0 ${selectedTag === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
              style={{ fontSize: '11px', borderRadius: '20px' }}
              onClick={() => setSelectedTag('all')}
            >
              All
            </button>
            {tagsList.slice(0, 8).map((tag, idx) => (
              <button 
                key={idx}
                className={`btn btn-xs py-1 px-2 border-0 ${selectedTag === tag ? 'btn-primary' : 'btn-outline-secondary'}`}
                style={{ fontSize: '11px', borderRadius: '20px' }}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Features Tree view */}
      <div className="dashboard-card p-4">
        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
          <Folder size={18} className="text-primary" />
          <span>features/</span>
        </h5>

        <div className="d-flex flex-column gap-3">
          {filteredFeatures.length > 0 ? (
            filteredFeatures.map((feat) => {
              const isExpanded = expandedFeatures.has(feat.file);
              return (
                <div key={feat.file} className="border rounded">
                  {/* Feature Row header */}
                  <div 
                    className="p-3 bg-dark bg-opacity-25 d-flex align-items-center justify-content-between flex-wrap gap-2 cursor-pointer"
                    onClick={() => toggleExpand(feat.file)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </div>
                      <div className="metric-badge bg-primary bg-opacity-10 text-primary m-0" style={{ width: '38px', height: '38px' }}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <h6 className="m-0 fw-bold">{feat.name}</h6>
                        <small className="text-muted text-break">{feat.file}</small>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      {/* Scenario counter */}
                      <span className="badge bg-secondary">
                        {feat.scenarioCount} Scenarios
                      </span>

                      {/* Tags */}
                      <div className="d-none d-lg-flex gap-1">
                        {feat.tags.map((t: string, idx: number) => (
                          <span key={idx} className="badge bg-info bg-opacity-10 text-info" style={{ fontSize: '10px' }}>{t}</span>
                        ))}
                      </div>

                      {/* Quick Execute */}
                      {currentUser?.role !== 'Viewer' && (
                        <button 
                          className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
                          disabled={status.status === 'running'}
                          onClick={() => handleRunFeature(feat.file)}
                          title="Run feature file"
                        >
                          <Play size={12} />
                          <span>Run</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Scenarios Row List */}
                  {isExpanded && (
                    <div className="p-3 border-top bg-dark bg-opacity-5">
                      <div className="d-flex flex-column gap-2">
                        {feat.scenarios.map((scen: any, idx: number) => (
                          <div key={idx} className="p-2 border rounded bg-secondary bg-opacity-5 d-flex align-items-center justify-content-between flex-wrap gap-2">
                            <div>
                              <div className="fw-semibold" style={{ fontSize: '13px' }}>
                                <span className="text-secondary">{scen.type}:</span> {scen.name}
                              </div>
                              <div className="d-flex align-items-center gap-2 mt-1">
                                <small className="text-muted" style={{ fontSize: '11px' }}>Line: {scen.line}</small>
                                <div className="d-flex gap-1">
                                  {scen.tags.map((t: string, tIdx: number) => (
                                    <span key={tIdx} className="badge bg-secondary" style={{ fontSize: '9px' }}>{t}</span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Run individual scenario */}
                            {currentUser?.role !== 'Viewer' && (
                              <button 
                                className="btn btn-outline-success btn-xs py-1 px-2 d-flex align-items-center gap-1"
                                style={{ fontSize: '11px' }}
                                disabled={status.status === 'running'}
                                onClick={() => handleRunScenario(scen.name)}
                                title="Run scenario"
                              >
                                <Play size={10} />
                                <span>Run</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-5 text-muted border border-dashed rounded">
              No features match your search filter
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
