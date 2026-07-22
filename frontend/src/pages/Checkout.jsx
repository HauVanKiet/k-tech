import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../api';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    note: '',
  });

  const total = getCartTotal();
  const shippingFee = total >= 1000000 ? 0 : 30000;
  const finalTotal = total + shippingFee;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.email || !form.address) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng.');
      return;
    }

    setLoading(true);

    try {
      // Gọi API SePay để tạo QR thanh toán
      const paymentRes = await axios.post(`${API_BASE_URL}/api/sepay/create-payment`, {
        amount: finalTotal,
        customerName: form.fullName,
      });

      if (paymentRes.data.success) {
        setPaymentInfo(paymentRes.data.data);

        // Lưu đơn hàng vào localStorage
        const orderId = paymentRes.data.data.orderId;
        const newOrder = {
          orderId: orderId,
          userEmail: user?.email,
          date: new Date().toISOString(),
          items: [...cartItems],
          address: form.address,
          note: form.note,
          paymentMethod: 'Chuyển khoản',
          shippingFee,
          finalTotal,
          status: 'Chờ thanh toán',
          paymentStatus: 'pending',
        };
        
        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        existingOrders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(existingOrders));
      }
    } catch (error) {
      alert('Lỗi tạo thanh toán: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = () => {
    // Cập nhật trạng thái đơn hàng
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const updatedOrders = orders.map(o => 
      o.orderId === paymentInfo?.orderId 
        ? { ...o, status: 'Đã xác nhận', paymentStatus: 'success' } 
        : o
    );
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    clearCart();
    setOrderPlaced(true);
  };

  if (!user) {
    navigate('/login?redirect=/checkout');
    return null;
  }

  if (cartItems.length === 0 && !orderPlaced && !paymentInfo) {
    return (
      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px', textAlign: 'center', color: '#5b1616' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒</div>
        <h2 style={{ color: '#7f1d1d' }}>Giỏ hàng trống</h2>
        <p style={{ color: '#991b1b', marginBottom: '24px' }}>Không có sản phẩm để thanh toán.</p>
        <Link to="/" style={{
          display: 'inline-block', background: 'linear-gradient(90deg, #dc2626, #ef4444)',
          color: 'white', padding: '12px 24px', borderRadius: '999px',
          textDecoration: 'none', fontWeight: '700',
        }}>← Mua sắm ngay</Link>
      </div>
    );
  }

  if (paymentInfo && !orderPlaced) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px 48px', color: '#5b1616' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ color: '#7f1d1d', fontSize: '28px', marginBottom: '8px' }}>💳 Quét mã để thanh toán</h2>
          <p style={{ color: '#7a4a4a' }}>Vui lòng chuyển khoản theo thông tin bên dưới để hoàn tất đơn hàng</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          alignItems: 'start',
        }}>
          {/* QR Code */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(220,38,38,0.12)',
            boxShadow: '0 4px 16px rgba(220,38,38,0.06)',
            textAlign: 'center',
          }}>
            <img 
              src={paymentInfo.qrUrl} 
              alt="QR thanh toán"
              style={{ width: '100%', maxWidth: '320px', borderRadius: '12px' }}
            />
            <p style={{ marginTop: '12px', fontSize: '13px', color: '#7a4a4a' }}>
              Quét mã bằng ứng dụng ngân hàng để chuyển khoản
            </p>
          </div>

          {/* Thông tin chuyển khoản */}
          <div style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #fff7f7 100%)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(220,38,38,0.12)',
            boxShadow: '0 4px 16px rgba(220,38,38,0.06)',
          }}>
            <h3 style={{ color: '#7f1d1d', margin: '0 0 16px', fontSize: '18px' }}>🏦 Thông tin chuyển khoản</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#fff5f5', padding: '10px 14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', color: '#991b1b' }}>Ngân hàng</div>
                <div style={{ fontWeight: '700', color: '#7f1d1d' }}>{paymentInfo.bank}</div>
              </div>
              <div style={{ background: '#fff5f5', padding: '10px 14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', color: '#991b1b' }}>Số tài khoản</div>
                <div style={{ fontWeight: '700', color: '#7f1d1d', fontSize: '18px', letterSpacing: '2px' }}>{paymentInfo.accountNumber}</div>
              </div>
              <div style={{ background: '#fff5f5', padding: '10px 14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', color: '#991b1b' }}>Chủ tài khoản</div>
                <div style={{ fontWeight: '700', color: '#7f1d1d' }}>{paymentInfo.accountName}</div>
              </div>
              <div style={{ background: '#fff5f5', padding: '10px 14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', color: '#991b1b' }}>Số tiền</div>
                <div style={{ fontWeight: '800', color: '#dc2626', fontSize: '22px' }}>{finalTotal.toLocaleString('vi-VN')} đ</div>
              </div>
              <div style={{ background: '#fff5f5', padding: '10px 14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', color: '#991b1b' }}>Nội dung chuyển khoản</div>
                <div style={{ fontWeight: '700', color: '#7f1d1d', fontSize: '14px' }}>{paymentInfo.content}</div>
              </div>
            </div>

            <div style={{ background: '#fff7ed', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '10px', padding: '12px', marginTop: '16px' }}>
              <div style={{ fontSize: '12px', color: '#9a3412', lineHeight: 1.6 }}>
                ⚠️ Sau khi chuyển khoản, vui lòng nhấn "Đã chuyển khoản" để xác nhận đơn hàng.
                <br />Đơn hàng sẽ được xử lý sau khi nhận được thanh toán.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                onClick={handleConfirmPayment}
                style={{
                  flex: 1,
                  background: 'linear-gradient(90deg, #dc2626, #ef4444)',
                  color: 'white', border: 'none', padding: '14px',
                  borderRadius: '999px', fontWeight: '700', fontSize: '16px',
                  cursor: 'pointer',
                }}
              >✅ Đã chuyển khoản</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', padding: '40px 24px', textAlign: 'center', color: '#5b1616' }}>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>🎉</div>
        <h2 style={{ color: '#15803d', fontSize: '32px', marginBottom: '12px' }}>Đặt hàng thành công!</h2>
        <p style={{ color: '#7a4a4a', fontSize: '16px', lineHeight: 1.6, marginBottom: '30px' }}>
          Cảm ơn bạn <strong>{form.fullName}</strong> đã đặt hàng tại K_Tech.<br />
          Chúng tôi sẽ gọi điện xác nhận đơn hàng qua số <strong>{form.phone}</strong> trong thời gian sớm nhất.
        </p>
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px',
          padding: '20px', marginBottom: '30px', color: '#166534', textAlign: 'left',
        }}>
          <div style={{ fontWeight: '700', marginBottom: '12px' }}>📦 Thông tin đơn hàng</div>
          <div style={{ fontSize: '14px', lineHeight: 1.8 }}>
            <div>• Mã đơn: <strong>{paymentInfo?.orderId}</strong></div>
            <div>• Phương thức thanh toán: <strong>Chuyển khoản ngân hàng</strong></div>
            <div>• Địa chỉ giao hàng: <strong>{form.address}</strong></div>
            <div>• Phí vận chuyển: <strong>{shippingFee === 0 ? 'Miễn phí' : shippingFee.toLocaleString('vi-VN') + ' đ'}</strong></div>
            <div>• Tổng tiền: <strong style={{ color: '#dc2626' }}>{finalTotal.toLocaleString('vi-VN')} đ</strong></div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/orders" style={{
            display: 'inline-block', background: 'linear-gradient(90deg, #dc2626, #ef4444)',
            color: 'white', padding: '14px 32px', borderRadius: '999px',
            textDecoration: 'none', fontWeight: '700', fontSize: '16px',
          }}>📋 Theo dõi đơn hàng</Link>
          <Link to="/" style={{
            display: 'inline-block', background: '#fff', color: '#dc2626',
            border: '1px solid rgba(220,38,38,0.25)', padding: '14px 32px', borderRadius: '999px',
            textDecoration: 'none', fontWeight: '700', fontSize: '16px',
          }}>← Về trang chủ</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 48px', color: '#5b1616' }}>
      <h2 style={{ color: '#7f1d1d', fontSize: '28px', marginBottom: '8px' }}>Thanh toán</h2>
      <p style={{ color: '#7a4a4a', marginBottom: '28px' }}>Nhập thông tin giao hàng và tiến hành thanh toán qua chuyển khoản.</p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px', alignItems: 'start' }}>
          {/* Left - Shipping form */}
          <div style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #fff7f7 100%)',
            borderRadius: '16px', padding: '24px',
            border: '1px solid rgba(220,38,38,0.12)',
            boxShadow: '0 4px 16px rgba(220,38,38,0.06)',
          }}>
            <h3 style={{ color: '#7f1d1d', margin: '0 0 20px', fontSize: '18px' }}>📍 Thông tin giao hàng</h3>
            
            <div style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#991b1b', marginBottom: '4px', fontWeight: '600' }}>Họ và tên *</label>
                <input name="fullName" value={form.fullName} onChange={handleChange} required
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(220,38,38,0.18)', outline: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#991b1b', marginBottom: '4px', fontWeight: '600' }}>Số điện thoại *</label>
                  <input name="phone" value={form.phone} onChange={handleChange} required
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(220,38,38,0.18)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#991b1b', marginBottom: '4px', fontWeight: '600' }}>Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(220,38,38,0.18)', outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#991b1b', marginBottom: '4px', fontWeight: '600' }}>Địa chỉ giao hàng *</label>
                <input name="address" value={form.address} onChange={handleChange} required placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(220,38,38,0.18)', outline: 'none' }} />
                <div style={{ marginTop: '6px', fontSize: '12px', color: '#991b1b', fontStyle: 'italic', background: '#fef2f2', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(220,38,38,0.15)' }}>
                  ⚠️ Vui lòng nhập đầy đủ số nhà, tên đường, thành phố, tỉnh, xã,...
                </div>
                <div style={{ marginTop: '6px', fontSize: '12px', color: '#7a4a4a', fontStyle: 'italic', background: '#fff7ed', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(249,115,22,0.2)' }}>
                  📌 Lưu ý: Phí ship mặc định là 30.000₫. Đơn trên 1.000.000₫ sẽ được <strong style={{ color: '#15803d' }}>free ship</strong>.
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#991b1b', marginBottom: '4px', fontWeight: '600' }}>Ghi chú (không bắt buộc)</label>
                <textarea name="note" value={form.note} onChange={handleChange} rows={3} placeholder="Ghi chú cho đơn hàng..."
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(220,38,38,0.18)', outline: 'none', resize: 'vertical' }} />
              </div>

              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#991b1b', marginBottom: '8px', fontWeight: '600' }}>Phương thức thanh toán</label>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
                  borderRadius: '10px', border: '2px solid #dc2626',
                  background: '#fff5f5',
                }}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#7f1d1d' }}>🏦 Chuyển khoản ngân hàng (QR Code)</div>
                    <div style={{ fontSize: '12px', color: '#7a4a4a', marginTop: '4px' }}>
                      Thanh toán qua VietQR - Quét mã để chuyển khoản
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Order summary */}
          <div style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #fff7f7 100%)',
            borderRadius: '16px', padding: '24px',
            border: '1px solid rgba(220,38,38,0.12)',
            boxShadow: '0 4px 16px rgba(220,38,38,0.06)',
            position: 'sticky', top: '24px',
          }}>
            <h3 style={{ color: '#7f1d1d', margin: '0 0 16px', fontSize: '18px' }}>📋 Đơn hàng của bạn</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              {cartItems.map(item => (
                <div key={item._id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <img src={item.coverImage} alt={item.name}
                    style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(220,38,38,0.08)' }} />
                  <div style={{ flex: 1, fontSize: '13px' }}>
                    <div style={{ fontWeight: '600', color: '#7f1d1d' }}>{item.name}</div>
                    <div style={{ color: '#7a4a4a' }}>SL: {item.quantity}</div>
                  </div>
                  <div style={{ fontWeight: '700', color: '#dc2626', fontSize: '14px', whiteSpace: 'nowrap' }}>
                    {Number(item.price * item.quantity).toLocaleString('vi-VN')} đ
                  </div>
                </div>
              ))}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(220,38,38,0.12)', margin: '0 0 14px' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#7a4a4a' }}>
              <span>Tạm tính</span>
              <span style={{ fontWeight: '600', color: '#5b1616' }}>{total.toLocaleString('vi-VN')} đ</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#7a4a4a' }}>
              <span>Phí vận chuyển</span>
              {shippingFee === 0 ? (
                <span style={{ color: '#15803d', fontWeight: '600' }}>Miễn phí</span>
              ) : (
                <span style={{ fontWeight: '600', color: '#5b1616' }}>{shippingFee.toLocaleString('vi-VN')} đ</span>
              )}
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid rgba(220,38,38,0.12)', margin: '8px 0 14px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '18px' }}>
              <span style={{ fontWeight: '700', color: '#7f1d1d' }}>Tổng cộng</span>
              <span style={{ fontWeight: '800', color: '#dc2626', fontSize: '22px' }}>{finalTotal.toLocaleString('vi-VN')} đ</span>
            </div>

            <button type="submit" disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#7f8c8d' : 'linear-gradient(90deg, #dc2626, #ef4444)',
                color: 'white', border: 'none', padding: '14px',
                borderRadius: '999px', fontWeight: '700', fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '10px',
              }}
            >{loading ? '⏳ Đang tạo mã QR...' : '💳 Tiến hành thanh toán'}</button>

            <Link to="/cart" style={{
              display: 'block', textAlign: 'center', color: '#7f1d1d',
              textDecoration: 'none', fontSize: '14px', fontWeight: '600',
            }}>← Quay lại giỏ hàng</Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;