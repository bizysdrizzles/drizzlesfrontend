import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createFeedback, fetchAllFeedback, selectAllFeedback, selectFeedbackLoading, selectFeedbackSuccess, clearSuccess } from '../features/feedback/feedbackSlice';
import { selectUser, selectIsAuthenticated } from '../features/auth/authSlice';
import { showToast } from '../features/ui/uiSlice';
import './Feedback.css';

export default function Feedback() {
  const dispatch = useDispatch();
  const feedback = useSelector(selectAllFeedback);
  const loading = useSelector(selectFeedbackLoading);
  const success = useSelector(selectFeedbackSuccess);
  const user = useSelector(selectUser);
  const isAuth = useSelector(selectIsAuthenticated);
  const [form, setForm] = useState({ name: user?.fullName || '', email: user?.email || '', message: '', rating: 5 });
  const [hovered, setHovered] = useState(0);

  useEffect(() => { dispatch(fetchAllFeedback()); }, [dispatch]);

  useEffect(() => {
    if (success) {
      dispatch(showToast(success, 'success'));
      dispatch(clearSuccess());
      dispatch(fetchAllFeedback());
      setForm({ name: user?.fullName || '', email: user?.email || '', message: '', rating: 5 });
    }
  }, [success, dispatch, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(createFeedback(form));
  };

  const avgRating = feedback.length
    ? (feedback.reduce((s, f) => s + (f.rating || 5), 0) / feedback.length).toFixed(1)
    : 0;

  return (
    <div className="page-wrapper">
      <div className="page-title-section">
        <div className="container">
          <span className="section-eyebrow">Customer Reviews</span>
          <h1>What Our Customers Say</h1>
          <p className="text-muted">Real reviews from real coffee lovers</p>
        </div>
      </div>

      <div className="container feedback-page">
        {/* Stats */}
        {feedback.length > 0 && (
          <div className="feedback-stats card">
            <div className="stat-item">
              <strong>{avgRating}</strong>
              <div className="stars">{'★'.repeat(Math.round(avgRating))}</div>
              <span>Average Rating</span>
            </div>
            <div className="stat-divider-v" />
            <div className="stat-item">
              <strong>{feedback.length}</strong>
              <span>Total Reviews</span>
            </div>
            <div className="stat-divider-v" />
            <div className="stat-item">
              <strong>{feedback.filter(f => f.rating >= 4).length}</strong>
              <span>Positive Reviews</span>
            </div>
          </div>
        )}

        <div className="feedback-layout">
          {/* Reviews */}
          <div className="reviews-section">
            <h3>Customer Reviews ({feedback.length})</h3>
            {loading ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : feedback.length === 0 ? (
              <div className="empty-state" style={{ minHeight: 200 }}>
                <div className="icon">💬</div>
                <h3>Be the first to review!</h3>
              </div>
            ) : (
              <div className="feedback-list">
                {feedback.map((fb) => (
                  <div key={fb._id} className="feedback-card card">
                    <div className="feedback-top">
                      <div className="fb-meta">
                        <strong>{fb.name}</strong>
                        <span className="text-muted text-sm">{new Date(fb.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                      </div>
                      <div className="fb-rating-badge">
                        {'★'.repeat(fb.rating || 5)}
                      </div>
                    </div>
                    <p className="fb-message">{fb.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Form */}
          <div className="feedback-form-wrap card">
            <h3>Leave a Review</h3>
            <form onSubmit={handleSubmit} className="feedback-form">
              <div className="form-group">
                <label>Your Name</label>
                <input type="text" className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Rating</label>
                <div className="star-picker">
                  {[1,2,3,4,5].map(n => (
                    <button
                      key={n}
                      type="button"
                      className={`star-btn ${n <= (hovered || form.rating) ? 'active' : ''}`}
                      onMouseEnter={() => setHovered(n)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setForm({...form, rating: n})}
                    >★</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Your Review</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Share your experience with Bizy's Drizzles..."
                  value={form.message}
                  onChange={e => setForm({...form, message: e.target.value})}
                  required
                />
              </div>
              <button type="submit" className="btn btn-accent" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
