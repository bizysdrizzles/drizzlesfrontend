import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, resetPassword, selectAuthLoading, selectAuthError } from '../../features/auth/authSlice';
import { showToast } from '../../features/ui/uiSlice';
import './Auth.css';

export function ForgotPassword() {
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(forgotPassword(email));
    if (result.meta.requestStatus === 'fulfilled') setSent(true);
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="brand-script">Bizy's</span>
          <span className="brand-main">Drizzles</span>
        </div>
        <h2>Forgot your password? 🔑</h2>
        <p>No worries! We'll send you reset instructions to your email address.</p>
        <div className="auth-bg-img" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800)' }} />
      </div>
      <div className="auth-right">
        <div className="auth-form-wrap">
          {sent ? (
            <div className="text-center">
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>📧</div>
              <h2>Check Your Inbox!</h2>
              <p className="text-muted" style={{ marginTop: 8, marginBottom: 24 }}>
                We sent a reset link to <strong>{email}</strong>. It expires in 10 minutes.
              </p>
              <Link to="/login" className="btn btn-accent">Back to Login</Link>
            </div>
          ) : (
            <>
              <h1>Reset Password</h1>
              <p className="auth-subtitle">Enter your email and we will send you a link</p>
              {error && <div className="alert alert-error">{error}</div>}
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" className="form-control" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-accent btn-lg auth-submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <p className="auth-switch"><Link to="/login">Back to login</Link></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const [form, setForm] = useState({ password: '', confirmPassword: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      dispatch(showToast('Passwords do not match', 'error'));
      return;
    }
    const result = await dispatch(resetPassword({ token, password: form.password }));
    if (result.meta.requestStatus === 'fulfilled') navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="brand-script">Bizy's</span>
          <span className="brand-main">Drizzles</span>
        </div>
        <h2>Create a new password</h2>
        <div className="auth-bg-img" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800)' }} />
      </div>
      <div className="auth-right">
        <div className="auth-form-wrap">
          <h1>New Password</h1>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>New Password</label>
              <input type="password" className="form-control" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" className="form-control" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-accent btn-lg auth-submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
