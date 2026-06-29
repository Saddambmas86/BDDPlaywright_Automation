import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Play, 
  FolderSearch, 
  FileSpreadsheet, 
  History, 
  Calendar, 
  Settings, 
  LogOut,
  ShieldCheck,
  Server
} from 'lucide-react';
import { useExecution } from '../context/ExecutionContext';

export const Sidebar: React.FC = () => {
  const { currentUser, logout, isConnected } = useExecution();

  return (
    <div className="sidebar">
      <div className="p-4 border-bottom border-secondary d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <span className="fs-4 me-2">🎭</span>
          <div>
            <h5 className="m-0 fw-bold text-light">Playwright BDD</h5>
            <small className="text-secondary" style={{ fontSize: '10px' }}>AUTOMATION FRAMEWORK</small>
          </div>
        </div>
      </div>

      <div className="p-3 border-bottom border-secondary bg-dark bg-opacity-25 d-flex align-items-center">
        <div className="metric-badge bg-primary bg-opacity-20 text-primary m-0 me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
          <ShieldCheck size={20} className="text-info" />
        </div>
        <div>
          <div className="text-light fw-semibold" style={{ fontSize: '14px' }}>{currentUser?.name || 'Guest'}</div>
          <span className="badge bg-secondary text-capitalize" style={{ fontSize: '10px' }}>{currentUser?.role || 'Viewer'}</span>
        </div>
      </div>

      <ul className="nav-menu">
        <li className="nav-item-custom">
          <NavLink to="/" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li className="nav-item-custom">
          <NavLink to="/execute" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>
            <Play size={18} />
            <span>Execute Tests</span>
          </NavLink>
        </li>
        <li className="nav-item-custom">
          <NavLink to="/features" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>
            <FolderSearch size={18} />
            <span>Feature Browser</span>
          </NavLink>
        </li>
        <li className="nav-item-custom">
          <NavLink to="/reports" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>
            <FileSpreadsheet size={18} />
            <span>Reports & Media</span>
          </NavLink>
        </li>
        <li className="nav-item-custom">
          <NavLink to="/history" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>
            <History size={18} />
            <span>Test History</span>
          </NavLink>
        </li>
        <li className="nav-item-custom">
          <NavLink to="/scheduler" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>
            <Calendar size={18} />
            <span>Scheduler</span>
          </NavLink>
        </li>
        <li className="nav-item-custom">
          <NavLink to="/settings" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
        </li>
      </ul>

      <div className="mt-auto position-absolute bottom-0 w-100 p-3 border-top border-secondary bg-dark bg-opacity-10 d-flex flex-column gap-2">
        <div className="d-flex align-items-center justify-content-between text-secondary" style={{ fontSize: '12px' }}>
          <div className="d-flex align-items-center">
            <Server size={14} className="me-1" />
            <span>Status:</span>
          </div>
          <span className={`fw-semibold ${isConnected ? 'text-success' : 'text-danger'}`}>
            ● {isConnected ? 'Connected' : 'Offline'}
          </span>
        </div>
        <button 
          onClick={logout} 
          className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center gap-2 mt-1"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
