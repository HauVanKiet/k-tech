import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api';

const AddProductModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({ name: '', price: '', description: '', category: 'Laptop', condition: 'mới', quantity: 1, stockStatus: 'còn hàng', warranty: '' });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFiles = (e) => {
    const f = Array.from(e.target.files);
    if (f.length > 8) { alert('Tối đa 8 ảnh'); e.target.value = ''; setFiles([]); return; }
    setFiles(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) { alert('Chọn ít nhất 1 ảnh'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('price', form.price);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('condition', form.condition);
      formData.append('quantity', form.quantity);
      formData.append('stockStatus', form.stockStatus);
      formData.append('warranty', form.warranty);
      files.forEach(f => formData.append('images', f));

      const resp = await axios.post(`${API_BASE_URL}/api/products/add`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (resp.data.success) {
        alert('Đã đăng sản phẩm thành công');
        onSuccess && onSuccess();
      }
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally { setUploading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div style={{ background: 'white', padding: 20, borderRadius: 8, width: 520, maxWidth: '95%' }}>
        <h3>Thêm sản phẩm</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10 }}>
          <input name="name" placeholder="Tên sản phẩm" value={form.name} onChange={handleChange} required />
          <input name="price" type="number" placeholder="Giá (VNĐ)" value={form.price} onChange={handleChange} required />
          <select name="category" value={form.category} onChange={handleChange}>
            <option>Laptop</option>
            <option>Điện thoại</option>
            <option>Linh kiện</option>
          </select>
          <select name="condition" value={form.condition} onChange={handleChange}>
            <option value="mới">Mới</option>
            <option value="cũ">Cũ</option>
          </select>
          <input name="quantity" type="number" min="0" placeholder="Số lượng" value={form.quantity} onChange={handleChange} required />
          <select name="stockStatus" value={form.stockStatus} onChange={handleChange}>
            <option value="còn hàng">Còn hàng</option>
            <option value="tạm hết hàng">Tạm hết hàng</option>
          </select>
          <input name="warranty" placeholder="Bảo hành (VD: 12 tháng chính hãng)" value={form.warranty} onChange={handleChange} />
          <textarea name="description" placeholder="Mô tả" value={form.description} onChange={handleChange} rows={4} />
          <input type="file" accept="image/*" multiple onChange={handleFiles} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose}>Hủy</button>
            <button type="submit" disabled={uploading} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 6 }}>{uploading ? 'Đang tải...' : 'Đăng sản phẩm'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
