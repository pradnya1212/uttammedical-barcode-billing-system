import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ShieldCheck, Lock, User, ArrowRight, Eye, EyeOff, Building2, Store } from 'lucide-react';
import './login.css';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8086';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'utaam123';

function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Verify existing admin token on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem('utaam_admin_token');
      const s = JSON.parse(localStorage.getItem('utaam_admin_session') || 'null');
      if (token && s && (Date.now() - s.loginAt < 8 * 60 * 60 * 1000)) {
        fetch(`${API}/api/auth/admin/verify-token?token=${encodeURIComponent(token)}`)
          .then(res => {
            if (res.ok) window.location.href = '/';
          })
          .catch(() => {
            if (Date.now() - s.loginAt < 8 * 60 * 60 * 1000) {
              window.location.href = '/';
            }
          });
      }
    } catch {
      // ignore
    }
  }, []);

  async function handleAdminSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('utaam_admin_token', data.adminToken);
        localStorage.setItem(
          'utaam_admin_session',
          JSON.stringify({
            username: username.trim(),
            token: data.adminToken,
            loginAt: Date.now()
          })
        );
        window.location.href = '/';
      } else {
        if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
          const fallbackToken = 'ADM-TOKEN-' + Date.now();
          localStorage.setItem('utaam_admin_token', fallbackToken);
          localStorage.setItem(
            'utaam_admin_session',
            JSON.stringify({ username: username.trim(), token: fallbackToken, loginAt: Date.now() })
          );
          window.location.href = '/';
        } else {
          setError(data.message || 'Invalid administrator credentials. Access restricted to pharmacy staff.');
        }
      }
    } catch {
      if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const fallbackToken = 'ADM-TOKEN-' + Date.now();
        localStorage.setItem('utaam_admin_token', fallbackToken);
        localStorage.setItem(
          'utaam_admin_session',
          JSON.stringify({ username: username.trim(), token: fallbackToken, loginAt: Date.now() })
        );
        window.location.href = '/';
      } else {
        setError('Authentication server error. Please verify credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-bg admin-login-theme">
      {/* Left panel - Admin Branding */}
      <div className="login-brand-panel admin-brand-side">
        <div className="brand-content">
          <div className="brand-logo admin-logo-badge">
            <Building2 size={32} color="#34d399" />
          </div>
          <h1>UTAAM <span>PHARMACY</span><br/><small style={{ fontSize: '1rem', color: '#a7f3d0' }}>Admin & Staff Portal</small></h1>
          <p className="brand-tagline">
            Restricted management workspace for inventory controllers, pharmacists, and dispatch managers.
          </p>

          <ul className="brand-features">
            <li>📦 Live Medicine Stock & Batch Control</li>
            <li>🏷️ GS1 & Code128 Barcode Printing</li>
            <li>📋 Order Processing & Dispatch Lifecycle</li>
            <li>📊 Expiry Tracking & Real-time Analytics</li>
            <li>🔒 Protected Multi-level Access</li>
          </ul>
        </div>

        <div className="brand-footer">
          <div>© 2026 UTAAM Medical · Pharmacy Management System</div>
          <div style={{ marginTop: '6px', color: '#6ee7b7', fontSize: '12px' }}>
            Authorized pharmacy staff only.
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="login-form-panel">
        <div className="login-card admin-login-card">
          <div className="login-type-switcher">
            <a href="/login.html" className="switch-opt">
              <User size={15} /> Customer Login
            </a>
            <span className="switch-opt active-opt">
              <ShieldCheck size={15} /> Admin Portal
            </span>
          </div>

          <div className="login-card-body">
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <div className="admin-badge-pill">
                <Lock size={12} /> RESTRICTED ACCESS
              </div>
              <h2 className="login-title" style={{ marginTop: '8px' }}>Administrator Sign In</h2>
              <p className="login-subtitle">Enter your pharmacy staff credentials to access the console.</p>
            </div>

            {error && (
              <div className="auth-alert auth-alert--error" style={{ textAlign: 'left' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleAdminSubmit} className="auth-form" autoComplete="off">
              <div className="form-group">
                <label htmlFor="admin-user">Administrator Username</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input
                    id="admin-user"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Enter 'admin'"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="admin-pass">Staff Password</label>
                <div className="password-wrapper input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="admin-pass"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter 'utaam123'"
                    required
                  />
                  <button
                    type="button"
                    className="pass-toggle"
                    onClick={() => setShowPass(s => !s)}
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="admin-hint-box">
                <small><b>Authorized Staff Credentials:</b> User: <code>admin</code> | Pass: <code>utaam123</code></small>
              </div>

              <button
                type="submit"
                className="btn-primary-auth admin-btn"
                disabled={loading}
              >
                {loading ? 'Authenticating Staff…' : 'Access Admin Workspace →'}
              </button>
            </form>

            <div className="admin-footer-links">
              <span>Looking for the pharmacy store?</span>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '6px' }}>
                <a href="/login.html" className="link-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={14} /> Customer Sign In
                </a>
                <span style={{ color: '#d1d5db' }}>|</span>
                <a href="/store.html" className="link-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Store size={14} /> Customer Storefront
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('admin-login-root')).render(<AdminLoginPage />);
