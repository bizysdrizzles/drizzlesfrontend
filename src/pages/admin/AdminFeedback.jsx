import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllFeedback, deleteFeedback, selectAllFeedback, selectFeedbackLoading } from '../../features/feedback/feedbackSlice';
import { showToast } from '../../features/ui/uiSlice';
import './AdminCommon.css';

export default function AdminFeedback() {
  const dispatch = useDispatch();
  const feedback = useSelector(selectAllFeedback);
  const loading = useSelector(selectFeedbackLoading);

  useEffect(() => { dispatch(fetchAllFeedback()); }, [dispatch]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feedback?')) return;
    await dispatch(deleteFeedback(id));
    dispatch(showToast('Feedback deleted', 'success'));
    dispatch(fetchAllFeedback());
  };

  const avgRating = feedback.length
    ? (feedback.reduce((s, f) => s + (f.rating || 5), 0) / feedback.length).toFixed(1)
    : 0;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Feedback</h1>
          <div className="flex gap-md" style={{ marginTop: 4 }}>
            <span className="badge badge-primary">{feedback.length} reviews</span>
            <span className="badge badge-warning">⭐ {avgRating} avg rating</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Rating</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...feedback].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(fb => (
                  <tr key={fb._id}>
                    <td><strong>{fb.name}</strong></td>
                    <td>{fb.email}</td>
                    <td>
                      <span style={{ color: 'var(--accent-color)' }}>
                        {'★'.repeat(fb.rating || 5)}
                      </span>
                    </td>
                    <td style={{ maxWidth: 300 }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {fb.message?.substring(0, 100)}{fb.message?.length > 100 ? '...' : ''}
                      </span>
                    </td>
                    <td>{new Date(fb.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error-color)' }} onClick={() => handleDelete(fb._id)}>
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {feedback.length === 0 && <div className="empty-state" style={{ minHeight: 150 }}><p>No feedback yet</p></div>}
        </div>
      )}
    </div>
  );
}
