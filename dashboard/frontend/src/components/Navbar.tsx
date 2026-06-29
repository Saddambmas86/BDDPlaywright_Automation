import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, AlertTriangle, RefreshCw } from 'lucide-react';
import { useExecution } from '../context/ExecutionContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { status, stopTest, currentUser } = useExecution();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Sync theme with DOM
  useEffect(() => {
    const savedTheme = localStorage.getItem('dashboard_theme') || 'dark';
    setTheme(savedTheme as 'light' | 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('dashboard_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // Get Page Title
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard Overview';
      case '/execute': return 'Execute Tests';
      case '/features': return 'Feature Browser';
      case '/reports': return 'Reports & Attachments';
      case '/history': return 'Execution History';
      case '/scheduler': return 'Execution Scheduler';
      case '/settings': return 'Framework Settings';
      case '/login': return 'Portal Login';
      default: return 'Playwright BDD Portal';
    }
  };

  return (
    <header className="top-navbar">
      <div>
        <h4 className="m-0 fw-bold">{getPageTitle()}</h4>
        <small className="text-muted d-none d-md-inline">Manage and analyze your Cucumber BDD automation runs</small>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Active execution warning */}
        {status.status === 'running' && (
          <div className="alert alert-warning py-1 px-3 m-0 d-flex align-items-center gap-2 border-0 bg-warning bg-opacity-25" style={{ borderRadius: '50px' }}>
            <RefreshCw size={14} className="spin text-warning" style={{ animation: 'spin 2s linear infinite' }} />
            <span className="text-warning fw-semibold" style={{ fontSize: '12px' }}>
              Execution Active ({status.progress}%)
            </span>
            {currentUser?.role !== 'Viewer' && (
              <button 
                onClick={stopTest} 
                className="btn btn-outline-danger btn-xs py-0 px-2 fw-bold" 
                style={{ fontSize: '10px', borderRadius: '20px' }}
              >
                Abort
              </button>
            )}
          </div>
        )}

        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme} 
          className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
          style={{ width: '40px', height: '40px', borderRadius: '50%' }}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Global style inject for rotation animation */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spin {
            animation: spin 1.5s linear infinite;
          }
        `}} />
      </div>
    </header>
  );
};
