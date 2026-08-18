import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api';

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', category: 'Tin tức', excerpt: '', content: '', coverImage: '', author: 'K_Tech', status: 'published' });
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/posts/admin/all`, { headers });
      if (res.data.success) setPosts(res.data.posts);
    } catch (err) {
      console.error(err);
      alert('Lỗi tải bài đăng: ' + (err.response?.data?.message || err.message));
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => {
    setEditingId(null);
    setForm({ title: '', category: 'Tin tức', excerpt: '', content: '', coverImage: '', author: 'K_Tech', status: 'published' });
    setShowForm(true);
  };

  const openEdit = (post) => {
    setEditingId(post._id);
    setForm({ title: post.title, category: post.category, excerpt: post.excerpt, content: post.content, coverImage: post.coverImage, author: post.author, status: post.status });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { alert('Vui lòng nhập tiêu đề'); return; }
    if (!form.content.trim()) { alert('Vui lòng nhập nội dung'); return; }
    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/api/posts/${editingId}`, form, { headers });
        alert('✅ Đã cập nhật bài đăng!');
      } else {
        await axios.post(`${API_BASE_URL}/api/posts/`, form, { headers });
        alert('✅ Đã đăng bài thành công!');
      }
      setShowForm(false);
      fetchPosts();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Xóa bài đăng "${title}"?`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/posts/${id}`, { headers });
      alert('✅ Đã xóa bài đăng!');
      fetchPosts();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN');

  if (loading) return <div style={{ padding: 24, color: '#7f1d1d' }}>🔄 Đang tải...</div>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ color: '#b91c1c', margin: 0 }}>📰 Quản lý bài đăng</h2>
        <button onClick={openCreate} style={{ background: 'linear-gradient(90deg, #dc2626, #ef4444)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 999, fontWeight: 700, cursor: 'pointer' }}>➕ Đăng bài mới</button>
      </div>
      <p style={{ color: '#7f1d1d', marginBottom: 20, fontSize: 14 }}>Đăng, sửa và xóa các bài viết tin tức hiển thị trên trang Tin tức.</p>

      {/* FORM ĐĂNG / SỬA */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 12, width: 720, maxWidth: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', background: '#dc2626', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <span style={{ fontWeight: 700 }}>{editingId ? '✏️ Sửa bài đăng' : '📝 Đăng bài mới'}</span>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input name="title" value={form.title} onChange={handleChange} placeholder="Tiêu đề bài viết *" required style={{ padding: 10, borderRadius: 8, border: '1px solid rgba(220,38,38,0.2)', outline: 'none', gridColumn: 'span 2' }} />
                <select name="category" value={form.category} onChange={handleChange} style={{ padding: 10, borderRadius: 8, border: '1px solid rgba(220,38,38,0.2)', outline: 'none', background: 'white' }}>
                  <option>Tin tức</option>
                  <option>Công nghệ</option>
                  <option>Mẹo hay</option>
                  <option>Khuyến mãi</option>
                </select>
                <select name="status" value={form.status} onChange={handleChange} style={{ padding: 10, borderRadius: 8, border: '1px solid rgba(220,38,38,0.2)', outline: 'none', background: 'white' }}>
                  <option value="published">📢 Xuất bản</option>
                  <option value="draft">📝 Bản nháp</option>
                </select>
                <input name="author" value={form.author} onChange={handleChange} placeholder="Tác giả" style={{ padding: 10, borderRadius: 8, border: '1px solid rgba(220,38,38,0.2)', outline: 'none' }} />
                <input name="coverImage" value={form.coverImage} onChange={handleChange} placeholder="URL ảnh bìa (tùy chọn)" style={{ padding: 10, borderRadius: 8, border: '1px solid rgba(220,38,38,0.2)', outline: 'none' }} />
              </div>
              <textarea name="excerpt" value={form.excerpt} onChange={handleChange} placeholder="Mô tả ngắn (tùy chọn)" rows={2} style={{ padding: 10, borderRadius: 8, border: '1px solid rgba(220,38,38,0.2)', outline: 'none', resize: 'vertical' }} />
              <textarea name="content" value={form.content} onChange={handleChange} placeholder="Nội dung bài viết * (mỗi dòng là một đoạn văn)" rows={8} required style={{ padding: 10, borderRadius: 8, border: '1px solid rgba(220,38,38,0.2)', outline: 'none', resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: '#fff', color: '#7f1d1d', border: '1px solid rgba(220,38,38,0.25)', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
                <button type="submit" disabled={saving} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 8, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? '⏳ Đang lưu...' : editingId ? '💾 Lưu thay đổi' : '🚀 Đăng bài'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DANH SÁCH BÀI ĐĂNG */}
      {posts.length === 0 ? (
        <p style={{ color: '#991b1b' }}>Chưa có bài đăng nào. Bấm "Đăng bài mới" để tạo bài viết đầu tiên.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {posts.map(p => (
            <div key={p._id} style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid rgba(220,38,38,0.12)', boxShadow: '0 2px 8px rgba(220,38,38,0.06)', display: 'flex', gap: 16, alignItems: 'center' }}>
              {p.coverImage && (
                <div style={{ width: 120, height: 80, borderRadius: 8, overflow: 'hidden', background: '#fef2f2', flexShrink: 0 }}>
                  <img src={p.coverImage} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, background: 'rgba(220,38,38,0.12)', color: '#dc2626', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>{p.category}</span>
                  {p.status === 'draft' && <span style={{ fontSize: 12, background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>📝 Nháp</span>}
                  <span style={{ fontSize: 12, color: '#991b1b' }}>📅 {formatDate(p.createdAt)}</span>
                </div>
                <div style={{ fontWeight: 700, color: '#7f1d1d', fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => openEdit(p)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>✏️ Sửa</button>
                <button onClick={() => handleDelete(p._id, p.title)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>🗑️ Xóa</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPosts;