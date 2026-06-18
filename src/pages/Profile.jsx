import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, getMe, updateProfile, addAddress, deleteAddress } from '../features/auth/authSlice';
import { showToast } from '../features/ui/uiSlice';
import './Profile.css';

export default function Profile() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [tab, setTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ fullName: user?.fullName || '' });
  const [addrForm, setAddrForm] = useState({ floor: '', apartment: '', street: '', city: '', state: '', zipCode: '', country: 'Egypt' });
  const [addingAddr, setAddingAddr] = useState(false);
  const [saving, setSaving] = useState(false);

  const loyaltyThreshold = 7;
  const saucesCount = user?.saucesOrderedCount || 0;
  const progress = saucesCount % loyaltyThreshold;
  const cyclesCompleted = Math.floor(saucesCount / loyaltyThreshold);

  useEffect(() => { dispatch(getMe()); }, [dispatch]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await dispatch(updateProfile(profileForm));
    setSaving(false);
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(showToast('Profile updated!', 'success'));
      dispatch(getMe());
    }
  };

  const handleAddAddress = async (e) => {
  e.preventDefault();
  const fullStreet = [
    addrForm.street,
    addrForm.floor ? `Floor ${addrForm.floor}` : '',
    addrForm.apartment ? `Apt ${addrForm.apartment}` : '',
  ].filter(Boolean).join(', ');
  const result = await dispatch(addAddress({ ...addrForm, street: fullStreet }));
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(showToast('Address added!', 'success'));
      dispatch(getMe());
      setAddrForm({ floor: '', apartment: '', street: '', city: '', state: '', zipCode: '', country: 'Egypt' });
      setAddingAddr(false);
    }
  };

  const handleDeleteAddr = (addressId) => {
    dispatch(deleteAddress(addressId));
    dispatch(showToast('Address removed', 'info'));
    dispatch(getMe());
  };

  return (
    <div className="page-wrapper">
      <div className="page-title-section">
        <div className="container">
          <h1>My Profile</h1>
        </div>
      </div>

      <div className="container profile-page">
        <div className="profile-tabs">
          {['profile', 'addresses', 'loyalty'].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'profile' ? '👤 Profile' : t === 'addresses' ? '📍 Addresses' : '🎁 Loyalty'}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="profile-section card">
            <div className="profile-avatar">
              <div className="avatar-circle">{user?.fullName?.charAt(0) || 'U'}</div>
              <div>
                <h3>{user?.fullName}</h3>
                <p className="text-muted">{user?.email}</p>
                <span className={`badge ${user?.role === 'admin' ? 'badge-error' : 'badge-primary'}`}>
                  {user?.role === 'admin' ? '🛡 Admin' : '👤 Customer'}
                </span>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileForm.fullName}
                  onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email (read-only)</label>
                <input type="email" className="form-control" value={user?.email || ''} disabled />
              </div>
              <div className="form-group">
                <label>Phone (read-only)</label>
                <input type="tel" className="form-control" value={user?.phoneNumber || ''} disabled />
              </div>
              <button type="submit" className="btn btn-accent" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {tab === 'addresses' && (
          <div className="addresses-section">
            {user?.addresses?.length === 0 && !addingAddr && (
              <div className="empty-state" style={{ minHeight: 200 }}>
                <div className="icon">📍</div>
                <h3>No saved addresses</h3>
              </div>
            )}

            {user?.addresses?.map((addr) => (
              <div key={addr._id} className="address-card card">
                <div className="addr-info">
                  <strong>{addr.street}</strong>
                  {(addr.floor || addr.apartment) && <span>Floor {addr.floor}{addr.apartment ? `, Apt ${addr.apartment}` : ''}</span>}
                  <span>{addr.city}, {addr.state} {addr.zipCode}</span>
                  <span>{addr.country}</span>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteAddr(addr._id)}
                  style={{ color: 'var(--error-color)' }}>
                  Remove
                </button>
              </div>
            ))}

            {!addingAddr ? (
              <button className="btn btn-outline" onClick={() => setAddingAddr(true)}>
                + Add New Address
              </button>
            ) : (
              <form onSubmit={handleAddAddress} className="card add-addr-form">
                <h4>New Address</h4>
                <div className="form-group">
                  <label>Street Address <span className="required-star">*</span></label>
                  <input type="text" className="form-control" placeholder="123 Coffee Lane" value={addrForm.street} onChange={e => setAddrForm({...addrForm, street: e.target.value})} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div className="form-group">
                    <label>Floor</label>
                    <input type="text" className="form-control" placeholder="ex 3" value={addrForm.floor} onChange={e => setAddrForm({...addrForm, floor: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Apartment</label>
                    <input type="text" className="form-control" placeholder="ex 12" value={addrForm.apartment} onChange={e => setAddrForm({...addrForm, apartment: e.target.value})} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div className="form-group">
                    <label>City <span className="required-star">*</span></label>
                    <input type="text" className="form-control" value={addrForm.city} onChange={e => setAddrForm({...addrForm, city: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Region <span className="required-star">*</span></label>
                    <input type="text" className="form-control" value={addrForm.state} onChange={e => setAddrForm({...addrForm, state: e.target.value})} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div className="form-group">
                    <label>Zip Code</label>
                    <input type="text" className="form-control" value={addrForm.zipCode} onChange={e => setAddrForm({...addrForm, zipCode: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Country <span className="required-star">*</span></label>
                    <input type="text" className="form-control" value={addrForm.country} onChange={e => setAddrForm({...addrForm, country: e.target.value})} required />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  <button type="submit" className="btn btn-accent" disabled={!addrForm.street || !addrForm.city || !addrForm.state || !addrForm.country}>Save Address</button>
                  <button type="button" className="btn btn-ghost" onClick={() => setAddingAddr(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        )}

        {tab === 'loyalty' && (
          <div className="loyalty-section card">
            <div className="loyalty-header">
              <div className="loyalty-icon-big">{saucesCount >= 7 ? '👑' : '🎁'}</div>
              <div>
                <h3>{cyclesCompleted > 0 ? `${cyclesCompleted} Cycle${cyclesCompleted !== 1 ? 's' : ''} Completed! 🎉` : 'Earn Your Sauce Reward'}</h3>
                  <p className="text-muted">
                    {`Buy ${loyaltyThreshold - progress} more sauce${loyaltyThreshold - progress !== 1 ? 's' : ''} to get your ${(cyclesCompleted + 1) * 8}th sauce at 10% off!`}
                  </p>
              </div>
            </div>

            <div className="loyalty-progress">
              <div className="progress-header">
                <span>{progress} / {loyaltyThreshold} sauces (excludes bundles)</span>
                <span>{Math.round((progress / loyaltyThreshold) * 100)}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(progress / loyaltyThreshold) * 100}%` }} />
              </div>
            </div>

            <div className="loyalty-benefits">
              <h4>Loyalty Benefits</h4>
              <div className="benefit-list">
                <div className="benefit"><span>✅</span> 10% discount on every 8th sauce</div>
                <div className="benefit"><span>✅</span> Renews every 7 sauces — ongoing reward</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
