import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCartItems, selectCartSubtotal, updateCartItem, removeFromCart, clearCart } from '../features/cart/cartSlice';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import './Cart.css';

export default function Cart() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const isAuth = useSelector(selectIsAuthenticated);

  const getId = (item) => item.product?._id || item.product || item.productId;
  const getName = (item) => item.name || item.product?.name || 'Product';
  const getImg = (item) => item.imageUrl || item.product?.imageUrl || '';
  const getPrice = (item) => item.price || item.product?.price || 0;

  const handleUpdate = (productId, quantity) => {
    if (quantity <= 0) dispatch(removeFromCart(productId));
    else dispatch(updateCartItem({ productId, quantity }));
  };

  if (items.length === 0) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state" style={{ minHeight: '60vh' }}>
            <div className="icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some delicious drizzles to get started!</p>
            <Link to="/products" className="btn btn-accent btn-lg">Shop Now</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-title-section">
        <div className="container">
          <h1>Your Cart</h1>
          <p className="text-muted">{items.length} items</p>
        </div>
      </div>

      <div className="container cart-page">
        <div className="cart-layout">
          <div className="cart-items-section">
            <div className="cart-header-row">
              <h3>Items</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => dispatch(clearCart())}>
                🗑 Clear All
              </button>
            </div>

            {items.map((item) => {
              const pid = getId(item);
              return (
                <div key={pid} className="cart-row">
                  <div className="cart-item-img">
                    {getImg(item) ? (
                      <img src={getImg(item)} alt={getName(item)} />
                    ) : (
                      <div className="cart-img-placeholder">☕</div>
                    )}
                  </div>
                  <div className="cart-item-name">
                    <h4>{getName(item)}</h4>
                    <span className="text-muted text-sm">${getPrice(item).toFixed(2)} each</span>
                  </div>
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => handleUpdate(pid, item.quantity - 1)}>−</button>
                    <span className="qty-value">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => handleUpdate(pid, item.quantity + 1)}>+</button>
                  </div>
                  <div className="cart-item-total">
                    ${(getPrice(item) * item.quantity).toFixed(2)}
                  </div>
                  <button className="remove-item-btn" onClick={() => dispatch(removeFromCart(pid))}>✕</button>
                </div>
              );
            })}
          </div>

          <div className="cart-summary card">
            <h3>Order Summary</h3>

            {!isAuth && (
              <div className="loyalty-promo-notice">
                <div className="loyalty-icon">🎁</div>
                <div>
                  <strong>Earn Loyalty Rewards!</strong>
                  <p><Link to="/login">Login</Link> or <Link to="/register">register</Link> to earn loyalty points and get discounts after 5 orders.</p>
                </div>
              </div>
            )}

            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="text-accent">{subtotal >= 50 ? 'FREE' : '$5.99'}</span>
              </div>
              {subtotal < 50 && (
                <div className="free-shipping-note">
                  Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                </div>
              )}
            </div>

            <div className="divider" />

            <div className="summary-total">
              <span>Total</span>
              <strong>${(subtotal + (subtotal >= 50 ? 0 : 5.99)).toFixed(2)}</strong>
            </div>

            <Link to="/checkout" className="btn btn-accent btn-lg checkout-btn">
              Proceed to Checkout
            </Link>

            <Link to="/products" className="btn btn-ghost btn-sm" style={{ textAlign: 'center', marginTop: 8 }}>
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
