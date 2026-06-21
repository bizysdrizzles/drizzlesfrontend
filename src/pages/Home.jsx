import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, selectAllProducts } from '../features/products/productsSlice';
import { addToCart } from '../features/cart/cartSlice';
import { showToast } from '../features/ui/uiSlice';
import { fetchAllFeedback, selectAllFeedback } from '../features/feedback/feedbackSlice';
import './Home.css';

const HERO_IMAGES_DESKTOP = [
  'https://res.cloudinary.com/dsfa43amy/image/upload/v1774455034/hero_1_ja06ho.jpg',
  'https://res.cloudinary.com/dsfa43amy/image/upload/v1774455033/hero4_epjwib.jpg',
  'https://res.cloudinary.com/dsfa43amy/image/upload/v1777155442/a2bd9092-cbf8-47fc-ab33-d513e168582b_udps1w.jpg',
];

const HERO_IMAGES_MOBILE = [
  'https://res.cloudinary.com/dsfa43amy/image/upload/v1774455034/hero_1_ja06ho.jpg',
  'https://res.cloudinary.com/dsfa43amy/image/upload/v1777152479/hero_mob_juffjt.jpg',
  'https://res.cloudinary.com/dsfa43amy/image/upload/v1777152479/hero_mo2_t9d8gd.jpg',
];

export default function Home() {
  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts);
  const feedback = useSelector(selectAllFeedback);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 640);

