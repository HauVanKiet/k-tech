import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api';

const AdminSoldProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSold = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const resp = await axios.get(`${API_BASE_URL}/api/products/sold/all`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (resp.data.success) setProducts(resp.data.products || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchSold(); }, []);

  const handleRestore = async (id) => {
    if (!window.confirm('Quay sản phẩm này vào danh sách đang bán?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/products/${id}/restore`, {}, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      alert('Đã quay sản phẩm vào danh sách đang bán');
      fetchSold();
    } catch (err) { alert('Lỗi: ' + (err.response?.data?.message || err.message)); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa sản phẩm này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/products/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      alert('Đã xóa');
      fetchSold();
    } catch (err) { alert('Lỗi xóa: ' + (err.response?.data?.message || err.message)); }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: '#b91c1c' }}>Quản lý sản phẩm đã bán</h2>
      <p style={{ color: '#7f1d1d', fontSize: 14 }}>Danh sách sản phẩm đã đán dấu bán hết — không hiển thị trên trang chủ cho khách.</p>

      {loading ? <div>Đang tải...</div> : products.length === 0 ? (
        <p style={{ color: '#991b1b' }}>Chưa có sản phẩm đã bán hết nào.</p>
      ) : (
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
                <button onClick={() => handleRestore(p._id)} style={{ padding: '6px 10px', background: '#15803d', color: 'white', border: 'none' }}>Quay bán</button>
                <button onClick={() => handleDelete(p._id)} style={{ padding: '6px 10px', background: '#ff4d4d', color: 'white', border: 'none' }}>Xóa</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSoldProducts;