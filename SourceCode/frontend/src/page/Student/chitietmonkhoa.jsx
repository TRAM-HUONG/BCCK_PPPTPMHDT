import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../layout.jsx';
import './lapkehoach.css';

export default function ChiTietMonKhoa() {
  const [danhSachKhoa, setDanhSachKhoa] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');

useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser) {
      setCurrentUser(savedUser);
      const maSV = savedUser.MaSinhVien || savedUser.MaSV || savedUser.MaTK?.replace('TK_', '');
      if (maSV) {
        loadMonBiKhoa(maSV);
      } else {
        alert('Không tìm thấy thông tin mã sinh viên.');
      }
    }
  }, []);

  const loadMonBiKhoa = async (maSV) => {
    try {
      const response = await fetch(`http://localhost:5000/api/plan/bi-khoa/${maSV}`);
      const data = await response.json();
      if (data.success) {
        setDanhSachKhoa(data.data);
      } else {
        setError('Không thể tải danh sách môn bị khóa.');
      }
    } catch (err) {
      setError('Lỗi kết nối đến máy chủ.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <Layout user={currentUser} onLogout={handleLogout}>
      <div className="lapkehoach-container">
        <h2>Chi Tiết Các Môn Học Bị Khóa & Lý Do Thực Tế (2026)</h2>
        <p className="sub-desc">Phân tích chi tiết lý do khóa dựa trên quy chế Học trước, Tiên quyết và Song hành.</p>

        {error && <p className="error-msg">{error}</p>}

        <div className="table-responsive" style={{ marginTop: '20px' }}>
          <table className="plan-table">
            <thead>
              <tr>
                <th>Mã Học Phần</th>
                <th>Tên Học Phần</th>
                <th>Số Tín Chỉ</th>
                <th>Phân Loại</th>
                <th>Học Kỳ Gợi Ý</th>
                <th>Lý Do Khóa / Vi Phạm Ràng Buộc</th>
              </tr>
            </thead>
            <tbody>
              {danhSachKhoa.length > 0 ? (
                danhSachKhoa.map((mon) => (
                  <tr key={mon.MaHocPhan}>
                    <td>{mon.MaHocPhan}</td>
                    <td>{mon.TenHocPhan}</td>
                    <td>{mon.SoTinChi}</td>
                    <td>{mon.PhanLoai}</td>
                    <td>{mon.HocKyGoiY}</td>
                    <td style={{ color: '#dc3545', fontWeight: 'bold', lineHeight: '1.4' }}>
                      {mon.LyDoKhoa}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>Chúc mừng! Bạn không có môn học nào bị khóa.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '20px' }}>
          <Link to="/lap-ke-hoach" className="btn-thuattoan" style={{ textDecoration: 'none', display: 'inline-block' }}>
            &larr; Quay lại trang Lập Kế Hoạch
          </Link>
        </div>
      </div>
    </Layout>
  );
}