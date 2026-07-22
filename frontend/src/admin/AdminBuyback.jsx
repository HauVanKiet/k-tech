import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api';

const AdminBuyback = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const resp = await axios.get(`${API_BASE_URL}/api/buyback/admin/requests`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      setRequests(resp.data || []);
    } catch (err) {
      console.error(err);
      alert('Không lấy được yêu cầu thu máy (kiểm tra token/admin)');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handlePrice = async (id) => {
    const price = prompt('Nhập mức giá đề xuất (VNĐ)');
    if (!price) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/buyback/admin/price/${id}`, { admin_price: price }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      alert('Đã gửi định giá'); fetchRequests();
    } catch (err) { alert('Lỗi: ' + (err.response?.data?.message || err.message)); }
  };

  if (loading) return <div style={{ padding: 20 }}>Đang tải...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: '#b91c1c' }}>Quản lý thu cũ</h2>
      {requests.length === 0 ? <p>Chưa có yêu cầu nào.</p> : (
        <div>
          {requests.map(r => (
            <div key={r._id} style={{ border: '1px solid #eee', padding: 12, marginBottom: 12 }}>
              <div><strong>Thiết bị:</strong> {r.device_name}</div>
              <div><strong>Người gửi:</strong> {r.user_id?.username || r.user_id?.email}</div>
              <div><strong>Tình trạng:</strong> {r.status}</div>
              <div style={{ marginTop: 8 }}>
                <button onClick={() => handlePrice(r._id)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 8 }}>Định giá</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBuyback;
