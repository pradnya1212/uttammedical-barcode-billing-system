
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Pill, Search, Package, CheckCircle2, Clock,
  Truck, MapPin, ArrowLeft, ShieldCheck
} from "lucide-react";
import "./track-order.css";

const API =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8086";

const STEPS = [
  { status: "CONFIRMED", label: "Order Confirmed", description: "Pharmacy accepted your order." },
  { status: "PROCESSING", label: "Preparing Order", description: "Your medicines are being packed." },
  { status: "SHIPPED", label: "Order Shipped", description: "Your order has been dispatched." },
  { status: "OUT_FOR_DELIVERY", label: "Out for Delivery", description: "Your order is on its way." },
  { status: "DELIVERED", label: "Delivered", description: "Your order has been delivered." }
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
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleTrack(event) {
    event.preventDefault();

    if (!orderNumber.trim() || !phone.trim()) {
      setError("Please enter your order number and phone number.");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const url =
        `${API}/api/orders/track/${encodeURIComponent(orderNumber.trim())}` +
        `?phone=${encodeURIComponent(phone.trim())}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.detail || "Unable to find your order.");
      }

      setOrder(data);
    } catch (err) {
      setError(err.message || "Unable to track your order.");
    } finally {
      setLoading(false);
    }
  }

  const history = order?.statusHistory || [];
  const currentIndex = STEPS.findIndex(
    step => step.status === order?.orderStatus
  );

  const cancelled = order?.orderStatus === "CANCELLED";

  return (
    <div className="tracking-page">
      <header className="tracking-header">
        <a href="/store.html" className="tracking-brand">
          <span className="tracking-logo"><Pill size={23} /></span>
          <span>UTAAM <b>MEDICAL</b><small>CARE THAT COMES CLOSER</small></span>
        </a>
        <a href="/store.html" className="back-store">
          <ArrowLeft size={16} /> Continue Shopping
        </a>
      </header>

      <main className="tracking-main">
        <div className="tracking-heading">
          <span className="tracking-eyebrow">ORDER TRACKING</span>
          <h1>Track your order</h1>
          <p>Enter your order details to see the latest delivery status.</p>
        </div>

        <form className="tracking-search" onSubmit={handleTrack}>
          <label>
            Order Number
            <input
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              placeholder="Example: ORD-20261112-1626"
              required
            />
          </label>

          <label>
            Registered Phone Number
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Enter your registered phone"
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            <Search size={17} />
            {loading ? "Searching..." : "Track Order"}
          </button>

          {error && <div className="tracking-error">{error}</div>}
        </form>

        {order && (
          <section className="tracking-result">
            <div className="tracking-order-top">
              <div>
                <span className="tracking-eyebrow">ORDER NUMBER</span>
                <h2>{order.orderNumber}</h2>
                <p>Placed on {formatDate(order.createdAt)}</p>
              </div>

              <span className={`tracking-status ${cancelled ? "cancelled" : ""}`}>
                {formatStatus(order.orderStatus)}
              </span>
            </div>

            <div className="tracking-summary">
              <div>
                <Package />
                <span>Customer</span>
                <b>{order.customerName}</b>
              </div>
              <div>
                <MapPin />
                <span>Delivery Address</span>
                <b>{order.deliveryAddress}</b>
              </div>
              <div>
                <ShieldCheck />
                <span>Payment</span>
                <b>{order.paymentMethod}</b>
              </div>
            </div>

            <div className="tracking-section">
              <h3><Truck size={19} /> Delivery Progress</h3>

              {cancelled ? (
                <div className="tracking-cancelled">
                  This order has been cancelled. Please contact the pharmacy for assistance.
                </div>
              ) : (
                <div className="tracking-timeline">
                  {STEPS.map((step, index) => {
                    const event = history.find(
                      entry => entry.status === step.status
                    );

                    const completed = currentIndex >= index;

                    return (
                      <div className="tracking-step" key={step.status}>
                        <div className={`tracking-step-icon ${completed ? "completed" : ""}`}>
                          {completed
                            ? <CheckCircle2 size={21} />
                            : <Clock size={20} />}
                        </div>

                        <div className="tracking-step-content">
                          <b>{step.label}</b>
                          <p>{event?.note || step.description}</p>
                          {event?.updatedAt && (
                            <small>{formatDate(event.updatedAt)}</small>
                          )}
                        </div>

                        {completed && (
                          <span className="tracking-done">Completed</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="tracking-section">
              <h3>Order Items</h3>
              {order.items?.map(item => (
                <div className="tracking-item" key={item.id}>
                  <div>
                    <b>{item.medicineName}</b>
                    <small>
                      {item.dosageForm || "Medicine"} · Batch: {item.batchNumber || "N/A"}
                    </small>
                  </div>
                  <span>{item.quantity} × ₹{Number(item.unitPrice).toFixed(2)}</span>
                  <b>₹{Number(item.subtotal).toFixed(2)}</b>
                </div>
              ))}
              <div className="tracking-total">
                <span>Total Payable</span>
                <b>₹{Number(order.totalAmount).toFixed(2)}</b>
              </div>
            </div>
          </section>
        )}

        <div className="tracking-help">
          <ShieldCheck size={19} />
          <span>Your order details are checked against your registered phone number.</span>
        </div>
      </main>

      <footer className="tracking-footer">
        © {new Date().getFullYear()} UTAAM MEDICAL · Care that comes closer.
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<TrackOrder />);
