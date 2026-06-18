import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectIsAuthenticated, selectUser, selectIsAdmin } from '../../features/auth/authSlice';
import { selectCartTotal } from '../../features/cart/cartSlice';
import { toggleDarkMode, selectDarkMode, toggleMobileMenu, selectMobileMenu, closeMobileMenu, toggleCart, selectCartOpen } from '../../features/ui/uiSlice';
import CartDrawer from '../CartDrawer/CartDrawer';
import './Navbar.css';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuth = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const isAdmin = useSelector(selectIsAdmin);
  const cartCount = useSelector(selectCartTotal);
  const darkMode = useSelector(selectDarkMode);
  const mobileOpen = useSelector(selectMobileMenu);
  const cartOpen = useSelector(selectCartOpen);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    dispatch(closeMobileMenu());
  }, [location, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner container">
          <Link to="/" className="navbar-brand">
            <span className="brand-script">Bizy's</span>
            <span className="brand-main">Drizzles</span>
          </Link>

          <ul className="navbar-links">
            <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
            <li><Link to="/products" className={location.pathname.startsWith('/products') ? 'active' : ''}>Shop</Link></li>
            <li><Link to="/feedback" className={location.pathname === '/feedback' ? 'active' : ''}>Reviews</Link></li>
            <li><Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link></li>
          </ul>

          <div className="navbar-actions">
            <button
              className="nav-icon-btn"
              onClick={() => dispatch(toggleDarkMode())}
              aria-label="Toggle dark mode"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            <button
              className="nav-icon-btn cart-btn"
              onClick={() => dispatch(toggleCart())}
              aria-label="Open cart"
            >
              🛒
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>

            {isAuth ? (
              <div className="user-menu">
                <button className="user-avatar">
                  {user?.fullName?.charAt(0) || 'U'}
                </button>
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <strong>{user?.fullName}</strong>
                    <span className="text-muted text-sm">{user?.email}</span>
                  </div>
                  <Link to="/profile">My Profile</Link>
                  <Link to="/orders">My Orders</Link>
                  {isAdmin && <Link to="/admin">Admin Dashboard</Link>}
                  <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                <Link to="/register" className="btn btn-accent btn-sm">Sign Up</Link>
              </div>
            )}

            <button
              className="hamburger"
              onClick={() => dispatch(toggleMobileMenu())}
              aria-label="Toggle menu"
            >
              <span className={mobileOpen ? 'open' : ''}></span>
              <span className={mobileOpen ? 'open' : ''}></span>
              <span className={mobileOpen ? 'open' : ''}></span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="mobile-menu">
            <Link to="/">Home</Link>
            <Link to="/products">Shop</Link>
            <Link to="/feedback">Reviews</Link>
            <Link to="/contact">Contact</Link>
            <div className="mobile-divider" />
            {isAuth ? (
              <>
                <Link to="/profile">My Profile</Link>
                <Link to="/orders">My Orders</Link>
                {isAdmin && <Link to="/admin">Admin Dashboard</Link>}
                <button onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Sign Up</Link>
              </>
            )}
          </div>
        )}
      </nav>

      {cartOpen && <CartDrawer />}
    </>
  );
}
