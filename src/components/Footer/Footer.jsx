import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTiktok, faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/auth/authSlice';

export default function Footer() {
  const user = useSelector(selectUser);
  const loyaltyThreshold = 7;
  const saucesCount = user?.saucesOrderedCount || 0;
  // const progress = saucesCount % loyaltyThreshold;
  const remainder = loyaltyThreshold - saucesCount;
  return (
    <footer className="footer">
      <div className="footer-wave">
        <svg viewBox="0 0 1200 80" preserveAspectRatio="none">
          <path d="M0,40 C300,80 900,0 1200,40 L1200,80 L0,80 Z" fill="var(--primary-color)" />
        </svg>
      </div>
      <div className="footer-content">
        <div className="container footer-grid">
          <div className="footer-brand">
            <div className="brand-name">
              <span className="brand-script">Bizy's</span>
              <span className="brand-main">Drizzles</span>
            </div>
            <p className="footer-tagline">BEWARE: Sauce might become slightly addictive.</p>
             <p className="footer-tagline"> Enjoy every pour!</p>
            <div className="social-links">
              <a href="https://www.tiktok.com/@bizysdrizzles" aria-label="Facebook" className="social-link"> <FontAwesomeIcon icon={faFacebook} color="#1877F2" /> </a>
              <a href="https://www.tiktok.com/@bizysdrizzles" aria-label="Instagram" className="social-link"> <FontAwesomeIcon icon={faInstagram} color="#E4405F" /></a>
              <a href="https://www.tiktok.com/@bizysdrizzles" aria-label="Tiktok" className="social-link"><FontAwesomeIcon icon={faTiktok} color="#000000" /></a>
            </div>
          </div>

          <div className="footer-col fooot">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Shop</Link></li>
              <li><Link to="/feedback">Reviews</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Account</h4>
            <ul>
              {!user && <li><Link to="/login">Login</Link></li>}
              {!user && <li><Link to="/register">Sign Up</Link></li>}
              {user && <li><Link to="/orders">My Orders</Link></li>}
              {user && <li><Link to="/profile">My Profile</Link></li>}
            </ul>
          </div>

          <div className="footer-col footer-newsletter">
            {!user && <h4>Stay in the Loop</h4>}
            {!user && <p>Get 10% off your next sauce after ordering 7 sauces.</p>}
            {user && <h4>Order more, save more</h4>}
            {user && <p>Order {remainder} more sauces & get your 8th sauce at 10% off  </p>}
            
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container">
            <p>&copy; {new Date().getFullYear()} Bizy's Drizzles. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
