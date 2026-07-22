import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from './api';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const redirectTo = params.get('redirect') || '/';
  const [isRegister, setIsRegister] = useState(false); // Chuyển đổi giữa Đăng nhập & Đăng ký
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    phone: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    email: '',
    password: '',
    confirmPassword: '', // Nhập lại mật khẩu
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Cập nhật giá trị đầu vào khi gõ phím
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Nếu là họ và tên: chỉ cho phép chữ và khoảng trắng (hỗ trợ unicode)
    if (name === 'fullName') {
      const v = value.replace(/[^\p{L}\s'-]/gu, '');
      setFormData({ ...formData, [name]: v });
      return;
    }
    // Nếu là số điện thoại: chỉ giữ chữ số, giới hạn 10 ký tự
    if (name === 'phone') {
      const v = value.replace(/[^0-9]/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: v });
      return;
    }
    // Ngày/tháng/năm chọn từ select -> chấp nhận trực tiếp
    if (name === 'birthDay' || name === 'birthMonth' || name === 'birthYear') {
      setFormData({ ...formData, [name]: value });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  // Xử lý Gửi Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (isRegister) {
      // Validate full name: must contain letters only (spaces allowed)
      if (!formData.fullName || !/^[\p{L}\s'-]+$/u.test(formData.fullName)) {
        setError('Họ và tên chỉ được chứa chữ cái và khoảng trắng.');
        return;
      }
      // Validate username: must contain at least one uppercase and one digit
      if (!formData.username || !/(?=.*[A-Z])(?=.*\d)/.test(formData.username)) {
        setError('Tên đăng nhập phải chứa ít nhất 1 chữ hoa và 1 chữ số.');
        return;
      }
      // Validate phone: must be digits, start with 0, and exactly 10 digits
      if (!/^0\d{9}$/.test(formData.phone)) {
        setError('Vui lòng nhập đúng định dạng số điện thoại');
        return;
      }
      // Validate birthDay/birthMonth/birthYear selects
      const { birthDay, birthMonth, birthYear } = formData;
      if (!birthDay || !birthMonth || !birthYear) { setError('Vui lòng chọn ngày/tháng/năm sinh.'); return; }
      if (!/^\d{4}$/.test(birthYear)) { setError('Năm sinh phải gồm 4 chữ số.'); return; }
      const y = parseInt(birthYear, 10);
      const m = parseInt(birthMonth, 10);
      const d = parseInt(birthDay, 10);
      const today = new Date();
      const minYear = 1900;
      const maxYear = today.getFullYear() - 16; // phải ít nhất 16 tuổi
      if (y < minYear || y > maxYear) { setError(`Năm sinh phải từ ${minYear} đến ${maxYear}.`); return; }
      // kiểm tra ngày hợp lệ cho tháng (bao gồm năm nhuận)
      const birth = new Date(y, m - 1, d);
      if (birth.getFullYear() !== y || birth.getMonth() + 1 !== m || birth.getDate() !== d) { setError('Ngày sinh không hợp lệ.'); return; }
      // tuổi tính kỹ
      let age = today.getFullYear() - y;
      const mm = today.getMonth() - (m - 1);
      if (mm < 0 || (mm === 0 && today.getDate() < d)) age--;
      if (age < 16) { setError('Người dùng phải từ 16 tuổi trở lên.'); return; }
      // Validate email format
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setError('Email không hợp lệ.'); return; }
      // Validate password: at least one uppercase and one digit
      if (!/(?=.*[A-Z])(?=.*\d)/.test(formData.password)) { setError('Mật khẩu phải chứa ít nhất 1 chữ hoa và 1 chữ số.'); return; }
      // 1. Kiểm tra 2 mật khẩu có trùng nhau không ở Frontend trước
      if (formData.password !== formData.confirmPassword) {
        setError("Mật khẩu nhập lại không trùng khớp!");
        return;
      }

      try {
        // Gửi toàn bộ 6 thông tin đăng ký về Backend
        // Assemble birthDate as YYYY-MM-DD
        const birthDateStr = `${formData.birthYear}-${String(formData.birthMonth).padStart(2, '0')}-${String(formData.birthDay).padStart(2, '0')}`;
        const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
          fullName: formData.fullName,
          username: formData.username,
          phone: formData.phone,
          birthDate: birthDateStr,
          email: formData.email,
          password: formData.password,
        });
        setMessage(response.data.message + " Mời bạn chuyển sang Đăng nhập.");
        setIsRegister(false); // Đăng ký xong tự về trang đăng nhập
      } catch (err) {
        setError(err.response?.data?.message || "Đăng ký thất bại, vui lòng kiểm tra lại!");
      }
    } else {
      // Xử lý Đăng nhập (Chỉ cần Email và Mật khẩu)
      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          email: formData.email,
          password: formData.password
        });
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        setMessage(`Chào mừng ${response.data.user.username} đã đăng nhập!`);
        if (onLoginSuccess) onLoginSuccess(response.data.user);
        navigate(redirectTo);
      } catch (err) {
        setError(err.response?.data?.message || "Sai tài khoản hoặc mật khẩu!");
      }
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '40px auto', padding: '25px', border: '1px solid #f5c2c2', borderRadius: '16px', boxShadow: '0 18px 40px rgba(220,38,38,0.12)', background: 'linear-gradient(135deg, #fff 0%, #fff7f7 100%)' }}>
      <h2 style={{ textAlign: 'center', color: '#b91c1c', marginBottom: '20px' }}>
        {isRegister ? "ĐĂNG KÝ KHÁCH HÀNG" : "ĐĂNG NHẬP K_TECH"}
      </h2>
      
      {message && <p style={{ color: 'green', fontWeight: 'bold', textAlign: 'center' }}>{message}</p>}
      {error && <p style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {isRegister && (
          <>
            <div>
              <label>Họ và tên:</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
            </div>
            <div>
              <label>Tên đăng nhập:</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
            </div>
            <div>
              <label>Số điện thoại:</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
            </div>
            <div>
              <label>Ngày tháng năm sinh:</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <select name="birthDay" value={formData.birthDay} onChange={handleChange} required style={{ padding: '8px', flex: '0 0 30%' }}>
                  <option value="">Ngày</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select name="birthMonth" value={formData.birthMonth} onChange={handleChange} required style={{ padding: '8px', flex: '0 0 30%' }}>
                  <option value="">Tháng</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select name="birthYear" value={formData.birthYear} onChange={handleChange} required style={{ padding: '8px', flex: '0 0 40%' }}>
                  <option value="">Năm</option>
                  {(() => {
                    const years = []; const current = new Date().getFullYear(); const max = current - 16; const min = 1900;
                    for (let y = max; y >= min; y--) years.push(y);
                    return years.map(y => <option key={y} value={y}>{y}</option>);
                  })()}
                </select>
              </div>
            </div>
          </>
        )}

        <div>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
        </div>

        <div>
          <label>Mật khẩu:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
        </div>

        {isRegister && (
          <div>
            <label>Nhập lại mật khẩu:</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
          </div>
        )}

        <button type="submit" style={{ padding: '10px', background: 'linear-gradient(90deg, #dc2626, #ef4444)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
          {isRegister ? "Đăng Ký Tài Khoản" : "Đăng Nhập"}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
        {isRegister ? "Bạn đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
        <span onClick={() => { setIsRegister(!isRegister); setError(''); setMessage(''); }} style={{ color: '#b91c1c', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>
          {isRegister ? "Đăng nhập ngay" : "Đăng ký ngay"}
        </span>
      </p>
    </div>
  );
};

export default Login;