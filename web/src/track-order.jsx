import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  Pill, Search, Package, CheckCircle2, Clock,
  Truck, MapPin, ArrowLeft, ShieldCheck, User,
  Calendar, CreditCard, ChevronRight, RefreshCw, AlertCircle
} from "lucide-react";
import "./track-order.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8086";

const STEPS = [
  { status: "CONFIRMED", label: "Order Confirmed", description: "Pharmacy accepted your order." },
  { status: "PROCESSING", label: "Preparing Order", description: "Your medicines are being packed." },
  { status: "SHIPPED", label: "Order Shipped", description: "Your order has been dispatched." },
  { status: "OUT_FOR_DELIVERY", label: "Out for Delivery", description: "Courier is on the way to your address." },
  { status: "DELIVERED", label: "Delivered", description: "Your order has been delivered successfully." }
];

function formatStatus(status) {
  return (status || "").replaceAll("_", " ");
}

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function TrackOrder() {
  // Customer Profile Session & Token Verification
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("utaam_session") || "null");
    } catch {
      return null;
    }
  });

  // Verify Customer Token with Backend
  useEffect(() => {
    if (session && session.authToken) {
      fetch(`${API}/api/auth/verify-token?token=${encodeURIComponent(session.authToken)}`)
        .then(res => {
          if (!res.ok) throw new Error("Session invalid");
          return res.json();
        })
        .then(data => {
          if (!data.valid && !data.success) throw new Error("Invalid token");
        })
        .catch(() => {
          localStorage.removeItem("utaam_session");
          setSession(null);
        });
    }
  }, []);

  // All orders for customer profile
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Active tracked order
  const [order, setOrder] = useState(null);

  // Manual search form
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  // Load customer orders automatically if customer is logged in
  useEffect(() => {
    // Check URL parameters first (e.g. ?orderNumber=ORD-...)
    const params = new URLSearchParams(window.location.search);
    const paramOrderNum = params.get("orderNumber");
    if (paramOrderNum) {
      setOrderNumber(paramOrderNum);
      fetchSingleOrder(paramOrderNum, params.get("phone") || "");
    }

    if (session?.email || session?.phone) {
      loadCustomerOrders();
    }
  }, []);

  async function loadCustomerOrders() {
    if (!session?.email && !session?.phone) return;
    setLoadingOrders(true);
    try {
      const emailParam = encodeURIComponent(session.email || "");
      const phoneParam = encodeURIComponent(session.phone || "");
      const res = await fetch(`${API}/api/orders/customer?email=${emailParam}&phone=${phoneParam}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCustomerOrders(data);
          // If no order currently selected, select the latest one
          if (data.length > 0 && !order) {
            setOrder(data[0]);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching customer orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  }

  async function fetchSingleOrder(num, userPhone) {
    if (!num) return;
    setSearching(true);
    setError("");
    try {
      let url = `${API}/api/orders/track/${encodeURIComponent(num.trim())}`;
      if (userPhone && userPhone.trim()) {
        url += `?phone=${encodeURIComponent(userPhone.trim())}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.detail || "Unable to find order details.");
      }
      setOrder(data);
    } catch (err) {
      setError(err.message || "Failed to find order.");
    } finally {
      setSearching(false);
    }
  }

  async function handleManualSearch(e) {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setError("Please enter your Order Number (e.g. ORD-20261112-9328)");
      return;
    }
    fetchSingleOrder(orderNumber, phone || session?.phone || "");
  }

  const history = order?.statusHistory || [];
  const currentIndex = STEPS.findIndex(s => s.status === order?.orderStatus);
  const cancelled = order?.orderStatus === "CANCELLED";

  return (
    <div className="tracking-page">
      <header className="tracking-header">
        <a href="/store.html" className="tracking-brand">
          <span className="tracking-logo"><Pill size={22} /></span>
          <span>UTAAM <b>MEDICAL</b><small>CARE THAT COMES CLOSER</small></span>
        </a>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <a href="/store.html" className="back-store">
            <ArrowLeft size={16} /> Storefront
          </a>
          {session ? (
            <div className="header-user-tag">
              <span className="user-dot"></span>
              <span>{session.name?.split(' ')[0] || 'User'}</span>
            </div>
          ) : (
            <a href="/login.html" className="back-store" style={{ background: '#eaf2e9', padding: '6px 12px', borderRadius: '16px' }}>
              Sign In
            </a>
          )}
        </div>
      </header>

      <main className="tracking-main">
        {/* Customer Profile Banner */}
        {session ? (
          <div className="customer-profile-card">
            <div className="profile-card-left">
              <div className="profile-avatar">
                {(session.name || session.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="profile-details">
                <div className="profile-name-row">
                  <h2>{session.name || 'Valued Customer'}</h2>
                  <span className="verified-pill">✓ Verified Account</span>
                </div>
                <div className="profile-meta-row">
                  <span>✉ {session.email}</span>
                  {session.phone && <span>📞 +91 {session.phone}</span>}
                  {session.address && <span>📍 {session.address}</span>}
                </div>
              </div>
            </div>
            <button
              className="refresh-orders-btn"
              onClick={loadCustomerOrders}
              disabled={loadingOrders}
              title="Refresh Orders"
            >
              <RefreshCw size={15} className={loadingOrders ? "spin" : ""} />
              {loadingOrders ? "Updating…" : "Refresh"}
            </button>
          </div>
        ) : (
          <div className="guest-login-prompt">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={20} color="#2d6a4f" />
              <span>Looking for your personal order history?</span>
            </div>
            <a href="/login.html" className="guest-login-btn">
              Sign In with Verified Account →
            </a>
          </div>
        )}

        {/* If customer has orders: Show All Customer Orders List */}
        {session && (
          <section className="customer-orders-section">
            <div className="section-title-row">
              <h3>
                <Package size={18} />
                All Your Orders ({customerOrders.length})
              </h3>
              <small>Click any order to view real-time delivery tracking</small>
            </div>

            {loadingOrders ? (
              <div className="orders-loading">Loading your order history…</div>
            ) : customerOrders.length === 0 ? (
              <div className="no-orders-box">
                <AlertCircle size={28} color="#9ca3af" />
                <p>No orders found under {session.email}.</p>
                <a href="/store.html" className="shop-link">Start Shopping at Storefront →</a>
              </div>
            ) : (
              <div className="customer-orders-grid">
                {customerOrders.map(ord => {
                  const isSelected = order?.id === ord.id || order?.orderNumber === ord.orderNumber;
                  const count = ord.items ? ord.items.reduce((s, it) => s + (it.quantity || 1), 0) : 0;
                  return (
                    <div
                      key={ord.id || ord.orderNumber}
                      className={`order-card-summary ${isSelected ? "selected-order" : ""}`}
                      onClick={() => {
                        setOrder(ord);
                        setError("");
                      }}
                    >
                      <div className="order-summary-top">
                        <span className="order-card-num">{ord.orderNumber}</span>
                        <span className={`status-badge status-${(ord.orderStatus || 'CONFIRMED').toLowerCase()}`}>
                          {formatStatus(ord.orderStatus)}
                        </span>
                      </div>
                      <div className="order-summary-mid">
                        <span><Calendar size={13} /> {formatDate(ord.createdAt)}</span>
                        <span><CreditCard size={13} /> ₹{Number(ord.totalAmount).toFixed(2)}</span>
                      </div>
                      <div className="order-summary-bot">
                        <span>{count} {count === 1 ? 'medicine' : 'medicines'} ({ord.paymentMethod?.replaceAll('_', ' ')})</span>
                        <ChevronRight size={15} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Selected Order Full Tracking View */}
        {order ? (
          <section className="tracking-result">
            <div className="tracking-order-top">
              <div>
                <span className="tracking-eyebrow">LIVE DELIVERY TRACKING</span>
                <h2>Order #{order.orderNumber}</h2>
                <p>Placed on {formatDate(order.createdAt)}</p>
              </div>

              <span className={`tracking-status ${cancelled ? "cancelled" : ""}`}>
                ● {formatStatus(order.orderStatus)}
              </span>
            </div>

            <div className="tracking-summary">
              <div>
                <Package />
                <span>Customer</span>
                <b>{order.customerName}</b>
                <small>{order.customerPhone || 'N/A'}</small>
              </div>
              <div>
                <MapPin />
                <span>Delivery Address</span>
                <b>{order.deliveryAddress}</b>
              </div>
              <div>
                <ShieldCheck />
                <span>Payment Mode</span>
                <b>{order.paymentMethod?.replaceAll('_', ' ')}</b>
                <small>Total: ₹{Number(order.totalAmount).toFixed(2)}</small>
              </div>
            </div>

            {/* Visual Delivery Stepper Timeline */}
            <div className="tracking-section">
              <h3><Truck size={19} /> Live Delivery Stages</h3>

              {cancelled ? (
                <div className="tracking-cancelled">
                  This order has been cancelled. Please contact UTAAM Medical pharmacy support for queries.
                </div>
              ) : (
                <div className="tracking-timeline">
                  {STEPS.map((step, index) => {
                    const event = history.find(entry => entry.status === step.status);
                    const completed = currentIndex >= index;
                    const isCurrent = currentIndex === index;

                    return (
                      <div className={`tracking-step ${isCurrent ? 'current-step' : ''}`} key={step.status}>
                        <div className={`tracking-step-icon ${completed ? "completed" : ""} ${isCurrent ? "active-stage" : ""}`}>
                          {completed ? <CheckCircle2 size={19} /> : <Clock size={18} />}
                        </div>

                        <div className="tracking-step-content">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <b>{step.label}</b>
                            {isCurrent && <span className="in-progress-tag">In Progress</span>}
                          </div>
                          <p>{event?.note || step.description}</p>
                          {event?.updatedAt && (
                            <small>{formatDate(event.updatedAt)}</small>
                          )}
                        </div>

                        {completed && (
                          <span className="tracking-done">Completed ✓</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Itemized Medicine List */}
            <div className="tracking-section">
              <h3>Medicines in this Package</h3>
              {order.items?.map(item => (
                <div className="tracking-item" key={item.id || item.medicineId || Math.random()}>
                  <div>
                    <b>{item.medicineName}</b>
                    <small>
                      {item.dosageForm || "Medicine"} • Batch: {item.batchNumber || "Certified Batch"}
                    </small>
                  </div>
                  <span>{item.quantity} × ₹{Number(item.unitPrice).toFixed(2)}</span>
                  <b>₹{Number(item.subtotal).toFixed(2)}</b>
                </div>
              ))}
              <div className="tracking-total">
                <span>Grand Total Payable</span>
                <b>₹{Number(order.totalAmount).toFixed(2)}</b>
              </div>
            </div>
          </section>
        ) : null}

        {/* Manual Lookup Form (for any other order or guests) */}
        <div className="manual-lookup-wrap">
          <div className="tracking-heading" style={{ marginTop: '35px', marginBottom: '18px' }}>
            <span className="tracking-eyebrow">ORDER SEARCH</span>
            <h2 style={{ fontSize: '20px', margin: '4px 0' }}>Track Any Other Order</h2>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>
              Enter an order number to look up real-time pharmacy packing and dispatch status.
            </p>
          </div>

          <form className="tracking-search" onSubmit={handleManualSearch}>
            <label>
              Order Number *
              <input
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
                placeholder="e.g. ORD-20261112-9328"
                required
              />
            </label>

            <label>
              Registered Phone Number (Optional)
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder={session?.phone ? `Default: ${session.phone}` : "e.g. 9876543210"}
              />
            </label>

            <button type="submit" disabled={searching}>
              <Search size={16} />
              {searching ? "Searching…" : "Track Order"}
            </button>

            {error && <div className="tracking-error">{error}</div>}
          </form>
        </div>

        <div className="tracking-help">
          <ShieldCheck size={18} />
          <span>Real-time prescription & batch tracking protected by UTAAM Medical inventory system.</span>
        </div>
      </main>

      <footer className="tracking-footer">
        © {new Date().getFullYear()} UTAAM MEDICAL PHARMACY · Care that comes closer.
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<TrackOrder />);
