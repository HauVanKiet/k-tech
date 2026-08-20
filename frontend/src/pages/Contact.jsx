import { useState } from 'react';
import { Link } from 'react-router-dom';

const Contact = () => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: 'Tư vấn sản phẩm', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Demo: hiện thông báo đã gửi (có thể nối backend sau này)
    setSent(true);
    setForm({ name: '', phone: '', email: '', subject: 'Tư vấn sản phẩm', message: '' });
    setTimeout(() => setSent(false), 5000);
  };

  const contactInfo = [
    { icon: '📍', label: 'Địa chỉ', value: '320/45M Tôn Thất Hiệp Phường Phú Thọ, TP.HCM' },
    { icon: '📞', label: 'Hotline', value: '0932643541 (8h - 21h hàng ngày)' },
    { icon: '✉️', label: 'Email', value: 'ravens1706@gmail.com' },
    { icon: '🕐', label: 'Giờ làm việc', value: 'Thứ 2 - Chủ nhật: 8h00 - 21h00' },
  ];

  return (
    <div style={{ padding: '40px 24px 60px', maxWidth: '1100px', margin: '0 auto', color: '#5b1616' }}>
      <Link to="/" style={{ color: '#dc2626', textDecoration: 'none', fontWeight: '700', display: 'inline-block', marginBottom: '24px' }}>← Quay lại trang chủ</Link>

      {/* HERO */}
      <div style={{ textAlign: 'center', padding: '40px 24px', background: 'linear-gradient(145deg, #ffffff 0%, #fff4f4 100%)', borderRadius: '24px', border: '1px solid rgba(220,38,38,0.14)', boxShadow: '0 18px 50px rgba(220,38,38,0.1)', marginBottom: '40px' }}>
        <h1 style={{ margin: '0 0 12px', fontSize: '32px', color: '#7f1d1d' }}>📬 Liên hệ K_Tech</h1>
        <p style={{ color: '#7a4a4a', fontSize: '16px', maxWidth: '640px', margin: '0 auto', lineHeight: 1.7 }}>
          Bạn cần tư vấn cấu hình, hỗ trợ kỹ thuật hay muốn thu cũ - đổi mới? Đội ngũ K_Tech luôn sẵn sàng hỗ trợ bạn 24/7.
        </p>
      </div>

      {/* THÔNG TIN LIÊN HỆ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '18px', marginBottom: '40px' }}>
        {contactInfo.map((c, i) => (
          <div key={i} style={{ background: '#fff7f7', border: '1px solid rgba(220,38,38,0.12)', borderRadius: '16px', padding: '20px', textAlign: 'center', boxShadow: '0 10px 28px rgba(220,38,38,0.06)' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{c.icon}</div>
            <div style={{ fontSize: '13px', color: '#991b1b', fontWeight: '700', marginBottom: '4px' }}>{c.label}</div>
            <div style={{ fontSize: '14px', color: '#7f1d1d' }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="ktech-contact-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '28px', alignItems: 'start' }}>
        {/* FORM */}
        <div style={{ background: 'linear-gradient(145deg, #ffffff 0%, #fff7f7 100%)', border: '1px solid rgba(220,38,38,0.12)', borderRadius: '20px', padding: '28px', boxShadow: '0 14px 40px rgba(220,38,38,0.08)' }}>
          <h2 style={{ margin: '0 0 20px', color: '#7f1d1d', fontSize: '22px' }}>✍️ Gửi yêu cầu cho chúng tôi</h2>
          {sent && (
            <div style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontWeight: '600' }}>
              ✅ Cảm ơn bạn! Yêu cầu đã được ghi nhận. K_Tech sẽ phản hồi trong thời gian sớm nhất.
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Họ và tên *" required style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(220,38,38,0.2)', outline: 'none', color: '#5b1616' }} />
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Số điện thoại *" required style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(220,38,38,0.2)', outline: 'none', color: '#5b1616' }} />
            </div>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email *" required style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(220,38,38,0.2)', outline: 'none', color: '#5b1616' }} />
            <select name="subject" value={form.subject} onChange={handleChange} style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(220,38,38,0.2)', outline: 'none', color: '#5b1616', background: 'white' }}>
              <option>Tư vấn sản phẩm</option>
              <option>Thu cũ - Đổi mới</option>
              <option>Bảo hành & sửa chữa</option>
              <option>Khiếu nại / Góp ý</option>
              <option>Khác</option>
            </select>
            <textarea name="message" value={form.message} onChange={handleChange} placeholder="Nội dung yêu cầu *" rows="5" required style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(220,38,38,0.2)', outline: 'none', color: '#5b1616', resize: 'vertical' }}></textarea>
            <button type="submit" style={{ background: 'linear-gradient(90deg, #dc2626, #ef4444)', color: 'white', border: 'none', borderRadius: '999px', padding: '14px 20px', fontWeight: '700', cursor: 'pointer', fontSize: '15px', boxShadow: '0 8px 20px rgba(220,38,38,0.3)' }}>
              📨 Gửi liên hệ
            </button>
          </form>
        </div>

        {/* BẢN ĐỒ / CSKH */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#fffaf5', border: '1px solid rgba(220,38,38,0.12)', borderRadius: '20px', padding: '24px', boxShadow: '0 14px 40px rgba(220,38,38,0.08)' }}>
            <h3 style={{ margin: '0 0 14px', color: '#7f1d1d' }}>🏢 Hệ thống cửa hàng</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'white', borderRadius: '12px', padding: '14px', border: '1px solid rgba(220,38,38,0.08)' }}>
                <div style={{ fontWeight: '700', color: '#7f1d1d', marginBottom: '4px' }}>Cửa hàng chính - Quận 1</div>
                <div style={{ fontSize: '13px', color: '#7a4a4a' }}>320/45M Tôn Thất Hiệp, Phường Phú Thọ, TP.HCM</div>
              </div>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', borderRadius: '20px', padding: '24px', color: 'white', textAlign: 'center', boxShadow: '0 14px 40px rgba(220,38,38,0.3)' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎧</div>
            <div style={{ fontWeight: '800', fontSize: '20px', marginBottom: '6px' }}>Hotline hỗ trợ 24/7</div>
            <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>0932643541</div>
            <div style={{ fontSize: '13px', opacity: 0.95 }}>Miễn phí tư vấn - Thu cũ định giá - Hỗ trợ kỹ thuật</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;