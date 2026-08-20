import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';
import Profile from './Profile';
import { API_BASE_URL } from './api';
import AdminProducts from './admin/AdminProducts';
import AdminUsers from './admin/AdminUsers';
import AdminBuyback from './admin/AdminBuyback';
import Buyback from './pages/Buyback';
import AdminOrders from './admin/AdminOrders';
import AdminPosts from './admin/AdminPosts';
import { CartProvider, useCart } from './context/CartContext';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import About from './pages/About';
import Contact from './pages/Contact';
import News from './pages/News';

// ==================== 1. TRANG CHỦ: HIỂN THỊ SẢN PHẨM ====================
const Home = ({ searchQuery, categoryFilter, priceFilter, conditionFilter }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Đã đồng bộ cổng kết nối sang 5001
        const response = await axios.get(`${API_BASE_URL}/api/products/all`);
        if (response.data.success) {
          setProducts(response.data.products);
        }
        setLoading(false);
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const query = searchQuery?.trim().toLowerCase();
    let matches = true;
    if (query) {
      matches = product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);
    }
    if (matches && categoryFilter && categoryFilter !== 'all') {
      matches = product.category.toLowerCase() === categoryFilter;
    }
    if (matches && conditionFilter && conditionFilter !== 'all') {
      const normalizedCondition = (product.condition || 'mới').toLowerCase();
      const expectedCondition = conditionFilter === 'new' ? 'mới' : 'cũ';
      matches = normalizedCondition === expectedCondition;
    }
    if (matches && priceFilter && priceFilter !== 'all') {
      const price = Number(product.price) || 0;
      if (priceFilter === 'under5') matches = price < 5000000;
      if (priceFilter === '5to10') matches = price >= 5000000 && price <= 10000000;
      if (priceFilter === '10to20') matches = price > 10000000 && price <= 20000000;
      if (priceFilter === 'over20') matches = price > 20000000;
    }
    return matches;
  });

  if (loading) return <div style={{ padding: '20px', textAlign: 'center', color: '#b91c1c' }}>🔄 Đang tải sản phẩm K_Tech...</div>;

  return (
    <div style={{ padding: '32px 24px 48px', width: '100%', boxSizing: 'border-box', color: '#5b1616' }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
        {filteredProducts.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#991b1b', marginTop: '40px', fontSize: '16px' }}>
            {searchQuery ? `Không tìm thấy sản phẩm với từ khoá “${searchQuery}”.` : 'Chưa có sản phẩm nào được đăng bán.'}
          </p>
        ) : (
          <div className="ktech-product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '22px', marginTop: '12px' }}>
            {filteredProducts.map(product => (
              <div key={product._id} style={{ background: 'linear-gradient(145deg, #ffffff 0%, #fff4f4 100%)', border: '1px solid rgba(220,38,38,0.14)', borderRadius: '18px', padding: '16px', textAlign: 'left', boxShadow: '0 16px 40px rgba(220,38,38,0.1)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
                <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ width: '100%', height: '200px', marginBottom: '14px', borderRadius: '12px', overflow: 'hidden', background: '#fef2f2', border: '1px solid rgba(220,38,38,0.08)' }}>
                    <img src={product.coverImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', background: 'rgba(220,38,38,0.12)', color: '#dc2626', padding: '4px 8px', borderRadius: '999px' }}>{product.category}</span>
                    <span style={{ fontSize: '12px', color: '#991b1b' }}>{product.condition === 'cũ' ? 'Cũ' : 'Mới'}</span>
                  </div>
                  <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: product.stockStatus === 'tạm hết hàng' ? '#b45309' : '#15803d', fontWeight: '700' }}>
                      {product.stockStatus === 'tạm hết hàng' ? 'Tạm hết hàng' : 'Còn hàng'}
                    </span>
                  </div>
                  <h3 style={{ margin: '8px 0 8px', fontSize: '18px', color: '#7f1d1d' }}>{product.name}</h3>
                  <p style={{ color: '#7a4a4a', fontSize: '13px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', minHeight: '39px' }}>{product.description}</p>
                </Link>
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '16px', margin: 0 }}>{Number(product.price).toLocaleString('vi-VN')} đ</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        const user = JSON.parse(localStorage.getItem('user') || 'null');
                        if (!user) {
                          navigate(`/login?redirect=/product/${product._id}`);
                          return;
                        }
                        addToCart(product);
                        alert('✅ Đã thêm vào giỏ hàng!');
                      }}
                      style={{ background: '#fff', color: '#dc2626', border: '1px solid rgba(220,38,38,0.25)', padding: '8px 10px', borderRadius: '999px', cursor: 'pointer', fontWeight: '600' }}
                    >🛒</button>
                    <button
                      onClick={() => {
                        const user = JSON.parse(localStorage.getItem('user') || 'null');
                        if (!user) {
                          navigate(`/login?redirect=/product/${product._id}`);
                          return;
                        }
                        addToCart(product);
                        navigate('/checkout');
                      }}
                      style={{ background: 'linear-gradient(90deg, #dc2626, #ef4444)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '999px', cursor: 'pointer', fontWeight: '600', display: 'inline-block' }}
                    >Mua ngay</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== 2. TRANG CHI TIẾT SẢN PHẨM ====================
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewTab, setReviewTab] = useState('review');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewStarFilter, setReviewStarFilter] = useState('all');
  // Loại bỏ ảnh trùng lặp để tránh trường hợp 1 ảnh bị hiển thị 2 lần
  const images = [...new Set(product?.images && product.images.length > 0 ? product.images : [product?.coverImage].filter(Boolean))];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products/${id}`);
        if (response.data.success) {
          setProduct(response.data.product);
        } else {
          setError(response.data.message || 'Không tìm thấy sản phẩm');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    setSelectedImageIndex(0);
    setIsZoomOpen(false);
    setZoomLevel(1);
  }, [id]);

  // Fetch đánh giá + thảo luận
  useEffect(() => {
    if (!id) return;
    axios.get(`${API_BASE_URL}/api/reviews/product/${id}`)
      .then(res => setReviews(res.data.reviews || []))
      .catch(() => setReviews([]));
  }, [id]);

  useEffect(() => {
    if (!isZoomOpen) return;

    // Chặn scroll body khi modal zoom mở
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Chặn sự kiện wheel trên toàn bộ document (non-passive để preventDefault hoạt động)
    const preventWheel = (e) => e.preventDefault();
    window.addEventListener('wheel', preventWheel, { passive: false });

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setSelectedImageIndex((prev) => (prev + 1) % images.length);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
      } else if (event.key === 'Escape') {
        setIsZoomOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', preventWheel);
      document.body.style.overflow = originalOverflow;
    };
  }, [isZoomOpen, images.length]);

  if (loading) return <div style={{ padding: '32px 24px', textAlign: 'center', color: '#b91c1c' }}>🔄 Đang tải chi tiết sản phẩm...</div>;
  if (error) return <div style={{ padding: '32px 24px', textAlign: 'center', color: '#b91c1c' }}>{error}</div>;
  if (!product) return null;

  const descriptionLines = (product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.').split('\n').filter(Boolean);
  const selectedImage = images[selectedImageIndex] || product.coverImage;

  const openImage = (index) => {
    setSelectedImageIndex(index);
    setIsZoomOpen(true);
    setZoomLevel(1);
  };

  const goToImage = (direction) => {
    setSelectedImageIndex((prev) => (prev + direction + images.length) % images.length);
    setZoomLevel(1);
  };

  const handleWheelZoom = (event) => {
    event.preventDefault();
    if (event.deltaY < 0) {
      setZoomLevel((prev) => Math.min(prev + 0.15, 3));
    } else {
      setZoomLevel((prev) => Math.max(prev - 0.15, 1));
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
      alert('Vui lòng đăng nhập để tham gia!');
      return;
    }
    if (!reviewText.trim()) { alert('Vui lòng nhập nội dung'); return; }
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/reviews/`, {
        product_id: id,
        type: reviewTab,
        rating: reviewRating,
        content: reviewText,
        user_name: user.fullName || user.username
      }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      setReviewText('');
      setReviews(prev => [res.data.review, ...prev]);
      alert('✅ Đã gửi!');
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      if (errMsg.includes('Token') || errMsg.includes('token')) {
        alert('⏳ Phiên đăng nhập hết hạn. Vui lòng đăng xuất và đăng nhập lại!');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        alert('❌ ' + errMsg);
      }
    }
  };

  const renderStars = (rating) => {
    let s = '';
    for (let i = 1; i <= 5; i++) s += i <= rating ? '★' : '☆';
    return <span style={{ color: '#f59e0b', letterSpacing: 2 }}>{s}</span>;
  };

  const filteredReviews = reviews.filter(r => r.type === reviewTab).filter(r => {
    if (reviewTab !== 'review' || reviewStarFilter === 'all') return true;
    return r.rating === Number(reviewStarFilter);
  });
  const avgRating = reviews.filter(r => r.type === 'review').length
    ? (reviews.filter(r => r.type === 'review').reduce((a, r) => a + (r.rating || 5), 0) / reviews.filter(r => r.type === 'review').length).toFixed(1)
    : '0';

  return (
    <div style={{ padding: '32px 24px 48px', maxWidth: '1200px', margin: '0 auto', color: '#5b1616' }}>
      <Link to="/" style={{ color: '#dc2626', textDecoration: 'none', fontWeight: '700', display: 'inline-block', marginBottom: '20px' }}>← Quay lại trang chủ</Link>
      <div className="ktech-product-detail" style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: '24px', alignItems: 'start' }}>
        <div style={{ background: 'linear-gradient(145deg, #ffffff 0%, #fff7f7 100%)', borderRadius: '24px', padding: '18px', boxShadow: '0 18px 50px rgba(220,38,38,0.12)' }}>
          <div
            onClick={() => openImage(selectedImageIndex)}
            style={{ width: '100%', aspectRatio: '4 / 3', borderRadius: '18px', overflow: 'hidden', background: '#fef2f2', border: '1px solid rgba(220,38,38,0.1)', cursor: 'zoom-in' }}
          >
            <img src={selectedImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '10px', marginTop: '12px' }}>
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => openImage(index)}
                style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: '12px', overflow: 'hidden', border: index === selectedImageIndex ? '2px solid #dc2626' : '1px solid rgba(220,38,38,0.12)', background: '#fef2f2', padding: 0, cursor: 'pointer' }}
              >
                <img src={img} alt={`${product.name}-${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </button>
            ))}
          </div>
        </div>

        {isZoomOpen && (
          <div
            onClick={() => setIsZoomOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(17, 24, 39, 0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}
          >
            <div onClick={(event) => event.stopPropagation()} style={{ width: '100%', maxWidth: '960px', background: '#fff', borderRadius: '20px', padding: '16px', boxShadow: '0 16px 60px rgba(0,0,0,0.35)' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                <button onClick={() => setIsZoomOpen(false)} style={{ border: 'none', background: '#fef2f2', color: '#dc2626', borderRadius: '999px', width: '36px', height: '36px', cursor: 'pointer', fontSize: '20px' }}>×</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button onClick={(event) => { event.stopPropagation(); goToImage(-1); }} style={{ background: '#fff1f2', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '999px', padding: '8px 12px', cursor: 'pointer', fontWeight: '700', flexShrink: 0 }}>←</button>
                <div onWheel={handleWheelZoom} style={{ flex: 1, width: '100%', aspectRatio: '4 / 3', borderRadius: '16px', overflow: 'hidden', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-in' }}>
                  <img src={selectedImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.15s ease-out' }} />
                </div>
                <button onClick={(event) => { event.stopPropagation(); goToImage(1); }} style={{ background: '#fff1f2', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '999px', padding: '8px 12px', cursor: 'pointer', fontWeight: '700', flexShrink: 0 }}>→</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <span style={{ display: 'inline-block', width: 'fit-content', background: 'rgba(220,38,38,0.12)', color: '#dc2626', padding: '6px 10px', borderRadius: '999px', fontSize: '13px', fontWeight: '700' }}>{product.category}</span>
          <h2 style={{ margin: 0, fontSize: '28px', color: '#7f1d1d' }}>{product.name}</h2>
          <div style={{ background: '#fffaf5', border: '1px solid rgba(220,38,38,0.12)', borderRadius: '16px', padding: '14px 16px' }}>
            <h3 style={{ margin: '0 0 8px', color: '#9a2c00' }}>📝 Mô tả sản phẩm</h3>
            {descriptionLines.length > 0 ? descriptionLines.map((line, index) => (
              <p key={index} style={{ margin: '0 0 8px', color: '#7a4a4a', lineHeight: 1.7 }}>{line}</p>
            )) : <p style={{ margin: 0, color: '#7a4a4a' }}>Chưa có mô tả chi tiết cho sản phẩm này.</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div style={{ background: '#fff7f7', borderRadius: '16px', padding: '12px 14px', border: '1px solid rgba(220,38,38,0.12)' }}>
              <div style={{ fontSize: '12px', color: '#991b1b', marginBottom: '4px' }}>Giá bán</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#dc2626' }}>{Number(product.price).toLocaleString('vi-VN')} đ</div>
            </div>
            <div style={{ background: '#fff7f7', borderRadius: '16px', padding: '12px 14px', border: '1px solid rgba(220,38,38,0.12)' }}>
              <div style={{ fontSize: '12px', color: '#991b1b', marginBottom: '4px' }}>Tình trạng</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#7f1d1d' }}>{product.condition === 'cũ' ? 'Cũ' : 'Mới'}</div>
            </div>
            <div style={{ background: '#fff7f7', borderRadius: '16px', padding: '12px 14px', border: '1px solid rgba(220,38,38,0.12)' }}>
              <div style={{ fontSize: '12px', color: '#991b1b', marginBottom: '4px' }}>Kho hàng</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: product.stockStatus === 'tạm hết hàng' ? '#b45309' : '#15803d' }}>
                {product.stockStatus === 'tạm hết hàng' ? 'Tạm hết hàng' : 'Còn hàng'}
              </div>
            </div>
            <div style={{ background: '#fff7f7', borderRadius: '16px', padding: '12px 14px', border: '1px solid rgba(220,38,38,0.12)' }}>
              <div style={{ fontSize: '12px', color: '#991b1b', marginBottom: '4px' }}>Bảo hành</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#7f1d1d' }}>{product.warranty || 'Đang cập nhật'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                const user = JSON.parse(localStorage.getItem('user') || 'null');
                if (!user) {
                  navigate(`/login?redirect=/product/${id}`);
                  return;
                }
                addToCart(product);
                alert('✅ Đã thêm vào giỏ hàng!');
              }}
              style={{ background: '#fff', color: '#dc2626', border: '1px solid rgba(220,38,38,0.25)', padding: '12px 16px', borderRadius: '999px', fontWeight: '700', cursor: 'pointer' }}
            >🛒 Thêm vào giỏ</button>
            <button
              onClick={() => {
                const user = JSON.parse(localStorage.getItem('user') || 'null');
                if (!user) {
                  navigate(`/login?redirect=/product/${id}`);
                  return;
                }
                addToCart(product);
                navigate('/checkout');
              }}
              style={{ background: 'linear-gradient(90deg, #dc2626, #ef4444)', color: 'white', border: 'none', padding: '12px 16px', borderRadius: '999px', fontWeight: '700', cursor: 'pointer' }}
            >⚡ Mua ngay</button>
          </div>

          <div style={{ background: '#fff7ed', borderRadius: '16px', padding: '14px 16px', border: '1px solid rgba(249,115,22,0.2)' }}>
            <h3 style={{ margin: '0 0 8px', color: '#9a2c00' }}>Lưu ý khi mua</h3>
            <ul style={{ margin: 0, paddingLeft: '18px', color: '#7f1d1d', lineHeight: 1.7 }}>
              <li>Sản phẩm được kiểm tra kỹ trước khi giao.</li>
              <li>Hỗ trợ tư vấn cấu hình và bảo hành phù hợp.</li>
              <li>Liên hệ ngay để nhận giá tốt nhất.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ===== ĐÁNH GIÁ & THẢO LUẬN ===== */}
      <div style={{ marginTop: 40, background: '#fff', borderRadius: 16, border: '1px solid rgba(220,38,38,0.1)', padding: 24 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => setReviewTab('review')}
            style={{ padding: '8px 20px', borderRadius: 999, border: reviewTab === 'review' ? '2px solid #dc2626' : '1px solid rgba(220,38,38,0.2)', background: reviewTab === 'review' ? '#fff5f5' : '#fff', color: '#7f1d1d', fontWeight: 700, cursor: 'pointer' }}>
            ⭐ Đánh giá ({reviews.filter(r => r.type === 'review').length})
          </button>
          <button onClick={() => setReviewTab('discussion')}
            style={{ padding: '8px 20px', borderRadius: 999, border: reviewTab === 'discussion' ? '2px solid #dc2626' : '1px solid rgba(220,38,38,0.2)', background: reviewTab === 'discussion' ? '#fff5f5' : '#fff', color: '#7f1d1d', fontWeight: 700, cursor: 'pointer' }}>
            💬 Thảo luận ({reviews.filter(r => r.type === 'discussion').length})
          </button>
          {reviewTab === 'review' && reviews.filter(r => r.type === 'review').length > 0 && (
            <span style={{ marginLeft: 'auto', fontSize: 16, color: '#7f1d1d', fontWeight: 700 }}>
              {renderStars(Math.round(Number(avgRating)))} {avgRating}/5
            </span>
          )}
        </div>

        {/* Bộ lọc sao */}
        {reviewTab === 'review' && reviews.filter(r => r.type === 'review').length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {['all','5','4','3','2','1'].map(s => (
              <button key={s} onClick={() => setReviewStarFilter(s)}
                style={{
                  padding: '4px 12px', borderRadius: 999, cursor: 'pointer', fontSize: 13,
                  border: reviewStarFilter === s ? '2px solid #dc2626' : '1px solid rgba(220,38,38,0.15)',
                  background: reviewStarFilter === s ? '#fff5f5' : '#fff', color: '#7f1d1d', fontWeight: reviewStarFilter === s ? 700 : 500
                }}>
                {s === 'all' ? 'Tất cả' : s === '5' ? '⭐⭐⭐⭐⭐' : s === '4' ? '⭐⭐⭐⭐' : s === '3' ? '⭐⭐⭐' : s === '2' ? '⭐⭐' : '⭐'}
              </button>
            ))}
          </div>
        )}

        {/* Form đăng - chỉ hiện khi đã đăng nhập */}
        {(() => {
          const user = JSON.parse(localStorage.getItem('user') || 'null');
          return user ? (
            <form onSubmit={handleSubmitReview} style={{ background: '#fef2f2', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ fontWeight: 700, color: '#7f1d1d', marginBottom: 8 }}>
                {reviewTab === 'review' ? '✍️ Viết đánh giá của bạn' : '💬 Tham gia thảo luận'}
              </div>
              {reviewTab === 'review' && (
                <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setReviewRating(s)}
                      style={{ fontSize: 24, color: s <= reviewRating ? '#f59e0b' : '#ddd', background: 'none', border: 'none', cursor: 'pointer' }}>★</button>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder={reviewTab === 'review' ? 'Chia sẻ trải nghiệm của bạn về sản phẩm...' : 'Nhập câu hỏi / bình luận...'} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid rgba(220,38,38,0.2)', outline: 'none' }} />
                <button type="submit" style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: 10, padding: '8px 20px', fontWeight: 700, cursor: 'pointer' }}>Gửi</button>
              </div>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: 20, color: '#7a4a4a', background: '#fef2f2', borderRadius: 12, marginBottom: 20 }}>
              <Link to="/login?redirect=/product/" style={{ color: '#dc2626', fontWeight: 700 }}>Đăng nhập</Link> để tham gia {reviewTab === 'review' ? 'đánh giá' : 'thảo luận'}
            </div>
          );
        })()}

        {/* Danh sách */}
        {filteredReviews.length === 0 ? (
          <p style={{ color: '#991b1b', textAlign: 'center' }}>
            {reviewTab === 'review' ? 'Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!' : 'Chưa có thảo luận nào. Bắt đầu một câu chuyện nào!'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredReviews.map(r => (
              <div key={r._id} style={{ border: '1px solid rgba(220,38,38,0.08)', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#fee2e2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👤</span>
                    <span style={{ fontWeight: 700, color: '#7f1d1d', fontSize: 14 }}>{r.user_name}</span>
                    {r.verified_buyer && <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>Đã mua ✓</span>}
                  </div>
                  <span style={{ fontSize: 11, color: '#991b1b' }}>{new Date(r.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                {reviewTab === 'review' && <div style={{ marginBottom: 6 }}>{renderStars(r.rating || 5)}</div>}
                <div style={{ color: '#5b1616', lineHeight: 1.6 }}>{r.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== 2. TRANG THU MÁY (TẠM THỜI) ====================
const BuyBack = () => (
  <div style={{ padding: '20px', width: '100%', boxSizing: 'border-box', color: '#7f1d1d' }}>
    <h2>Chức Năng Thu Máy Đổi Cũ Lấy Mới</h2>
    <p>Nhập thông số, hình ảnh thiết bị của bạn để Admin định giá.</p>
  </div>
);

// ==================== 3. TRANG ADMIN: QUẢN LÝ USER VÀ SẢN PHẨM ====================
const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State quản lý Form văn bản
  const [productForm, setProductForm] = useState({ name: '', price: '', description: '', category: 'Laptop' });
  // State quản lý mảng nhiều file ảnh thay vì 1 file đơn lẻ như trước
  const [imageFiles, setImageFiles] = useState([]); 
  const [uploading, setUploading] = useState(false); 

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/users`);
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleProductChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  // Logic bắt danh sách file và chặn nếu vượt quá 8 ảnh
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files); // Chuyển dữ liệu FileList của trình duyệt thành mảng Array
    
    if (files.length > 8) {
      alert("❌ Hệ thống chỉ cho phép chọn tối đa 8 hình ảnh cho 1 sản phẩm!");
      e.target.value = ""; // Reset sạch ô chọn file trên giao diện HTML
      setImageFiles([]);
      return;
    }
    setImageFiles(files);
  };

  // Hàm xử lý gửi form đăng sản phẩm
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      alert("Vui lòng chọn ít nhất 1 file ảnh đính kèm!");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('name', productForm.name);
    formData.append('price', productForm.price);
    formData.append('description', productForm.description);
    formData.append('category', productForm.category);
    
    // Vòng lặp đóng gói toàn bộ mảng file ảnh vào FormData với key chung là 'images'
    imageFiles.forEach(file => {
      formData.append('images', file); // Khớp hoàn toàn với upload.array('images', 8) ở Backend
    });

    try {
      const response = await axios.post(`${API_BASE_URL}/api/products/add`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      
      if (response.data.success) {
        alert(`🎉 Đã tải thành công ${imageFiles.length} ảnh lên Cloudinary và phát hành sản phẩm thành công!`);
        // Khôi phục form về trạng thái trống
        setProductForm({ name: '', price: '', description: '', category: 'Laptop' });
        setImageFiles([]);
        document.getElementById("fileInput").value = ""; 
      }
    } catch (error) {
      alert("Lỗi đăng sản phẩm: " + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteUser = async (id, fullName) => {
    if (window.confirm(`Xóa tài khoản của "${fullName}"?`)) {
      try {
        await axios.delete(`${API_BASE_URL}/api/auth/users/${id}`);
        alert("Xóa thành công!");
        fetchUsers();
      } catch (error) { alert(error.message); }
    }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center', color: 'white' }}>🔄 Đang tải dữ liệu...</div>;

  return (
    <div style={{ padding: '30px', width: '100%', boxSizing: 'border-box', color: '#f8fafc' }}>
      <h2 style={{ color: '#f43f5e', borderBottom: '2px solid #f43f5e', paddingBottom: '10px' }}>👑 HỆ THỐNG QUẢN TRỊ VIÊN K_TECH</h2>
      
      {/* FORM ĐĂNG SẢN PHẨM MỚI */}
      <div style={{ background: '#111827', padding: '20px', borderRadius: '12px', marginTop: '20px', border: '1px solid #334155' }}>
        <h3>📦 Đăng Bán Sản Phẩm Mới (Hỗ trợ tối đa 8 ảnh qua Cloudinary)</h3>
        <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
          <input type="text" name="name" placeholder="Tên sản phẩm (VD: MacBook Pro 2026)" value={productForm.name} onChange={handleProductChange} required style={{ padding: '10px' }} />
          <input type="number" name="price" placeholder="Giá tiền (VNĐ)" value={productForm.price} onChange={handleProductChange} required style={{ padding: '10px' }} />
          
          {/* Ô nhập ảnh dạng MULTIPLE cho phép bôi đen chọn loạt nhiều ảnh */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>Chọn bộ ảnh sản phẩm từ thiết bị (Giới hạn: 1 - 8 ảnh):</label>
            <input id="fileInput" type="file" accept="image/*" multiple onChange={handleFileChange} required style={{ color: 'white' }} />
            <small style={{ color: '#3498db', display: 'block', marginTop: '4px' }}>💡 Mẹo: Nhấn giữ nút Ctrl để click chọn nhiều ảnh cùng lúc. Tấm ảnh đầu tiên được chọn sẽ làm ảnh bìa.</small>
          </div>

          <textarea name="description" placeholder="Mô tả chi tiết cấu hình, tình trạng máy, quà tặng kèm..." value={productForm.description} onChange={handleProductChange} rows="3" style={{ padding: '10px', gridColumn: 'span 2' }}></textarea>
          <select name="category" value={productForm.category} onChange={handleProductChange} style={{ padding: '10px' }}>
            <option value="Laptop">Laptop</option>
            <option value="Điện thoại">Điện thoại</option>
            <option value="Linh kiện">Linh kiện</option>
          </select>
          
          <button type="submit" disabled={uploading} style={{ background: uploading ? '#7f8c8d' : '#27ae60', color: 'white', fontWeight: 'bold', border: 'none', cursor: uploading ? 'not-allowed' : 'pointer' }}>
            {uploading ? `⏳ Đang đẩy ${imageFiles.length} tấm ảnh lên đám mây...` : "🚀 Phát Hành Sản Phẩm"}
          </button>
        </form>
      </div>

      {/* BẢNG QUẢN LÝ TÀI KHOẢN */}
      <h3 style={{ marginTop: '40px' }}>👥 Quản Lý Danh Sách Tài Khoản</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', background: '#111827' }}>
        <thead>
          <tr style={{ backgroundColor: '#ff4d4d', color: '#fff', textAlign: 'left' }}>
            <th style={{ padding: '12px', border: '1px solid #333' }}>Họ và Tên</th>
            <th style={{ padding: '12px', border: '1px solid #333' }}>Email</th>
            <th style={{ padding: '12px', border: '1px solid #333' }}>Quyền hạn</th>
            <th style={{ padding: '12px', border: '1px solid #333', textAlign: 'center' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: '12px', border: '1px solid #333' }}>{user.fullName}</td>
              <td style={{ padding: '12px', border: '1px solid #333' }}>{user.email}</td>
              <td style={{ padding: '12px', border: '1px solid #333' }}>{user.role}</td>
              <td style={{ padding: '12px', border: '1px solid #333', textAlign: 'center' }}>
                {user.email === 'Ravens1706@gmail.com' ? <span>Tối cao</span> : <button onClick={() => handleDeleteUser(user._id, user.fullName)} style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Xóa</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Filter bar shown only on customer homepage
const FilterBar = ({ searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, priceFilter, setPriceFilter, conditionFilter, setConditionFilter, productTypes }) => {
  const location = useLocation();
  if (location.pathname !== '/') return null;

  return (
    <div className="ktech-filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end', padding: '12px 20px 0', background: 'transparent', maxWidth: '1080px', margin: '0 0 0 20px' }}>
      <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ color: '#7f1d1d', fontSize: '12px', fontWeight: '600' }}>Loại sản phẩm</span>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ width: '100%', borderRadius: '999px', border: '1px solid rgba(220,38,38,0.22)', padding: '10px 14px', background: 'white', color: '#5b1616' }}>
          <option value="all">Tất cả</option>
          {productTypes.map((type) => <option key={type} value={type.toLowerCase()}>{type}</option>)}
        </select>
      </div>
      <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ color: '#7f1d1d', fontSize: '12px', fontWeight: '600' }}>Giá</span>
        <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)} style={{ width: '100%', borderRadius: '999px', border: '1px solid rgba(220,38,38,0.22)', padding: '10px 14px', background: 'white', color: '#5b1616' }}>
          <option value="all">Tất cả</option>
          <option value="under5">Dưới 5 triệu</option>
          <option value="5to10">5 - 10 triệu</option>
          <option value="10to20">10 - 20 triệu</option>
          <option value="over20">Trên 20 triệu</option>
        </select>
      </div>
      <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ color: '#7f1d1d', fontSize: '12px', fontWeight: '600' }}>Tình trạng</span>
        <select value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)} style={{ width: '100%', borderRadius: '999px', border: '1px solid rgba(220,38,38,0.22)', padding: '10px 14px', background: 'white', color: '#5b1616' }}>
          <option value="all">Tất cả</option>
          <option value="new">Mới</option>
          <option value="used">Cũ</option>
        </select>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', flex: '0 0 auto', alignSelf: 'stretch' }}>
        <button onClick={() => { setCategoryFilter('all'); setPriceFilter('all'); setConditionFilter('all'); setSearchQuery(''); }} style={{ height: '44px', borderRadius: '999px', border: '1px solid rgba(220,38,38,0.3)', background: '#fff', color: '#b91c1c', fontWeight: '700', padding: '0 16px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Xóa</button>
      </div>
    </div>
  );
};

