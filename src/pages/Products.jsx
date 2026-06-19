import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, selectAllProducts, selectProductsLoading } from '../features/products/productsSlice';
import { addToCart } from '../features/cart/cartSlice';
import { showToast } from '../features/ui/uiSlice';
import './Products.css';

export default function Products() {
  const dispatch = useDispatch();
  const allProducts = useSelector(selectAllProducts);
  const loading = useSelector(selectProductsLoading);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');

  useEffect(() => { dispatch(fetchProducts()); }, [dispatch]);

  const activeProducts = allProducts.filter(p => p.isActive !== false);

  const filtered = activeProducts.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    if (sort === 'name') return a.name?.localeCompare(b.name);
    return 0;
  });

  const handleAdd = (product) => {
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
    dispatch(showToast(`${product.name} added to cart!`, 'success'));
  };

  return (
    <div className="page-wrapper">
      <div className="page-title-section">
        <div className="container">
          <span className="section-eyebrow">Our Collection</span>
          <h1>All Sauces</h1>
          <p className="text-muted">Discover our full range of premium coffee drizzles</p>
        </div>
      </div>

      <div className="container products-page">
        <div className="products-controls">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search sauces..."
              className="form-control search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-control sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="default">Sort by: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        <div className="results-info">
          <span>{sorted.length} products found</span>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : sorted.length === 0 ? (
          <div className="empty-state">
            <div className="icon">☕</div>
            <h3>No products found</h3>
            <p>Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="products-full-grid">
            {sorted.map((product) => (
              <div key={product._id} className="product-card-full">
                <Link to={`/products/${product._id}`} className="product-img-link">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} />
                  ) : (
                    <div className="img-placeholder">☕</div>
                  )}
                  {product.stock === 0 && <div className="oos-badge">Out of Stock</div>}
                  {product.stock > 0 && product.stock <= 5 && (
                    <div className="low-stock-badge">Only {product.stock} left!</div>
                  )}
                </Link>
                <div className="product-body">
                  <h3><Link to={`/products/${product._id}`}>{product.name}</Link></h3>
                  <p>{product.description?.substring(0, 100)}...</p>
                  <div className="product-meta">
                    
                    <div className="product-actions">
                      <span className="product-price">${product.price?.toFixed(2)}</span>
                      <Link to={`/products/${product._id}`} className="btn btn-ghost btn-sm">Details</Link>
                      <button
                        className="btn btn-accent btn-sm"
                        onClick={() => handleAdd(product)}
                        disabled={product.stock === 0}
                      >
                        {product.stock === 0 ? 'Out of Stock' : '+ Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
