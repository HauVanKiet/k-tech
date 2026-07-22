import React from 'react';
import { Link } from 'react-router-dom';

const OrderHistory = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const orders = JSON.parse(localStorage.getItem('orders') || '[]').filter(o => o.userEmail === user?.email);

  if (!user) {
    return (
      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px', textAlign: 'center', color: '#5b1616' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ color: '#7f1d1d' }}>Vui lòng đăng nhập</h2>
        <p style={{ color: '#991b1b', marginBottom: '24px' }}>Bạn cần đăng nhập để xem lịch sử đặt hàng.</p>
        <Link to="/login?redirect=/orders" style={{
          display: 'inline-block', background: 'linear-gradient(90deg, #dc2626, #ef4444)',
          color: 'white', padding: '12px 24px', borderRadius: '999px',
          textDecoration: 'none', fontWeight: '700',
        }}>Đăng nhập ngay</Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px', textAlign: 'center', color: '#5b1616' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
        <h2 style={{ color: '#7f1d1d' }}>Chưa có đơn hàng nào</h2>
        <p style={{ color: '#991b1b', marginBottom: '24px' }}>Bạn chưa đặt mua sản phẩm nào tại K_Tech.</p>
        <Link to="/" style={{
          display: 'inline-block', background: 'linear-gradient(90deg, #dc2626, #ef4444)',
          color: 'white', padding: '12px 24px', borderRadius: '999px',
          textDecoration: 'none', fontWeight: '700',
        }}>← Mua sắm ngay</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 48px', color: '#5b1616' }}>
      <h2 style={{ color: '#7f1d1d', fontSize: '28px', marginBottom: '8px' }}>📋 Lịch sử đặt hàng</h2>
      <p style={{ color: '#7a4a4a', marginBottom: '28px' }}>Theo dõi các đơn hàng đã đặt tại K_Tech.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {[...orders].reverse().map((order, index) => (
          <div key={index} style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #fff7f7 100%)',
            borderRadius: '16px', padding: '20px',
            border: '1px solid rgba(220,38,38,0.12)',
            boxShadow: '0 4px 16px rgba(220,38,38,0.06)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '13px', color: '#7a4a4a' }}>Đơn hàng #{index + 1}</span>
                <span style={{ fontSize: '12px', color: '#991b1b', marginLeft: '12px' }}>🕐 {new Date(order.date).toLocaleString('vi-VN')}</span>
              </div>
              <span style={{
                background: '#dcfce7', color: '#15803d', padding: '4px 12px',
                borderRadius: '999px', fontWeight: '700', fontSize: '12px',
              }}>✅ Đã xác nhận</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
              {order.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <img src={item.coverImage} alt={item.name}
                    style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(220,38,38,0.08)' }} />
                  <div style={{ flex: 1, fontSize: '13px' }}>
                    <div style={{ fontWeight: '600', color: '#7f1d1d' }}>{item.name}</div>
                    <div style={{ color: '#7a4a4a' }}>SL: {item.quantity} x {Number(item.price).toLocaleString('vi-VN')} đ</div>
                  </div>
                  <div style={{ fontWeight: '700', color: '#dc2626', fontSize: '14px', whiteSpace: 'nowrap' }}>
                    {Number(item.price * item.quantity).toLocaleString('vi-VN')} đ
                  </div>
                </div>
              ))}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(220,38,38,0.08)', margin: '0 0 12px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '13px', color: '#7a4a4a' }}>
              <div>
                <div>📍 {order.address}</div>
                <div>💳 {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>Phí ship: {order.shippingFee === 0 ? 'Miễn phí' : order.shippingFee.toLocaleString('vi-VN') + ' đ'}</div>
                <div style={{ fontWeight: '800', color: '#dc2626', fontSize: '16px', marginTop: '4px' }}>
                  Tổng: {order.finalTotal.toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;