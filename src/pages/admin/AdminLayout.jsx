import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import './AdminLayout.css';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { path: '/admin/products', label: 'Products', icon: '☕' },
  { path: '/admin/orders', label: 'Orders', icon: '📦' },
  { path: '/admin/users', label: 'Users', icon: '👥' },
  { path: '/admin/promocodes', label: 'Promo Codes', icon: '🎁' },
  { path: '/admin/feedback', label: 'Feedback', icon: '💬' },
  { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
];

export default function AdminLayout() {
  const location = useLocation();

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="admin-wrapper">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <span className="brand-script">Bizy's</span>
          <span>Admin</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive(item) ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <Link to="/" className="sidebar-link">
            <span className="sidebar-icon">🏠</span>
            <span>Back to Store</span>
          </Link>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
