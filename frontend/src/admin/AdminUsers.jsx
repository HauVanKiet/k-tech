import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const resp = await axios.get(`${API_BASE_URL}/api/auth/users`);
      setUsers(resp.data || []);
    } catch (err) {
      console.error(err);
      alert('Không lấy được danh sách người dùng');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Xóa tài khoản ${name}?`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/auth/users/${id}`);
      alert('Đã xóa'); fetchUsers();
    } catch (err) { alert('Lỗi xóa: ' + (err.response?.data?.message || err.message)); }
  };

  if (loading) return <div style={{ padding: 20 }}>Đang tải...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: '#b91c1c' }}>Quản lý người dùng</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left' }}><th>Họ tên</th><th>Email</th><th>Quyền</th><th>Hành động</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 8 }}>{u.fullName}</td>
              <td style={{ padding: 8 }}>{u.email}</td>
              <td style={{ padding: 8 }}>{u.role}</td>
              <td style={{ padding: 8 }}>
                <button onClick={() => handleDelete(u._id, u.fullName)} style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '6px 10px', borderRadius: 6 }}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;
