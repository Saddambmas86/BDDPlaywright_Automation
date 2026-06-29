import React, { useState } from 'react';
import { Shield, Key, User, Info } from 'lucide-react';
import { useExecution } from '../context/ExecutionContext';
import { useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const { login, currentUser } = useExecution();
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<'Admin' | 'QA' | 'Viewer'>('QA');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // If already logged in, redirect home
  React.useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Preconfigured passwords for demo / ease of use
    const isValid = 
      (role === 'Admin' && username === 'admin' && password === 'admin123') ||
      (role === 'QA' && username === 'qa' && password === 'qa123') ||
      (role === 'Viewer' && username === 'viewer' && password === 'viewer123');

    if (isValid) {
      login(username === 'admin' ? 'Administrator' : username === 'qa' ? 'QA Automation Lead' : 'Guest Viewer', role);
      navigate('/');
    } else {
      setErrorMsg('Invalid credentials. Check the credential presets in the info panel below.');
    }
  };

  const handleSelectPreset = (presetRole: 'Admin' | 'QA' | 'Viewer') => {
    setRole(presetRole);
    if (presetRole === 'Admin') {
      setUsername('admin');
      setPassword('admin123');
    } else if (presetRole === 'QA') {
      setUsername('qa');
      setPassword('qa123');
    } else {
      setUsername('viewer');
      setPassword('viewer123');
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
        
        {/* Logo and header */}
        <div className="text-center mb-4">
          <span style={{ fontSize: '48px' }}>🎭</span>
          <h3 className="fw-bold mt-2">Playwright BDD Portal</h3>
          <p className="text-muted">Enter credentials to manage test execution dashboard</p>
        </div>

        {/* Login Card */}
        <div className="dashboard-card p-5 mb-4">
          {errorMsg && (
            <div className="alert alert-danger py-2" style={{ fontSize: '13px' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            {/* Role selection */}
            <div>
              <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Access Profile Role</label>
              <div className="btn-group w-100" role="group">
                {(['Admin', 'QA', 'Viewer'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`btn btn-sm ${role === r ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => handleSelectPreset(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Username */}
            <div className="position-relative mt-2">
              <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Username</label>
              <div className="position-relative">
                <User size={16} className="position-absolute text-secondary" style={{ left: '12px', top: '12px' }} />
                <input 
                  type="text" 
                  className="form-control ps-5" 
                  placeholder="Enter username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="position-relative mt-1">
              <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Password</label>
              <div className="position-relative">
                <Key size={16} className="position-absolute text-secondary" style={{ left: '12px', top: '12px' }} />
                <input 
                  type="password" 
                  className="form-control ps-5" 
                  placeholder="Enter password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button 
              type="submit" 
              className="btn btn-primary w-100 py-2 fw-semibold mt-3 d-flex align-items-center justify-content-center gap-2"
            >
              <Shield size={16} />
              <span>Authenticate Portal Access</span>
            </button>
          </form>
        </div>

        {/* Credentials Info Help Panel */}
        <div className="p-4 border rounded bg-secondary bg-opacity-10 d-flex gap-3">
          <Info size={24} className="text-info flex-shrink-0" />
          <div style={{ fontSize: '13px' }}>
            <h6 className="fw-bold text-info m-0 mb-1">Preset Credentials Directory</h6>
            <div className="text-muted mt-2 d-flex flex-column gap-1">
              <div>⚙️ <strong>Admin (Full access):</strong> username: <code>admin</code> / password: <code>admin123</code></div>
              <div>🧑‍💻 <strong>QA Lead (Runs only):</strong> username: <code>qa</code> / password: <code>qa123</code></div>
              <div>👁️ <strong>Viewer (Read only):</strong> username: <code>viewer</code> / password: <code>viewer123</code></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
