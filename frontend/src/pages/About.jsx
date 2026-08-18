import { Link } from 'react-router-dom';

const About = () => {
  const values = [
    { icon: '🛡️', title: 'Uy tín hàng đầu', desc: 'Cam kết sản phẩm chính hãng, nguồn gốc rõ ràng, được kiểm tra kỹ lưỡng trước khi đến tay khách hàng.' },
    { icon: '💰', title: 'Giá tốt nhất', desc: 'Luôn mang đến mức giá cạnh tranh nhất thị trường cùng nhiều chương trình ưu đãi hấp dẫn.' },
    { icon: '🔁', title: 'Thu cũ - Đổi mới', desc: 'Dịch vụ thu mua máy cũ giá cao, hỗ trợ đổi cũ lấy mới linh hoạt, nhanh chóng.' },
    { icon: '🔧', title: 'Bảo hành tận tâm', desc: 'Đội ngũ kỹ thuật chuyên nghiệp, hỗ trợ bảo hành và tư vấn cấu hình tận tình.' },
  ];

  return (
    <div style={{ padding: '40px 24px 60px', maxWidth: '1100px', margin: '0 auto', color: '#5b1616' }}>
      <Link to="/" style={{ color: '#dc2626', textDecoration: 'none', fontWeight: '700', display: 'inline-block', marginBottom: '24px' }}>← Quay lại trang chủ</Link>

      {/* HERO */}
      <div style={{ textAlign: 'center', padding: '48px 24px', background: 'linear-gradient(145deg, #ffffff 0%, #fff4f4 100%)', borderRadius: '24px', border: '1px solid rgba(220,38,38,0.14)', boxShadow: '0 18px 50px rgba(220,38,38,0.1)', marginBottom: '40px' }}>
        <h1 style={{ margin: '0 0 12px', fontSize: '36px', color: '#7f1d1d' }}>Về K_Tech</h1>
        <p style={{ color: '#7a4a4a', fontSize: '17px', lineHeight: 1.8, maxWidth: '720px', margin: '0 auto' }}>
          K_Tech là hệ thống chuyên mua bán, thu cũ - đổi mới laptop, điện thoại và linh kiện công nghệ chính hãng.
          Với sứ mệnh mang đến cho khách hàng những sản phẩm chất lượng với mức giá minh bạch và dịch vụ tận tâm.
        </p>
      </div>

      {/* GIÁ TRỊ CỐT LÕI */}
      <h2 style={{ color: '#7f1d1d', textAlign: 'center', marginBottom: '28px', fontSize: '26px' }}>💎 Giá trị cốt lõi</h2>
      <div className="ktech-about-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '20px' }}>
        {values.map((v, i) => (
          <div key={i} style={{ background: 'linear-gradient(145deg, #ffffff 0%, #fff7f7 100%)', border: '1px solid rgba(220,38,38,0.12)', borderRadius: '18px', padding: '24px 20px', textAlign: 'center', boxShadow: '0 12px 32px rgba(220,38,38,0.08)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>{v.icon}</div>
            <h3 style={{ margin: '0 0 8px', color: '#7f1d1d', fontSize: '18px' }}>{v.title}</h3>
            <p style={{ margin: 0, color: '#7a4a4a', fontSize: '14px', lineHeight: 1.6 }}>{v.desc}</p>
          </div>
        ))}
      </div>

      {/* CHÍNH SÁCH */}
      <h2 style={{ color: '#7f1d1d', textAlign: 'center', margin: '48px 0 28px', fontSize: '26px' }}>📜 Cam kết của chúng tôi</h2>
      <div style={{ background: '#fffaf5', border: '1px solid rgba(220,38,38,0.12)', borderRadius: '18px', padding: '28px', maxWidth: '760px', margin: '0 auto' }}>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#7a4a4a', lineHeight: 2.2, fontSize: '15px' }}>
          <li>100% sản phẩm được kiểm tra chất lượng, nguồn gốc rõ ràng trước khi bán.</li>
          <li>Hỗ trợ tư vấn cấu hình phù hợp với nhu cầu và ngân sách của bạn.</li>
          <li>Thu cũ giá cao, định giá nhanh chóng và minh bạch.</li>
          <li>Bảo hành chính hãng, hỗ trợ kỹ thuật trong suốt quá trình sử dụng.</li>
          <li>Giao hàng nhanh, đóng gói cẩn thận trên toàn quốc.</li>
        </ul>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', marginTop: '48px' }}>
        <Link to="/" style={{ background: 'linear-gradient(90deg, #dc2626, #ef4444)', color: 'white', textDecoration: 'none', padding: '14px 32px', borderRadius: '999px', fontWeight: '700', display: 'inline-block', boxShadow: '0 8px 20px rgba(220,38,38,0.3)' }}>
          🛒 Khám phá sản phẩm ngay
        </Link>
      </div>
    </div>
  );
};

export default About;