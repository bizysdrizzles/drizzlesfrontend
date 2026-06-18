import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectToasts, removeToast } from '../../features/ui/uiSlice';
import './Toast.css';

export default function ToastContainer() {
  const toasts = useSelector(selectToasts);

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function Toast({ toast }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(toast.id)), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, dispatch]);

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  return (
    <div className={`toast toast-${toast.type || 'info'}`}>
      <span className="toast-icon">{icons[toast.type] || icons.info}</span>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={() => dispatch(removeToast(toast.id))}>✕</button>
    </div>
  );
}
