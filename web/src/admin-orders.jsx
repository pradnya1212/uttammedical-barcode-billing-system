
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./admin-orders.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8086";

const STATUSES = [
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
];

const NEXT_STATUS = {
  CONFIRMED: "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED"
};

const money = value =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

const dateFormat = value =>
  value ? new Date(value).toLocaleString("en-IN") : "N/A";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [newOrders, setNewOrders] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  const previousIds = useRef(null);

  const fetchOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const response = await fetch(`${API}/api/orders`);

      if (!response.ok) {
        throw new Error(`Could not load orders: HTTP ${response.status}`);
      }

      const data = await response.json();
      const list = Array.isArray(data) ? data : [];

      if (previousIds.current !== null) {
        const count = list.filter(
          order => !previousIds.current.has(order.id)
        ).length;

        if (count) setNewOrders(value => value + count);
      }

      previousIds.current = new Set(list.map(order => order.id));
      setOrders(list);
      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    const timer = setInterval(() => fetchOrders(true), 10000);

    return () => clearInterval(timer);
  }, [fetchOrders]);

  const filteredOrders = orders.filter(order => {
    const matchesStatus =
      filter === "ALL" || order.orderStatus === filter;

    const query = search.toLowerCase().trim();

    const matchesSearch =
      !query ||
      [
        order.orderNumber,
        order.customerName,
        order.customerPhone,
        order.customerEmail
      ].some(value =>
        String(value || "").toLowerCase().includes(query)
      );

    return matchesStatus && matchesSearch;
  });

  const updateStatus = async (order, status) => {
    const note = window.prompt("Enter an optional status note:", "");
    if (note === null) return;

    try {
      setUpdating(true);

      const response = await fetch(
        `${API}/api/orders/${order.id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, note })
        }
      );

      if (!response.ok) {
        throw new Error(await response.text() || "Status update failed");
      }

      await fetchOrders(true);
      setSelectedOrder(null);
      window.alert("Order status updated successfully.");
    } catch (err) {
      window.alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const countStatus = status =>
    orders.filter(order => order.orderStatus === status).length;

  const statusClass = status =>
    String(status || "").toLowerCase().replaceAll("_", "-");

  return (
    <div className="admin-layout">

      <aside className="admin-sidebar">
        <a href="/" className="admin-brand">
          <span className="brand-icon">U</span>
          <span>
            <strong>UTAAM</strong>
            <small>MEDICAL</small>
          </span>
        </a>

        <p className="sidebar-label">WORKSPACE</p>

        <a href="/" className="sidebar-link">
          <span>▦</span> Dashboard
        </a>

        <a href="/admin-orders.html" className="sidebar-link active">
          <span>▤</span> Orders
          <span className="sidebar-count">{orders.length}</span>
        </a>

        <a href="/store.html" className="sidebar-link">
          <span>▧</span> View Store
        </a>

        <div className="sidebar-bottom">
          <div className="profile-avatar">A</div>
          <div>
            <strong>Administrator</strong>
            <small>Store Management</small>
          </div>
        </div>
      </aside>

      <main className="admin-main">

        <header className="topbar">
          <div>
            <span className="breadcrumb">Workspace / Orders</span>
            <h1>Orders Management</h1>
          </div>

          <div className="topbar-actions">
            {newOrders > 0 && (
              <button
                className="new-order-alert"
                onClick={() => setNewOrders(0)}
              >
                🔔 {newOrders} New
              </button>
            )}

            <button
              className="refresh-button"
              onClick={() => fetchOrders()}
            >
              ↻ Refresh
            </button>
          </div>
        </header>

        <section className="welcome-row">
          <div>
            <h2>Order Overview</h2>
            <p>Monitor customer purchases and delivery progress.</p>
          </div>

          <span className="live-indicator">
            <i /> Auto-refresh every 10 seconds
          </span>
        </section>

        <section className="overview-grid">
          <div className="overview-card">
            <span>Total Orders</span>
            <strong>{orders.length}</strong>
            <small>All customer orders</small>
          </div>

          <div className="overview-card">
            <span>Confirmed</span>
            <strong>{countStatus("CONFIRMED")}</strong>
            <small>Ready for processing</small>
          </div>

          <div className="overview-card">
            <span>Processing</span>
            <strong>{countStatus("PROCESSING")}</strong>
            <small>Being prepared</small>
          </div>

          <div className="overview-card">
            <span>Delivered</span>
            <strong>{countStatus("DELIVERED")}</strong>
            <small>Successfully completed</small>
          </div>
        </section>

        <section className="orders-panel">
          <div className="panel-heading">
            <div>
              <h2>All Orders</h2>
              <p>Customer information and ordered medicines.</p>
            </div>

            <span className="result-count">
              {filteredOrders.length} orders
            </span>
          </div>

          <div className="order-toolbar">
            <input
              type="search"
              placeholder="Search order, customer or phone..."
              value={search}
              onChange={event => setSearch(event.target.value)}
            />

            <select
              value={filter}
              onChange={event => setFilter(event.target.value)}
            >
              <option value="ALL">All statuses</option>
              {STATUSES.map(status => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="admin-error">
              {error}
              <button onClick={() => fetchOrders()}>Retry</button>
            </div>
          )}

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ORDER ID</th>
                  <th>CUSTOMER</th>
                  <th>PRODUCTS</th>
                  <th>DATE</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="7" className="table-message">
                      Loading orders...
                    </td>
                  </tr>
                )}

                {!loading && filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.orderNumber}</strong>
                    </td>

                    <td>
                      <strong>{order.customerName || "N/A"}</strong>
                      <small>{order.customerPhone || "N/A"}</small>
                    </td>

                    <td>
                      <strong>{order.items?.length || 0} items</strong>
                      <small>
                        {order.items?.[0]?.medicineName || "No item details"}
                      </small>
                    </td>

                    <td>{dateFormat(order.createdAt)}</td>
                    <td><strong>{money(order.totalAmount)}</strong></td>

                    <td>
                      <span className={`order-status ${statusClass(order.orderStatus)}`}>
                        {String(order.orderStatus || "UNKNOWN").replaceAll("_", " ")}
                      </span>
                    </td>

                    <td>
                      <button
                        className="view-button"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View details →
                      </button>
                    </td>
                  </tr>
                ))}

                {!loading && !error && filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="table-message">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="panel-footer">
            <span>
              Last updated: {lastUpdated?.toLocaleTimeString() || "Waiting"}
            </span>
            <span>{filteredOrders.length} of {orders.length} orders</span>
          </div>
        </section>
      </main>

      {selectedOrder && (
        <div
          className="drawer-backdrop"
          onClick={event => {
            if (event.target === event.currentTarget) {
              setSelectedOrder(null);
            }
          }}
        >
          <aside className="order-drawer">
            <div className="drawer-header">
              <div>
                <small>ORDER DETAILS</small>
                <h2>{selectedOrder.orderNumber}</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)}>×</button>
            </div>

            <div className="drawer-content">

              <span className={`order-status ${statusClass(selectedOrder.orderStatus)}`}>
                {String(selectedOrder.orderStatus || "").replaceAll("_", " ")}
              </span>

              <section className="drawer-section">
                <h3>Customer Information</h3>
                <p><small>Name</small><strong>{selectedOrder.customerName || "N/A"}</strong></p>
                <p><small>Phone</small><strong>{selectedOrder.customerPhone || "N/A"}</strong></p>
                <p><small>Email</small><strong>{selectedOrder.customerEmail || "N/A"}</strong></p>
                <p><small>Delivery Address</small><strong>{selectedOrder.deliveryAddress || "N/A"}</strong></p>
                <p><small>Payment Method</small><strong>{selectedOrder.paymentMethod || "N/A"}</strong></p>
              </section>

              <section className="drawer-section">
                <h3>Ordered Medicines</h3>

                {selectedOrder.items?.length ? (
                  selectedOrder.items.map(item => (
                    <div className="drawer-product" key={item.id}>
                      <div>
                        <strong>{item.medicineName || "Medicine"}</strong>
                        <small>
                          {item.dosageForm || ""}
                          {item.batchNumber ? ` · Batch ${item.batchNumber}` : ""}
                        </small>
                        <small>
                          {money(item.unitPrice)} × {item.quantity}
                        </small>
                      </div>
                      <strong>{money(item.subtotal)}</strong>
                    </div>
                  ))
                ) : (
                  <p>No medicine details available.</p>
                )}
              </section>

              <div className="drawer-total">
                <span>Total Amount</span>
                <strong>{money(selectedOrder.totalAmount)}</strong>
              </div>

              {NEXT_STATUS[selectedOrder.orderStatus] ? (
                <button
                  className="update-status-button"
                  disabled={updating}
                  onClick={() =>
                    updateStatus(
                      selectedOrder,
                      NEXT_STATUS[selectedOrder.orderStatus]
                    )
                  }
                >
                  {updating
                    ? "Updating..."
                    : `Move to ${NEXT_STATUS[selectedOrder.orderStatus].replaceAll("_", " ")}`}
                </button>
              ) : (
                <p className="delivered-message">
                  Order successfully delivered.
                </p>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<AdminOrders />);
