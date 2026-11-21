
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserMultiFormatReader } from '@zxing/browser';
import {
  Activity, AlertTriangle, Barcode, Boxes, Camera, Check,
  ChevronRight, CircleDollarSign, ClipboardList, LayoutDashboard,
  Menu, PackagePlus, Pill, Plus, Printer, RefreshCw, Search,
  ShieldCheck, X, Truck, Users, ShoppingCart, ShoppingBag, Receipt,
  RotateCcw, Bell, FileBarChart, Trash2, ClipboardCheck,
  UserRound, Save, Mail, Phone, MapPin, Building2
} from 'lucide-react';
import './styles.css';
import UtaamFooter from './UtaamFooter';
import OrdersView from './OrdersView';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8086';

const emptyMedicine = {
  medicineName: '',
  genericName: '',
  strength: '',
  dosageForm: 'TABLET',
  manufacturer: '',
  category: '',
  prescriptionRequired: false,
  manufacturerBarcode: ''
};

const emptyBatch = {
  batchNumber: '',
  mrp: '',
  purchasePrice: '',
  manufacturingDate: '',
  expiryDate: '',
  quantity: '0'
};

const defaultProfile = {
  fullName: 'Pharmacy Administrator',
  role: 'Administrator',
  email: '',
  phone: '',
  pharmacyName: 'UTAAM MEDICAL',
  address: ''
};

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    }
  });

  const text = await response.text();

  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { detail: text };
  }

  if (!response.ok) {
    throw new Error(
      data.detail || data.message || `Request failed (${response.status})`
    );
  }

  return data;
}

