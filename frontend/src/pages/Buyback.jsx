import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import { formatPriceInput } from '../utils';

const Buyback = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const [activeTab, setActiveTab] = useState('create');
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [chatMsg, setChatMsg] = useState('');

  const [form, setForm] = useState({
    fullName: user?.fullName || '', phone: user?.phone || '', address: '',
    deviceInfo: '', deviceType: 'Laptop', exteriorCondition: 'Tốt',
    deviceCondition: 'Hoạt động tốt', desiredPrice: ''
  });
  const [displayDesired, setDisplayDesired] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [deliveryForm, setDeliveryForm] = useState({
    shippingMethod: '', deliveryName: user?.fullName || '', deliveryPhone: user?.phone || '', deliveryAddress: ''
  });
  const [showDelivery, setShowDelivery] = useState(false);

  const handleChange = (e) => {
    if (e.target.name === 'desiredPrice') {
      setDisplayDesired(formatPriceInput(e.target.value));
      setForm({ ...form, desiredPrice: e.target.value.replace(/[^0-9]/g, '') });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };
  const handleDeliveryChange = (e) => setDeliveryForm({ ...deliveryForm, [e.target.name]: e.target.value });

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/buyback/my-requests`, { headers });
      setRequests(res.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (user && token) fetchRequests();
  }, [user, token]);

  const toBase64 = (file) => new Promise((resolve, reject) => {
    if (file.size > 500 * 1024) { reject('File quá lớn (>500KB)'); return; }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject('Lỗi đọc file');
    reader.readAsDataURL(file);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.deviceInfo) { alert('Vui lòng điền đầy đủ thông tin'); return; }
    setSubmitting(true);
    try {
      const img1 = document.getElementById('buyback-invoice');
      const img2 = document.getElementById('buyback-device');
      const invoiceFiles = img1?.files ? Array.from(img1.files) : [];
      const deviceFiles = img2?.files ? Array.from(img2.files) : [];
      
      let invoiceUrls = [], deviceUrls = [];
      try { invoiceUrls = await Promise.all(invoiceFiles.map(f => toBase64(f))); } catch(e) { alert(e); setSubmitting(false); return; }
      try { deviceUrls = await Promise.all(deviceFiles.map(f => toBase64(f))); } catch(e) { alert(e); setSubmitting(false); return; }

      const res = await axios.post(`${API_BASE_URL}/api/buyback/request`, {
        ...form, desiredPrice: Number(form.desiredPrice) || 0,
        invoiceImages: invoiceUrls, deviceImages: deviceUrls
      }, { headers });
      alert('✅ ' + res.data.message);
      setForm({ ...form, deviceInfo: '', desiredPrice: '' });
      setDisplayDesired('');
      if (img1) img1.value = '';
      if (img2) img2.value = '';
      fetchRequests();
      setActiveTab('my');
    } catch (err) { alert('❌ ' + (err.response?.data?.error || err.message)); }
    finally { setSubmitting(false); }
  };

  const handleRespond = async (id, action) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/api/buyback/user/respond/${id}`, { action }, { headers });
      if (action === 'accept') { setSelectedRequest(res.data.data); setShowDelivery(true); setDeliveryForm({ ...deliveryForm, shippingMethod: '' }); }
      else { alert(res.data.message); fetchRequests(); }
    } catch (err) { alert('❌ ' + (err.response?.data?.error || err.message)); }
  };

  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    if (!deliveryForm.shippingMethod) { alert('Chọn phương thức giao hàng'); return; }
    try {
      await axios.put(`${API_BASE_URL}/api/buyback/user/shipping/${selectedRequest._id}`, deliveryForm, { headers });
      setShowDelivery(false); setSelectedRequest(null); fetchRequests();
      alert('✅ Đã gửi thông tin giao hàng!');
    } catch (err) { alert('❌ ' + (err.response?.data?.error || err.message)); }
  };

  const sendChat = async (reqId) => {
    if (!chatMsg.trim()) return;
    try {
      await axios.post(`${API_BASE_URL}/api/buyback/chat/${reqId}`, { text: chatMsg }, { headers });
      setChatMsg(''); fetchChat(reqId);
    } catch (err) { alert('Lỗi gửi tin nhắn'); }
  };

  const fetchChat = async (reqId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/buyback/chat/${reqId}`, { headers });
      setSelectedRequest(prev => prev?._id === reqId ? { ...prev, messages: res.data } : prev);
    } catch (err) {}
  };

  const openChat = (req) => { setSelectedRequest(req); fetchChat(req._id); };

  const getStatusBadge = (r) => {
    if (r.status === 'pending') return <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: 999, fontWeight: 700, fontSize: 12 }}>⏳ Chờ định giá</span>;
    if (r.status === 'priced') return <span style={{ background: '#dbeafe', color: '#2563eb', padding: '4px 10px', borderRadius: 999, fontWeight: 700, fontSize: 12 }}>💰 Đã định giá</span>;
    if (r.status === 'accepted') return <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: 999, fontWeight: 700, fontSize: 12 }}>🟡 {r.shippingStatus === 'waiting_delivery' ? 'Chờ giao nhận' : r.shippingStatus === 'waiting_receive' ? 'Chờ thu' : 'Đã chấp nhận'}</span>;
    if (r.status === 'completed') return <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: 999, fontWeight: 700, fontSize: 12 }}>✅ Hoàn tất</span>;
    if (r.status === 'rejected' || r.status === 'cancelled') return <span style={{ background: '#fef2f2', color: '#dc2626', padding: '4px 10px', borderRadius: 999, fontWeight: 700, fontSize: 12 }}>❌ Đã hủy</span>;
  };

  const inp = { width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(220,38,38,0.18)', outline: 'none', boxSizing: 'border-box' };

  if (!user) {
    return <div style={{ textAlign: 'center', padding: 40, color: '#5b1616' }}><h2>Vui lòng đăng nhập</h2><Link to="/login?redirect=/buyback" style={{ color: '#dc2626' }}>Đăng nhập ngay</Link></div>;
  }

  return (
    <div className="ktech-buyback" style={{ maxWidth: 1200, margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, minHeight: '80vh', color: '#5b1616' }}>
      <div className="ktech-buyback-sidebar" style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid rgba(220,38,38,0.1)', height: 'fit-content', position: 'sticky', top: 24 }}>
        <h3 style={{ color: '#7f1d1d', margin: '0 0 16px', fontSize: 16 }}>📦 Thu cũ sản phẩm</h3>
        {[{ key: 'create', label: 'Tạo yêu cầu thu cũ' },{ key: 'my', label: 'Yêu cầu của tôi' },{ key: 'history', label: 'Lịch sử thu cũ' },{ key: 'messages', label: 'Tin nhắn' }].map(tab => (
          <div key={tab.key} onClick={() => { setActiveTab(tab.key); setShowDelivery(false); setSelectedRequest(null); }}
            style={{ padding: '10px 12px', borderRadius: 8, cursor: 'pointer', fontWeight: activeTab === tab.key ? 700 : 500,
              background: activeTab === tab.key ? '#fef2f2' : 'transparent', color: activeTab === tab.key ? '#dc2626' : '#7f1d1d', marginBottom: 4 }}>
            {tab.label}
          </div>
        ))}
      </div>

      <div>
        {activeTab === 'create' && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid rgba(220,38,38,0.1)' }}>
            <h2 style={{ color: '#7f1d1d', marginBottom: 16 }}>📝 Tạo yêu cầu thu cũ</h2>
            <p style={{ fontSize: 13, color: '#7a4a4a', marginBottom: 12 }}>⚠️ Ảnh gửi dạng base64, giới hạn {'<'}500KB/ảnh.</p>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input name="fullName" placeholder="Họ tên *" value={form.fullName} onChange={handleChange} required style={inp} />
                <input name="phone" placeholder="Số điện thoại *" value={form.phone} onChange={handleChange} required style={inp} />
              </div>
              <input name="address" placeholder="Địa chỉ" value={form.address} onChange={handleChange} style={inp} />
              <textarea name="deviceInfo" placeholder="Thông tin thiết bị * (VD: MacBook Pro 2020, i5, 8GB...)" value={form.deviceInfo} onChange={handleChange} required rows={3} style={inp} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <select name="deviceType" value={form.deviceType} onChange={handleChange} style={inp}>
                  <option>Laptop</option><option>Điện thoại</option><option>Máy tính bảng</option><option>Đồng hồ</option><option>Linh kiện</option><option>Khác</option>
                </select>
                <select name="exteriorCondition" value={form.exteriorCondition} onChange={handleChange} style={inp}>
                  <option>Mới</option><option>Rất tốt</option><option>Tốt</option><option>Trung bình</option><option>Kém</option>
                </select>
                <select name="deviceCondition" value={form.deviceCondition} onChange={handleChange} style={inp}>
                  <option>Hoạt động tốt</option><option>Hoạt động bình thường</option><option>Lỗi nhẹ</option><option>Lỗi nặng</option><option>Không hoạt động</option>
                </select>
              </div>
              <input name="desiredPrice" placeholder="Mức giá mong muốn (VNĐ) - tự động format" value={displayDesired} onChange={handleChange} style={inp} />
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#991b1b', marginBottom: 4, fontWeight: 600 }}>📎 Đính kèm hóa đơn (nếu có)</label>
                <input id="buyback-invoice" type="file" accept="image/*" multiple style={{ fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#991b1b', marginBottom: 4, fontWeight: 600 }}>📸 Đính kèm hình ảnh thiết bị</label>
                <input id="buyback-device" type="file" accept="image/*" multiple style={{ fontSize: 13 }} />
              </div>
              <button type="submit" disabled={submitting} style={{
                padding: 12, background: submitting ? '#7f8c8d' : '#dc2626', color: 'white', border: 'none',
                borderRadius: 8, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 16
              }}>{submitting ? 'Đang gửi...' : '📤 Gửi yêu cầu'}</button>
            </form>
          </div>
        )}

        {activeTab === 'my' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ color: '#7f1d1d' }}>📋 Yêu cầu thu cũ của tôi</h2>
            {requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled' && r.status !== 'rejected').length === 0 ? (
              <p style={{ color: '#991b1b' }}>Không có yêu cầu nào đang xử lý.</p>
            ) : (
              requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled' && r.status !== 'rejected').map(r => (
                <div key={r._id} style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid rgba(220,38,38,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontWeight: 700, color: '#7f1d1d' }}>{r.deviceInfo}</span>
                    {getStatusBadge(r)}
                  </div>
                  <div style={{ fontSize: 13, color: '#7a4a4a', marginBottom: 8 }}>{r.deviceType} | Giá mong muốn: {Number(r.desiredPrice).toLocaleString('vi-VN')}đ</div>
                  {r.status === 'priced' && r.adminPrice && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, color: '#15803d' }}>💰 Giá admin đề xuất: {Number(r.adminPrice).toLocaleString('vi-VN')}đ</div>
                      {r.adminNote && <div style={{ fontSize: 13, color: '#166534', marginTop: 4 }}>📝 {r.adminNote}</div>}
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button onClick={() => handleRespond(r._id, 'accept')} style={{ background: '#15803d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>✅ Đồng ý</button>
                        <button onClick={() => handleRespond(r._id, 'reject')} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>❌ Từ chối</button>
                      </div>
                    </div>
                  )}
                  {r.status === 'accepted' && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 13, color: '#7a4a4a', marginBottom: 4 }}>📦 Phương thức: {r.shippingMethod === 'store' ? 'Gửi tại cửa hàng' : r.shippingMethod === 'shipping' ? 'Gửi chuyển phát' : r.shippingMethod === 'home' ? 'Thu tại nhà' : 'Chưa chọn'}</div>
                    </div>
                  )}
                  <div style={{ marginTop: 8 }}>
                    <button onClick={() => openChat(r)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>💬 Chat với admin</button>
                  </div>
                </div>
              ))
            )}
            {showDelivery && selectedRequest && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                <div style={{ background: 'white', padding: 24, borderRadius: 12, width: 500, maxWidth: '95%' }}>
                  <h3 style={{ color: '#7f1d1d', marginBottom: 12 }}>📦 Chọn phương thức giao hàng</h3>
                  <form onSubmit={handleShippingSubmit} style={{ display: 'grid', gap: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[{ value: 'store', label: 'Gửi máy tại cửa hàng', note: 'Mang thiết bị đến cửa hàng K_Tech để kiểm tra.' },{ value: 'shipping', label: 'Gửi qua chuyển phát', note: '⚠️ Vui lòng quay video đóng gói hàng và đính kèm ảnh trước/sau đóng gói.' },{ value: 'home', label: 'Thu tại nhà', note: '📍 Chỉ áp dụng tại TP.HCM. Phí di chuyển tính thêm nếu khoảng cách ≥ 10km.' }].map(opt => (
                        <label key={opt.value} onClick={() => setDeliveryForm({ ...deliveryForm, shippingMethod: opt.value })}
                          style={{ display: 'block', padding: 12, borderRadius: 8, border: deliveryForm.shippingMethod === opt.value ? '2px solid #dc2626' : '1px solid rgba(220,38,38,0.15)', cursor: 'pointer', background: deliveryForm.shippingMethod === opt.value ? '#fff5f5' : '#fff' }}>
                          <div style={{ fontWeight: 700, color: '#7f1d1d', marginBottom: 4 }}>{opt.label}</div>
                          <div style={{ fontSize: 12, color: '#7a4a4a' }}>{opt.note}</div>
                        </label>
                      ))}
                    </div>
                    {deliveryForm.shippingMethod && (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <input name="deliveryName" placeholder="Họ tên người gửi" value={deliveryForm.deliveryName} onChange={handleDeliveryChange} required style={inp} />
                          <input name="deliveryPhone" placeholder="Số điện thoại" value={deliveryForm.deliveryPhone} onChange={handleDeliveryChange} required style={inp} />
                        </div>
                        <input name="deliveryAddress" placeholder="Địa chỉ gửi hàng" value={deliveryForm.deliveryAddress} onChange={handleDeliveryChange} required style={inp} />
                      </>
                    )}
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => { setShowDelivery(false); setSelectedRequest(null); }} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(220,38,38,0.2)', background: '#fff', color: '#7f1d1d', cursor: 'pointer' }}>Hủy</button>
                      <button type="submit" disabled={!deliveryForm.shippingMethod} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: deliveryForm.shippingMethod ? '#dc2626' : '#ccc', color: 'white', fontWeight: 700, cursor: deliveryForm.shippingMethod ? 'pointer' : 'not-allowed' }}>✅ Xác nhận</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h2 style={{ color: '#7f1d1d' }}>📜 Lịch sử thu cũ</h2>
            {requests.filter(r => r.status === 'completed' || r.status === 'cancelled' || r.status === 'rejected').length === 0 ? (
              <p style={{ color: '#991b1b' }}>Chưa có lịch sử thu cũ.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {requests.filter(r => r.status === 'completed' || r.status === 'cancelled' || r.status === 'rejected').map(r => (
                  <div key={r._id} style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid rgba(220,38,38,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ fontWeight: 700, color: '#7f1d1d' }}>{r.deviceInfo}</span>
                      {getStatusBadge(r)}
                    </div>
                    <div style={{ fontSize: 13, color: '#7a4a4a', marginBottom: 4 }}>
                      📅 {new Date(r.createdAt).toLocaleString('vi-VN')} | {r.deviceType}
                      {r.adminPrice ? ` | Giá thu: ${Number(r.adminPrice).toLocaleString('vi-VN')}đ` : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div>
            <h2 style={{ color: '#7f1d1d' }}>💬 Tin nhắn</h2>
            {requests.filter(r => r.messages && r.messages.length > 0).length === 0 ? (
              <p style={{ color: '#991b1b' }}>Chưa có tin nhắn nào.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {requests.filter(r => r.messages && r.messages.length > 0).map(r => {
                  const lastMsg = r.messages[r.messages.length - 1];
                  const unread = r.messages.filter(m => m.sender === 'admin').length;
                  return (
                    <div key={r._id} onClick={() => { setSelectedRequest(r); fetchChat(r._id); }}
                      style={{ background: '#fff', borderRadius: 12, padding: 16, cursor: 'pointer', border: selectedRequest?._id === r._id ? '2px solid #dc2626' : '1px solid rgba(220,38,38,0.1)', display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>💬</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: '#7f1d1d', fontSize: 14, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.deviceInfo}</div>
                        <div style={{ color: '#7a4a4a', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastMsg?.text || ''}</div>
                        <div style={{ color: '#991b1b', fontSize: 11, marginTop: 2 }}>{new Date(lastMsg?.createdAt || r.createdAt).toLocaleString('vi-VN')}</div>
                      </div>
                      {unread > 0 && <span style={{ background: '#dc2626', color: 'white', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{unread}</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {selectedRequest && selectedRequest.messages !== undefined && (activeTab === 'my' || activeTab === 'messages') && !showDelivery && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ background: 'white', borderRadius: 12, width: 450, maxWidth: '95%', padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', background: '#dc2626', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>💬 Chat với admin - {selectedRequest.deviceInfo}</span>
                <button onClick={() => setSelectedRequest(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 20 }}>×</button>
              </div>
              <div style={{ padding: 16, height: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(!selectedRequest.messages || selectedRequest.messages.length === 0) ? (
                  <div style={{ textAlign: 'center', color: '#aaa', marginTop: 40 }}>Chưa có tin nhắn</div>
                ) : selectedRequest.messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      background: msg.sender === 'user' ? '#dc2626' : '#f1f5f9',
                      color: msg.sender === 'user' ? 'white' : '#1e293b',
                      padding: '8px 14px', borderRadius: 12, maxWidth: '80%', fontSize: 14
                    }}>
                      <div>{msg.text}</div>
                      <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>{new Date(msg.createdAt).toLocaleTimeString('vi-VN')}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px 16px', borderTop: '1px solid #eee', display: 'flex', gap: 8 }}>
                <input value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} placeholder="Nhập tin nhắn..." style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ddd', outline: 'none' }}
                  onKeyDown={(e) => e.key === 'Enter' && sendChat(selectedRequest._id)} />
                <button onClick={() => sendChat(selectedRequest._id)} style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, cursor: 'pointer' }}>Gửi</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Buyback;