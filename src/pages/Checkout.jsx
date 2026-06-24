import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCartItems, selectCartSubtotal, resetCart } from '../features/cart/cartSlice';
import { createOrder } from '../features/orders/ordersSlice';
import { selectUser, selectIsAuthenticated, getMe } from '../features/auth/authSlice';
import { validatePromoCode, selectValidatedPromo, selectPromoLoading, clearValidated } from '../features/promocodes/promoSlice';
import { showToast } from '../features/ui/uiSlice';
import './Checkout.css';

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const user = useSelector(selectUser);
  const isAuth = useSelector(selectIsAuthenticated);
  const validatedPromo = useSelector(selectValidatedPromo);
  const promoLoading = useSelector(selectPromoLoading);

  // Compute subtotal from items directly in case Redux subtotal is stale/zero
  const computedSubtotal = items.reduce((sum, item) => {
    const price = Number(item.price) || Number(item.product?.price) || 0;
    return sum + price * (Number(item.quantity) || 0);
  }, 0);
  const safeSubtotal = computedSubtotal > 0 ? computedSubtotal : (Number(subtotal) || 0);

  // Calculate how many sauce discounts will apply in this order
  const saucesOrderedSoFar = user?.saucesOrderedCount || 0;
  const sauceItemsInCart = items.filter(i => {
    const type = i.type || i.product?.type;
    return type === 'sauce' || type === undefined; // treat unknown as sauce
  });
  const totalSaucesInCart = sauceItemsInCart.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);

  // Calculate per-sauce price and figure out which ones get 10% off
  let loyaltyDiscountAmount = 0;
  let sauceCounter = saucesOrderedSoFar;
  sauceItemsInCart.forEach(item => {
    const price = Number(item.price) || Number(item.product?.price) || 0;
    for (let i = 0; i < item.quantity; i++) {
      sauceCounter++;
      if (sauceCounter % 8 === 0) {
        loyaltyDiscountAmount += price * 0.1;
      }
    }
  });

  const promoDiscount = validatedPromo ? (validatedPromo.discountPercent || 0) / 100 : 0;
  const promoDiscountAmount = safeSubtotal * promoDiscount;
  const discountAmount = loyaltyDiscountAmount + promoDiscountAmount;
  const shipping = 100;
  const total = safeSubtotal - discountAmount + shipping;

  const [promoCode, setPromoCode] = useState('');
  const [guestOrderId, setGuestOrderId] = useState(null);
  const [step, setStep] = useState(1); // 1: address, 2: review
  const [address, setAddress] = useState({
    floor: '', apartment: '', street: '', city: '', state: '', zipCode: '', country: 'Egypt'
  });
  const [addingNew, setAddingNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestInfo, setGuestInfo] = useState({ email: '', phone: '' });

  // Fetch fresh user data to ensure addresses are loaded
  useEffect(() => { dispatch(getMe()); }, [dispatch]);

  // Prefill from user addresses
  useEffect(() => {
    if (!addingNew) {
      const defaultAddr = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
      if (defaultAddr) {
        setAddress({
          floor: defaultAddr.floor || '',
          apartment: defaultAddr.apartment || '',
          street: defaultAddr.street || '',
          city: defaultAddr.city || '',
          state: defaultAddr.state || '',
          zipCode: defaultAddr.zipCode || '',
          country: defaultAddr.country || 'Egypt',
        });
      }
    }
  }, [user, addingNew]);

  useEffect(() => {
    if (items.length === 0 && !guestOrderId && !loading) navigate('/cart');
    return () => dispatch(clearValidated());
  }, [items, navigate, dispatch, guestOrderId, loading]);

  const handlePromo = async () => {
    if (!promoCode) return;
    dispatch(validatePromoCode(promoCode));
  };

  const addressComplete = address.street && address.city && address.state && address.country;
  const guestComplete = isAuth || (guestInfo.email && guestInfo.phone);

  const handleSubmit = async () => {
    if (!addressComplete) {
      dispatch(showToast('Please fill in all required address fields', 'error'));
      return;
    }
    if (!guestComplete) {
      dispatch(showToast('Please enter your email and phone number', 'error'));
      return;
    }
    setLoading(true);
    const fullStreet = [
      address.street,
      address.floor ? `Floor ${address.floor}` : '',
      address.apartment ? `Apt ${address.apartment}` : '',
    ].filter(Boolean).join(', ');
    // const orderData = {
    //   orderItems: items.map(item => ({
    //       product: item.product?._id || item.product || item.productId,
    //       quantity: item.quantity,
    //     })),
    //     shippingAddress: { ...address, street: fullStreet },
    //     ...(validatedPromo ? { promoCode: validatedPromo._id || promoCode } : {}),
    //   };
    const orderData = {
      orderItems: items.map(item => ({
        product: item.product?._id || item.product || item.productId,
        quantity: item.quantity,
      })),
      shippingAddress: { ...address, street: fullStreet },
      ...(validatedPromo ? { promoCode: validatedPromo._id || promoCode } : {}),
      ...(!isAuth ? { isGuest: true, guestEmail: guestInfo.email, guestPhone: guestInfo.phone } : {}),
    };
    const result = await dispatch(createOrder(orderData));
    setLoading(false);
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(showToast('Order placed successfully! 🎉', 'success'));
      if (isAuth) {
        dispatch(resetCart());
        navigate(`/orders/${result.payload._id}`);
      } else {
        setGuestOrderId(result.payload._id);
        setTimeout(() => dispatch(resetCart()), 100);
      }
    } else {
      dispatch(showToast(result.payload || 'Order failed', 'error'));
    }
  };

  const getId = (item) => item.product?._id || item.product || item.productId;
  const getName = (item) => item.name || item.product?.name || 'Product';
  const getImg = (item) => item.imageUrl || item.product?.imageUrl || '';
  const getPrice = (item) => Number(item.price) || Number(item.product?.price) || 0;

  if (guestOrderId) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: 520, margin: '80px auto', textAlign: 'center' }}>
          <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
            <h2 style={{ marginBottom: 8 }}>Order Placed!</h2>
            <p className="text-muted" style={{ marginBottom: 24 }}>
              Save your Order ID to follow up on your order.
            </p>

            <div style={{
              background: 'var(--background-muted)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}>
              <span style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700, wordBreak: 'break-all' }}>
                {guestOrderId.slice(-6).toUpperCase()}
              </span>
              <button
                className="btn btn-accent btn-sm"
                onClick={() => {
                  navigator.clipboard.writeText(guestOrderId.slice(-6).toUpperCase());
                  dispatch(showToast('Order ID copied!', 'success'));
                }}
              >
                Copy
              </button>
            </div>

            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 24 }}>
              Want to track orders automatically next time?{' '}
              <a href="/register" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>Create a free account</a>
            </p>

            <a href="/" className="btn btn-outline">Back to Home</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-title-section">
        <div className="container">
          <h1>Checkout</h1>
        </div>
      </div>

      <div className="container checkout-layout">
        <div className="checkout-main">
          {/* Steps */}
          <div className="checkout-steps">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <span className="step-num">1</span>
              <span>Shipping</span>
            </div>
            <div className="step-line" />
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <span className="step-num">2</span>
              <span>Review</span>
            </div>
          </div>

          {step === 1 && (
            <div className="checkout-section card">
              {!isAuth && (
                <div className="guest-info-section">
                  <h4>Your Contact Info</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email <span className="required-star">*</span></label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="your@email.com"
                        value={guestInfo.email}
                        onChange={e => setGuestInfo({ ...guestInfo, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone <span className="required-star">*</span></label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="+20 1xx xxx xxxx"
                        value={guestInfo.phone}
                        onChange={e => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <p className="guest-login-hint">
                    Already have an account? <a href="/login">Log in</a> to track your orders and earn loyalty rewards.
                  </p>
                </div>
              )}
              <h3>Shipping Address</h3>

              {/* Saved addresses — only for logged-in users who have addresses and are not adding new */}
              {isAuth && (user?.addresses?.length ?? 0) > 0 && !addingNew && (
                <div className="saved-addresses">
                  <label className="saved-addr-label">Your Saved Addresses</label>
                  <div className="addr-list">
                    {user.addresses.map((addr) => {
                      const isSelected = address.street === addr.street && address.city === addr.city;
                      return (
                        <div
                          key={addr._id}
                          className={`addr-option ${isSelected ? 'selected' : ''}`}
                          onClick={() => setAddress({
                            floor: addr.floor || '',
                            apartment: addr.apartment || '',
                            street: addr.street || '',
                            city: addr.city || '',
                            state: addr.state || '',
                            zipCode: addr.zipCode || '',
                            country: addr.country || 'Egypt',
                          })}
                        >
                          <strong>{addr.street}</strong>
                          {(addr.floor || addr.apartment) && (
                            <span>Floor {addr.floor}{addr.apartment ? `, Apt ${addr.apartment}` : ''}</span>
                          )}
                          <span>{addr.city}, {addr.state} {addr.zipCode}</span>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: 8 }}
                    onClick={() => {
                      setAddingNew(true);
                      setAddress({ floor: '', apartment: '', street: '', city: '', state: '', zipCode: '', country: 'Egypt' });
                    }}
                  >
                    + Use a different address
                  </button>
                </div>
              )}

              {/* Address form — shown for: guests, logged-in with no addresses, or logged-in adding new */}
              {(!isAuth || (user?.addresses?.length ?? 0) === 0 || addingNew) && (
                <div className="address-form">
                  {addingNew && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ marginBottom: 12 }}
                      onClick={() => setAddingNew(false)}
                    >
                      ← Back to saved addresses
                    </button>
                  )}
                  <div className="form-group">
                    <label>Street Address <span className="required-star">*</span></label>
                    <input type="text" className="form-control" placeholder="123 Coffee Lane" value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Floor</label>
                      <input type="text" className="form-control" placeholder="e.g. 3" value={address.floor} onChange={e => setAddress({ ...address, floor: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Apartment</label>
                      <input type="text" className="form-control" placeholder="e.g. 4B" value={address.apartment} onChange={e => setAddress({ ...address, apartment: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City <span className="required-star">*</span></label>
                      <input type="text" className="form-control" placeholder="City" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Region <span className="required-star">*</span></label>
                      <input type="text" className="form-control" placeholder="Region" value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Zip Code</label>
                      <input type="text" className="form-control" placeholder="12345" value={address.zipCode} onChange={e => setAddress({ ...address, zipCode: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Country <span className="required-star">*</span></label>
                      <input type="text" className="form-control" value={address.country} onChange={e => setAddress({ ...address, country: e.target.value })} required />
                    </div>
                  </div>
                </div>
              )}

              <button
                className="btn btn-accent btn-lg"
                onClick={() => setStep(2)}
                disabled={!addressComplete || !guestComplete}
                title={!addressComplete ? 'Please fill in all required fields' : ''}
              >
                Continue to Review →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="checkout-section card">
              <div className="flex-between" style={{ marginBottom: 'var(--spacing-md)' }}>
                <h3>Review & Place Order</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>← Edit Address</button>
              </div>

              <div className="review-address">
                <h5>📍 Shipping to</h5>
                <p>{address.street}{address.floor ? `, Floor ${address.floor}` : ''}{address.apartment ? `, Apt ${address.apartment}` : ''}, {address.city}, {address.state} {address.zipCode}, {address.country}</p>
              </div>

              <div className="review-items">
                {items.map(item => (
                  <div key={getId(item)} className="review-item">
                    <div className="ri-img">
                      {getImg(item) ? <img src={getImg(item)} alt={getName(item)} /> : <span>☕</span>}
                    </div>
                    <span className="ri-name">{getName(item)}</span>
                    <span className="ri-qty">×{item.quantity}</span>
                    <span className="ri-price">{(getPrice(item) * item.quantity)}&nbsp;EGP</span>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-accent btn-lg"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <><span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Placing order...</>
                ) : `Place Order — ${total} EGP`}
              </button>
            </div>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="checkout-sidebar">
          <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
            <h3>Order Summary</h3>

            {/* Promo Code */}
            <div className="promo-section">
              <label className="form-group">Promo Code</label>
              <div className="promo-input-row">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value.toUpperCase())}
                />
                <button className="btn btn-outline btn-sm" onClick={handlePromo} disabled={promoLoading}>
                  Apply
                </button>
              </div>
              {validatedPromo && (
                <div className="promo-success">
                  ✅ {validatedPromo.code} — {validatedPromo.discountPercent}% off applied!
                </div>
              )}
            </div>

            {loyaltyDiscountAmount > 0 ? (
              <div className="loyalty-applied">
                🎁 8th sauce reward applied — saving {loyaltyDiscountAmount}&nbsp;EGP!
              </div>
            ) : !isAuth ? (
              <div className="loyalty-info">
                <a href="/register" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>Register</a> to track your orders and earn loyalty rewards.
              </div>
            ) : (
              <div className="loyalty-info">
                ☕ {8 - ((saucesOrderedSoFar + totalSaucesInCart) % 8 || 8)} more sauce{8 - ((saucesOrderedSoFar + totalSaucesInCart) % 8 || 8) !== 1 ? 's' : ''} until your next 10% reward
              </div>
            )}

            <div className="summary-lines">
              <div className="summary-line">
                <span>Subtotal</span>
                <span>{safeSubtotal}&nbsp;EGP</span>
              </div>
              {discountAmount > 0 && (
                <div className="summary-line discount-line">
                  <span>Discount{validatedPromo ? ` (${validatedPromo.code})` : ''}{loyaltyDiscountAmount > 0 ? ' + 8th Sauce' : ''}</span>
                  <span>−{discountAmount} &nbsp;EGP</span>
                </div>
              )}
              <div className="summary-line">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `${shipping} EGP`}</span>
              </div>
            </div>

            <div className="divider" />

            <div className="summary-total-big">
              <span>Total</span>
              <strong>{total} &nbsp;EGP</strong>
            </div>

            <div className="checkout-security">
              <span>💳 COD accepted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
