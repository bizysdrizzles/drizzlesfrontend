import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrder, updateOrder, selectSelectedOrder, selectOrdersLoading, selectOrdersError } from '../features/orders/ordersSlice';
import { showToast } from '../features/ui/uiSlice';
import './OrderEdit.css';

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

  if (timeLeft <= 0) return <span className="timer-expired">Edit window closed</span>;
  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div className="edit-countdown">
      <span className="countdown-icon">⏱</span>
      <span>Time remaining to edit: <strong>{mins}:{secs.toString().padStart(2, '0')}</strong></span>
    </div>
  );
}

export default function OrderEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const order = useSelector(selectSelectedOrder);
  const loading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);
  const [items, setItems] = useState([]);
  const [expired, setExpired] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchOrder(id));
  }, [id, dispatch]);

  // Populate items once order loads
  useEffect(() => {
    if (order?.orderItems) {
      setItems(order.orderItems.map(i => ({
        product: i.product?._id || i.product,
        name: i.name,
        imageUrl: i.imageUrl,
        price: i.price,
        quantity: i.quantity,
      })));
    }
  }, [order]);

  // Check if editable
  useEffect(() => {
    if (!order) return;
    const editable =
      order.isEditable &&
      order.status === 'Pending' &&
      order.editableUntil &&
      new Date() < new Date(order.editableUntil);
    if (!editable) setExpired(true);
  }, [order]);

  const handleExpire = useCallback(() => setExpired(true), []);

  const updateQty = (index, qty) => {
    setItems(prev => prev.map((item, i) =>
      i === index ? { ...item, quantity: Math.max(1, qty) } : item
    ));
  };

  const removeItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (items.length === 0) {
      dispatch(showToast('Order must have at least one item', 'error'));
      return;
    }
    setSaving(true);
    const result = await dispatch(updateOrder({
      id,
      data: {
        orderItems: items.map(i => ({
          product: i.product,
          quantity: i.quantity,
        })),
      },
    }));
    setSaving(false);
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(showToast('Order updated successfully!', 'success'));
      navigate(`/orders/${id}`);
    } else {
      dispatch(showToast(result.payload || 'Update failed', 'error'));
    }
  };

  if (loading && !order) {
    return (
      <div className="page-wrapper loading-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-wrapper">
        <div className="container empty-state">
          <div className="icon">🔍</div>
          <h3>Order not found</h3>
          <Link to="/orders" className="btn btn-accent">Back to Orders</Link>
        </div>
      </div>
    );
  }

  if (expired || order.status !== 'Pending') {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="edit-expired-box card">
            <div className="expired-icon">⏰</div>
            <h2>Edit Window Closed</h2>
            <p>
              {order.status !== 'Pending'
                ? `This order cannot be edited because its status is "${order.status}".`
                : 'The 15-minute edit window for this order has expired.'}
            </p>
            <Link to={`/orders/${id}`} className="btn btn-accent">View Order</Link>
          </div>
        </div>
      </div>
    );
  }

  const newSubtotal = items.reduce((sum, i) => sum + (Number(i.price) || 0) * i.quantity, 0);

  return (
    <div className="page-wrapper">
      <div className="page-title-section">
        <div className="container">
          <h1>Edit Order</h1>
          <p className="text-muted">#{order._id?.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      <div className="container order-edit-page">
        {/* Timer banner */}
        <div className="timer-banner card">
          {order.editableUntil && (
            <CountdownTimer editableUntil={order.editableUntil} onExpire={handleExpire} />
          )}
          <p className="timer-note">You can change item quantities or remove items. You cannot add new products here.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="edit-layout">
          <div className="edit-items card">
            <h3>Order Items</h3>

            {items.length === 0 && (
              <div className="empty-state" style={{ minHeight: 120 }}>
                <p>No items remaining — add at least one item before saving.</p>
              </div>
            )}

            {items.map((item, index) => (
              <div key={index} className="edit-item-row">
                <div className="edit-item-img">
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.name} />
                    : <span>☕</span>}
                </div>

                <div className="edit-item-info">
                  <strong>{item.name}</strong>
                  <span className="text-muted text-sm">${Number(item.price).toFixed(2)} each</span>
                </div>

                <div className="qty-control">
                  <button className="qty-btn" onClick={() => updateQty(index, item.quantity - 1)}>−</button>
                  <span className="qty-value">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQty(index, item.quantity + 1)}>+</button>
                </div>

                <div className="edit-item-total">
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </div>

                <button className="remove-item-btn" onClick={() => removeItem(index)} title="Remove item">✕</button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="edit-summary card">
            <h3>Summary</h3>
            <div className="summary-rows">
              <div className="summary-row">
                <span>Items</span>
                <span>{items.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
              <div className="summary-row">
                <span>New Subtotal</span>
                <strong>${newSubtotal.toFixed(2)}</strong>
              </div>
            </div>

            <div className="divider" />

            <div className="edit-actions">
              <button
                className="btn btn-accent btn-lg"
                onClick={handleSave}
                disabled={saving || items.length === 0 || expired}
              >
                {saving
                  ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Saving...</>
                  : '💾 Save Changes'}
              </button>
              <Link to={`/orders/${id}`} className="btn btn-ghost">
                Cancel
              </Link>
            </div>

            <p className="edit-disclaimer">
              Final total will be recalculated by the server including any discounts applied to the original order.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
