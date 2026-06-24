import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrder, cancelOrder, selectSelectedOrder, selectOrdersLoading } from '../features/orders/ordersSlice';
import { showToast } from '../features/ui/uiSlice';
import './OrderDetail.css';

const statusColors = {
  Pending: 'warning',
  Confirmed: 'info',
  'Out for Delivery': 'info',
  Completed: 'success',
  Cancelled: 'error',
};

const statusSteps = ['Pending', 'Confirmed', 'Out for Delivery', 'Completed'];

function CountdownTimer({ editableUntil, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(editableUntil) - new Date();
      if (diff <= 0) { setTimeLeft(0); onExpire?.(); return; }
      setTimeLeft(diff);
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [editableUntil, onExpire]);

  if (timeLeft <= 0) return null;
  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div className="edit-timer">
      <span className="timer-icon">⏱</span>
      <span>Edit window closes in <strong>{mins}:{secs.toString().padStart(2, '0')}</strong></span>
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const order = useSelector(selectSelectedOrder);
  const loading = useSelector(selectOrdersLoading);
  const [canEdit, setCanEdit] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchOrder(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (!order) return;
    const editable = order.isEditable &&
      order.status === 'Pending' &&
      order.editableUntil &&
      new Date() < new Date(order.editableUntil);
    setCanEdit(editable);
  }, [order]);

  const handleCancel = async () => {
    const result = await dispatch(cancelOrder(id));
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(showToast('Order cancelled successfully', 'success'));
      dispatch(fetchOrder(id));
      navigate('/orders');
    }
  };

  const currentStep = order ? statusSteps.indexOf(order.status) : 0;

  if (loading || !order) return <div className="page-wrapper loading-center"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container order-detail-page">
        <div className="breadcrumb">
          <Link to="/orders">My Orders</Link>
          <span>›</span>
          <span>#{order._id?.slice(-8)?.toUpperCase()}</span>
        </div>

        <div className="order-detail-header">
          <div>
            <h1>Order #{order._id?.slice(-8)?.toUpperCase()}</h1>
            <p className="text-muted text-sm">
              Placed on {new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
          <span className={`badge badge-${statusColors[order.status] || 'primary'} badge-lg`}>
            {order.status}
          </span>
        </div>

        {/* Edit Window */}
        {canEdit && order.editableUntil && (
          <div className="edit-notice card">
            <CountdownTimer editableUntil={order.editableUntil} onExpire={() => setCanEdit(false)} />
            <p>Your order can be modified. Contact us or update from here within the edit window.</p>
          </div>
        )}

        {/* Status Tracker */}
        {order.status !== 'Cancelled' && (
          <div className="status-tracker card">
            <h3>Order Progress</h3>
            <div className="tracker-steps">
              {statusSteps.map((step, i) => (
                <React.Fragment key={step}>
                  <div className={`tracker-step ${i <= currentStep ? 'done' : ''} ${i === currentStep ? 'current' : ''}`}>
                    <div className="step-circle">
                      {i < currentStep ? '✓' : i + 1}
                    </div>
                    <span>{step}</span>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className={`tracker-line ${i < currentStep ? 'done' : ''}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <div className="order-detail-grid">
          {/* Items */}
          <div className="order-items-section card">
            <h3>Items Ordered</h3>
            {order.orderItems?.map((item, i) => (
              <div key={i} className="order-detail-item">
                <div className="odi-img">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <span>☕</span>}
                </div>
                <div className="odi-info">
                  <strong>{item.name}</strong>
                  <span className="text-muted text-sm">Unit price: {item.price}&nbsp;EGP</span>
                </div>
                <div className="odi-qty">× {item.quantity}</div>
                <div className="odi-total">{(item.price * item.quantity)}&nbsp;EGP</div>
              </div>
            ))}
          </div>

          <div className="order-sidebar">
            {/* Shipping */}
            <div className="card side-card">
              <h4>📍 Shipping Address</h4>
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
              <p>{order.shippingAddress?.country}</p>
            </div>

            {/* Payment Summary */}
            <div className="card side-card">
              <h4>💰 Payment Summary</h4>
              <div className="payment-rows">
                <div className="payment-row">
                  <span>Subtotal</span>
                  <span>{order.subtotal}&nbsp;EGP</span>
                </div>
                {order.discount > 0 && (
                  <div className="payment-row discount">
                    <span>Discount {order.promoCodeUsed ? `(${order.promoCodeUsed.code})` : '(8th Sauce Reward)'}</span>
                    <span>−{order.discount}&nbsp;EGP</span>
                  </div>
                )}
                <div className="summary-line">
                  <span>Shipping</span>
                  <span>{order.shippingFee || 100} EGP</span>
                </div>
                <div className="payment-row total">
                  <strong>Total</strong>
                  <strong>{order.total}&nbsp;EGP</strong>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card side-card order-actions">
              {canEdit && (
                <Link to={`/orders/${order._id}/edit`} className="btn btn-outline">
                  ✏️ Edit Order
                </Link>
              )}
              {order.status === 'Pending' && !cancelConfirm && (
                <button
                  className="btn btn-ghost"
                  style={{ color: 'var(--error-color)' }}
                  onClick={() => setCancelConfirm(true)}
                >
                  Cancel Order
                </button>
              )}
              {cancelConfirm && (
                <div className="cancel-confirm">
                  <p>Are you sure you want to cancel?</p>
                  <div className="flex gap-sm">
                    <button className="btn btn-sm" style={{ background: 'var(--error-color)', color: 'white' }} onClick={handleCancel}>
                      Yes, Cancel
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setCancelConfirm(false)}>Keep Order</button>
                  </div>
                </div>
              )}
              <Link to="/products" className="btn btn-accent">Shop Again</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
