// frontend/src/page/trangchu.jsx
import React, { useState } from 'react';
import Layout from '../layout.jsx';
import './trangchu.css';

export default function TrangChu() {
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, matKhau })
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.data));
        const vaiTro = data.data.VaiTro;

        if (vaiTro === 'SinhVien') {
          window.location.href = '/sinh-vien';
        } else if (vaiTro === 'GiangVien') {
          window.location.href = '/advisor/pending-plans';
        } else if (vaiTro === 'Admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Lỗi kết nối đến máy chủ.');
    }
  };

  return (
    <Layout>
      <div className="trangchu-container">
        <div className="welcome-section">
          <div className="badge-pill">Hệ thống thông minh 2026</div>
          <h1 className="main-title">Xin chào đến với hệ thống trợ lý lập kế hoạch học tập</h1>
          <p className="sub-title">Hệ thống hỗ trợ tự động kiểm tra điều kiện môn học, xây dựng lộ trình tối ưu theo năng lực, mô phỏng kịch bản và quản lý học vụ hiệu quả.</p>
          <button className="primary-login-trigger" onClick={() => setShowModal(true)}>
            Đăng Nhập Ngay
          </button>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="login-box animate-pop">
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
              <h3>ĐĂNG NHẬP HỆ THỐNG</h3>
              {error && <p className="error-msg">{error}</p>}
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Email tài khoản:</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="VD: gv01@university.edu.vn" />
                </div>
                <div className="form-group">
                  <label>Mật khẩu:</label>
                  <input type="password" value={matKhau} onChange={(e) => setMatKhau(e.target.value)} required placeholder="Nhập mật khẩu..." />
                </div>
                <button type="submit" className="login-submit-btn">XÁC NHẬN ĐĂNG NHẬP</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}