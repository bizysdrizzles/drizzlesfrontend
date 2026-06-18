import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPromoCodes, selectPromoCodes, createPromoCode, updatePromoCode, deletePromoCode, selectPromoLoading } from '../../features/promocodes/promoSlice';
import { showToast } from '../../features/ui/uiSlice';
import './AdminCommon.css';

const EMPTY = { code: '', discountPercent: '', expiryDate: '', usageLimit: '' };

export default function AdminPromoCodes() {
  const dispatch = useDispatch();
  const codes = useSelector(selectPromoCodes);
  const loading = useSelector(selectPromoLoading);
  const [modal, setModal] = useState(false);
  const [editCode, setEditCode] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => { dispatch(fetchPromoCodes()); }, [dispatch]);

  const openCreate = () => { setEditCode(null); setForm(EMPTY); setModal(true); };
  const openEdit = (c) => {
    setEditCode(c);
    setForm({
      code: c.code || '',
      discountPercent: c.discountPercent || '',
      expiryDate: c.expiryDate ? new Date(c.expiryDate).toISOString().split('T')[0] : '',
      usageLimit: c.usageLimit || '',
    });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...form,
      discountPercent: parseInt(form.discountPercent),
      usageLimit: parseInt(form.usageLimit) || undefined,
      expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : undefined,
    };
    let result;
    if (editCode) result = await dispatch(updatePromoCode({ id: editCode._id, data }));
    else result = await dispatch(createPromoCode(data));
    setSaving(false);
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(showToast(editCode ? 'Promo updated!' : 'Promo created!', 'success'));
      setModal(false);
      dispatch(fetchPromoCodes());
    } else {
      dispatch(showToast(result.payload || 'Failed', 'error'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this promo code?')) return;
    const result = await dispatch(deletePromoCode(id));
    if (result.meta.requestStatus === 'fulfilled') { dispatch(showToast('Promo code deleted', 'success')); dispatch(fetchPromoCodes()); }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Promo Codes</h1>
        <button className="btn btn-accent" onClick={openCreate}>+ Create Code</button>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Expiry</th>
                  <th>Usage</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {codes.map(code => {
                  const isExpired = code.expiryDate && new Date(code.expiryDate) < new Date();
                  return (
                    <tr key={code._id}>
                      <td><strong style={{ fontFamily: 'monospace', background: 'var(--background-muted)', padding: '3px 8px', borderRadius: 4 }}>{code.code}</strong></td>
                      <td><span className="badge badge-success">{code.discountPercent}% OFF</span></td>
                      <td>{code.expiryDate ? new Date(code.expiryDate).toLocaleDateString() : 'No expiry'}</td>
                      <td>{code.usageCount || 0} / {code.usageLimit || '∞'}</td>
                      <td><span className={`badge ${isExpired ? 'badge-error' : 'badge-success'}`}>{isExpired ? 'Expired' : 'Active'}</span></td>
                      <td>
                        <div className="action-btns">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(code)}>✏️ Edit</button>
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error-color)' }} onClick={() => handleDelete(code._id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {codes.length === 0 && <div className="empty-state" style={{ minHeight: 150 }}><p>No promo codes yet</p></div>}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editCode ? 'Edit Promo Code' : 'Create Promo Code'}</h3>
              <button className="close-btn" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-group">
                <label>Code</label>
                <input type="text" className="form-control" placeholder="e.g. SAVE20" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} required style={{ fontFamily: 'monospace' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                <div className="form-group">
                  <label>Discount (%)</label>
                  <input type="number" min="1" max="100" className="form-control" value={form.discountPercent} onChange={e => setForm({...form, discountPercent: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Usage Limit</label>
                  <input type="number" min="1" className="form-control" placeholder="Optional" value={form.usageLimit} onChange={e => setForm({...form, usageLimit: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Expiry Date</label>
                <input type="date" className="form-control" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-accent" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
