import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrdersAdmin, selectAllOrders, selectOrdersLoading, updateOrderStatus } from '../../features/orders/ordersSlice';
import { showToast } from '../../features/ui/uiSlice';
import './AdminCommon.css';

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Out for Delivery', 'Completed', 'Cancelled'];
const statusColors = { Pending: 'warning', Confirmed: 'info', 'Out for Delivery': 'info', Completed: 'success', Cancelled: 'error' };

export default function AdminOrders() {
  const dispatch = useDispatch();
  const orders = useSelector(selectAllOrders);
  const loading = useSelector(selectOrdersLoading);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { dispatch(fetchAllOrdersAdmin()); }, [dispatch]);

  const filtered = orders
    .filter(o => filter === 'all' || o.status === filter)
    .filter(o => !search || o._id?.toLowerCase().includes(search.toLowerCase()));

  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleStatusUpdate = async (orderId, status) => {
    const result = await dispatch(updateOrderStatus({ id: orderId, status }));
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(showToast(`Order status updated to ${status}`, 'success'));
      dispatch(fetchAllOrdersAdmin());
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Orders</h1>
        <span className="badge badge-primary">{orders.length} total</span>
      </div>

      <div className="admin-controls">
        <input
          type="text"
          className="form-control"
          placeholder="Search by order ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <div className="filter-tabs">
          {['all', ...STATUS_OPTIONS].map(s => (
            <button
              key={s}
              className={`filter-tab ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Update Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(order => (
                  <tr key={order._id}>
                    <td><strong>#{order._id?.slice(-8).toUpperCase()}</strong></td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        {order.user ? (
                          <span>{order.user?.fullName || 'Registered User'}</span>
                        ) : (
                          <span className="text-muted">Guest<br />{order.guestEmail}</span>
                        )}
                      </div>
                    </td>
                    <td>{order.orderItems?.length} items</td>
                    <td><strong>${order.total?.toFixed(2)}</strong></td>
                    <td><span className={`badge badge-${statusColors[order.status] || 'primary'}`}>{order.status}</span></td>
                    <td>
                      <select
                        className="form-control"
                        style={{ fontSize: '0.8rem', padding: '6px 8px', width: 'auto' }}
                        value={order.status}
                        onChange={e => handleStatusUpdate(order._id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <Link to={`/orders/${order._id}`} className="btn btn-ghost btn-sm">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sorted.length === 0 && (
            <div className="empty-state" style={{ minHeight: 150 }}>
              <p>No orders found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
