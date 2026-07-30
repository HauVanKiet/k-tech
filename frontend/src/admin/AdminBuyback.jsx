import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api';

const AdminBuyback = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [priceInput, setPriceInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [chatMsg, setChatMsg] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('all');
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${API_BASE_URL}/api/buyback/admin/all`, { headers });
      setRequests(resp.data || []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handlePrice = async (id) => {
    if (!priceInput) { alert('Nhập giá thu'); return; }
    try {
      await axios.put(`${API_BASE_URL}/api/buyback/admin/price/${id}`, { adminPrice: Number(priceInput), adminNote: noteInput }, { headers });
      alert('✅ Đã gửi định giá');
      setSelectedRequest(null);
      setPriceInput('');
      setNoteInput('');
      fetchRequests();
    } catch (err) { alert('Lỗi: ' + (err.response?.data?.error || err.message)); }
  };

  const handleStatus = async (id, status, shippingStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/api/buyback/admin/status/${id}`, { status, shippingStatus }, { headers });
      alert('✅ Đã cập nhật trạng thái');
      fetchRequests();
    } catch (err) { alert('Lỗi: ' + (err.response?.data?.error || err.message)); }
  };

  const sendChat = async (reqId) => {
    if (!chatMsg.trim()) return;
    try {
      await axios.post(`${API_BASE_URL}/api/buyback/chat/${reqId}`, { text: chatMsg }, { headers });
      setChatMsg('');
      fetchChat(reqId);
    } catch (err) { alert('Lỗi gửi tin nhắn'); }
  };

  const fetchChat = async (reqId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/buyback/chat/${reqId}`, { headers });
      setSelectedRequest(prev => prev?._id === reqId ? { ...prev, messages: res.data } : prev);
    } catch (err) {}
  };

  const openDetail = (req) => {
    setSelectedRequest(req);
    setPriceInput(req.adminPrice || '');
    setNoteInput(req.adminNote || '');
    fetchChat(req._id);
  };

  const getStatusBadge = (r) => {
    if (r.status === 'pending') return <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: 999, fontWeight: 700, fontSize: 12 }}>⏳ Chờ định giá</span>;
    if (r.status === 'priced') return <span style={{ background: '#dbeafe', color: '#2563eb', padding: '4px 10px', borderRadius: 999, fontWeight: 700, fontSize: 12 }}>💰 Đã định giá</span>;
    if (r.status === 'accepted') {
      if (r.shippingStatus === 'waiting_delivery') return <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: 999, fontWeight: 700, fontSize: 12 }}>🟡 Chờ giao nhận</span>;
      if (r.shippingStatus === 'waiting_receive') return <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: 999, fontWeight: 700, fontSize: 12 }}>🟡 Chờ thu</span>;
      return <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: 999, fontWeight: 700, fontSize: 12 }}>🟡 Đã chấp nhận</span>;
    }
    if (r.status === 'completed') return <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: 999, fontWeight: 700, fontSize: 12 }}>✅ Hoàn tất</span>;
    return <span style={{ background: '#fef2f2', color: '#dc2626', padding: '4px 10px', borderRadius: 999, fontWeight: 700, fontSize: 12 }}>❌ Đã hủy</span>;
  };

  const formatPrice = (p) => p ? Number(p).toLocaleString('vi-VN') + 'đ' : '---';

  if (loading) return <div style={{ padding: 24, color: '#7f1d1d' }}>🔄 Đang tải...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: '#b91c1c', marginBottom: 8 }}>📋 Quản lý thu cũ</h2>
      <p style={{ color: '#7f1d1d', marginBottom: 20, fontSize: 14 }}>Xem, định giá và quản lý yêu cầu thu cũ từ khách hàng.</p>

      {/* Tab con */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all', 'messages'].map(tab => (
          <button key={tab} onClick={() => { setActiveSubTab(tab); setSelectedRequest(null); }}
            style={{
              padding: '8px 16px', borderRadius: 999, border: activeSubTab === tab ? '2px solid #dc2626' : '1px solid rgba(220,38,38,0.2)',
              background: activeSubTab === tab ? '#fff5f5' : '#fff', color: '#7f1d1d', fontWeight: activeSubTab === tab ? 700 : 600,
              cursor: 'pointer', fontSize: 14
            }}>
            {tab === 'all' ? '📋 Tất cả yêu cầu' : '💬 Tin nhắn'}
          </button>
        ))}
      </div>

      {activeSubTab === 'messages' && (
        <div style={{ marginBottom: 16 }}>
          {requests.filter(r => r.messages && r.messages.length > 0).length === 0 ? (
            <p style={{ color: '#991b1b' }}>Chưa có tin nhắn nào.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {requests.filter(r => r.messages && r.messages.length > 0).map(r => {
                const lastMsg = r.messages[r.messages.length - 1];
                return (
                  <div key={r._id} onClick={() => { openDetail(r); }}
                    style={{
                      background: '#fff', borderRadius: 12, padding: 14, cursor: 'pointer',
                      border: selectedRequest?._id === r._id ? '2px solid #dc2626' : '1px solid rgba(220,38,38,0.1)',
                      display: 'flex', gap: 12, alignItems: 'center'
                    }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>💬</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: '#7f1d1d', fontSize: 14, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.deviceInfo}</div>
                      <div style={{ color: '#7a4a4a', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.fullName} - {lastMsg?.text || ''}</div>
                      <div style={{ fontSize: 11, color: '#991b1b', marginTop: 2 }}>{new Date(lastMsg?.createdAt || r.createdAt).toLocaleString('vi-VN')}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'all' && requests.length === 0 ? (
        <p style={{ color: '#991b1b' }}>Chưa có yêu cầu thu cũ nào.</p>
      ) : activeSubTab === 'all' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {requests.map(r => (
            <div key={r._id} onClick={() => openDetail(r)} style={{
              background: '#fff', borderRadius: 12, padding: 16, cursor: 'pointer',
              border: selectedRequest?._id === r._id ? '2px solid #dc2626' : '1px solid rgba(220,38,38,0.12)',
              boxShadow: '0 2px 8px rgba(220,38,38,0.06)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#7f1d1d' }}>{r.deviceInfo}</span>
                  <span style={{ fontSize: 12, color: '#991b1b', marginLeft: 12 }}>🕐 {new Date(r.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                {getStatusBadge(r)}
              </div>
              <div style={{ fontSize: 13, color: '#7a4a4a' }}>
                👤 {r.fullName} - {r.phone} | 📍 {r.address}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal chi tiết + định giá */}
      {selectedRequest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: 'white', borderRadius: 12, width: 700, maxWidth: '95%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 16px', background: '#dc2626', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700 }}>📋 Chi tiết yêu cầu thu cũ</span>
              <button onClick={() => setSelectedRequest(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>

            <div style={{ padding: 16, overflowY: 'auto', flex: 1, display: 'grid', gap: 12 }}>
              {/* Thông tin người dùng */}
              <div style={{ background: '#fef2f2', padding: 12, borderRadius: 8 }}>
                <div style={{ fontWeight: 700, color: '#7f1d1d', marginBottom: 4 }}>👤 Thông tin khách hàng</div>
                <div style={{ fontSize: 13, color: '#7a4a4a' }}>
                  <div>{selectedRequest.fullName} - {selectedRequest.phone}</div>
                  <div>📍 {selectedRequest.address}</div>
                  <div>📧 {selectedRequest.user_id?.email || ''}</div>
                </div>
              </div>

              {/* Thông tin thiết bị */}
              <div style={{ background: '#fff7ed', padding: 12, borderRadius: 8 }}>
                <div style={{ fontWeight: 700, color: '#9a3412', marginBottom: 4 }}>📱 Thông tin thiết bị</div>
                <div style={{ fontSize: 13, color: '#7a4a4a' }}>
                  <div>📌 {selectedRequest.deviceInfo}</div>
                  <div>Loại: {selectedRequest.deviceType}</div>
                  <div>Ngoại hình: {selectedRequest.exteriorCondition}</div>
                  <div>Hoạt động: {selectedRequest.deviceCondition}</div>
                  {selectedRequest.desiredPrice > 0 && <div>💰 Giá mong muốn: {formatPrice(selectedRequest.desiredPrice)}</div>}
                  {selectedRequest.adminPrice && <div style={{ color: '#15803d', fontWeight: 700 }}>🔴 Giá admin: {formatPrice(selectedRequest.adminPrice)}</div>}
                </div>
              </div>

              {/* Form định giá */}
              {(selectedRequest.status === 'pending' || selectedRequest.status === 'priced') && (
                <div style={{ background: '#f0fdf4', padding: 12, borderRadius: 8, border: '1px solid #bbf7d0' }}>
                  <div style={{ fontWeight: 700, color: '#15803d', marginBottom: 8 }}>💰 Định giá</div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input value={priceInput} onChange={(e) => setPriceInput(e.target.value)} type="number" placeholder="Giá thu (VNĐ)" style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid rgba(220,38,38,0.18)', outline: 'none' }} />
                  </div>
                  <textarea value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="Ghi chú cho khách hàng..." rows={2} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(220,38,38,0.18)', outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: 8 }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handlePrice(selectedRequest._id)} style={{ background: '#15803d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>📤 Gửi định giá</button>
                    {selectedRequest.status === 'priced' && selectedRequest.adminPrice && (
                      <button onClick={() => handleStatus(selectedRequest._id, 'completed', 'completed')} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>✅ Đã hoàn tất</button>
                    )}
                  </div>
                </div>
              )}

              {/* Cập nhật trạng thái giao hàng */}
              {selectedRequest.status === 'accepted' && (
                <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontWeight: 700, color: '#7f1d1d', marginBottom: 4 }}>📦 Phương thức: {
                    selectedRequest.shippingMethod === 'store' ? 'Gửi tại cửa hàng' :
                    selectedRequest.shippingMethod === 'shipping' ? 'Gửi chuyển phát' :
                    selectedRequest.shippingMethod === 'home' ? 'Thu tại nhà' : 'Chưa chọn'
                  }</div>
                  <div style={{ fontSize: 13, color: '#7a4a4a', marginBottom: 8 }}>
                    {selectedRequest.deliveryName && <div>👤 {selectedRequest.deliveryName} - {selectedRequest.deliveryPhone}</div>}
                    {selectedRequest.deliveryAddress && <div>📍 {selectedRequest.deliveryAddress}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {selectedRequest.shippingStatus === 'waiting_receive' && (
                      <button onClick={() => handleStatus(selectedRequest._id, 'accepted', 'received')} style={{ background: '#15803d', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>📦 Đã nhận hàng</button>
                    )}
                    {selectedRequest.shippingStatus === 'received' && (
                      <button onClick={() => handleStatus(selectedRequest._id, 'completed', 'completed')} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>✅ Xác nhận hoàn tất</button>
                    )}
                    {selectedRequest.shippingStatus === 'waiting_delivery' && (
                      <button onClick={() => handleStatus(selectedRequest._id, 'accepted', 'received')} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>📦 Đã nhận hàng</button>
                    )}
                    <button onClick={() => handleStatus(selectedRequest._id, 'cancelled', 'cancelled')} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>🗑️ Hủy</button>
                  </div>
                </div>
              )}

              {/* Chat */}
              <div style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ padding: '10px 12px', background: '#f1f5f9', fontWeight: 700, color: '#1e293b', fontSize: 14 }}>💬 Chat với khách hàng</div>
                <div style={{ padding: 12, height: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(!selectedRequest.messages || selectedRequest.messages.length === 0) ? (
                    <div style={{ textAlign: 'center', color: '#aaa', marginTop: 40 }}>Chưa có tin nhắn</div>
                  ) : selectedRequest.messages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: msg.sender === 'admin' ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        background: msg.sender === 'admin' ? '#dc2626' : '#f1f5f9',
                        color: msg.sender === 'admin' ? 'white' : '#1e293b',
                        padding: '8px 14px', borderRadius: 12, maxWidth: '80%', fontSize: 14
                      }}>
                        <div>{msg.text}</div>
                        <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>{new Date(msg.createdAt).toLocaleTimeString('vi-VN')}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '10px 12px', borderTop: '1px solid #eee', display: 'flex', gap: 8 }}>
                  <input value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} placeholder="Nhập tin nhắn..." style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ddd', outline: 'none' }}
                    onKeyDown={(e) => e.key === 'Enter' && sendChat(selectedRequest._id)} />
                  <button onClick={() => sendChat(selectedRequest._id)} style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, cursor: 'pointer' }}>Gửi</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBuyback;