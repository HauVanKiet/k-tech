import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?redirect=/cart');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px', textAlign: 'center', color: '#5b1616' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒</div>
        <h2 style={{ color: '#7f1d1d' }}>Giỏ hàng trống</h2>
        <p style={{ color: '#991b1b', marginBottom: '24px' }}>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
        <Link to="/" style={{
          display: 'inline-block',
          background: 'linear-gradient(90deg, #dc2626, #ef4444)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '999px',
          textDecoration: 'none',
          fontWeight: '700',
        }}>
          ← Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 48px', color: '#5b1616' }}>
      <h2 style={{ color: '#7f1d1d', fontSize: '28px', marginBottom: '24px' }}>🛒 Giỏ hàng của bạn</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cartItems.map(item => (
            <div key={item._id} style={{
              display: 'flex',
              gap: '16px',
              background: 'linear-gradient(145deg, #ffffff 0%, #fff7f7 100%)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid rgba(220,38,38,0.12)',
              boxShadow: '0 4px 16px rgba(220,38,38,0.06)',
            }}>
              <Link to={`/product/${item._id}`} style={{ flexShrink: 0, width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(220,38,38,0.08)' }}>
                <img src={item.coverImage} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Link>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <Link to={`/product/${item._id}`} style={{ textDecoration: 'none', color: '#7f1d1d', fontWeight: '700', fontSize: '18px' }}>{item.name}</Link>
                  <div style={{ marginTop: '4px', color: '#991b1b', fontSize: '13px' }}>{item.category}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      style={{
                        width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(220,38,38,0.2)',
                        background: '#fff', color: '#dc2626', cursor: 'pointer', fontWeight: '700', fontSize: '16px',
                      }}
                    >−</button>
                    <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: '700', color: '#7f1d1d' }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      style={{
                        width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(220,38,38,0.2)',
                        background: '#fff', color: '#dc2626', cursor: 'pointer', fontWeight: '700', fontSize: '16px',
                      }}
                    >+</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: '#dc2626', fontWeight: '800', fontSize: '18px' }}>
                      {Number(item.price * item.quantity).toLocaleString('vi-VN')} đ
                    </span>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      style={{
                        border: 'none', background: 'transparent', color: '#b91c1c',
                        cursor: 'pointer', fontSize: '20px', padding: '4px',
                      }}
                      title="Xóa"
                    >🗑️</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #fff7f7 100%)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(220,38,38,0.12)',
          boxShadow: '0 4px 16px rgba(220,38,38,0.06)',
          position: 'sticky',
          top: '24px',
        }}>
          <h3 style={{ color: '#7f1d1d', margin: '0 0 20px', fontSize: '20px' }}>Tóm tắt đơn hàng</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#7a4a4a' }}>
            <span>Tạm tính ({cartItems.reduce((t, i) => t + i.quantity, 0)} sản phẩm)</span>
            <span style={{ fontWeight: '700', color: '#5b1616' }}>{getCartTotal().toLocaleString('vi-VN')} đ</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: '#7a4a4a' }}>
            <span>Phí vận chuyển</span>
            <span style={{ color: '#15803d', fontWeight: '600' }}>Tính tại bước thanh toán</span>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid rgba(220,38,38,0.12)', margin: '0 0 16px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '18px' }}>
            <span style={{ fontWeight: '700', color: '#7f1d1d' }}>Tổng cộng</span>
            <span style={{ fontWeight: '800', color: '#dc2626', fontSize: '22px' }}>{getCartTotal().toLocaleString('vi-VN')} đ</span>
          </div>
          <button
            onClick={handleCheckout}
            style={{
              width: '100%',
              background: 'linear-gradient(90deg, #dc2626, #ef4444)',
              color: 'white',
              border: 'none',
              padding: '14px',
              borderRadius: '999px',
              fontWeight: '700',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '10px',
            }}
          >Tiến hành thanh toán</button>
          <Link to="/" style={{
            display: 'block', textAlign: 'center', color: '#7f1d1d',
            textDecoration: 'none', fontSize: '14px', fontWeight: '600',
          }}>← Tiếp tục mua sắm</Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;