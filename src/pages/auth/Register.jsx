import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, selectAuthLoading, selectAuthError, selectIsAuthenticated, clearError } from '../../features/auth/authSlice';
import { showToast } from '../../features/ui/uiSlice';
import './Auth.css';


export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuth = useSelector(selectIsAuthenticated);
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [agree, setAgree] = useState(false);

  useEffect(() => { if (isAuth) navigate('/'); }, [isAuth, navigate]);
  useEffect(() => { return () => dispatch(clearError()); }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      dispatch(showToast('Passwords do not match', 'error'));
      return;
    }
    const { confirmPassword, ...data } = form;
    const result = await dispatch(register(data));
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(showToast('Account created! Welcome to Bizy\'s Drizzles!', 'success'));
      navigate('/');
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="brand-script">Bizy's</span>
          <span className="brand-main">Drizzles</span>
        </div>
        <h2>Join the Drizzle Family! ☕✨</h2>
        <p>Create your account and start earning loyalty rewards from your very first order.</p>
        <div className="auth-perks">
          <div className="perk">🎁 Loyalty program — every 7 sauces = 10% off your 8th</div>
          <div className="perk">📦 Easy order management</div>
          <div className="perk">🚀 Faster checkout</div>
          <div className="perk">⭐ Exclusive member deals</div>
        </div>
        <div className="auth-bg-img"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800)' }}
        />
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <h1>Create Account</h1>
          <p className="auth-subtitle">It's free and always will be</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" className="form-control" placeholder="John Doe" value={form.fullName} onChange={update('fullName')} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={update('email')} required />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" className="form-control" placeholder="10-15 digits" value={form.phoneNumber} onChange={update('phoneNumber')} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="pass-wrap">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-control"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={update('password')}
                  required
                  minLength={6}
                />
                <button type="button" className="show-pass" onClick={() => setShowPass(!showPass)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={update('confirmPassword')}
                required
              />
            </div>
            <label className="checkbox-label">
              <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} required />
              I agree to the <a href="#" style={{ color: 'var(--accent-color)' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--accent-color)' }}>Privacy Policy</a>
            </label>
            <button type="submit" className="btn btn-accent btn-lg auth-submit" disabled={loading || !agree}>
              {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
