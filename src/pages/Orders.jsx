import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders, selectAllOrders, selectOrdersLoading } from '../features/orders/ordersSlice';
import './Orders.css';

const statusColors = {
  Pending: 'warning',
  Confirmed: 'info',
  'Out for Delivery': 'info',
  Completed: 'success',
  Cancelled: 'error',
};

export default function Orders() {
  const dispatch = useDispatch();
  const orders = useSelector(selectAllOrders);
  const loading = useSelector(selectOrdersLoading);

  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  const sorted = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (loading) return <div className="page-wrapper loading-center"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="page-title-section">
        <div className="container">
          <h1>My Orders</h1>
          <p className="text-muted">{orders.length} orders total</p>
        </div>
      </div>

      <div className="container orders-page">
        {sorted.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📦</div>
            <h3>No orders yet</h3>
            <p>Start shopping to see your orders here</p>
            <Link to="/products" className="btn btn-accent">Shop Now</Link>
          </div>
        ) : (
          <div className="orders-list">
            {sorted.map((order) => (
              <div key={order._id} className="order-card card">
                <div className="order-header">
                  <div>
                    <span className="order-id">Order #{order._id?.slice(-8)?.toUpperCase()}</span>
                    <span className="order-date text-muted text-sm">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <span className={`badge badge-${statusColors[order.status] || 'primary'}`}>
                    {order.status}
                  </span>
                </div>

                <div className="order-items-preview">
                  {order.orderItems?.slice(0, 3).map((item, i) => (
                    <div key={i} className="order-item-thumb">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} />
                      ) : (
                        <div className="thumb-placeholder">☕</div>
                      )}
                    </div>
                  ))}
                  {order.orderItems?.length > 3 && (
                    <div className="order-item-thumb more">+{order.orderItems.length - 3}</div>
                  )}
                  <div className="order-items-text">
                    {order.orderItems?.slice(0, 2).map(i => i.name).join(', ')}
                    {order.orderItems?.length > 2 ? ` +${order.orderItems.length - 2} more` : ''}
                  </div>
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <span>Total</span>
                    <strong>${order.total?.toFixed(2)}</strong>
                  </div>
                  <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
