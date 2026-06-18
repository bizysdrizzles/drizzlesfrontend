import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsAdmin, selectAllProducts, selectProductsLoading, createProduct, updateProduct, deleteProduct, updateStock } from '../../features/products/productsSlice';
import { showToast } from '../../features/ui/uiSlice';
import './AdminCommon.css';

const EMPTY = { name: '', description: '', price: '', stock: '', imageUrl: '', type: 'sauce' };

export default function AdminProducts() {
  const dispatch = useDispatch();
  const allProducts = useSelector(selectAllProducts);
  const products = allProducts.filter(p => p.isActive !== false);
  const loading = useSelector(selectProductsLoading);
  const [modal, setModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [stockModal, setStockModal] = useState(null);
  const [stockForm, setStockForm] = useState({ quantity: 1, operation: 'increase' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { dispatch(fetchProductsAdmin()); }, [dispatch]);

  const openCreate = () => { setEditProduct(null); setForm(EMPTY); setModal(true); };
  const openEdit = (p) => { setEditProduct(p); setForm({ name: p.name || '', description: p.description || '', price: p.price || '', stock: p.stock || '', imageUrl: p.imageUrl || '', type: p.type || 'sauce' }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
    let result;
    if (editProduct) {
      result = await dispatch(updateProduct({ id: editProduct._id, data }));
    } else {
      result = await dispatch(createProduct(data));
    }
    setSaving(false);
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(showToast(editProduct ? 'Product updated!' : 'Product created!', 'success'));
      setModal(false);
      dispatch(fetchProductsAdmin());
    } else {
      dispatch(showToast(result.payload || 'Failed', 'error'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    const result = await dispatch(deleteProduct(id));
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(showToast('Product removed', 'success'));
      dispatch(fetchProductsAdmin());
    }
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateStock({ id: stockModal._id, data: { quantity: parseInt(stockForm.quantity), operation: stockForm.operation } }));
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(showToast('Stock updated!', 'success'));
      setStockModal(null);
      dispatch(fetchProductsAdmin());
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Products</h1>
        <button className="btn btn-accent" onClick={openCreate}>+ Add Product</button>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div className="product-thumb">
                        {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : '☕'}
                      </div>
                    </td>
                    <td>
                      <strong>{p.name}</strong>
                      <div className="text-muted text-sm">{p.description?.substring(0, 50)}...</div>
                    </td>
                    <td>${p.price?.toFixed(2)}</td>
                    <td>
                      <span className={p.stock === 0 ? 'text-error' : p.stock <= 5 ? 'text-warning' : ''}>
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.isActive !== false ? 'badge-success' : 'badge-error'}`}>
                        {p.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.type === 'bundle' ? 'badge-warning' : 'badge-info'}`}>
                        {p.type === 'bundle' ? '📦 Bundle' : '☕ Sauce'}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>✏️ Edit</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setStockModal(p); setStockForm({ quantity: 1, operation: 'increase' }); }}>📦 Stock</button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error-color)' }} onClick={() => handleDelete(p._id)}>🗑 Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button className="close-btn" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-group"><label>Name</label><input type="text" className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="form-group"><label>Description</label><textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                <div className="form-group"><label>Price ($)</label><input type="number" step="0.01" min="0" className="form-control" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required /></div>
                <div className="form-group"><label>Stock</label><input type="number" min="0" className="form-control" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required /></div>
              </div>
              <div className="form-group">
             <label>Product Type</label>
             <select className="form-control" value={form.type} onChange={e => setForm({...form, type: e.target.value})} required>
               <option value="sauce">Sauce</option>
               <option value="bundle">Bundle</option>
             </select>
            </div>
              <div className="form-group"><label>Image URL</label><input type="url" className="form-control" placeholder="https://..." value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} /></div>
              {form.imageUrl && <img src={form.imageUrl} alt="preview" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />}
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-accent" disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Update Modal */}
      {stockModal && (
        <div className="modal-overlay" onClick={() => setStockModal(null)}>
          <div className="modal-box small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Stock: {stockModal.name}</h3>
              <button className="close-btn" onClick={() => setStockModal(null)}>✕</button>
            </div>
            <form onSubmit={handleStockUpdate} className="modal-form">
              <div className="stock-current">Current stock: <strong>{stockModal.stock}</strong></div>
              <div className="form-group">
                <label>Operation</label>
                <select className="form-control" value={stockForm.operation} onChange={e => setStockForm({...stockForm, operation: e.target.value})}>
                  <option value="increase">Increase</option>
                  <option value="decrease">Decrease</option>
                  <option value="set">Set to</option>
                </select>
              </div>
              <div className="form-group"><label>Quantity</label><input type="number" min="1" className="form-control" value={stockForm.quantity} onChange={e => setStockForm({...stockForm, quantity: e.target.value})} /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setStockModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-accent">Update Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