useEffect(() => {
  const handleResize = () => setIsMobileView(window.innerWidth <= 640);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

const HERO_IMAGES = isMobileView ? HERO_IMAGES_MOBILE : HERO_IMAGES_DESKTOP;

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchAllFeedback());
    const interval = setInterval(() => setHeroIndex(i => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(interval);
  }, [dispatch, HERO_IMAGES.length]);


  const featuredProducts = products.filter(p => p.isActive !== false).slice(0, 4);
  const reviews = feedback.slice(0, 3);

  const handleAddToCart = (product) => {
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
    dispatch(showToast(`${product.name} added to cart!`, 'success'));
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg">
          {HERO_IMAGES.map((img, i) => (
            <div
              key={i}
              className={`hero-slide ${i === heroIndex ? 'active' : ''}`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
          <div className="hero-overlay" />
        </div>

        <div className="hero-content container">

          <h1 className="hero-title">
            Enjoy every
            <span className="hero-brand"> Pour</span>
          </h1>
          <p className="hero-subtitle">
            Because life is too short for boring coffee. Turn your daily grind into a gourmet ritual with one effortless drizzle.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-accent btn-lg">Grab Your Flavor</Link>
            <Link to="/feedback" className="btn btn-outline-white btn-lg">See Reviews</Link>
          </div>
          {/* <div className="hero-stats">
            <div className="stat"><strong>1,200+</strong><span>Happy Customers</span></div>
            <div className="stat-divider" />
            <div className="stat"><strong>15+</strong><span>Sauce Flavors</span></div>
            <div className="stat-divider" />
            <div className="stat"><strong>⭐ 4.9</strong><span>Average Rating</span></div>
          </div> */}
        </div>

        <div className="hero-scroll">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              className={`scroll-dot ${i === heroIndex ? 'active' : ''}`}
              onClick={() => setHeroIndex(i)}
            />
          ))}
        </div>
      </section>

      {/* Marquee Banner */}
      <div className="marquee-banner">
        <div className="marquee-track">
          {Array(6).fill(['🎁 LOYALTY REWARDS', '✨ ARTISAN CRAFTED', '🌿 ALL NATURAL INGREDIENTS']).flat().map((text, i) => (
            <span key={i}>{text}</span>
          ))}
        </div>
      </div>

      {/* About Section */}
      <section className="about-section">
        <div className="container about-grid">
          <div className="about-images">
            <img
              src="https://images.unsplash.com/photo-1511920170033-f8396924c348?w=500"
              alt="Coffee pouring"
              className="about-img-main"
            />
            <img
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300"
              alt="Coffee close up"
              className="about-img-accent"
            />
          </div>
          <div className="about-text">
            <span className="section-eyebrow">Our Story</span>
            <h2>Your Shortcut to<br /><em>Barista-Level</em> Perfection</h2>
            <p>
              At Bizy's Drizzles, we believe every coffee deserves a finishing touch. Our
              handcrafted sauces are made with premium ingredients to transform your daily cup
              into something extraordinary.
            </p>
            <p>
              From classic caramel to bold mocha, our sauces are designed to complement any
              coffee drink — or drizzle over your favorite desserts.
            </p>
            <div className="about-features">
              <div className="feature">
                <span className="feature-icon">🌿</span>
                <div><strong>All Natural</strong><p>No artificial flavors or preservatives</p></div>
              </div>
              <div className="feature">
                <span className="feature-icon">☕</span>
                <div><strong>Coffee Lovers Made</strong><p>Created by baristas, for coffee lovers</p></div>
              </div>
              <div className="feature">
                <span className="feature-icon">🎁</span>
                <div><strong>Loyalty Rewards</strong><p>Earn discounts with every order</p></div>
              </div>
            </div>
            <Link to="/products" className="btn btn-primary">Explore Our Sauces</Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Our Collection</span>
            <h2>Bestselling Drizzles</h2>
            <p>Each sauce is carefully crafted to deliver the perfect balance of flavor and sweetness</p>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="loading-center">
              <div className="spinner" />
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.slice(0, 4).map((product) => (
                <div key={product._id} className="product-card">
                  <Link to={`/products/${product._id}`} className="product-image-wrap">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} />
                    ) : (
                      <div className="product-image-placeholder">
                        <span>☕</span>
                      </div>
                    )}
                    {product.stock === 0 && <div className="out-of-stock-badge">Out of Stock</div>}
                  </Link>
                  <div className="product-info">
                    <h3><Link to={`/products/${product._id}`}>{product.name}</Link></h3>
                    <p>{product.description?.substring(0, 80)}...</p>
                    <div className="product-footer">
                      <span className="product-price">{product.price}EGP</span>
                      <button
                        className="btn btn-accent btn-sm"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                      >
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center" style={{ marginTop: '40px' }}>
            <Link to="/products" className="btn btn-outline">View All Products</Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Why Bizy's Drizzles</span>
            <h2>More Than Just Sauce</h2>
          </div>
          <div className="why-grid">
            {[
              { icon: '🌿', title: 'The Gold Standard', desc: 'Premium Ingredients: We don’t do "basic." We source the finest, richest ingredients so your morning brew feels like a high-end cafe experience.' },
              { icon: '🏆', title: 'Flavor Game: Strong', desc: 'Unique & Bold Flavors From nostalgic classics to wild new blends, our recipes are crafted to make your taste buds enjoy every sip.' },
              { icon: '🚀', title: 'Cravings, Delivered', desc: 'Lightning-Fast Shipping so that we don’t let your coffee feel lonely.' },
              { icon: '💚', title: 'Join the Drizzle Dynasty', desc: 'Get rewarded for your obsession in our loyalty program! Earn points with every bottle and unlock exclusive discounts that make your habit even sweeter.' },
              { icon: '🎁', title: 'Fan Favorites', desc: 'Obsessively Loved because we’re not just a sauce—we’re a morning ritual. Join the family members who never brew without us.' },
              { icon: '⭐', title: 'Barista Quality, Zero Effort', desc: 'Turn your kitchen into the hottest cafe in town. No fancy machines required—just drizzle, sip, and feel like a total pro.' },
            ].map((item) => (
              <div key={item.title} className="why-card">
                <div className="why-icon">{item.icon}</div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="reviews-section">
          <div className="container">
            <div className="section-header">
              <span className="section-eyebrow">Customer Love</span>
              <h2>Sweet Words from Happy Customers</h2>
            </div>

            <div className="reviews-grid" style={{ justifyContent: 'center' }}>
              {reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-stars">
                    {'★'.repeat(review.rating || 5)}{'☆'.repeat(5 - (review.rating || 5))}
                  </div>
                  <p className="review-text">"{review.message}"</p>
                  <div className="reviewer">
                    <div className="reviewer-avatar">{(review.name || 'A').charAt(0)}</div>
                    <strong>{review.name}</strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center" style={{ marginTop: '32px' }}>
              <Link to="/feedback" className="btn btn-outline">Leave a Review</Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-bg" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1400)'
        }}>
          <div className="cta-overlay" />
        </div>
        <div className="container cta-content">
          <h2>Don’t be the last to know!</h2>
          <p>Discover why thousands of drink lovers are obsessed with the Bizy’s glow-up. Your mug will thank you.</p>
          <div className="cta-actions">
            <Link to="/products" className="btn btn-accent btn-lg">Shop the collection</Link>
            <Link to="/register" className="btn btn-outline-white btn-lg">Join for Rewards</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
