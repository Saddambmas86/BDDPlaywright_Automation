import React, { useEffect, useState } from 'react';
import { 
  FileSpreadsheet, 
  ExternalLink, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  ChevronRight,
  Download,
  Eye,
  Activity,
  Trash
} from 'lucide-react';
import axios from 'axios';

export const ReportsPage: React.FC = () => {
  const [reportsInfo, setReportsInfo] = useState<any>({
    allureAvailable: false,
    cucumberHtmlAvailable: false,
    screenshots: [],
    videos: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      const res = await axios.get('/api/reports');
      setReportsInfo(res.data);
    } catch (e) {
      console.error('Error fetching reports:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="h-100 d-flex align-items-center justify-content-center flex-column gap-3 py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="text-muted">Scanning reports registry...</p>
      </div>
    );
  }

  return (
    <div>
      {/* HTML Reports Quick Links Cards */}
      <div className="row g-4 mb-4">
        {/* Allure Report Card */}
        <div className="col-md-6">
          <div className="dashboard-card p-4 h-100 d-flex align-items-center justify-content-between">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="fs-3">📊</span>
                <h5 className="m-0 fw-bold">Allure Interactive Report</h5>
              </div>
              <p className="text-muted m-0" style={{ fontSize: '13px' }}>
                View visual execution history, graphs, timeline, steps details, and test suites distributions.
              </p>
            </div>
            <div>
              {reportsInfo.allureAvailable ? (
                <a 
                  href="/allure-report/index.html" 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn btn-primary d-flex align-items-center gap-2"
                >
                  <span>Open Allure</span>
                  <ExternalLink size={14} />
                </a>
              ) : (
                <span className="badge bg-secondary">Not Generated</span>
              )}
            </div>
          </div>
        </div>

        {/* Cucumber HTML Report Card */}
        <div className="col-md-6">
          <div className="dashboard-card p-4 h-100 d-flex align-items-center justify-content-between">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="fs-3">📄</span>
                <h5 className="m-0 fw-bold">Cucumber HTML Report</h5>
              </div>
              <p className="text-muted m-0" style={{ fontSize: '13px' }}>
                View single page Gherkin BDD execution details, steps status and inline screenshot attachments.
              </p>
            </div>
            <div>
              {reportsInfo.cucumberHtmlAvailable ? (
                <a 
                  href="/reports/cucumber-report.html" 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn btn-primary d-flex align-items-center gap-2"
                >
                  <span>Open HTML</span>
                  <ExternalLink size={14} />
                </a>
              ) : (
                <span className="badge bg-secondary">Not Generated</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Screen & Video attachments browser */}
      <div className="row g-4">
        {/* Screenshots column */}
        <div className="col-lg-6">
          <div className="dashboard-card p-4 h-100">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <ImageIcon size={18} className="text-primary" />
              <span>Screenshots on Failures</span>
              {reportsInfo.screenshots.length > 0 && (
                <span className="badge bg-danger rounded-pill">{reportsInfo.screenshots.length}</span>
              )}
            </h5>

            <div 
              className="d-flex flex-column gap-3 overflow-y-auto" 
              style={{ maxHeight: '500px' }}
            >
              {reportsInfo.screenshots.length > 0 ? (
                reportsInfo.screenshots.map((img: any, idx: number) => (
                  <div key={idx} className="p-3 border rounded d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3">
                      {/* Image Thumbnail */}
                      <img 
                        src={img.url} 
                        alt={img.name} 
                        className="rounded cursor-pointer border"
                        style={{ width: '80px', height: '50px', objectFit: 'cover', cursor: 'zoom-in' }}
                        onClick={() => setSelectedImage(img.url)}
                      />
                      <div>
                        <div className="fw-semibold text-truncate" style={{ fontSize: '13px', maxWidth: '220px' }} title={img.name}>
                          {img.name}
                        </div>
                        <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                          Size: {formatBytes(img.size)} | Date: {new Date(img.mtime).toLocaleString()}
                        </small>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setSelectedImage(img.url)}
                        title="Zoom Image"
                      >
                        <Eye size={12} />
                      </button>
                      <a 
                        href={img.url} 
                        download={img.name}
                        className="btn btn-outline-secondary btn-sm"
                        title="Download Screenshot"
                      >
                        <Download size={12} />
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-5 text-muted border border-dashed rounded h-100 d-flex align-items-center justify-content-center flex-column">
                  <ImageIcon size={28} className="mb-2 opacity-50 text-secondary" />
                  <span>No screenshots logged on failures. All green!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Video recordings column */}
        <div className="col-lg-6">
          <div className="dashboard-card p-4 h-100">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <VideoIcon size={18} className="text-primary" />
              <span>Video Playbacks</span>
              {reportsInfo.videos.length > 0 && (
                <span className="badge bg-primary rounded-pill">{reportsInfo.videos.length}</span>
              )}
            </h5>

            <div 
              className="d-flex flex-column gap-3 overflow-y-auto" 
              style={{ maxHeight: '500px' }}
            >
              {reportsInfo.videos.length > 0 ? (
                reportsInfo.videos.map((vid: any, idx: number) => (
                  <div key={idx} className="p-3 border rounded d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="metric-badge bg-primary bg-opacity-10 text-primary m-0" style={{ width: '44px', height: '44px' }}>
                        <VideoIcon size={18} />
                      </div>
                      <div>
                        <div className="fw-semibold text-truncate" style={{ fontSize: '13px', maxWidth: '220px' }} title={vid.name}>
                          {vid.name}
                        </div>
                        <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                          Size: {formatBytes(vid.size)} | Date: {new Date(vid.mtime).toLocaleString()}
                        </small>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                        onClick={() => setSelectedVideo(vid.url)}
                      >
                        <Eye size={12} />
                        <span style={{ fontSize: '11px' }}>Play</span>
                      </button>
                      <a 
                        href={vid.url} 
                        download={vid.name}
                        className="btn btn-outline-secondary btn-sm"
                        title="Download Video"
                      >
                        <Download size={12} />
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-5 text-muted border border-dashed rounded h-100 d-flex align-items-center justify-content-center flex-column">
                  <VideoIcon size={28} className="mb-2 opacity-50 text-secondary" />
                  <span>No video playbacks generated. Check video options in execute.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="modal d-flex align-items-center justify-content-center" 
          style={{ background: 'rgba(0, 0, 0, 0.85)', zIndex: 1050, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
          onClick={() => setSelectedImage(null)}
        >
          <div className="position-relative" style={{ maxWidth: '90%', maxHeight: '90%' }}>
            <img 
              src={selectedImage} 
              alt="Zoomed Screenshot" 
              className="img-fluid rounded border border-light"
              style={{ maxHeight: '80vh' }}
            />
            <button 
              className="btn btn-dark position-absolute border border-secondary"
              style={{ top: '-15px', right: '-15px', borderRadius: '50%', width: '40px', height: '40px' }}
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="modal d-flex align-items-center justify-content-center" 
          style={{ background: 'rgba(0, 0, 0, 0.85)', zIndex: 1050, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
          onClick={() => setSelectedVideo(null)}
        >
          <div className="position-relative" style={{ width: '800px', maxWidth: '95%' }}>
            <video 
              src={selectedVideo} 
              controls 
              autoPlay 
              className="w-100 rounded border border-secondary"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              className="btn btn-dark position-absolute border border-secondary"
              style={{ top: '-15px', right: '-15px', borderRadius: '50%', width: '40px', height: '40px' }}
              onClick={() => setSelectedVideo(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
