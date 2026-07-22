import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';

const AdminProducts = () => {
  const [productForm, setProductForm] = useState({ name: '', price: '', description: '', category: 'Laptop' });
  const [imageFiles, setImageFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProductData, setEditProductData] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${API_BASE_URL}/api/products/all`);
      if (resp.data.success) setProducts(resp.data.products || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleProductChange = (e) => setProductForm({ ...productForm, [e.target.name]: e.target.value });

  const handleEdit = (p) => {
    setEditProductData(p);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/products/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      alert('Đã xóa'); fetchProducts();
    } catch (err) { alert('Lỗi xóa: ' + (err.response?.data?.message || err.message)); }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: '#b91c1c' }}>Quản lý sản phẩm</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setShowAddModal(true)} style={{ background: '#dc2626', color: 'white', padding: '10px', border: 'none', borderRadius: 8 }}>Thêm sản phẩm</button>
      </div>
      {showAddModal && <AddProductModal onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); fetchProducts(); }} />}
      {showEditModal && editProductData && (
        <EditProductModal product={editProductData} onClose={() => { setShowEditModal(false); setEditProductData(null); }} onSuccess={() => { setShowEditModal(false); setEditProductData(null); fetchProducts(); }} />
      )}

      <hr style={{ margin: '20px 0' }} />
      <h3>Danh sách sản phẩm đã đăng</h3>
      {loading ? <div>Đang tải...</div> : (
        <div style={{ display: 'grid', gap: 12 }}>
          {products.map(p => (
            <div key={p._id} style={{ border: '1px solid #eee', padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src={p.coverImage} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600' }}>{p.name}</div>
                <div style={{ color: '#7f1d1d' }}>{Number(p.price).toLocaleString('vi-VN')} đ</div>
                <div style={{ fontSize: 13, color: '#444' }}>{p.category}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleEdit(p)} style={{ padding: '6px 10px' }}>Sửa</button>
                <button onClick={() => handleDelete(p._id)} style={{ padding: '6px 10px', background: '#ff4d4d', color: 'white', border: 'none' }}>Xóa</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
