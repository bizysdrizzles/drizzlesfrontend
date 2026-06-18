import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, selectAllUsers, selectUsersLoading, updateUser, deleteUser } from '../../features/users/usersSlice';
import { showToast } from '../../features/ui/uiSlice';
import './AdminCommon.css';

export default function AdminUsers() {
  const dispatch = useDispatch();
  const users = useSelector(selectAllUsers);
  const loading = useSelector(selectUsersLoading);
  const [modal, setModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', role: 'user' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { dispatch(fetchAllUsers()); }, [dispatch]);

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ fullName: u.fullName || '', email: u.email || '', phoneNumber: u.phoneNumber || '', role: u.role || 'user' });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await dispatch(updateUser({ id: editUser._id, data: form }));
    setSaving(false);
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(showToast('User updated!', 'success'));
      setModal(false);
      dispatch(fetchAllUsers());
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    const result = await dispatch(deleteUser(id));
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(showToast('User deleted', 'success'));
      dispatch(fetchAllUsers());
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Users</h1>
        <span className="badge badge-primary">{users.length} users</span>
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
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Sauces Ordered</th>
                  <th>Cycles</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>
                          {user.fullName?.charAt(0)}
                        </div>
                        <strong>{user.fullName}</strong>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phoneNumber}</td>
                    <td><span className={`badge ${user.role === 'admin' ? 'badge-error' : 'badge-primary'}`}>{user.role}</span></td>
                    <td>{user.saucesOrderedCount || 0}</td>
                    <td>
                      <span className={`badge ${Math.floor((user.saucesOrderedCount || 0) / 7) > 0 ? 'badge-success' : 'badge-primary'}`}>
                        {Math.floor((user.saucesOrderedCount || 0) / 7) > 0 ? `👑 ${Math.floor((user.saucesOrderedCount || 0) / 7)} cycle${Math.floor((user.saucesOrderedCount || 0) / 7) !== 1 ? 's' : ''}` : 'No cycles yet'}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(user)}>✏️ Edit</button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error-color)' }} onClick={() => handleDelete(user._id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User</h3>
              <button className="close-btn" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-group"><label>Full Name</label><input type="text" className="form-control" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} /></div>
              <div className="form-group"><label>Email</label><input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div className="form-group"><label>Phone</label><input type="tel" className="form-control" value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} /></div>
              <div className="form-group">
                <label>Role</label>
                <select className="form-control" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-accent" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