function money(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

function date(value) {
  return value
    ? new Date(`${value}T00:00:00`).toLocaleDateString('en-IN')
    : '—';
}

/* ── Admin credentials (change these for production) ── */
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'utaam123';

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem('utaam_admin_session', JSON.stringify({ username, loginAt: Date.now() }));
        onLogin();
      } else {
        setError('Invalid username or password.');
      }
      setLoading(false);
    }, 400);
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f2027, #1b4332, #203a43)',
      fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, boxShadow: '0 8px 48px rgba(0,0,0,0.25)',
        width: '100%', maxWidth: 400, overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1b4332, #2d6a4f)',
          padding: '32px 32px 24px', textAlign: 'center', color: '#fff'
        }}>
          <div style={{
            width: 56, height: 56, background: 'rgba(255,255,255,0.15)',
            borderRadius: 16, display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px', fontSize: 26
          }}>🏥</div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: '#95d5b2', fontWeight: 600 }}>UTAAM MEDICAL</div>
          <h1 style={{ margin: '6px 0 4px', fontSize: '1.4rem', fontWeight: 700 }}>Admin Portal</h1>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>Pharmacy Management System</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '28px 32px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
              borderRadius: 10, padding: '10px 14px', fontSize: '0.875rem', fontWeight: 500
            }}>⚠ {error}</div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              required
              autoComplete="username"
              style={{
                padding: '11px 14px', border: '1.5px solid #d1d5db', borderRadius: 10,
                fontSize: '0.95rem', outline: 'none', background: '#f9fafb', fontFamily: 'inherit'
              }}
              onFocus={e => e.target.style.borderColor = '#2d6a4f'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{
                  width: '100%', padding: '11px 44px 11px 14px', border: '1.5px solid #d1d5db',
                  borderRadius: 10, fontSize: '0.95rem', outline: 'none', background: '#f9fafb',
                  fontFamily: 'inherit', boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = '#2d6a4f'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.6
                }}
              >{showPass ? '🙈' : '👁️'}</button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: 13, marginTop: 4,
              background: loading ? '#6b7280' : 'linear-gradient(135deg, #2d6a4f, #1b4332)',
              color: '#fff', border: 'none', borderRadius: 12, fontSize: '1rem',
              fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
            }}
          >
            {loading ? 'Signing in…' : 'Sign In to Admin'}
          </button>

          <div style={{ textAlign: 'center', margin: 0, fontSize: '0.82rem', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div>
              Customer looking to buy or track orders?{' '}
              <a href="/login.html" style={{ color: '#2d6a4f', fontWeight: 600, textDecoration: 'none' }}>
                Customer Sign In →
              </a>
            </div>
            <div>
              <a href="/store.html" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.78rem' }}>
                Browse Pharmacy Storefront
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function App() {
  /* ── Admin auth guard with backend token verification ── */
  const [adminLoggedIn, setAdminLoggedIn] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem('utaam_admin_session') || 'null');
      return s && (Date.now() - s.loginAt < 8 * 60 * 60 * 1000);
    } catch { return false; }
  });

  // Verify Admin Token with Backend on Mount
  useEffect(() => {
    const token = localStorage.getItem('utaam_admin_token');
    const s = JSON.parse(localStorage.getItem('utaam_admin_session') || 'null');

    if (!token && !s) {
      window.location.href = '/admin-login.html';
      return;
    }

    if (token) {
      fetch(`${API}/api/auth/admin/verify-token?token=${encodeURIComponent(token)}`)
        .then(res => {
          if (!res.ok) throw new Error('Admin session expired');
          return res.json();
        })
        .then(data => {
          if (!data.valid) throw new Error('Invalid admin token');
        })
        .catch(() => {
          localStorage.removeItem('utaam_admin_session');
          localStorage.removeItem('utaam_admin_token');
          window.location.href = '/admin-login.html?expired=1';
        });
    }
  }, []);

  function handleAdminLogout() {
    const token = localStorage.getItem('utaam_admin_token');
    if (token) {
      fetch(`${API}/api/auth/admin/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      }).catch(() => {});
    }
    localStorage.removeItem('utaam_admin_session');
    localStorage.removeItem('utaam_admin_token');
    window.location.href = '/admin-login.html';
  }

  if (!adminLoggedIn) {
    window.location.href = '/admin-login.html';
    return null;
  }

  const [page, setPage] = useState('dashboard');
  const [medicines, setMedicines] = useState([]);
  const [selected, setSelected] = useState(null);
  const [batches, setBatches] = useState([]);
  const [allBatches, setAllBatches] = useState([]);

  const [barcodeSearch, setBarcodeSearch] = useState('');
  const [barcodeTab, setBarcodeTab] = useState('lookup');

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [medicineForm, setMedicineForm] = useState(emptyMedicine);
  const [batchForm, setBatchForm] = useState(emptyBatch);

  const [showMedicine, setShowMedicine] = useState(false);
  const [showBatch, setShowBatch] = useState(false);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanTarget, setScanTarget] = useState('medicine');
  const [scanValue, setScanValue] = useState('');
  const [barcodeResult, setBarcodeResult] = useState(null);

  const [mobileNav, setMobileNav] = useState(false);

  const [profile, setProfile] = useState(() => {
    try {
      return {
        ...defaultProfile,
        ...JSON.parse(localStorage.getItem('utaam_profile') || '{}')
      };
    } catch {
      return defaultProfile;
    }
  });

  const [profileSaved, setProfileSaved] = useState(false);

  const videoRef = useRef(null);
  const readerRef = useRef(null);

  async function loadMedicines() {
    setLoading(true);
    setError('');

    try {
      setMedicines(await api('/api/medicines'));
    } catch (e) {
      setError(`${e.message}. Check that the backend is running at ${API}.`);
    } finally {
      setLoading(false);
    }
  }

  async function loadAllBatches() {
    setLoading(true);
    setError('');

    try {
      const records = await Promise.all(
        medicines.map(async medicine => {
          const rows = await api(`/api/medicines/${medicine.id}/batches`);

          return rows.map(batch => ({
            ...batch,
            medicineName: batch.medicineName || medicine.medicineName,
            medicineCode: batch.medicineCode || medicine.medicineCode
          }));
        })
      );

      setAllBatches(records.flat());
    } catch (e) {
      setError(`Could not load batch barcodes: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function loadBatches(medicine) {
    setSelected(medicine);
    setPage('details');
    setError('');

    try {
      setBatches(await api(`/api/medicines/${medicine.id}/batches`));
    } catch (e) {
      setBatches([]);
      setError(e.message);
    }
  }

  useEffect(() => {
    loadMedicines();
  }, []);

  useEffect(() => {
    if (!scannerOpen || !videoRef.current) return;

    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    let active = true;

    reader.decodeFromVideoDevice(
      undefined,
      videoRef.current,
      result => {
        if (active && result) {
          const value = result.getText();

          setScanValue(value);
          setScannerOpen(false);
          stopScanner();

          if (scanTarget === 'medicine') {
            setMedicineForm(f => ({
              ...f,
              manufacturerBarcode: value
            }));
          } else {
            setBarcodeResult(value);
          }
        }
      }
    ).catch(e => {
      setError(`Camera could not start: ${e.message}`);
    });

    return () => {
      active = false;
      stopScanner();
    };
  }, [scannerOpen]);

  function stopScanner() {
    try {
      readerRef.current?.reset();
    } catch { }
  }

  function openScanner(target) {
    setScanTarget(target);
    setScannerOpen(true);
    setError('');
  }

  async function submitMedicine(e) {
    e.preventDefault();
    setError('');
    setNotice('');

    try {
      const created = await api('/api/medicines', {
        method: 'POST',
        body: JSON.stringify(medicineForm)
      });

      setMedicineForm(emptyMedicine);
      setShowMedicine(false);

      await loadMedicines();

      setNotice(`Medicine ${created.medicineCode} registered successfully.`);
      setSelected(created);
      setPage('details');
      setBatches([]);
    } catch (e) {
      setError(e.message);
    }
  }

  async function submitBatch(e) {
    e.preventDefault();

    if (!selected) return;

    setError('');
    setNotice('');

    try {
      const created = await api(
        `/api/medicines/${selected.id}/batches`,
        {
          method: 'POST',
          body: JSON.stringify({
            ...batchForm,
            mrp: Number(batchForm.mrp),
            purchasePrice:
              batchForm.purchasePrice === ''
                ? null
                : Number(batchForm.purchasePrice),
            quantity: Number(batchForm.quantity)
          })
        }
      );

      setBatchForm(emptyBatch);
      setShowBatch(false);

      setBatches(
        await api(`/api/medicines/${selected.id}/batches`)
      );

      setNotice(
        `Batch ${created.batchNumber} saved. Internal barcode: ${created.internalBarcode}`
      );
    } catch (e) {
      setError(e.message);
    }
  }

  async function lookupBarcode(value = barcodeResult) {
    if (!value?.trim()) return;

    setError('');
    setNotice('');

    try {
      const path = value.startsWith('UTB-')
        ? `/api/barcode/batch/${encodeURIComponent(value)}`
        : `/api/barcode/${encodeURIComponent(value)}`;

      const result = await api(path);

      setBarcodeResult(value);

      if (!result.found) {
        setError('Barcode not found. Register the medicine or batch first.');
        return;
      }

      if (result.batch) {
        const m = result.medicine;

        setSelected(m);
        setBatches([result.batch]);
        setPage('details');

        setNotice(
          `Batch found: ${m.medicineName} · ${result.batch.batchNumber}`
        );
      } else {
        setSelected(result.medicine);
        setPage('details');
        setBatches([]);

        setNotice(
          `Medicine found: ${result.medicine.medicineName}`
        );
      }
    } catch (e) {
      setError(e.message);
    }
  }

  const filtered = useMemo(
    () =>
      medicines.filter(m =>
        `${m.medicineName} ${m.genericName || ''} ${m.medicineCode} ${m.manufacturer || ''}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [medicines, search]
  );

  const totalBatches = batches.length;

  const expiring = batches.filter(
    b =>
      b.expiryDate &&
      new Date(`${b.expiryDate}T00:00:00`) <
      new Date(Date.now() + 90 * 86400000)
  ).length;

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Customer Orders', icon: ShoppingBag },
    { id: 'profile', label: 'My profile', icon: UserRound },
    { id: 'medicines', label: 'Medicines', icon: Pill },
    { id: 'barcode-center', label: 'Barcode Center', icon: Barcode },
    { id: 'module-suppliers', label: 'Suppliers', icon: Truck },
    { id: 'module-customers', label: 'Customers', icon: Users },
    { id: 'module-purchases', label: 'Purchase orders', icon: ShoppingCart },
    { id: 'module-sales', label: 'Sales & billing', icon: Receipt },
    { id: 'module-returns', label: 'Returns', icon: RotateCcw },
    { id: 'module-alerts', label: 'Stock alerts', icon: Bell },
    { id: 'module-reports', label: 'Reports', icon: FileBarChart },
    { id: 'module-audit', label: 'Activity log', icon: ClipboardCheck }
  ];

  const go = id => {
    setPage(id);
    setMobileNav(false);
    setError('');
    setNotice('');

    if (id === 'barcode-center') {
      setBarcodeTab('lookup');
      loadAllBatches();
    }
  };

  const barcodeFiltered = allBatches.filter(b =>
    `${b.medicineName} ${b.medicineCode} ${b.batchNumber} ${b.internalBarcode}`
      .toLowerCase()
      .includes(barcodeSearch.toLowerCase())
  );

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>

        <div
          className="brand"
          onClick={() => go('dashboard')}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              go('dashboard');
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="brand-mark">
            <Pill size={22} />
          </div>
          <div>
            <strong>UTAAM</strong>
            <span>MEDICAL</span>
          </div>
        </div>


        <div className="workspace-label">WORKSPACE</div>

        <nav>
          {navItems.map(n => (
            <button
              key={n.id}
              className={`nav-item ${page === n.id ? 'active' : ''}`}
              onClick={() => go(n.id)}
            >
              <n.icon size={18} />
              <span>{n.label}</span>
              {n.id === 'medicines' && <small>{medicines.length}</small>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="secure">
            <ShieldCheck size={18} />
            <div>
              <b>Inventory protected</b>
              <span>Local workspace</span>
            </div>
          </div>
          <button
            onClick={handleAdminLogout}
            style={{
              width: '100%', padding: '9px 12px', marginTop: 8,
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 10, color: '#ef4444', fontSize: '0.82rem', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit'
            }}
          >
            <span>⏻</span> Sign Out
          </button>
          <span className="version">UTAAM MEDICAL · v1.0</span>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="icon-btn mobile-menu"
            onClick={() => setMobileNav(!mobileNav)}
          >
            <Menu />
          </button>

          <div className="crumb">
            Workspace <ChevronRight size={14} />
            <b>
              {page === 'details'
                ? 'Medicine details'
                : navItems.find(n => n.id === page)?.label || 'Overview'}
            </b>
          </div>

          <div className="top-actions">
            <a
              className="store-link"
              href="/store.html"
              target="_blank"
              rel="noreferrer"
            >
              Customer store <span>↗</span>
            </a>

            <span className="api-status">
              <i /> API connection
            </span>

            <button
              className="icon-btn"
              title="Refresh"
              onClick={loadMedicines}
            >
              <RefreshCw size={17} />
            </button>

            <button
              className="avatar avatar-button"
              title="My profile"
              onClick={() => go('profile')}
            >
              {(profile.fullName || 'UM')
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map(x => x[0])
                .join('')
                .toUpperCase()}
            </button>
          </div>
        </header>

        <div className="content">
          {error && (
            <div className="alert error">
              <AlertTriangle size={17} />
              <span>{error}</span>
              <button onClick={() => setError('')}>
                <X size={16} />
              </button>
            </div>
          )}

          {notice && (
            <div className="alert success">
              <Check size={17} />
              <span>{notice}</span>
              <button onClick={() => setNotice('')}>
                <X size={16} />
              </button>
            </div>
          )}

          {/* CUSTOMER ORDERS MANAGEMENT */}
          {page === 'orders' && <OrdersView />}

          {/* MY PROFILE */}
          {page === 'profile' && <>
            <div className="page-heading">
              <div>
                <div className="eyebrow">ACCOUNT SETTINGS</div>
                <h1>My profile</h1>
                <p>Manage the contact and pharmacy details shown in your workspace.</p>
              </div>

              <button
                className="primary-btn"
                onClick={() => {
                  localStorage.setItem('utaam_profile', JSON.stringify(profile));
                  setProfileSaved(true);
                  setNotice('Profile saved in this browser.');
                }}
              >
                <Save size={16} /> Save profile
              </button>
            </div>

            <div className="profile-layout">
              <section className="panel profile-summary">
                <div className="profile-avatar">
                  {(profile.fullName || 'UM')
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map(x => x[0])
                    .join('')
                    .toUpperCase()}
                </div>

                <h2>{profile.fullName || 'Your name'}</h2>
                <span className="profile-role">
                  {profile.role || 'Role not set'}
                </span>

                <div className="profile-summary-line">
                  <Building2 size={15} />
                  {profile.pharmacyName || 'Pharmacy name not set'}
                </div>

                <div className="profile-summary-line">
                  <Mail size={15} />
                  {profile.email || 'Email not added'}
                </div>

                <div className="profile-local-note">
                  <ShieldCheck size={16} />
                  Profile details are saved locally in this browser.
                </div>
              </section>

              <section className="panel profile-form-panel">
                <div className="panel-head">
                  <div>
                    <h2>Personal & pharmacy information</h2>
                    <p>Update the details associated with this workspace.</p>
                  </div>
                </div>

                <form
                  className="profile-form"
                  onSubmit={e => {
                    e.preventDefault();
                    localStorage.setItem('utaam_profile', JSON.stringify(profile));
                    setProfileSaved(true);
                    setNotice('Profile saved in this browser.');
                  }}
                >
                  <div className="form-grid">
                    <Field label="Full name *">
                      <input
                        required
                        value={profile.fullName}
                        onChange={e =>
                          setProfile({ ...profile, fullName: e.target.value })
                        }
                        placeholder="Enter your full name"
                      />
                    </Field>

                    <Field label="Role">
                      <input
                        value={profile.role}
                        onChange={e =>
                          setProfile({ ...profile, role: e.target.value })
                        }
                        placeholder="e.g. Pharmacist / Administrator"
                      />
                    </Field>

                    <Field label="Email address">
                      <input
                        type="email"
                        value={profile.email}
                        onChange={e =>
                          setProfile({ ...profile, email: e.target.value })
                        }
                        placeholder="name@example.com"
                      />
                    </Field>

                    <Field label="Phone number">
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={e =>
                          setProfile({ ...profile, phone: e.target.value })
                        }
                        placeholder="Enter phone number"
                      />
                    </Field>

                    <Field label="Pharmacy / business name" wide>
                      <input
                        value={profile.pharmacyName}
                        onChange={e =>
                          setProfile({ ...profile, pharmacyName: e.target.value })
                        }
                        placeholder="Enter pharmacy name"
                      />
                    </Field>

                    <Field label="Address" wide>
                      <textarea
                        rows="3"
                        value={profile.address}
                        onChange={e =>
                          setProfile({ ...profile, address: e.target.value })
                        }
                        placeholder="Enter pharmacy address"
                      />
                    </Field>
                  </div>

                  <div className="profile-form-footer">
                    <span>
                      {profileSaved
                        ? 'Your latest changes are saved.'
                        : 'Changes are not saved until you select Save profile.'}
                    </span>
                    <button type="submit" className="primary-btn">
                      <Save size={16} /> Save changes
                    </button>
                  </div>
                </form>
              </section>
            </div>
          </>}

          {/* DASHBOARD */}
          {page === 'dashboard' && <>
            <div className="page-heading">
              <div>
                <div className="eyebrow">PHARMACY MANAGEMENT</div>
                <h1>Good day. <span>Welcome back.</span></h1>
                <p>Here’s what’s happening with your medicine inventory.</p>
              </div>

              <button
                className="primary-btn"
                onClick={() => setShowMedicine(true)}
              >
                <Plus size={17} /> Add medicine
              </button>
            </div>

            <section className="stats-grid">
              <Stat
                icon={Pill}
                label="Registered medicines"
                value={medicines.length}
                tone="teal"
              />
              <Stat
                icon={Boxes}
                label="Batches loaded"
                value="—"
                tone="blue"
                hint="Open a medicine to view batches"
              />
              <Stat
                icon={Barcode}
                label="Barcode enabled"
                value="Code 128"
                tone="purple"
                hint="Unique barcode per batch"
              />
              <Stat
                icon={Activity}
                label="API status"
                value={error ? 'Check API' : 'Connected'}
                tone="green"
                hint="Spring Boot · port 8086"
              />
            </section>

            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2>Recently registered medicines</h2>
                  <p>Medicine master records from your database</p>
                </div>
                <button className="text-btn" onClick={() => go('medicines')}>
                  View all <ChevronRight size={15} />
                </button>
              </div>

              <MedicineTable
                items={medicines.slice(0, 6)}
                onSelect={loadBatches}
                loading={loading}
              />
            </section>

            <div className="bottom-grid">
              <section className="tip-card">
                <div className="tip-icon"><Barcode size={20} /></div>
                <div>
                  <b>Batch-level barcode labels</b>
                  <p>
                    Each batch receives its own internal barcode. Scan it to retrieve
                    medicine, MRP, manufacturing date and expiry date.
                  </p>
                  <button
                    className="text-btn"
                    onClick={() => go('barcode-center')}
                  >
                    Open Barcode Center <ChevronRight size={15} />
                  </button>
                </div>
              </section>

              <section className="tip-card">
                <div className="tip-icon violet">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <b>Keep stock traceable</b>
                  <p>
                    Medicine master data and batch/expiry data are stored separately
                    for safer inventory tracking.
                  </p>
                </div>
              </section>
            </div>
          </>}

          {/* MEDICINES */}
          {page === 'medicines' && <>
            <div className="page-heading">
              <div>
                <div className="eyebrow">INVENTORY</div>
                <h1>Medicines</h1>
                <p>Manage medicine details and their manufacturer barcodes.</p>
              </div>

              <button
                className="primary-btn"
                onClick={() => setShowMedicine(true)}
              >
                <Plus size={17} /> Add medicine
              </button>
            </div>

            <section className="panel">
              <div className="toolbar">
                <div className="search-box">
                  <Search size={17} />
                  <input
                    placeholder="Search medicine, code or manufacturer..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                <button className="secondary-btn" onClick={loadMedicines}>
                  <RefreshCw size={16} /> Refresh
                </button>
              </div>

              <MedicineTable
                items={filtered}
                onSelect={loadBatches}
                loading={loading}
              />
            </section>
          </>}

          {/* MEDICINE DETAILS */}
          {page === 'details' && selected && <>
            <div className="page-heading">
              <div>
                <div className="eyebrow">INVENTORY / MEDICINES</div>
                <h1>{selected.medicineName}</h1>
                <p>
                  {selected.medicineCode} · {selected.strength} · {selected.dosageForm}
                </p>
              </div>

              <button
                className="primary-btn"
                onClick={() => setShowBatch(true)}
              >
                <Plus size={17} /> Add batch
              </button>
            </div>

            <section className="detail-card">
              <div className="detail-main">
                <div className="medicine-icon"><Pill size={26} /></div>
                <div>
                  <h2>{selected.medicineName}</h2>
                  <p>
                    {selected.genericName || 'Generic name not provided'} ·
                    {' '}{selected.manufacturer || 'Manufacturer not provided'}
                  </p>
                  <span className="code-pill">{selected.medicineCode}</span>
                </div>
              </div>

              <div className="detail-facts">
                <Fact label="Strength" value={selected.strength} />
                <Fact label="Dosage form" value={selected.dosageForm} />
                <Fact label="Category" value={selected.category || '—'} />
                <Fact
                  label="Manufacturer barcode"
                  value={selected.manufacturerBarcode || 'Not added'}
                />
              </div>
            </section>

            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2>Medicine batches</h2>
                  <p>MRP, manufacturing and expiry details for each batch</p>
                </div>
                <span className="count-pill">{batches.length} batches</span>
              </div>
              <BatchTable batches={batches} />
            </section>
          </>}

          {/* BARCODE CENTER: LOOKUP + MANAGEMENT + PRINT */}
          {page === 'barcode-center' && <>
            <div className="page-heading">
              <div>
                <div className="eyebrow">INVENTORY / IDENTIFICATION</div>
                <h1>Barcode Center</h1>
                <p>Scan, search, manage and print medicine barcode labels.</p>
              </div>

              <button className="secondary-btn" onClick={loadAllBatches}>
                <RefreshCw size={16} /> Refresh
              </button>
            </div>

            <div className="barcode-tabs">
              <button
                className={barcodeTab === 'lookup' ? 'active' : ''}
                onClick={() => setBarcodeTab('lookup')}
              >
                <Search size={16} /> Scan &amp; Lookup
              </button>

              <button
                className={barcodeTab === 'manage' ? 'active' : ''}
                onClick={() => setBarcodeTab('manage')}
              >
                <Barcode size={16} /> Barcode Management
              </button>

              <button
                className={barcodeTab === 'print' ? 'active' : ''}
                onClick={() => setBarcodeTab('print')}
              >
                <Printer size={16} /> Print Labels
              </button>
            </div>

            {/* TAB 1: SCAN AND LOOKUP */}
            {barcodeTab === 'lookup' && <>
              <section className="lookup-layout">
                <div className="panel lookup-panel">
                  <div className="lookup-graphic">
                    <Barcode size={44} />
                  </div>

                  <h2>Find a medicine or batch</h2>
                  <p>
                    Enter a barcode or scan the label using your device camera.
                  </p>

                  <div className="search-box lookup-input">
                    <Barcode size={18} />
                    <input
                      value={barcodeResult || ''}
                      onChange={e => setBarcodeResult(e.target.value)}
                      placeholder="Enter or scan barcode"
                      onKeyDown={e =>
                        e.key === 'Enter' && lookupBarcode()
                      }
                    />
                  </div>

                  <div className="lookup-actions">
                    <button
                      className="primary-btn"
                      onClick={() => lookupBarcode()}
                    >
                      <Search size={17} /> Look up barcode
                    </button>

                    <button
                      className="secondary-btn"
                      onClick={() => openScanner('lookup')}
                    >
                      <Camera size={17} /> Scan with camera
                    </button>
                  </div>
                </div>

                <div className="info-panel">
                  <div className="info-icon">
                    <ClipboardList size={20} />
                  </div>

                  <h3>Supported barcode types</h3>

                  <p>
                    <b>Manufacturer barcode</b><br />
                    Finds the medicine using its registered manufacturer barcode.
                  </p>

                  <p>
                    <b>UTAAM batch barcode</b><br />
                    Finds a specific batch with its MRP, batch number,
                    manufacturing date, expiry date and quantity.
                  </p>

                  <p className="muted-note">
                    Only barcodes registered in your UTAAM database can be retrieved.
                  </p>
                </div>
              </section>
            </>}

            {/* TAB 2: BARCODE MANAGEMENT */}
            {barcodeTab === 'manage' && <>
              <section className="panel">
                <div className="toolbar">
                  <div className="search-box">
                    <Search size={17} />
                    <input
                      value={barcodeSearch}
                      onChange={e => setBarcodeSearch(e.target.value)}
                      placeholder="Search medicine, batch or barcode..."
                    />
                  </div>

                  <span className="count-pill">
                    {allBatches.length} batch labels
                  </span>
                </div>

                <div className="barcode-grid">
                  {loading ? (
                    <div className="empty">Loading batch barcodes...</div>
                  ) : barcodeFiltered.length === 0 ? (
                    <div className="empty">
                      No batch barcodes found. Open a medicine and add a batch first.
                    </div>
                  ) : (
                    barcodeFiltered.map(b => (
                      <article className="barcode-card" key={b.id}>
                        <div className="barcode-card-head">
                          <div>
                            <b>{b.medicineName}</b>
                            <small>
                              {b.medicineCode} · Batch {b.batchNumber}
                            </small>
                          </div>

                          <span className="status">
                            <i /> Generated
                          </span>
                        </div>

                        <img
                          className="barcode-preview"
                          src={`${API}/api/barcode/image/${encodeURIComponent(b.internalBarcode)}`}
                          alt={`Barcode ${b.internalBarcode}`}
                          loading="lazy"
                        />

                        <div className="barcode-value">
                          {b.internalBarcode}
                        </div>

                        <div className="barcode-meta">
                          <span>MRP <b>{money(b.mrp)}</b></span>
                          <span>MFG <b>{date(b.manufacturingDate)}</b></span>
                          <span>EXP <b>{date(b.expiryDate)}</b></span>
                          <span>QTY <b>{b.quantity}</b></span>
                        </div>

                        <div className="barcode-card-actions">
                          <a
                            className="secondary-btn"
                            href={`${API}/api/barcode/image/${encodeURIComponent(b.internalBarcode)}`}
                            download={`${b.internalBarcode}.png`}
                          >
                            <Barcode size={15} /> Download PNG
                          </a>

                          <button
                            className="primary-btn"
                            onClick={() => printLabel(b)}
                          >
                            <Printer size={15} /> Print label
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </>}

            {/* TAB 3: PRINT LABELS */}
            {barcodeTab === 'print' && <>
              <section className="panel">
                <div className="panel-head">
                  <div>
                    <h2>Print medicine barcode labels</h2>
                    <p>Select a batch to print its barcode label.</p>
                  </div>

                  <span className="count-pill">
                    {allBatches.length} batches
                  </span>
                </div>

                <div className="toolbar">
                  <div className="search-box">
                    <Search size={17} />
                    <input
                      value={barcodeSearch}
                      onChange={e => setBarcodeSearch(e.target.value)}
                      placeholder="Search medicine, batch or barcode..."
                    />
                  </div>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>MEDICINE</th>
                        <th>BATCH NUMBER</th>
                        <th>BARCODE</th>
                        <th>MRP</th>
                        <th>EXPIRY</th>
                        <th>QUANTITY</th>
                        <th>PRINT</th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="empty">
                            Loading batches...
                          </td>
                        </tr>
                      ) : barcodeFiltered.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="empty">
                            No batches available for printing.
                          </td>
                        </tr>
                      ) : (
                        barcodeFiltered.map(b => (
                          <tr key={b.id}>
                            <td><b>{b.medicineName}</b></td>
                            <td>{b.batchNumber}</td>
                            <td>
                              <span className="code-pill">
                                {b.internalBarcode}
                              </span>
                            </td>
                            <td>{money(b.mrp)}</td>
                            <td>{date(b.expiryDate)}</td>
                            <td>{b.quantity}</td>
                            <td>
                              <button
                                className="small-icon-btn"
                                title="Print barcode label"
                                onClick={() => printLabel(b)}
                              >
                                <Printer size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>}
          </>}

          {/* OTHER BUSINESS MODULES */}
          {page.startsWith('module-') && (
            <BusinessModule
              key={page}
              moduleId={page.replace('module-', '')}
            />
          )}
        </div>

        {/* ── Official UTAAM Footer (Inside main-area) ── */}
        <UtaamFooter setPage={setPage} />
      </main>

      {/* ADD MEDICINE MODAL */}
      {showMedicine && (
        <Modal
          title="Add new medicine"
          subtitle="Create a medicine master record. A UTAAM medicine code is generated by the backend."
          onClose={() => setShowMedicine(false)}
        >
          <form onSubmit={submitMedicine}>
            <div className="form-grid">
              <Field label="Medicine name *">
                <input
                  required
                  maxLength="150"
                  value={medicineForm.medicineName}
                  onChange={e =>
                    setMedicineForm({
                      ...medicineForm,
                      medicineName: e.target.value
                    })
                  }
                  placeholder="e.g. Paracetamol"
                />
              </Field>

              <Field label="Generic name">
                <input
                  value={medicineForm.genericName}
                  onChange={e =>
                    setMedicineForm({
                      ...medicineForm,
                      genericName: e.target.value
                    })
                  }
                  placeholder="Generic name"
                />
              </Field>

              <Field label="Strength *">
                <input
                  required
                  value={medicineForm.strength}
                  onChange={e =>
                    setMedicineForm({
                      ...medicineForm,
                      strength: e.target.value
                    })
                  }
                  placeholder="e.g. 500 mg"
                />
              </Field>

              <Field label="Dosage form *">
                <select
                  value={medicineForm.dosageForm}
                  onChange={e =>
                    setMedicineForm({
                      ...medicineForm,
                      dosageForm: e.target.value
                    })
                  }
                >
                  {[
                    'TABLET', 'CAPSULE', 'SYRUP', 'SUSPENSION',
                    'INJECTION', 'CREAM', 'OINTMENT', 'DROPS',
                    'INHALER', 'POWDER', 'OTHER'
                  ].map(x => <option key={x}>{x}</option>)}
                </select>
              </Field>

              <Field label="Manufacturer">
                <input
                  value={medicineForm.manufacturer}
                  onChange={e =>
                    setMedicineForm({
                      ...medicineForm,
                      manufacturer: e.target.value
                    })
                  }
                  placeholder="Manufacturer"
                />
              </Field>

              <Field label="Category">
                <input
                  value={medicineForm.category}
                  onChange={e =>
                    setMedicineForm({
                      ...medicineForm,
                      category: e.target.value
                    })
                  }
                  placeholder="e.g. Pain relief"
                />
              </Field>

              <Field label="Manufacturer barcode" wide>
                <div className="input-with-action">
                  <input
                    value={medicineForm.manufacturerBarcode}
                    onChange={e =>
                      setMedicineForm({
                        ...medicineForm,
                        manufacturerBarcode: e.target.value
                      })
                    }
                    placeholder="Scan or type original package barcode"
                  />

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => openScanner('medicine')}
                  >
                    <Camera size={16} /> Scan
                  </button>
                </div>
              </Field>

              <label className="check-field">
                <input
                  type="checkbox"
                  checked={medicineForm.prescriptionRequired}
                  onChange={e =>
                    setMedicineForm({
                      ...medicineForm,
                      prescriptionRequired: e.target.checked
                    })
                  }
                />
                Prescription required
              </label>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setShowMedicine(false)}
              >
                Cancel
              </button>

              <button className="primary-btn" type="submit">
                <Check size={16} /> Save medicine
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ADD BATCH MODAL */}
      {showBatch && selected && (
        <Modal
          title="Add medicine batch"
          subtitle={`Add price, manufacturing and expiry details for ${selected.medicineName}. A unique internal barcode is generated automatically.`}
          onClose={() => setShowBatch(false)}
        >
          <form onSubmit={submitBatch}>
            <div className="form-grid">
              <Field label="Batch number *">
                <input
                  required
                  value={batchForm.batchNumber}
                  onChange={e =>
                    setBatchForm({
                      ...batchForm,
                      batchNumber: e.target.value
                    })
                  }
                  placeholder="e.g. BATCH-2026-01"
                />
              </Field>

              <Field label="MRP (₹) *">
                <input
                  required
                  min="0.01"
                  step="0.01"
                  type="number"
                  value={batchForm.mrp}
                  onChange={e =>
                    setBatchForm({
                      ...batchForm,
                      mrp: e.target.value
                    })
                  }
                  placeholder="0.00"
                />
              </Field>

              <Field label="Purchase price (₹)">
                <input
                  min="0"
                  step="0.01"
                  type="number"
                  value={batchForm.purchasePrice}
                  onChange={e =>
                    setBatchForm({
                      ...batchForm,
                      purchasePrice: e.target.value
                    })
                  }
                  placeholder="0.00"
                />
              </Field>

              <Field label="Quantity *">
                <input
                  required
                  min="0"
                  type="number"
                  value={batchForm.quantity}
                  onChange={e =>
                    setBatchForm({
                      ...batchForm,
                      quantity: e.target.value
                    })
                  }
                />
              </Field>

              <Field label="Manufacturing date *">
                <input
                  required
                  type="date"
                  value={batchForm.manufacturingDate}
                  onChange={e =>
                    setBatchForm({
                      ...batchForm,
                      manufacturingDate: e.target.value
                    })
                  }
                />
              </Field>

              <Field label="Expiry date *">
                <input
                  required
                  type="date"
                  min={batchForm.manufacturingDate || undefined}
                  value={batchForm.expiryDate}
                  onChange={e =>
                    setBatchForm({
                      ...batchForm,
                      expiryDate: e.target.value
                    })
                  }
                />
              </Field>
            </div>

            <div className="hint-box">
              <Barcode size={18} />
              The backend creates a unique UTB- batch barcode after saving.
              You can print the label from the Barcode Center.
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setShowBatch(false)}
              >
                Cancel
              </button>

              <button className="primary-btn" type="submit">
                <Check size={16} /> Save batch & generate barcode
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* CAMERA SCANNER MODAL */}
      {scannerOpen && (
        <Modal
          title="Scan barcode"
          subtitle="Allow camera access and place the barcode inside the camera view."
          onClose={() => {
            setScannerOpen(false);
            stopScanner();
          }}
        >
          <div className="scanner-wrap">
            <video ref={videoRef} muted playsInline />
            <div className="scan-frame" />
          </div>

          <p className="scanner-help">
            <Camera size={16} />
            Camera scanning uses your browser's camera permission.
            You can also type the barcode manually.
          </p>

          <div className="modal-actions">
            <button
              className="secondary-btn"
              onClick={() => {
                setScannerOpen(false);
                stopScanner();
              }}
            >
              Close scanner
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

const MODULES = {
  suppliers: {
    title: 'Suppliers',
    eyebrow: 'PURCHASING',
    description: 'Maintain vendor contacts, GST details and payment terms.',
    icon: Truck,
    fields: [
      ['name', 'Supplier name', 'text', true],
      ['contact', 'Contact person', 'text'],
      ['phone', 'Phone', 'tel'],
      ['email', 'Email', 'email'],
      ['gstin', 'GSTIN', 'text'],
      ['address', 'Address', 'text', true],
      ['paymentTerms', 'Payment terms', 'text']
    ]
  },
  customers: {
    title: 'Customers',
    eyebrow: 'CUSTOMER MANAGEMENT',
    description: 'Maintain customer contact details for billing and service.',
    icon: Users,
    fields: [
      ['name', 'Customer name', 'text', true],
      ['phone', 'Phone', 'tel'],
      ['email', 'Email', 'email'],
      ['address', 'Address', 'text', true],
      ['notes', 'Notes', 'text', true]
    ]
  },
  purchases: {
    title: 'Purchase orders',
    eyebrow: 'PROCUREMENT',
    description: 'Record supplier invoices and incoming stock references.',
    icon: ShoppingCart, ShoppingBag,
    fields: [
      ['supplier', 'Supplier', 'text'],
      ['invoiceNo', 'Supplier invoice number', 'text'],
      ['orderDate', 'Purchase date', 'date'],
      ['total', 'Invoice total (₹)', 'number'],
      ['status', 'Status', 'select', [
        'Draft', 'Ordered', 'Partially received', 'Received', 'Cancelled'
      ]],
      ['notes', 'Notes', 'text', true]
    ]
  },
  sales: {
    title: 'Sales & billing',
    eyebrow: 'POINT OF SALE',
    description: 'Record sales invoices and payment references. This register does not deduct batch stock yet.',
    icon: Receipt,
    fields: [
      ['invoiceNo', 'Invoice number', 'text'],
      ['customer', 'Customer', 'text'],
      ['saleDate', 'Sale date', 'date'],
      ['total', 'Invoice total (₹)', 'number'],
      ['paymentMode', 'Payment mode', 'select', [
        'Cash', 'UPI', 'Card', 'Bank transfer', 'Credit'
      ]],
      ['paymentStatus', 'Payment status', 'select', [
        'Paid', 'Pending', 'Partially paid'
      ]]
    ]
  },
  returns: {
    title: 'Returns',
    eyebrow: 'RETURNS & REFUNDS',
    description: 'Track customer returns and supplier return references for reconciliation.',
    icon: RotateCcw,
    fields: [
      ['returnType', 'Return type', 'select', [
        'Customer return', 'Supplier return'
      ]],
      ['referenceNo', 'Invoice / reference number', 'text'],
      ['party', 'Customer / supplier', 'text'],
      ['returnDate', 'Return date', 'date'],
      ['reason', 'Reason', 'text', true],
      ['amount', 'Amount (₹)', 'number'],
      ['status', 'Status', 'select', [
        'Requested', 'Inspected', 'Approved', 'Rejected', 'Refunded'
      ]]
    ]
  },
  alerts: {
    title: 'Stock alerts',
    eyebrow: 'INVENTORY CONTROL',
    description: 'Operational checklist for low-stock, near-expiry and expired medicines.',
    icon: Bell,
    fields: []
  },
  reports: {
    title: 'Reports',
    eyebrow: 'BUSINESS INTELLIGENCE',
    description: 'Review locally recorded purchases, sales, returns and master data.',
    icon: FileBarChart,
    fields: []
  },
  audit: {
    title: 'Activity log',
    eyebrow: 'OPERATIONS',
    description: 'A local record of changes made in these browser-based registers.',
    icon: ClipboardCheck,
    fields: []
  }
};

const DEFAULT_MODULE_DATA = {
  suppliers: [
    { id: 'sup-1', name: 'Cipla Healthcare Distributors', contact: 'Sachin Joshi', phone: '09822014589', email: 'orders.cipla.sangli@gmail.com', gstin: '27AABCC1234F1Z5', address: 'Plot 42, MIDC Kupwad, Sangli, MH 416436', paymentTerms: 'Net 30 days' },
    { id: 'sup-2', name: 'Sun Pharma Wholesale Depo', contact: 'Rahul Patil', phone: '09765412389', email: 'sunpharma.kolhapur@sunpharma.com', gstin: '27AABCS5678G2Z1', address: 'Near Shiroli Toll Naka, Kolhapur, MH 416122', paymentTerms: 'Net 21 days' },
    { id: 'sup-3', name: 'Mankind Pharma Stockist', contact: 'Amit Deshpande', phone: '09890123456', email: 'mankind.solapur@mankind.com', gstin: '27AABCM9101H3Z8', address: 'Old Pune Naka, Solapur, MH 413003', paymentTerms: 'Net 15 days' },
    { id: 'sup-4', name: "Dr. Reddy's Laboratories Agency", contact: 'Kiran More', phone: '09422078912', email: 'drreddys.sangli@drreddys.com', gstin: '27AABCD3456J4Z2', address: 'Harbhat Road, Sangli, MH 416416', paymentTerms: 'Net 30 days' },
    { id: 'sup-5', name: 'Abbott Healthcare Supply', contact: 'Vikram Shinde', phone: '09823145670', email: 'abbott.satara@abbott.in', gstin: '27AABCA7890K5Z9', address: 'MIDC Satara, MH 415004', paymentTerms: 'Net 30 days' }
  ],
  customers: [
    { id: 'cust-1', name: 'Pradnya Rakhamaji Turewale', phone: '07719061073', email: 'turevalepradnya@gmail.com', address: 'Chhatrapati Shivaji Maharaj Petha (Hujjare Galli), Jath, Sangli, Maharashtra 416404', notes: 'Verified customer · Regular prescription' },
    { id: 'cust-2', name: 'Ramesh Shankar Patil', phone: '09822345678', email: 'ramesh.patil@gmail.com', address: 'Station Road, Near Post Office, Jath, Sangli, MH 416404', notes: 'Diabetic and BP maintenance medication' },
    { id: 'cust-3', name: 'Dr. Sunita Vilas Shinde', phone: '09764512340', email: 'dr.sunita.shinde@gmail.com', address: 'Civil Hospital Road, Opp. Bus Stand, Jath, Sangli, MH 416404', notes: 'Family clinic bulk order supplies' },
    { id: 'cust-4', name: 'Aniket Dattatray Kulkarni', phone: '09423891234', email: 'aniket.kulkarni@gmail.com', address: 'Market Yard, Shivaji Chowk, Jath, Sangli, MH 416404', notes: 'General wellness & seasonal supplements' },
    { id: 'cust-5', name: 'Kavita Prakash Jadhav', phone: '09890145678', email: 'kavita.jadhav@gmail.com', address: 'Hujjare Galli, Shivaji Maharaj Petha, Jath, Sangli, MH 416404', notes: 'Pediatric syrup and vitamin supplies' }
  ],
  purchases: [
    { id: 'po-1', supplier: 'Cipla Healthcare Distributors', invoiceNo: 'INV-CIP-2026-4491', orderDate: '2026-11-14', total: 45200, status: 'Received', notes: 'Paracetamol 650mg, Azithromycin 500mg, Ascoril-D cough syrups' },
    { id: 'po-2', supplier: 'Sun Pharma Wholesale Depo', invoiceNo: 'INV-SUN-2026-7812', orderDate: '2026-11-11', total: 32850, status: 'Received', notes: 'Amoxicillin 500mg, Pantoprazole 40mg, Cetirizine 10mg' },
    { id: 'po-3', supplier: 'Mankind Pharma Stockist', invoiceNo: 'INV-MKD-2026-9034', orderDate: '2026-11-08', total: 18400, status: 'Received', notes: 'Multivitamins, D3 60K capsules, Omeprazole 20mg' },
    { id: 'po-4', supplier: "Dr. Reddy's Laboratories Agency", invoiceNo: 'INV-DRR-2026-2145', orderDate: '2026-11-04', total: 61700, status: 'Received', notes: 'Cardiovascular and diabetic chronic medicines batch' }
  ],
  sales: [
    { id: 'sal-1', invoiceNo: 'BILL-UTAAM-2026-1044', customer: 'Ramesh Shankar Patil', saleDate: '2026-11-17', total: 385.00, paymentMode: 'UPI', paymentStatus: 'Paid' },
    { id: 'sal-2', invoiceNo: 'BILL-UTAAM-2026-1043', customer: 'Dr. Sunita Vilas Shinde', saleDate: '2026-11-17', total: 560.00, paymentMode: 'Cash', paymentStatus: 'Paid' },
    { id: 'sal-3', invoiceNo: 'BILL-UTAAM-2026-1042', customer: 'Pradnya Turevale', saleDate: '2026-11-17', total: 241.00, paymentMode: 'UPI', paymentStatus: 'Paid' },
    { id: 'sal-4', invoiceNo: 'BILL-UTAAM-2026-1041', customer: 'Aniket Dattatray Kulkarni', saleDate: '2026-11-16', total: 195.00, paymentMode: 'Card', paymentStatus: 'Paid' },
    { id: 'sal-5', invoiceNo: 'BILL-UTAAM-2026-1040', customer: 'Kavita Prakash Jadhav', saleDate: '2026-11-16', total: 420.00, paymentMode: 'UPI', paymentStatus: 'Paid' },
    { id: 'sal-6', invoiceNo: 'BILL-UTAAM-2026-1039', customer: 'Walk-in Customer (Jath)', saleDate: '2026-11-15', total: 125.00, paymentMode: 'Cash', paymentStatus: 'Paid' }
  ],
  returns: [
    { id: 'ret-1', returnType: 'Customer return', referenceNo: 'BILL-UTAAM-2026-1031', party: 'Ramesh Patil', returnDate: '2026-11-12', reason: 'Doctor adjusted dosage from 500mg to 250mg', amount: 85.00, status: 'Refunded' },
    { id: 'ret-2', returnType: 'Supplier return', referenceNo: 'INV-MKD-2026-9034', party: 'Mankind Pharma Stockist', returnDate: '2026-11-09', reason: 'Outer carton seal damaged in transit', amount: 950.00, status: 'Approved' }
  ]
};

function BusinessModule({ moduleId }) {
  const cfg = MODULES[moduleId];

  const [rows, setRows] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(`utaam_${moduleId}`) || '[]');
      if (stored && stored.length > 0) return stored;
      return DEFAULT_MODULE_DATA[moduleId] || [];
    } catch {
      return DEFAULT_MODULE_DATA[moduleId] || [];
    }
  });

  const [form, setForm] = useState({});
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const saveRows = next => {
    setRows(next);
    localStorage.setItem(`utaam_${moduleId}`, JSON.stringify(next));
  };

  const add = e => {
    e.preventDefault();

    const item = {
      ...form,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };

    saveRows([item, ...rows]);
    setForm({});
    setOpen(false);

    const logs = JSON.parse(localStorage.getItem('utaam_audit') || '[]');

    logs.unshift({
      id: crypto.randomUUID(),
      action: `Added ${cfg.title.toLowerCase()} record`,
      detail: item.name || item.invoiceNo || item.referenceNo || cfg.title,
      createdAt: new Date().toISOString()
    });

    localStorage.setItem('utaam_audit', JSON.stringify(logs));
  };

  const filtered = rows.filter(r =>
    Object.values(r).join(' ').toLowerCase().includes(query.toLowerCase())
  );

  const Icon = cfg.icon;

  if (moduleId === 'alerts') {
    return <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">{cfg.eyebrow}</div>
          <h1>{cfg.title}</h1>
          <p>{cfg.description}</p>
        </div>
      </div>

      <div className="module-notice">
        <Bell size={18} />
        <div>
          <b>Live batch alerts need the backend stock/expiry API.</b>
          <p>
            Use this checklist while the inventory API is being connected.
            Do not sell expired stock; quarantine it and follow your pharmacy's
            approved disposal/return process.
          </p>
        </div>
      </div>

      <div className="module-grid">
        <ModuleInfo
          title="Low stock"
          text="Set minimum stock levels per medicine and review reorder quantities with your supplier."
        />
        <ModuleInfo
          title="Near expiry"
          text="Review batches approaching expiry (for example, within 90 days) and prioritize FEFO: first-expiry, first-out."
        />
        <ModuleInfo
          title="Expired stock"
          text="Identify expired batches, block them from sale and record the return or disposal action."
        />
        <ModuleInfo
          title="Recall / quarantine"
          text="Keep affected batch numbers traceable and prevent issue until the responsible pharmacist clears them."
        />
      </div>
    </>;
  }

  if (moduleId === 'reports') {
    return <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">{cfg.eyebrow}</div>
          <h1>{cfg.title}</h1>
          <p>{cfg.description}</p>
        </div>
      </div>

      <div className="stats-grid">
        <Stat
          icon={Pill}
          label="Medicines from API"
          value={medicinesCountSafe()}
          tone="teal"
          hint="Master records"
        />
        <Stat
          icon={Truck}
          label="Suppliers saved here"
          value={readCount('suppliers')}
          tone="blue"
          hint="This browser only"
        />
        <Stat
          icon={ShoppingCart}
          label="Purchases recorded"
          value={readCount('purchases')}
          tone="purple"
          hint="This browser only"
        />
        <Stat
          icon={Receipt}
          label="Sales recorded"
          value={readCount('sales')}
          tone="green"
          hint="This browser only"
        />
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Report coverage</h2>
            <p>Available operational summaries</p>
          </div>
        </div>

        <div className="module-grid">
          <ModuleInfo
            title="Sales summary"
            text="Daily/monthly sales, payment mode and outstanding balances after billing APIs are connected."
          />
          <ModuleInfo
            title="Purchase summary"
            text="Supplier-wise purchases, invoice totals and goods received reconciliation."
          />
          <ModuleInfo
            title="Inventory valuation"
            text="Stock on hand multiplied by purchase cost, grouped by medicine and batch."
          />
          <ModuleInfo
            title="Expiry & dead stock"
            text="Near-expiry quantity, expired value and slow-moving items by batch."
          />
        </div>
      </div>
    </>;
  }

  if (moduleId === 'audit') {
    return <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">{cfg.eyebrow}</div>
          <h1>{cfg.title}</h1>
          <p>{cfg.description}</p>
        </div>
      </div>

      <LocalRegister
        moduleId="audit"
        rows={rows}
        onDelete={id => saveRows(rows.filter(r => r.id !== id))}
        query={query}
        setQuery={setQuery}
      />
    </>;
  }

  return <>
    <div className="page-heading">
      <div>
        <div className="eyebrow">{cfg.eyebrow}</div>
        <h1>{cfg.title}</h1>
        <p>{cfg.description}</p>
      </div>

      <button className="primary-btn" onClick={() => setOpen(true)}>
        <Plus size={16} /> Add {cfg.title.slice(0, -1).toLowerCase()}
      </button>
    </div>

    <div className="panel">
      <div className="toolbar">
        <div className="search-box">
          <Search size={17} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={`Search ${cfg.title.toLowerCase()}...`}
          />
        </div>

        <span className="count-pill">
          {rows.length} records · saved in this browser
        </span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {cfg.fields.map(f => (
                <th key={f[0]}>{f[1].toUpperCase()}</th>
              ))}
              <th>ADDED</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={cfg.fields.length + 2} className="empty">
                  No records yet. Add your first {cfg.title.toLowerCase().replace(/s$/, '')}.
                </td>
              </tr>
            ) : (
              filtered.map(r => (
                <tr key={r.id}>
                  {cfg.fields.map(f => (
                    <td key={f[0]}>
                      {f[0] === 'total' || f[0] === 'amount'
                        ? money(r[f[0]])
                        : r[f[0]] || '—'}
                    </td>
                  ))}

                  <td>{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>

                  <td>
                    <button
                      className="small-icon-btn"
                      title="Delete record"
                      onClick={() =>
                        saveRows(rows.filter(x => x.id !== r.id))
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>

    {open && (
      <Modal
        title={`Add ${cfg.title.toLowerCase().replace(/s$/, '')}`}
        subtitle="This register is saved locally in this browser until the backend module is integrated."
        onClose={() => setOpen(false)}
      >
        <form onSubmit={add}>
          <div className="form-grid">
            {cfg.fields.map(f => (
              <Field
                key={f[0]}
                label={f[1] + (f[0] === 'name' || f[0] === 'invoiceNo' ? ' *' : '')}
                wide={!!f[3]}
              >
                {f[2] === 'select' ? (
                  <select
                    required
                    value={form[f[0]] || ''}
                    onChange={e =>
                      setForm({ ...form, [f[0]]: e.target.value })
                    }
                  >
                    <option value="">Select</option>
                    {f[3].map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    required={f[0] === 'name' || f[0] === 'invoiceNo'}
                    type={f[2]}
                    min={f[2] === 'number' ? '0' : undefined}
                    step={f[2] === 'number' ? '0.01' : undefined}
                    value={form[f[0]] || ''}
                    onChange={e =>
                      setForm({ ...form, [f[0]]: e.target.value })
                    }
                    placeholder={f[1]}
                  />
                )}
              </Field>
            ))}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>

            <button type="submit" className="primary-btn">
              <Check size={16} /> Save record
            </button>
          </div>
        </form>
      </Modal>
    )}
  </>;
}

function medicinesCountSafe() {
  return 'API';
}

function readCount(key) {
  try {
    return JSON.parse(localStorage.getItem(`utaam_${key}`) || '[]').length;
  } catch {
    return 0;
  }
}

function ModuleInfo({ title, text }) {
  return (
    <section className="tip-card">
      <div className="tip-icon">
        <ClipboardList size={19} />
      </div>
      <div>
        <b>{title}</b>
        <p>{text}</p>
      </div>
    </section>
  );
}

function LocalRegister({ moduleId, rows, onDelete, query, setQuery }) {
  const filtered = rows.filter(r =>
    Object.values(r).join(' ').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className="panel">
      <div className="toolbar">
        <div className="search-box">
          <Search size={17} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search activity..."
          />
        </div>

        <span className="count-pill">
          {rows.length} events · local browser log
        </span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ACTION</th>
              <th>DETAIL</th>
              <th>TIME</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty">
                  No activity recorded yet.
                </td>
              </tr>
            ) : (
              filtered.map(r => (
                <tr key={r.id}>
                  <td>{r.action}</td>
                  <td>{r.detail}</td>
                  <td>{new Date(r.createdAt).toLocaleString('en-IN')}</td>
                  <td>
                    <button
                      className="small-icon-btn"
                      onClick={() => onDelete(r.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Stat({ icon: Icon, label, value, tone, hint }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={19} />
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-hint">{hint || 'Live database value'}</div>
    </div>
  );
}

function MedicineTable({ items, onSelect, loading }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>MEDICINE</th>
            <th>MEDICINE CODE</th>
            <th>STRENGTH</th>
            <th>MANUFACTURER</th>
            <th>STATUS</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" className="empty">Loading medicines…</td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan="6" className="empty">
                No medicines found. Add your first medicine to get started.
              </td>
            </tr>
          ) : (
            items.map(m => (
              <tr
                key={m.id}
                onClick={() => onSelect(m)}
                className="click-row"
              >
                <td>
                  <div className="medicine-cell">
                    <div className="mini-pill"><Pill size={16} /></div>
                    <div>
                      <b>{m.medicineName}</b>
                      <small>{m.genericName || m.dosageForm}</small>
                    </div>
                  </div>
                </td>

                <td><span className="code-pill">{m.medicineCode}</span></td>
                <td>{m.strength}</td>
                <td>{m.manufacturer || '—'}</td>
                <td><span className="status"><i /> Active</span></td>
                <td><ChevronRight size={17} className="row-arrow" /></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function BatchTable({ batches }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>BATCH</th>
            <th>INTERNAL BARCODE</th>
            <th>MRP</th>
            <th>MFG. DATE</th>
            <th>EXPIRY DATE</th>
            <th>QTY</th>
            <th>LABEL</th>
          </tr>
        </thead>

        <tbody>
          {batches.length === 0 ? (
            <tr>
              <td colSpan="7" className="empty">
                No batches registered for this medicine yet.
              </td>
            </tr>
          ) : (
            batches.map(b => (
              <tr key={b.id}>
                <td><b>{b.batchNumber}</b></td>
                <td><span className="code-pill">{b.internalBarcode}</span></td>
                <td>{money(b.mrp)}</td>
                <td>{date(b.manufacturingDate)}</td>
                <td>{date(b.expiryDate)}</td>
                <td>{b.quantity}</td>
                <td>
                  <button
                    className="small-icon-btn"
                    title="Print barcode label"
                    onClick={() => printLabel(b)}
                  >
                    <Printer size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function printLabel(b) {
  const w = window.open('', '_blank', 'width=520,height=420');

  if (!w) return;

  const barcodeUrl =
    `${API}/api/barcode/image/${encodeURIComponent(b.internalBarcode)}`;

  w.document.write(`
    <html>
    <head>
      <title>UTAAM Medicine Label</title>
      <style>
        body{font-family:Arial;padding:24px;color:#111}
        .label{border:1px solid #ddd;padding:20px;max-width:420px}
        h2{font-size:18px;margin:0 0 8px}
        .muted{color:#555;font-size:12px}
        .barcode{width:100%;height:82px;object-fit:contain;margin:12px 0}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px}
        .grid b{display:block;margin-top:3px}
      </style>
    </head>
    <body>
      <div class="label">
        <div class="muted">UTAAM MEDICAL</div>
        <h2>${escapeHtml(b.medicineName)}</h2>
        <div class="muted">
          ${escapeHtml(b.medicineCode)} · Batch ${escapeHtml(b.batchNumber)}
        </div>
        <img class="barcode" src="${barcodeUrl}"/>
        <div style="text-align:center;font-size:12px">
          ${escapeHtml(b.internalBarcode)}
        </div>
        <hr/>
        <div class="grid">
          <div>MRP<b>${money(b.mrp)}</b></div>
          <div>Quantity<b>${b.quantity}</b></div>
          <div>Manufacturing<b>${date(b.manufacturingDate)}</b></div>
          <div>Expiry<b>${date(b.expiryDate)}</b></div>
        </div>
      </div>
      <script>
        window.onload=()=>setTimeout(()=>window.print(),500)
      </script>
    </body>
    </html>
  `);

  w.document.close();
}

function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function Fact({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function Field({ label, children, wide }) {
  return (
    <label className={`field ${wide ? 'wide' : ''}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={e => e.target === e.currentTarget && onClose()}
    >
      <section className="modal">
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          <button className="icon-btn" onClick={onClose}>
            <X size={19} />
          </button>
        </div>

        {children}
      </section>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
