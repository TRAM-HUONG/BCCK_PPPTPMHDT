import React from 'react';
import './layout.css';

export default function Layout({ user, onLogout, children }) {
  // Lấy email hoặc tên để lấy chữ cái đầu làm avatar đại diện
  const identifier = user?.Email || user?.HoTen || user?.MaSinhVien || user?.MaTK || 'U';
  const firstLetter = identifier.charAt(0).toUpperCase();

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-brand">
          <div className="logo-icon">🎓</div>
          <h1>Hệ Thống Trợ Lý Lập Kế Hoạch Học Tập</h1>
        </div>

        {user && (
          <div className="user-profile-section">
            <div className="user-avatar" title={identifier}>
              {firstLetter}
            </div>
            <div className="user-info">
              <span className="user-name">{user.HoTen || user.MaSinhVien || 'Thành viên'}</span>
              <span className="user-role">Sinh viên hệ chính quy</span>
            </div>
            <button onClick={onLogout} className="logout-btn">
              ĐĂNG XUẤT
            </button>
          </div>
        )}
      </header>
      
      <main className="app-content">
        {children}
      </main>

      <footer className="app-footer">
        <p>&copy; 2026 Hệ Thống Trợ Lý Lập Kế Hoạch Học Tập Đại Học.</p>
      </footer>
    </div>
  );
}