import React, { useState, useEffect } from 'react';
import Layout from '../layout';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [adminInfo, setAdminInfo] = useState(null);
  const [stats, setStats] = useState({
    TongSinhVien: 0,
    TongGiangVien: 0,
    TongHocPhan: 0,
    TongNganh: 0,
    TaiKhoanHoatDong: 0
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setAdminInfo(user);
    }

    fetch('http://localhost:5000/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.data);
        }
      })
      .catch(err => console.error('Lỗi tải thống kê:', err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <Layout user={adminInfo} onLogout={handleLogout}>
      <div className="admin-dashboard-container">
        <aside className="admin-sidebar">
          <h2>Quản Trị Hệ Thống</h2>
          <nav className="admin-nav">
            <a href="/admin" className="active">📊 Tổng quan hệ thống</a>
            <a href="/admin/users">👥 Quản lý người dùng</a>
            <a href="/admin/curriculum">📚 Chương trình đào tạo</a>
            <a href="/admin/grades">📊 Dữ liệu học tập chung</a>
            <a href="/admin/prerequisites">⚙️ Quy tắc tiên quyết</a>
            <a href="/admin/reset-password">🔑 Reset mật khẩu SV</a>
          </nav>
        </aside>

        <main className="admin-main">
          <header className="admin-header">
            <h1>Bảng Điều Khiển Quản Trị Viên</h1>
            <div className="admin-user-profile">
              <span>Xin chào, <strong>{adminInfo?.HoTen || 'Admin'}</strong> ({adminInfo?.QuyenHanQuanTri})</span>
            </div>
          </header>

          <section className="stats-grid">
            <div className="stat-card">
              <h3>Tổng số Sinh Viên</h3>
              <p className="stat-number">{stats.TongSinhVien}</p>
            </div>
            <div className="stat-card">
              <h3>Tổng số Cố Vấn / GV</h3>
              <p className="stat-number">{stats.TongGiangVien}</p>
            </div>
            <div className="stat-card">
              <h3>Tổng số Học Phần</h3>
              <p className="stat-number">{stats.TongHocPhan}</p>
            </div>
            <div className="stat-card">
              <h3>Chuyên Ngành</h3>
              <p className="stat-number">{stats.TongNganh}</p>
            </div>
          </section>

          <section className="admin-quick-actions">
            <h2>Chức năng quản trị nhanh</h2>
            <div className="action-buttons-grid">
              <a href="/admin/users" className="action-card-link">Quản lý người dùng</a>
              <a href="/admin/curriculum" className="action-card-link">Quản lý chương trình đào tạo</a>
              <a href="/admin/prerequisites" className="action-card-link">Cấu hình quy tắc tiên quyết</a>
              <a href="/admin/grades" className="action-card-link">Quản lý dữ liệu học tập chung</a>
              <a href="/admin/reset-password" className="action-card-link">Reset mật khẩu cho sinh viên</a>
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
}