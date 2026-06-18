import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  selectCartItems, selectCartSubtotal,
  updateCartItem, removeFromCart,
} from '../../features/cart/cartSlice';
import { closeCart } from '../../features/ui/uiSlice';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import './CartDrawer.css';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const isAuth = useSelector(selectIsAuthenticated);

  const handleClose = () => dispatch(closeCart());

  const handleUpdate = (productId, quantity) => {
    if (quantity <= 0) {
      dispatch(removeFromCart(productId));
    } else {
      dispatch(updateCartItem({ productId, quantity }));
    }
  };

  const getProductId = (item) => item.product?._id || item.product || item.productId;
  const getProductName = (item) => item.name || item.product?.name || 'Product';
  const getProductImage = (item) => item.imageUrl || item.product?.imageUrl || '';
  const getProductPrice = (item) => item.price || item.product?.price || 0;

  return (
    <div className="cart-overlay">
      <div className="cart-backdrop" onClick={handleClose} />
      <div className="cart-drawer">
        <div className="cart-header">
          <h3>Your Cart <span className="cart-count">{items.length} items</span></h3>
          <button className="close-btn" onClick={handleClose}>✕</button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="empty-icon">🛒</div>
            <h4>Your cart is empty</h4>
            <p>Add some delicious drizzles to get started!</p>
            <Link to="/products" className="btn btn-accent" onClick={handleClose}>
              Shop Now
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => {
                const pid = getProductId(item);
                return (
                  <div key={pid} className="cart-item">
                    <div className="item-image">
                      {getProductImage(item) ? (
                        <img src={getProductImage(item)} alt={getProductName(item)} />
                      ) : (
                        <div className="image-placeholder">☕</div>
                      )}
                    </div>
                    <div className="item-info">
                      <h5>{getProductName(item)}</h5>
                      <span className="item-price">${getProductPrice(item).toFixed(2)}</span>
                    </div>
                    <div className="item-actions">
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => handleUpdate(pid, item.quantity - 1)}>−</button>
                        <span className="qty-value">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => handleUpdate(pid, item.quantity + 1)}>+</button>
                      </div>
                      <span className="item-total">${(getProductPrice(item) * item.quantity).toFixed(2)}</span>
                      <button className="remove-btn" onClick={() => dispatch(removeFromCart(pid))}>🗑</button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-footer">
              {!isAuth && (
                <div className="loyalty-notice">
                  🎁 <Link to="/login" onClick={handleClose}>Login</Link> to earn loyalty rewards!
                </div>
              )}
              <div className="subtotal">
                <span>Subtotal</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
              <p className="shipping-note">Shipping calculated at checkout</p>
              <Link
                to="/checkout"
                className="btn btn-accent btn-lg"
                style={{ width: '100%' }}
                onClick={handleClose}
              >
                Checkout
              </Link>
              <Link to="/cart" className="btn btn-outline btn-sm view-cart-btn" onClick={handleClose}>
                View Full Cart
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
