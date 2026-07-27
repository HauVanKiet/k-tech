import { useState, useEffect } from 'react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [modal, setModal] = useState(null); // { type: 'confirm'|'cancel', index }

  const loadOrders = () => {
    const all = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders([...all].reverse());
  };

  useEffect(() => { loadOrders(); }, []);

  const handleAction = (note) => {
    const all = JSON.parse(localStorage.getItem('orders') || '[]');
    const realIndex = all.length - 1 - modal.index;
    
    if (modal.type === 'confirm') {
      all[realIndex].status = 'Đã xác nhận';
      all[realIndex].paymentStatus = 'success';
    } else {
      all[realIndex].status = 'Đã hủy';
      all[realIndex].paymentStatus = 'failed';
    }
    all[realIndex].adminNote = note || '';
    
    localStorage.setItem('orders', JSON.stringify(all));
    setModal(null);
    loadOrders();
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
                👤 {order.userEmail} | 📍 {order.address}
              </div>

              {order.adminNote && (
                <div style={{ fontSize: 12, color: '#7a4a4a', background: '#f5f5f5', padding: '6px 10px', borderRadius: 6, marginBottom: 6, fontStyle: 'italic' }}>
                  📝 Ghi chú admin: {order.adminNote}
                </div>
              )}

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
                      <button onClick={() => setModal({ type: 'confirm', index })} style={{ background: '#15803d', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                        ✅ Xác nhận
                      </button>
                      <button onClick={() => setModal({ type: 'cancel', index })} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
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

      {/* Modal ghi chú */}
      {modal && (
        <NoteModal
          type={modal.type}
          onClose={() => setModal(null)}
          onSubmit={handleAction}
        />
      )}
    </div>
  );
};

// Modal nhập ghi chú
const NoteModal = ({ type, onClose, onSubmit }) => {
  const [note, setNote] = useState('');
  const isConfirm = type === 'confirm';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div style={{ background: 'white', padding: 24, borderRadius: 12, width: 400, maxWidth: '90%' }}>
        <h3 style={{ margin: '0 0 12px', color: '#7f1d1d' }}>{isConfirm ? '✅ Xác nhận đơn hàng' : '🗑️ Hủy đơn hàng'}</h3>
        <p style={{ fontSize: 14, color: '#7a4a4a', marginBottom: 12 }}>
          {isConfirm ? 'Ghi chú cho việc xác nhận này (không bắt buộc):' : 'Lý do hủy đơn hàng (không bắt buộc):'}
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={isConfirm ? 'VD: Đã kiểm tra và nhận được tiền...' : 'VD: Khách yêu cầu hủy...'}
          rows={3}
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(220,38,38,0.2)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(220,38,38,0.2)', background: '#fff', color: '#7f1d1d', cursor: 'pointer' }}>Hủy</button>
          <button onClick={() => onSubmit(note)} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: isConfirm ? '#15803d' : '#dc2626', color: 'white', fontWeight: 700, cursor: 'pointer'
          }}>
            {isConfirm ? '✅ Xác nhận' : '🗑️ Hủy đơn'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;