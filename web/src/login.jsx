import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './login.css';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8086';

function LoginApp() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [showPass, setShowPass] = useState(false);

  // If already logged in, go straight to store
  useEffect(() => {
    const existing = localStorage.getItem('utaam_session');
    if (existing) {
      window.location.href = '/store.html';
    }
  }, []);

  function switchMode(m) {
    setMode(m);
    setError('');
    setSuccess('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = mode === 'login'
      ? { email, password }
      : { name, email, password, phone, address };

    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Something went wrong. Please try again.');
      } else {
        // Save session to localStorage
        localStorage.setItem('utaam_session', JSON.stringify({
          customerId: data.customerId,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          address: data.address || '',
        }));
        // Also update utaam_customer for checkout pre-fill
        localStorage.setItem('utaam_customer', JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          address: data.address || '',
        }));
        setSuccess(data.message);
        setTimeout(() => {
          window.location.href = '/store.html';
        }, 800);
      }
    } catch (err) {
      setError('Cannot connect to server. Make sure the backend is running at ' + API);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-bg">
      {/* Left branding panel */}
      <div className="login-brand-panel">
        <div className="brand-content">
          <div className="brand-logo">
            <span className="brand-cross">✚</span>
          </div>
          <h1>UTAAM <span>MEDICAL</span></h1>
          <p className="brand-tagline">Your trusted neighbourhood pharmacy, online.</p>
          <ul className="brand-features">
            <li>🚚 Fast home delivery</li>
            <li>💊 Genuine medicines</li>
            <li>🔒 Secure & private</li>
            <li>📋 Order history & tracking</li>
          </ul>
        </div>
        <div className="brand-footer">© 2026 UTAAM Medical. All rights reserved.</div>
      </div>

      {/* Right form panel */}
      <div className="login-form-panel">
        <div className="login-card">
          {/* Tab switcher */}
          <div className="login-tabs">
            <button
              className={`login-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Sign In
            </button>
            <button
              className={`login-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => switchMode('register')}
            >
              Create Account
            </button>
          </div>

          <div className="login-card-body">
            <h2 className="login-title">
              {mode === 'login' ? 'Welcome back 👋' : 'Create your account'}
            </h2>
            <p className="login-subtitle">
              {mode === 'login'
                ? 'Sign in to order medicines and track deliveries.'
                : 'Join UTAAM Medical for fast, reliable medicine delivery.'}
            </p>

            {error && <div className="auth-alert auth-alert--error">{error}</div>}
            {success && <div className="auth-alert auth-alert--success">✓ {success}</div>}

            <form onSubmit={handleSubmit} className="auth-form" autoComplete="on">
              {mode === 'register' && (
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Pradnya Turewale"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-wrapper">
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder={mode === 'register' ? 'Min. 6 characters' : 'Your password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    className="pass-toggle"
                    onClick={() => setShowPass(s => !s)}
                    tabIndex={-1}
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="07719061073"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      autoComplete="tel"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address">Delivery Address <span className="optional">(optional)</span></label>
                    <textarea
                      id="address"
                      placeholder="House No, Street, City, PIN"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      rows={2}
                      autoComplete="street-address"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="btn-primary-auth"
                disabled={loading}
              >
                {loading
                  ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
                  : (mode === 'login' ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <p className="switch-hint">
              {mode === 'login' ? (
                <>New to UTAAM? <button className="link-btn" onClick={() => switchMode('register')}>Create an account</button></>
              ) : (
                <>Already have an account? <button className="link-btn" onClick={() => switchMode('login')}>Sign in</button></>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('login-root')).render(<LoginApp />);

