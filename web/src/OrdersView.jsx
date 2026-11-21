import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './orders-view.css';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8086';

const money = val =>
  `₹${Number(val || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

const formatDateTime = dt => {
  if (!dt) return 'N/A';
  try {
    const d = new Date(dt);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return String(dt);
  }
};

export default function OrdersView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState('');

  const fetchOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch(`${API}/api/orders`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      if (!silent) setError('Unable to connect to order server. Retrying...');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), 8000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  // Status transitions
  const updateStatus = async (order, nextStatus, customNote) => {
    try {
      setUpdatingId(order.id);
      const note = customNote || (
        nextStatus === 'PROCESSING' ? 'Order accepted by UTAAM Pharmacy staff. Preparing prescription & medicines.' :
        nextStatus === 'SHIPPED' ? 'Dispatched from UTAAM Medical store with local delivery agent.' :
        nextStatus === 'OUT_FOR_DELIVERY' ? 'Delivery agent is on the way to customer address in Jath.' :
        nextStatus === 'DELIVERED' ? 'Order successfully delivered to customer.' :
        `Status updated to ${nextStatus}`
      );

      const res = await fetch(`${API}/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, note })
      });

      if (!res.ok) {
        // Fallback to PUT if PATCH fails
        const res2 = await fetch(`${API}/api/orders/${order.id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus, note })
        });
        if (!res2.ok) throw new Error('Status update failed');
      }

      await fetchOrders(true);

      if (nextStatus === 'PROCESSING') {
        showToast(`✓ Order ${order.orderNumber} ACCEPTED! Moved to processing.`);
      } else if (nextStatus === 'SHIPPED') {
        showToast(`🚚 Order ${order.orderNumber} marked as SHIPPED!`);
      } else if (nextStatus === 'OUT_FOR_DELIVERY') {
        showToast(`🛵 Order ${order.orderNumber} is OUT FOR DELIVERY!`);
      } else if (nextStatus === 'DELIVERED') {
        showToast(`✅ Order ${order.orderNumber} marked as DELIVERED!`);
      }

      if (selectedOrder && selectedOrder.id === order.id) {
        setSelectedOrder(prev => ({ ...prev, orderStatus: nextStatus }));
      }
    } catch (err) {
      alert(`Error updating order: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Counts
  const counts = useMemo(() => {
    return {
      all: orders.length,
      confirmed: orders.filter(o => o.orderStatus === 'CONFIRMED').length,
      processing: orders.filter(o => o.orderStatus === 'PROCESSING').length,
      shipped: orders.filter(o => o.orderStatus === 'SHIPPED').length,
      out: orders.filter(o => o.orderStatus === 'OUT_FOR_DELIVERY').length,
      delivered: orders.filter(o => o.orderStatus === 'DELIVERED').length
    };
  }, [orders]);

  // Filtering
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchStatus =
        filter === 'ALL' ? true :
        filter === 'CONFIRMED' ? o.orderStatus === 'CONFIRMED' :
        filter === 'PROCESSING' ? o.orderStatus === 'PROCESSING' :
        filter === 'SHIPPED' ? o.orderStatus === 'SHIPPED' :
        filter === 'OUT_FOR_DELIVERY' ? o.orderStatus === 'OUT_FOR_DELIVERY' :
        filter === 'DELIVERED' ? o.orderStatus === 'DELIVERED' : true;

      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.toLowerCase().includes(q)) ||
        (o.deliveryAddress && o.deliveryAddress.toLowerCase().includes(q));

      return matchStatus && matchSearch;
    });
  }, [orders, filter, search]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="ov-status-pill status-confirmed">🟡 Pending Accept</span>;
      case 'PROCESSING':
        return <span className="ov-status-pill status-processing">🔵 Accepted / Packing</span>;
      case 'SHIPPED':
        return <span className="ov-status-pill status-shipped">🚚 Shipped</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="ov-status-pill status-out_for_delivery">🛵 Out for Delivery</span>;
      case 'DELIVERED':
        return <span className="ov-status-pill status-delivered">✅ Delivered</span>;
      default:
        return <span className="ov-status-pill">{status}</span>;
    }
  };

  return (
    <div className="orders-view">
      {/* ── Page Heading ── */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">ORDER FULFILLMENT</div>
          <h1>Customer Orders</h1>
          <p>Review customer prescriptions, accept incoming orders, and manage local delivery stages.</p>
        </div>

        <button type="button" className="ov-refresh-btn" onClick={() => fetchOrders()}>
          ↻ Refresh Orders
        </button>
      </div>

      {toast && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #10b981',
          color: '#065f46',
          padding: '12px 18px',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {toast}
        </div>
      )}

      {/* ── Statistics Cards ── */}
      <div className="ov-stats-grid">
        <div className="ov-stat-card">
          <span className="ov-stat-label">Total Orders</span>
          <span className="ov-stat-val">{counts.all}</span>
          <span className="ov-stat-sub">All storefront orders</span>
        </div>

        <div className={`ov-stat-card ${counts.confirmed > 0 ? 'alert-card' : ''}`}>
          <span className="ov-stat-label">
            <span>Pending Acceptance</span>
            {counts.confirmed > 0 && <span style={{ color: '#b45309' }}>⚡ Action</span>}
          </span>
          <span className="ov-stat-val">{counts.confirmed}</span>
          <span className="ov-stat-sub">New orders ready to accept</span>
        </div>

        <div className="ov-stat-card">
          <span className="ov-stat-label">Processing / Packing</span>
          <span className="ov-stat-val">{counts.processing}</span>
          <span className="ov-stat-sub">Prescription being prepared</span>
        </div>

        <div className="ov-stat-card">
          <span className="ov-stat-label">In Transit</span>
          <span className="ov-stat-val">{counts.shipped + counts.out}</span>
          <span className="ov-stat-sub">Shipped &amp; out for delivery</span>
        </div>

        <div className="ov-stat-card">
          <span className="ov-stat-label">Delivered</span>
          <span className="ov-stat-val">{counts.delivered}</span>
          <span className="ov-stat-sub">Successfully fulfilled</span>
        </div>
      </div>

      {/* ── Toolbar with Filters & Search ── */}
      <div className="ov-toolbar-panel">
        <div className="ov-filter-tabs">
          <button
            type="button"
            className={`ov-tab-btn ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            All Orders <span className="ov-tab-count">{counts.all}</span>
          </button>

          <button
            type="button"
            className={`ov-tab-btn tab-pending ${filter === 'CONFIRMED' ? 'active' : ''}`}
            onClick={() => setFilter('CONFIRMED')}
          >
            🟡 Pending Accept <span className="ov-tab-count">{counts.confirmed}</span>
          </button>

          <button
            type="button"
            className={`ov-tab-btn ${filter === 'PROCESSING' ? 'active' : ''}`}
            onClick={() => setFilter('PROCESSING')}
          >
            🔵 Packing <span className="ov-tab-count">{counts.processing}</span>
          </button>

          <button
            type="button"
            className={`ov-tab-btn ${filter === 'SHIPPED' ? 'active' : ''}`}
            onClick={() => setFilter('SHIPPED')}
          >
            🚚 Shipped <span className="ov-tab-count">{counts.shipped}</span>
          </button>

          <button
            type="button"
            className={`ov-tab-btn ${filter === 'OUT_FOR_DELIVERY' ? 'active' : ''}`}
            onClick={() => setFilter('OUT_FOR_DELIVERY')}
          >
            🛵 Out for Delivery <span className="ov-tab-count">{counts.out}</span>
          </button>

          <button
            type="button"
            className={`ov-tab-btn ${filter === 'DELIVERED' ? 'active' : ''}`}
            onClick={() => setFilter('DELIVERED')}
          >
            ✅ Delivered <span className="ov-tab-count">{counts.delivered}</span>
          </button>
        </div>

        <div className="ov-search-box">
          <input
            type="search"
            placeholder="Search order #, customer, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ov-search-input"
          />
        </div>
      </div>

      {/* ── Orders Table ── */}
      <div className="ov-table-card">
        <div className="ov-table-wrap">
          <table className="ov-table">
            <thead>
              <tr>
                <th>ORDER DETAILS</th>
                <th>CUSTOMER &amp; ADDRESS</th>
                <th>MEDICINES</th>
                <th>AMOUNT</th>
                <th>CURRENT STATUS</th>
                <th style={{ minWidth: '180px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    Loading orders from database...
                  </td>
                </tr>
              )}

              {!loading && filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No orders matching this filter.
                  </td>
                </tr>
              )}

              {!loading && filteredOrders.map(order => {
                const isUpdating = updatingId === order.id;

                return (
                  <tr key={order.id}>
                    {/* Order Details */}
                    <td>
                      <div className="ov-order-num">
                        {order.orderNumber}
                        {order.orderStatus === 'CONFIRMED' && (
                          <span className="ov-badge-new">NEW</span>
                        )}
                      </div>
                      <div className="ov-date-sub">{formatDateTime(order.createdAt)}</div>
                      <div className="ov-pay-method">{order.paymentMethod || 'Online'}</div>
                    </td>

                    {/* Customer */}
                    <td>
                      <div className="ov-cust-name">{order.customerName || 'Customer'}</div>
                      <a href={`tel:${order.customerPhone}`} className="ov-cust-phone">
                        📞 {order.customerPhone}
                      </a>
                      <div className="ov-cust-addr" title={order.deliveryAddress}>
                        📍 {order.deliveryAddress || 'Local Delivery'}
                      </div>
                    </td>

                    {/* Medicines */}
                    <td>
                      <div className="ov-items-summary">
                        {order.items?.length || 0} item{order.items?.length === 1 ? '' : 's'}
                      </div>
                      <div className="ov-items-preview">
                        {order.items?.map(it => `${it.medicineName} (${it.quantity})`).join(', ') || 'Prescription items'}
                      </div>
                    </td>

                    {/* Amount */}
                    <td>
                      <div className="ov-amount">{money(order.totalAmount)}</div>
                    </td>

                    {/* Status */}
                    <td>
                      {getStatusBadge(order.orderStatus)}
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="ov-actions-cell">
                        {/* 1. If CONFIRMED -> PROMINENT ACCEPT BUTTON */}
                        {order.orderStatus === 'CONFIRMED' && (
                          <button
                            type="button"
                            className="ov-btn-accept"
                            disabled={isUpdating}
                            onClick={() => updateStatus(order, 'PROCESSING')}
                            title="Accept this order to start prescription packing"
                          >
                            {isUpdating ? 'Accepting...' : '✓ Accept Order'}
                          </button>
                        )}

                        {/* 2. If PROCESSING -> SHIP BUTTON */}
                        {order.orderStatus === 'PROCESSING' && (
                          <button
                            type="button"
                            className="ov-btn-ship"
                            disabled={isUpdating}
                            onClick={() => updateStatus(order, 'SHIPPED')}
                            title="Dispatch medicines with delivery partner"
                          >
                            {isUpdating ? 'Updating...' : '🚚 Ship Order'}
                          </button>
                        )}

                        {/* 3. If SHIPPED -> OUT FOR DELIVERY BUTTON */}
                        {order.orderStatus === 'SHIPPED' && (
                          <button
                            type="button"
                            className="ov-btn-out"
                            disabled={isUpdating}
                            onClick={() => updateStatus(order, 'OUT_FOR_DELIVERY')}
                            title="Delivery boy is out for delivery in Jath"
                          >
                            {isUpdating ? 'Updating...' : '🛵 Out for Delivery'}
                          </button>
                        )}

                        {/* 4. If OUT_FOR_DELIVERY -> MARK DELIVERED BUTTON */}
                        {order.orderStatus === 'OUT_FOR_DELIVERY' && (
                          <button
                            type="button"
                            className="ov-btn-deliver"
                            disabled={isUpdating}
                            onClick={() => updateStatus(order, 'DELIVERED')}
                            title="Confirm delivery to customer"
                          >
                            {isUpdating ? 'Updating...' : '✅ Mark Delivered'}
                          </button>
                        )}

                        {/* View Drawer Button */}
                        <button
                          type="button"
                          className="ov-btn-view"
                          onClick={() => setSelectedOrder(order)}
                          title="View order medicines breakdown"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="ov-table-footer">
          <span>Showing {filteredOrders.length} of {orders.length} orders</span>
          <span>Auto-refreshes every 8 seconds</span>
        </div>
      </div>

      {/* ── Order Details Drawer ── */}
      {selectedOrder && (
        <div className="ov-drawer-backdrop" onClick={(e) => {
          if (e.target === e.currentTarget) setSelectedOrder(null);
        }}>
          <aside className="ov-drawer">
            <div className="ov-drawer-head">
              <div>
                <small style={{ color: '#0d9488', fontWeight: 700, letterSpacing: '1px' }}>
                  ORDER DETAILS
                </small>
                <h3 className="ov-drawer-title">{selectedOrder.orderNumber}</h3>
                <div style={{ marginTop: '6px' }}>
                  {getStatusBadge(selectedOrder.orderStatus)}
                </div>
              </div>

              <button type="button" className="ov-drawer-close" onClick={() => setSelectedOrder(null)}>
                ✕
              </button>
            </div>

            <div className="ov-drawer-body">
              {/* Customer section */}
              <div className="ov-drawer-section">
                <h4>Customer Information</h4>
                <div className="ov-drawer-grid">
                  <div className="ov-grid-item">
                    <small>Customer Name</small>
                    <strong>{selectedOrder.customerName}</strong>
                  </div>
                  <div className="ov-grid-item">
                    <small>Contact Phone</small>
                    <strong>
                      <a href={`tel:${selectedOrder.customerPhone}`} style={{ color: '#0d9488', textDecoration: 'none' }}>
                        📞 {selectedOrder.customerPhone}
                      </a>
                    </strong>
                  </div>
                  <div className="ov-grid-item" style={{ gridColumn: '1 / -1' }}>
                    <small>Email Address</small>
                    <strong>{selectedOrder.customerEmail || 'Not specified'}</strong>
                  </div>
                  <div className="ov-grid-item" style={{ gridColumn: '1 / -1' }}>
                    <small>Delivery Address</small>
                    <strong>📍 {selectedOrder.deliveryAddress}</strong>
                  </div>
                  <div className="ov-grid-item">
                    <small>Payment Method</small>
                    <strong>{selectedOrder.paymentMethod}</strong>
                  </div>
                  <div className="ov-grid-item">
                    <small>Order Placed On</small>
                    <strong>{formatDateTime(selectedOrder.createdAt)}</strong>
                  </div>
                </div>
              </div>

              {/* Items section */}
              <div className="ov-drawer-section">
                <h4>Prescription Medicines ({selectedOrder.items?.length || 0})</h4>
                <div className="ov-drawer-items-list">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div key={item.id || idx} className="ov-item-row">
                        <div className="ov-item-info">
                          <strong>{item.medicineName}</strong>
                          <small>
                            {item.dosageForm || 'Medicine'} · Batch: <b>{item.batchNumber || 'BAT-26'}</b> · {money(item.unitPrice)} × {item.quantity}
                          </small>
                        </div>
                        <div className="ov-item-total">
                          {money(item.subtotal)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#64748b', fontSize: '12px' }}>No items recorded.</div>
                  )}
                </div>
              </div>

              {/* Total amount */}
              <div className="ov-drawer-total-box">
                <div>
                  <small style={{ textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block' }}>Total Paid</small>
                  <span>Incl. all pharmacy taxes &amp; packaging</span>
                </div>
                <strong>{money(selectedOrder.totalAmount)}</strong>
              </div>

              {/* Action in drawer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                {selectedOrder.orderStatus === 'CONFIRMED' && (
                  <button
                    type="button"
                    className="ov-btn-accept"
                    style={{ padding: '12px', fontSize: '13px', justifyContent: 'center' }}
                    onClick={() => updateStatus(selectedOrder, 'PROCESSING')}
                  >
                    ✓ Accept Order (Start Packing)
                  </button>
                )}

                {selectedOrder.orderStatus === 'PROCESSING' && (
                  <button
                    type="button"
                    className="ov-btn-ship"
                    style={{ padding: '12px', fontSize: '13px', justifyContent: 'center' }}
                    onClick={() => updateStatus(selectedOrder, 'SHIPPED')}
                  >
                    🚚 Mark as Shipped (Hand to Courier)
                  </button>
                )}

                {selectedOrder.orderStatus === 'SHIPPED' && (
                  <button
                    type="button"
                    className="ov-btn-out"
                    style={{ padding: '12px', fontSize: '13px', justifyContent: 'center' }}
                    onClick={() => updateStatus(selectedOrder, 'OUT_FOR_DELIVERY')}
                  >
                    🛵 Mark Out for Delivery (In Jath)
                  </button>
                )}

                {selectedOrder.orderStatus === 'OUT_FOR_DELIVERY' && (
                  <button
                    type="button"
                    className="ov-btn-deliver"
                    style={{ padding: '12px', fontSize: '13px', justifyContent: 'center' }}
                    onClick={() => updateStatus(selectedOrder, 'DELIVERED')}
                  >
                    ✅ Confirm Order Delivered
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
