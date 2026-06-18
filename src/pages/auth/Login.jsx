import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, selectAuthLoading, selectAuthError, selectIsAuthenticated, clearError } from '../../features/auth/authSlice';
import { mergeCart, selectSessionId } from '../../features/cart/cartSlice';
import { showToast } from '../../features/ui/uiSlice';
import './Auth.css';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuth = useSelector(selectIsAuthenticated);
  const sessionId = useSelector(selectSessionId);
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => { if (isAuth) navigate('/'); }, [isAuth, navigate]);
  useEffect(() => { return () => dispatch(clearError()); }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (result.meta.requestStatus === 'fulfilled') {
      if (sessionId) dispatch(mergeCart(sessionId));
      dispatch(showToast('Welcome back!', 'success'));
      navigate('/');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="brand-script">Bizy's</span>
          <span className="brand-main">Drizzles</span>
        </div>
        <h2>Welcome back to the drizzle life ☕</h2>
        <p>Sign in to access your orders, loyalty rewards, and personalized recommendations.</p>
        <div className="auth-perks">
          <div className="perk">🎁 Loyalty rewards program</div>
          <div className="perk">📦 Order tracking</div>
          <div className="perk">🚀 Faster checkout</div>
          <div className="perk">⭐ Exclusive deals</div>
        </div>
        <div
          className="auth-bg-img"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800)' }}
        />
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <h1>Sign In</h1>
          <p className="auth-subtitle">Enter your phone or email and password</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Phone Number or Email</label>
              <input
                type="text"
                className="form-control"
                placeholder="Phone or email address"
                value={form.identifier}
                onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="pass-wrap">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" className="show-pass" onClick={() => setShowPass(!showPass)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="auth-options">
              <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>

            <button type="submit" className="btn btn-accent btn-lg auth-submit" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Sign up for free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
