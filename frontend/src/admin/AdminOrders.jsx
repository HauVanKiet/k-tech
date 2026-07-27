import React, { useState, useEffect } from 'react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);

  const loadOrders = () => {
    const all = JSON.parse(localStorage.getItem('orders') || '[]');
    // Sắp xếp mới nhất lên đầu
    setOrders([...all].reverse());
  };

  useEffect(() => { loadOrders(); }, []);

  const handleConfirm = (index) => {
    if (!window.confirm('Xác nhận đơn hàng này đã thanh toán?')) return;
    const all = JSON.parse(localStorage.getItem('orders') || '[]');
    // index trong mảng gốc (đã reverse) -> cần tìm đúng order
    const realIndex = all.length - 1 - index;
    all[realIndex].status = 'Đã xác nhận';
    all[realIndex].paymentStatus = 'success';
    localStorage.setItem('orders', JSON.stringify(all));
    loadOrders();
    alert('✅ Đã xác nhận đơn hàng thành công!');
  };

  const handleCancel = (index) => {
    if (!window.confirm('Hủy đơn hàng này?')) return;
    const all = JSON.parse(localStorage.getItem('orders') || '[]');
    const realIndex = all.length - 1 - index;
    all[realIndex].status = 'Đã hủy';
    all[realIndex].paymentStatus = 'failed';
    localStorage.setItem('orders', JSON.stringify(all));
    loadOrders();
    alert('🗑️ Đã hủy đơn hàng.');
  };

  const getStatusBadge = (order) => {
    if (order.status === 'Đã xác nhận') {
      return <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: '999px', fontWeight: '700', fontSize: '12px' }}>✅ Đã xác nhận</span>;
    }
    if (order.status === 'Đã hủy') {
      return <span style={{ background: '#fef2f2', color: '#dc2626', padding: '4px 12px', borderRadius: '999px', fontWeight: '700', fontSize: '12px' }}>❌ Đã hủy</span>;
    }
    return <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: '999px', fontWeight: '700', fontSize: '12px' }}>⏳ Chờ xác nhận</span>;
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: '#b91c1c', marginBottom: 8 }}>📋 Quản lý đơn hàng</h2>
      <p style={{ color: '#7f1d1d', marginBottom: 20, fontSize: 14 }}>Xác nhận đơn hàng đã thanh toán từ khách hàng.</p>

      {orders.length === 0 ? (
        <p style={{ color: '#991b1b' }}>Chưa có đơn hàng nào.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map((order, index) => (
            <div key={index} style={{
              background: '#fff',
              borderRadius: 12,
              padding: 16,
              border: '1px solid rgba(220,38,38,0.12)',
              boxShadow: '0 2px 8px rgba(220,38,38,0.06)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#7f1d1d' }}>Mã đơn: {order.orderId}</span>
                  <span style={{ fontSize: 12, color: '#991b1b', marginLeft: 12 }}>🕐 {new Date(order.date).toLocaleString('vi-VN')}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {getStatusBadge(order)}
                </div>
              </div>

              <div style={{ fontSize: 13, color: '#7f1d1d', marginBottom: 8 }}>
                👤 {order.userEmail} | 📞 {order.note?.split('\n')[0] || 'Không có SĐT'} | 📍 {order.address}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                {order.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <img src={item.coverImage} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                    <div style={{ flex: 1, fontSize: 13 }}>
                      <span style={{ fontWeight: 600, color: '#7f1d1d' }}>{item.name}</span>
                      <span style={{ color: '#7a4a4a' }}> x{item.quantity}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#dc2626', fontSize: 13 }}>{Number(item.price * item.quantity).toLocaleString('vi-VN')} đ</span>
                  </div>
                ))}
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid rgba(220,38,38,0.08)', margin: '8px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontSize: 13, color: '#7a4a4a' }}>
                  Phí ship: {order.shippingFee === 0 ? 'Miễn phí' : order.shippingFee.toLocaleString('vi-VN') + ' đ'}
                  <span style={{ fontWeight: 800, color: '#dc2626', fontSize: 16, marginLeft: 12 }}>
                    Tổng: {order.finalTotal.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {order.status === 'Chờ thanh toán' || order.status === 'Chờ xác nhận' ? (
                    <>
                      <button onClick={() => handleConfirm(index)} style={{ background: '#15803d', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                        ✅ Xác nhận
                      </button>
                      <button onClick={() => handleCancel(index)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                        🗑️ Hủy
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;