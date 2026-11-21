import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './login.css';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8086';

function LoginApp() {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'verify'
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

  // Email verification state
  const [verifyCode, setVerifyCode] = useState('');
  const [simulatedCode, setSimulatedCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // If already logged in, redirect to store
  useEffect(() => {
    const existing = localStorage.getItem('utaam_session');
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        if (parsed.emailVerified !== false) {
          window.location.href = '/store.html';
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Cooldown timer for resend code
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(c => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  function switchMode(m) {
    setMode(m);
    setError('');
    setSuccess('');
  }

  function validateEmail(val) {
    return /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/.test(val.trim());
  }

  function validateRealPhone(val) {
    // 10-digit mobile number, e.g. starts with 6,7,8,9 (Indian standard) or 10-15 digits
    const cleaned = val.replace(/[\s\-\(\)\+]/g, '');
    return /^(?:91|0)?[6-9]\d{9}$/.test(cleaned);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validations
    const cleanEmail = email.trim().toLowerCase();
    if (!validateEmail(cleanEmail)) {
      setError('Please enter a valid email address (e.g., yourname@gmail.com).');
      return;
    }

    if (mode === 'register') {
      if (!name.trim() || name.trim().length < 2) {
        setError('Please enter your full name (at least 2 characters).');
        return;
      }
      if (!validateRealPhone(phone)) {
        setError('Please enter a real 10-digit mobile phone number (e.g., 9876543210).');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long for security.');
        return;
      }
    }

    setLoading(true);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = mode === 'login'
      ? { email: cleanEmail, password }
      : { name: name.trim(), email: cleanEmail, password, phone: phone.trim(), address: address.trim() };

    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        // If login failed because email is not verified yet
        if (data.emailVerified === false) {
          setPendingEmail(cleanEmail);
          setSimulatedCode(data.verificationCode || '');
          setMode('verify');
          setError('Email verification required. Please enter the 6-digit code sent to your email.');
        } else {
          setError(data.message || 'Authentication failed. Please check your credentials.');
        }
      } else {
        // Successful register
        if (mode === 'register') {
          setPendingEmail(cleanEmail);
          setSimulatedCode(data.verificationCode || '');
          setMode('verify');
          setSuccess('Account created! A 6-digit verification code has been generated for ' + cleanEmail);
          setResendCooldown(30);
        } else {
          // Successful login
          saveSessionAndRedirect(data);
        }
      }
    } catch (err) {
      setError('Cannot connect to server. Ensure the UTAAM backend is running at ' + API);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!verifyCode.trim() || verifyCode.trim().length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingEmail || email.trim().toLowerCase(),
          code: verifyCode.trim()
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Invalid verification code. Please check and try again.');
      } else {
        setSuccess('✓ Email verified successfully! Redirecting to storefront…');
        saveSessionAndRedirect(data);
      }
    } catch (err) {
      setError('Error during verification: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    if (resendCooldown > 0) return;
    setError('');
    try {
      const res = await fetch(`${API}/api/auth/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail || email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (data.success) {
        setSimulatedCode(data.verificationCode || '');
        setSuccess('New 6-digit code generated! Check your email or preview code below.');
        setResendCooldown(45);
      } else {
        setError(data.message || 'Failed to resend code');
      }
    } catch (err) {
      setError('Failed to resend code: ' + err.message);
    }
  }

  function saveSessionAndRedirect(data) {
    const sessionObj = {
      customerId: data.customerId,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      address: data.address || '',
      emailVerified: true,
      authToken: data.authToken || ''
    };
    localStorage.setItem('utaam_session', JSON.stringify(sessionObj));
    localStorage.setItem('utaam_customer', JSON.stringify({
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      address: data.address || ''
    }));

    setTimeout(() => {
      window.location.href = '/store.html';
    }, 800);
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
          <p className="brand-tagline">Your trusted neighbourhood pharmacy, online with verified security.</p>
          <ul className="brand-features">
            <li>🛡️ Secure SHA-256 / PBKDF2 Encrypted Accounts</li>
            <li>✉️ Verified Real Email & Mobile Authentication</li>
            <li>🚚 Fast Express Prescription & OTC Delivery</li>
            <li>💊 100% Genuine Certified Batch Inventory</li>
            <li>📍 Real-time GPS & Stage Order Tracking</li>
          </ul>
        </div>
        <div className="brand-footer">© 2026 UTAAM Medical Pharmacy. All rights reserved.</div>
      </div>

      {/* Right form panel */}
      <div className="login-form-panel">
        <div className="login-card">

          {mode !== 'verify' && (
            <div className="login-tabs">
              <button
                type="button"
                className={`login-tab ${mode === 'login' ? 'active' : ''}`}
                onClick={() => switchMode('login')}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`login-tab ${mode === 'register' ? 'active' : ''}`}
                onClick={() => switchMode('register')}
              >
                Create Account
              </button>
            </div>
          )}

          <div className="login-card-body">
            {mode === 'verify' ? (
              /* Email Verification Screen */
              <div className="verify-container">
                <div className="verify-badge-icon">✉️</div>
                <h2 className="login-title">Verify Your Email</h2>
                <p className="login-subtitle">
                  We've sent a 6-digit verification code to <b>{pendingEmail || email}</b>. Enter it below to complete verification.
                </p>

                {simulatedCode && (
                  <div className="otp-preview-card" onClick={() => setVerifyCode(simulatedCode)}>
                    <div className="otp-preview-badge">Email Simulator (Local Dev)</div>
                    <p>New Email received: <b>UTAAM Account Verification</b></p>
                    <div className="otp-code-display">
                      <span>Verification Code:</span>
                      <strong>{simulatedCode}</strong>
                      <span className="otp-click-hint">(Click to auto-fill)</span>
                    </div>
                  </div>
                )}

                {error && <div className="auth-alert auth-alert--error">{error}</div>}
                {success && <div className="auth-alert auth-alert--success">{success}</div>}

                <form onSubmit={handleVerify} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="verifyCode">Enter 6-digit Code</label>
                    <input
                      id="verifyCode"
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={verifyCode}
                      onChange={e => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                      className="otp-input"
                      autoFocus
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary-auth"
                    disabled={loading || verifyCode.length < 6}
                  >
                    {loading ? 'Verifying…' : '✓ Verify & Proceed to Store'}
                  </button>

                  <div className="resend-row">
                    <span>Didn't get the code?</span>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={handleResendCode}
                      disabled={resendCooldown > 0}
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                  </div>

                  <button
                    type="button"
                    className="link-btn back-btn"
                    onClick={() => switchMode('login')}
                  >
                    ← Back to Sign In
                  </button>
                </form>
              </div>
            ) : (
              /* Login / Register Screens */
              <>
                <h2 className="login-title">
                  {mode === 'login' ? 'Welcome back 👋' : 'Create your account'}
                </h2>
                <p className="login-subtitle">
                  {mode === 'login'
                    ? 'Sign in with your verified email and password to track orders.'
                    : 'Register with real email and phone number for secure medicine ordering.'}
                </p>

                {error && <div className="auth-alert auth-alert--error">{error}</div>}
                {success && <div className="auth-alert auth-alert--success">✓ {success}</div>}

                <form onSubmit={handleSubmit} className="auth-form" autoComplete="on">
                  {mode === 'register' && (
                    <div className="form-group">
                      <label htmlFor="name">Full Name *</label>
                      <input
                        id="name"
                        type="text"
                        placeholder="e.g. Pradnya Turewale"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        autoComplete="name"
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="email">Real Email Address *</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="e.g. yourname@gmail.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                    <small className="field-hint">A 6-digit verification code will be sent to this email.</small>
                  </div>

                  {mode === 'register' && (
                    <div className="form-group">
                      <label htmlFor="phone">Real 10-digit Mobile Phone Number *</label>
                      <div className="phone-input-wrapper">
                        <span className="phone-prefix">+91</span>
                        <input
                          id="phone"
                          type="tel"
                          maxLength={10}
                          placeholder="9876543210"
                          value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                          required
                          autoComplete="tel"
                        />
                      </div>
                      <small className="field-hint">Real mobile number used for delivery SMS & order tracking.</small>
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="password">
                      Password * {mode === 'register' && <span className="field-hint">(Min. 6 characters)</span>}
                    </label>
                    <div className="password-wrapper">
                      <input
                        id="password"
                        type={showPass ? 'text' : 'password'}
                        placeholder={mode === 'register' ? 'Choose a strong password' : 'Enter your password'}
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
                    <div className="form-group">
                      <label htmlFor="address">Delivery Address (Optional)</label>
                      <textarea
                        id="address"
                        placeholder="Flat / House No, Street, Landmark, City, PIN Code"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        rows={2}
                        autoComplete="street-address"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn-primary-auth"
                    disabled={loading}
                  >
                    {loading
                      ? (mode === 'login' ? 'Signing in…' : 'Creating Account & Sending Code…')
                      : (mode === 'login' ? 'Sign In' : 'Create Account & Verify Email')}
                  </button>
                </form>

                <p className="switch-hint">
                  {mode === 'login' ? (
                    <>New to UTAAM? <button className="link-btn" onClick={() => switchMode('register')}>Create an account</button></>
                  ) : (
                    <>Already have an account? <button className="link-btn" onClick={() => switchMode('login')}>Sign in</button></>
                  )}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('login-root')).render(<LoginApp />);
