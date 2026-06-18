import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct, selectSelectedProduct, selectProductsLoading } from '../features/products/productsSlice';
import { addToCart } from '../features/cart/cartSlice';
import { showToast } from '../features/ui/uiSlice';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const product = useSelector(selectSelectedProduct);
  const loading = useSelector(selectProductsLoading);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) dispatch(fetchProduct(id));
  }, [id, dispatch]);

  const handleAdd = () => {
    if (!product) return;
    dispatch(addToCart({ productId: product._id, quantity }));
    dispatch(showToast(`${product.name} (x${quantity}) added to cart!`, 'success'));
  };

  if (loading) return <div className="page-wrapper loading-center"><div className="spinner" /></div>;
  if (!product) return (
    <div className="page-wrapper">
      <div className="container empty-state">
        <div className="icon">🔍</div>
        <h3>Product not found</h3>
        <Link to="/products" className="btn btn-accent">Back to Shop</Link>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>›</span>
          <Link to="/products">Shop</Link>
          <span>›</span>
          <span>{product.name}</span>
        </div>

        <div className="product-detail-grid">
          <div className="detail-image">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} />
            ) : (
              <div className="detail-img-placeholder">☕</div>
            )}
            {product.stock === 0 && <div className="detail-oos">Out of Stock</div>}
          </div>

          <div className="detail-info">
            <span className="section-eyebrow">Premium Coffee Sauce</span>
            <h1>{product.name}</h1>

            <div className="detail-price">${product.price?.toFixed(2)}</div>

            <p className="detail-description">{product.description}</p>

            <div className="detail-badges">
              <span className="badge badge-primary">🌿 All Natural</span>
              <span className="badge badge-primary">☕ Coffee Grade</span>
              {product.stock > 0 && product.stock <= 10 && (
                <span className="badge badge-warning">⚡ Only {product.stock} left</span>
              )}
              {product.stock > 10 && <span className="badge badge-success">✓ In Stock</span>}
            </div>

            {product.stock > 0 && (
              <div className="detail-add">
                <div className="qty-section">
                  <label>Quantity</label>
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                    <span className="qty-value">{quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    >+</button>
                  </div>
                </div>
                <button
                  className="btn btn-accent btn-lg add-to-cart-btn"
                  onClick={handleAdd}
                >
                  Add to Cart — ${(product.price * quantity).toFixed(2)}
                </button>
              </div>
            )}

            {product.stock === 0 && (
              <div className="alert alert-error">
                This product is currently out of stock. Check back soon!
              </div>
            )}

            <div className="detail-features">
              <div className="df-row"><span>🚀</span><p><strong>Fast Shipping</strong> — Orders ship within 1-2 business days</p></div>
              <div className="df-row"><span>🔄</span><p><strong>Easy Returns</strong> — 30-day return policy</p></div>
              <div className="df-row"><span>🎁</span><p><strong>Loyalty Points</strong> — Earn rewards with every purchase</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
