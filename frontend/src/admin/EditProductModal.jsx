import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api';

const EditProductModal = ({ product, onClose, onSuccess }) => {
  const [form, setForm] = useState({ name: '', price: '', description: '', category: 'Laptop', condition: 'mới', quantity: 1, stockStatus: 'còn hàng', warranty: '' });
  const [saving, setSaving] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [toRemove, setToRemove] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  useEffect(() => {
    if (product) {
      setForm({ name: product.name || '', price: product.price || '', description: product.description || '', category: product.category || 'Laptop', condition: product.condition || 'mới', quantity: product.quantity ?? 1, stockStatus: product.stockStatus || 'còn hàng', warranty: product.warranty || '' });
      setExistingImages(product.images || (product.coverImage ? [product.coverImage] : []));
      setToRemove([]);
      setNewFiles([]);
    }
  }, [product]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');

      // Validate total images after remove/add
      const remain = (existingImages.length - toRemove.length) + newFiles.length;
      if (remain <= 0) { alert('Phải có ít nhất 1 ảnh sản phẩm'); setSaving(false); return; }
      if (remain > 8) { alert('Tổng số ảnh không vượt quá 8'); setSaving(false); return; }

      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('price', form.price);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('condition', form.condition);
      formData.append('quantity', form.quantity);
      formData.append('stockStatus', form.stockStatus);
      formData.append('warranty', form.warranty);
      formData.append('imagesToRemove', JSON.stringify(toRemove));
      newFiles.forEach(f => formData.append('newImages', f));

      await axios.put(`${API_BASE_URL}/api/products/${product._id}`, formData, { headers: Object.assign({ 'Content-Type': 'multipart/form-data' }, token ? { Authorization: `Bearer ${token}` } : {}) });
      alert('Cập nhật thành công');
      onSuccess && onSuccess();
    } catch (err) {
      alert('Lỗi cập nhật: ' + (err.response?.data?.message || err.message));
    } finally { setSaving(false); }
  };

  const toggleRemove = (img) => {
    setToRemove(prev => prev.includes(img) ? prev.filter(x => x !== img) : [...prev, img]);
  };

  const handleNewFiles = (e) => {
    const f = Array.from(e.target.files);
    if (f.length + (existingImages.length - toRemove.length) > 8) { alert('Tổng số ảnh sau khi thêm không được quá 8'); e.target.value = ''; return; }
    setNewFiles(f);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div style={{ background: 'white', padding: 20, borderRadius: 8, width: 520, maxWidth: '95%' }}>
        <h3>Chỉnh sửa sản phẩm</h3>
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
          <div>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>Ảnh hiện có</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {existingImages && existingImages.length > 0 ? existingImages.map(img => (
                <div key={img} style={{ position: 'relative' }}>
                  <img src={img} alt="" style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 6, opacity: toRemove.includes(img) ? 0.4 : 1 }} />
                  <label style={{ display: 'block', textAlign: 'center' }}>
                    <input type="checkbox" checked={toRemove.includes(img)} onChange={() => toggleRemove(img)} /> Xóa
                  </label>
                </div>
              )) : <div>Không có ảnh</div>}
            </div>
          </div>
          <div>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>Thêm ảnh mới</div>
            <input type="file" accept="image/*" multiple onChange={handleNewFiles} />
            {newFiles && newFiles.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {newFiles.map((f, i) => <div key={i} style={{ padding: 6, border: '1px solid #eee' }}>{f.name}</div>)}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose}>Hủy</button>
            <button type="submit" disabled={saving} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 6 }}>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
