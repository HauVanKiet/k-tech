import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from './api';

const Profile = ({ onUpdateUser, user: propUser }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ fullName: '', username: '', phone: '', birthDate: '', email: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const pick = (obj, keys) => {
    if (!obj) return '';
    for (const k of keys) {
      if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
    }
    return '';
  };

  useEffect(() => {
    const applyUser = (u) => {
      setUser(u);
      setForm({
        fullName: pick(u, ['fullName', 'full_name', 'name']),
        username: pick(u, ['username', 'userName', 'handle']),
        phone: pick(u, ['phone', 'phoneNumber', 'phone_number', 'mobile']),
        birthDate: pick(u, ['birthDate', 'birthday', 'dob']),
        email: pick(u, ['email', 'mail'])
      });
    };

    console.debug('Profile mounted - propUser:', propUser);
    const rawDebug = localStorage.getItem('user');
    try { console.debug('Profile mounted - localStorage user:', rawDebug ? JSON.parse(rawDebug) : null); } catch (e) { console.debug('Profile mounted - localStorage invalid JSON'); }

    if (propUser) {
      applyUser(propUser);
      return;
    }

    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        const u = JSON.parse(raw);
        applyUser(u);
      } catch (e) {
        console.error('Invalid user in localStorage', e);
      }
    }
  }, [propUser]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    if (!user) return setError('Không có người dùng.');

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      // Attempt to update on backend; if endpoint differs, failure will be shown but local update still applied
      const resp = await axios.put(`${API_BASE_URL}/api/auth/users/${user._id}`, form, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const updated = resp.data.user || { ...user, ...form };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      // keep form in sync with saved data
      setForm({
        fullName: pick(updated, ['fullName', 'full_name', 'name']),
        username: pick(updated, ['username', 'userName', 'handle']),
        phone: pick(updated, ['phone', 'phoneNumber', 'phone_number', 'mobile']),
        birthDate: pick(updated, ['birthDate', 'birthday', 'dob']),
        email: pick(updated, ['email', 'mail'])
      });
      setMessage('Cập nhật thông tin thành công.');
      if (onUpdateUser) onUpdateUser(updated);
    } catch (err) {
      console.warn('Update failed', err);
      // fallback: update locally
      const updated = { ...user, ...form };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      setForm({
        fullName: pick(updated, ['fullName', 'full_name', 'name']),
        username: pick(updated, ['username', 'userName', 'handle']),
        phone: pick(updated, ['phone', 'phoneNumber', 'phone_number', 'mobile']),
        birthDate: pick(updated, ['birthDate', 'birthday', 'dob']),
        email: pick(updated, ['email', 'mail'])
      });
      if (onUpdateUser) onUpdateUser(updated);
      setError(err.response?.data?.message || 'Không thể cập nhật trên server — đã lưu cục bộ.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div style={{ padding: 24 }}>Vui lòng đăng nhập để xem thông tin cá nhân.</div>;

  return (
    <div style={{ maxWidth: 720, margin: '28px auto', padding: 24 }}>
      <h2 style={{ color: '#b91c1c' }}>Thông tin cá nhân</h2>
      {message && <div style={{ color: 'green', marginBottom: 12 }}>{message}</div>}
      {error && <div style={{ color: '#dc2626', marginBottom: 12 }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <div>
          <label>Họ và tên</label>
          <input name="fullName" value={form.fullName} onChange={handleChange} readOnly style={{ width: '100%', padding: 8, marginTop: 6, background: '#fafafa' }} />
        </div>
        <div>
          <label>Tên đăng nhập</label>
          <input name="username" value={form.username} onChange={handleChange} readOnly style={{ width: '100%', padding: 8, marginTop: 6, background: '#fafafa' }} />
        </div>
        <div>
          <label>Số điện thoại</label>
          <input name="phone" value={form.phone} onChange={handleChange} readOnly style={{ width: '100%', padding: 8, marginTop: 6, background: '#fafafa' }} />
        </div>
        <div>
          <label>Ngày sinh</label>
          <input type="date" name="birthDate" value={form.birthDate} onChange={handleChange} readOnly style={{ width: '100%', padding: 8, marginTop: 6, background: '#fafafa' }} />
        </div>
        <div>
          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} readOnly style={{ width: '100%', padding: 8, marginTop: 6, background: '#fafafa' }} />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" disabled style={{ padding: '10px 16px', background: '#e5e7eb', color: '#9ca3af', border: 'none', borderRadius: 8, cursor: 'not-allowed' }}>Lưu thay đổi</button>
          <button type="button" onClick={() => navigate('/')} style={{ padding: '10px 16px', background: '#fff', border: '1px solid #ddd', borderRadius: 8 }}>Quay về</button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