// ==================== 4. PHẦN ĐIỀU HƯỚNG CHÍNH APP ====================
const AppContent = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [navOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();
  const productTypes = ['Laptop', 'Điện thoại', 'Linh kiện', 'Phụ kiện'];
  const { getCartCount, clearCart } = useCart();
  const cartCount = getCartCount();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user');
    clearCart(); // Xóa giỏ hàng khi đăng xuất
    setCurrentUser(null);
    setMenuOpen(false);
    navigate('/');
    alert("Đã đăng xuất!");
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#ffffff', minHeight: '100vh', color: '#5b1616' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <nav className="ktech-nav" style={{ background: 'rgba(255,255,255,0.95)', padding: '15px 20px', display: 'flex', gap: '16px', alignItems: 'center', borderBottom: '1px solid rgba(220,38,38,0.16)', boxShadow: '0 8px 24px rgba(220,38,38,0.08)' }}>
          <div
            onMouseEnter={() => setNavOpen(true)}
            onMouseLeave={() => setNavOpen(false)}
            onClick={() => setNavOpen(!navOpen)}
            style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <span className="ktech-nav-burger" style={{ display: 'inline-flex', flexDirection: 'column', justifyContent: 'center', gap: '3px', marginRight: '8px' }}>
              <span style={{ width: '18px', height: '2px', background: '#b91c1c', borderRadius: '2px' }} />
              <span style={{ width: '18px', height: '2px', background: '#b91c1c', borderRadius: '2px' }} />
              <span style={{ width: '18px', height: '2px', background: '#b91c1c', borderRadius: '2px' }} />
            </span>
            <div className="ktech-nav-logo" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <Link to="/" style={{ color: '#b91c1c', fontWeight: 'bold', fontSize: '18px', textDecoration: 'none' }}>K_Tech</Link>
              <span style={{ color: '#7f1d1d', fontSize: '12px' }}>Thu mua - Thu đổi - Bán nhanh</span>
            </div>
            {navOpen && (
              <div className="ktech-nav-menu" style={{ position: 'absolute', top: '100%', left: 0, background: 'white', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '14px', boxShadow: '0 16px 40px rgba(0,0,0,0.08)', padding: '8px 0', minWidth: '220px', zIndex: 1000 }}>
                {currentUser && currentUser.role === 'admin' ? (
                  <>
                    <Link to="/admin/products" style={{ display: 'block', padding: '10px 16px', color: '#b91c1c', textDecoration: 'none', fontWeight: '600' }}>Quản lý sản phẩm</Link>
                    <Link to="/admin/users" style={{ display: 'block', padding: '10px 16px', color: '#7f1d1d', textDecoration: 'none' }}>Quản lý người dùng</Link>
                    <Link to="/admin/orders" style={{ display: 'block', padding: '10px 16px', color: '#b91c1c', textDecoration: 'none', fontWeight: '600' }}>Quản lý đơn hàng</Link>
                    <Link to="/admin/buyback" style={{ display: 'block', padding: '10px 16px', color: '#7f1d1d', textDecoration: 'none' }}>Quản lý thu cũ</Link>
                    <Link to="/admin/posts" style={{ display: 'block', padding: '10px 16px', color: '#b91c1c', textDecoration: 'none', fontWeight: '600' }}>Quản lý bài đăng</Link>
                  </>
                ) : (
                  <>
                    <Link to="/buyback" style={{ display: 'block', padding: '10px 16px', color: '#b91c1c', textDecoration: 'none', fontWeight: '600' }}>Thu cũ sản phẩm</Link>
                  </>
                )}
                {/* Links chỉ hiển thị trên điện thoại (responsive) */}
                <div className="ktech-mobile-links">
                  <Link to="/about" onClick={() => setNavOpen(false)} style={{ display: 'block', padding: '10px 16px', color: '#7f1d1d', textDecoration: 'none' }}>Giới thiệu</Link>
                  <Link to="/contact" onClick={() => setNavOpen(false)} style={{ display: 'block', padding: '10px 16px', color: '#7f1d1d', textDecoration: 'none' }}>Liên hệ</Link>
                  <Link to="/news" onClick={() => setNavOpen(false)} style={{ display: 'block', padding: '10px 16px', color: '#7f1d1d', textDecoration: 'none' }}>Tin tức</Link>
                  {currentUser && (
                    <Link to="/cart" onClick={() => setNavOpen(false)} style={{ display: 'block', padding: '10px 16px', color: '#7f1d1d', textDecoration: 'none' }}>
                      Giỏ hàng {cartCount > 0 && `(${cartCount})`}
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
            <div className="ktech-nav-search" style={{ position: 'relative', width: '100%', maxWidth: '560px' }}>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                style={{
                  width: '100%',
                  padding: '10px 44px 10px 16px',
                  borderRadius: '999px',
                  border: '1px solid rgba(220,38,38,0.2)',
                  outline: 'none',
                  color: '#5b1616',
                }}
              />
              <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#7f1d1d', fontSize: '16px' }}>
                🔍
              </span>
            </div>
          </div>
          <Link to="/about" className="ktech-nav-link" style={{ color: '#7f1d1d', textDecoration: 'none', fontWeight: '600' }}>Giới thiệu</Link>
          <Link to="/contact" className="ktech-nav-link" style={{ color: '#7f1d1d', textDecoration: 'none', fontWeight: '600' }}>Liên hệ</Link>
          {currentUser && (
            <Link to="/cart" className="ktech-nav-link" style={{ color: '#7f1d1d', textDecoration: 'none', fontWeight: '600', position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              Giỏ hàng
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-8px', right: '-14px',
                  background: '#dc2626', color: 'white', fontSize: '11px',
                  width: '20px', height: '20px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '800', boxShadow: '0 2px 6px rgba(220,38,38,0.4)',
                }}>{cartCount}</span>
              )}
            </Link>
          )}
          <Link to="/news" className="ktech-nav-link" style={{ color: '#7f1d1d', textDecoration: 'none', fontWeight: '600' }}>Tin tức</Link>
          
          <div className="ktech-nav-user" style={{ marginLeft: 'auto', position: 'relative' }}>
            {currentUser ? (
              <div>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: '42px', height: '42px', cursor: 'pointer', fontSize: '18px', boxShadow: '0 4px 10px rgba(220,38,38,0.25)' }}
                  aria-label="User menu"
                >
                  👤
                </button>
                {menuOpen && (
                  <div style={{ position: 'absolute', right: 0, top: '50px', background: '#fff', color: '#222', borderRadius: '10px', minWidth: '180px', boxShadow: '0 10px 24px rgba(0,0,0,0.2)', zIndex: 1000 }}>
                    <Link to="/orders" onClick={() => setMenuOpen(false)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', textDecoration: 'none', color: '#111' }}>Lịch sử đặt hàng</Link>
                    <Link to="/profile" onClick={() => setMenuOpen(false)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', textDecoration: 'none', color: '#111' }}>Thông tin cá nhân</Link>
                    <button onClick={() => setMenuOpen(false)} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none', background: 'white', cursor: 'pointer' }}>Cài đặt</button>
                    <button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none', background: 'white', cursor: 'pointer', color: '#dc2626' }}>Đăng xuất</button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link to="/login" style={{ color: '#dc2626', textDecoration: 'none', fontWeight: 'bold' }}>Đăng nhập</Link>
              </div>
            )}
          </div>
        </nav>
        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          priceFilter={priceFilter}
          setPriceFilter={setPriceFilter}
          conditionFilter={conditionFilter}
          setConditionFilter={setConditionFilter}
          productTypes={productTypes}
        />

        <Routes>
          <Route path="/" element={<Home searchQuery={searchQuery} categoryFilter={categoryFilter} priceFilter={priceFilter} conditionFilter={conditionFilter} />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login onLoginSuccess={(user) => setCurrentUser(user)} />} />
          <Route path="/profile" element={<Profile user={currentUser} onUpdateUser={(u) => setCurrentUser(u)} />} />
          <Route path="/buyback" element={<Buyback />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/news" element={<News />} />
          <Route path="/admin" element={<AdminProducts />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/buyback" element={<AdminBuyback />} />
          <Route path="/admin/posts" element={<AdminPosts />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </Router>
  );
}

export default App;