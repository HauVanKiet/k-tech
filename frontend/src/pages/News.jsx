import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api';

const News = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/posts/published`);
        if (res.data.success) setPosts(res.data.posts);
      } catch (err) {
        console.error('Lỗi tải bài đăng:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const selectedPost = posts.find(p => p._id === selected);

  if (loading) return <div style={{ padding: '40px 24px', textAlign: 'center', color: '#b91c1c' }}>🔄 Đang tải tin tức...</div>;

  return (
    <div style={{ padding: '40px 24px 60px', maxWidth: '1000px', margin: '0 auto', color: '#5b1616' }}>
      <Link to="/" style={{ color: '#dc2626', textDecoration: 'none', fontWeight: '700', display: 'inline-block', marginBottom: '24px' }}>← Quay lại trang chủ</Link>

      {/* HERO */}
      <div style={{ textAlign: 'center', padding: '40px 24px', background: 'linear-gradient(145deg, #ffffff 0%, #fff4f4 100%)', borderRadius: '24px', border: '1px solid rgba(220,38,38,0.14)', boxShadow: '0 18px 50px rgba(220,38,38,0.1)', marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 12px', fontSize: '32px', color: '#7f1d1d' }}>📰 Tin tức K_Tech</h1>
        <p style={{ color: '#7a4a4a', fontSize: '16px', maxWidth: '640px', margin: '0 auto', lineHeight: 1.7 }}>
          Cập nhật những tin tức công nghệ mới nhất, mẹo hay và chương trình khuyến mãi hấp dẫn từ K_Tech.
        </p>
      </div>

      {/* CHI TIẾT BÀI VIẾT */}
      {selectedPost ? (
        <div style={{ background: '#fff7f7', border: '1px solid rgba(220,38,38,0.12)', borderRadius: '20px', padding: '28px', boxShadow: '0 14px 40px rgba(220,38,38,0.08)' }}>
          <button onClick={() => setSelected(null)} style={{ background: '#fff', color: '#dc2626', border: '1px solid rgba(220,38,38,0.25)', borderRadius: '999px', padding: '8px 16px', cursor: 'pointer', fontWeight: '600', marginBottom: '16px' }}>← Quay lại danh sách</button>
          {selectedPost.coverImage && (
            <div style={{ width: '100%', height: '280px', borderRadius: '14px', overflow: 'hidden', marginBottom: '16px', background: '#fef2f2' }}>
              <img src={selectedPost.coverImage} alt={selectedPost.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', background: 'rgba(220,38,38,0.12)', color: '#dc2626', padding: '4px 10px', borderRadius: '999px', fontWeight: '700' }}>{selectedPost.category}</span>
            <span style={{ fontSize: '12px', color: '#991b1b' }}>📅 {new Date(selectedPost.createdAt).toLocaleDateString('vi-VN')}</span>
            {selectedPost.author && <span style={{ fontSize: '12px', color: '#991b1b' }}>✍️ {selectedPost.author}</span>}
          </div>
          <h2 style={{ color: '#7f1d1d', fontSize: '24px', margin: '0 0 16px' }}>{selectedPost.title}</h2>
          {selectedPost.content.split('\n').filter(Boolean).map((line, i) => (
            <p key={i} style={{ color: '#5b1616', lineHeight: 1.8, margin: '0 0 12px', fontSize: '15px' }}>{line}</p>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#991b1b', padding: '40px 0' }}>Chưa có bài đăng nào. Vui lòng quay lại sau!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {posts.map(p => (
            <div key={p._id} className="ktech-news-card" style={{ background: 'linear-gradient(145deg, #ffffff 0%, #fff7f7 100%)', border: '1px solid rgba(220,38,38,0.12)', borderRadius: '18px', padding: '22px', boxShadow: '0 10px 28px rgba(220,38,38,0.07)', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease', display: 'flex', gap: '18px', alignItems: 'center' }} onClick={() => setSelected(p._id)}>
              {p.coverImage && (
                <div style={{ width: '160px', height: '110px', borderRadius: '12px', overflow: 'hidden', background: '#fef2f2', flexShrink: 0 }}>
                  <img src={p.coverImage} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', background: 'rgba(220,38,38,0.12)', color: '#dc2626', padding: '4px 10px', borderRadius: '999px', fontWeight: '700' }}>{p.category}</span>
                  <span style={{ fontSize: '12px', color: '#991b1b' }}>📅 {new Date(p.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <h3 style={{ color: '#7f1d1d', fontSize: '19px', margin: '0 0 8px' }}>{p.title}</h3>
                <p style={{ color: '#7a4a4a', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{p.excerpt || p.content.slice(0, 120) + '...'}</p>
                <div style={{ color: '#dc2626', fontSize: '13px', fontWeight: '700', marginTop: '12px' }}>Đọc thêm →</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default News;