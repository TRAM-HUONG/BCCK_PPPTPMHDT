import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../layout.jsx';
import './lapkehoach.css';

export default function LapKeHoach() {
  const [hocKy, setHocKy] = useState('20242');
  const [danhSachMon, setDanhSachMon] = useState([]);
  const [selectedMaHP, setSelectedMaHP] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [daChayThuatToan, setDaChayThuatToan] = useState(false);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser) setCurrentUser(savedUser);
  }, []);

  // Lấy chính xác mã sinh viên từ thông tin đăng nhập
  const maSinhVien = currentUser?.MaSinhVien || currentUser?.MaSV || (currentUser?.MaTK ? currentUser.MaTK.replace('TK_', 'SV') : '');

  const handleChayThuatToan = async () => {
    if (!maSinhVien) {
      alert('Vui lòng đăng nhập lại tài khoản sinh viên!');
      window.location.href = '/';
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/plan/de-xuat/${maSinhVien}`);
      const data = await response.json();
      if (data.success) {
        setDanhSachMon(data.data);
        setDaChayThuatToan(true);
        alert('Đã chạy thuật toán đề xuất (các môn bị khóa đã được tự động loại bỏ)!');
      }
    } catch {
      alert('Lỗi kết nối đến máy chủ.');
    }
  };

  // QUY TẮC: Không cho phép xóa các môn bắt buộc hoàn thành
  const handleXoaMon = () => {
    if (!selectedMaHP) {
      alert('Vui lòng chọn một dòng môn học cần xóa trong bảng!');
      return;
    }

    const monHienTai = danhSachMon.find(item => item.MaHocPhan === selectedMaHP);
    if (monHienTai && monHienTai.PhanLoai === 'BatBuoc') {
      alert(`Không thể xóa môn học [${monHienTai.MaHocPhan}] ${monHienTai.TenHocPhan} vì đây là môn Bắt Buộc phải hoàn thành trong chương trình!`);
      return;
    }

    setDanhSachMon(danhSachMon.filter(item => item.MaHocPhan !== selectedMaHP));
    setSelectedMaHP(null);
    alert('Đã loại bỏ môn học tự chọn khỏi kế hoạch đề xuất.');
  };

  // Thay thế hàm cũ bằng hàm Lưu Bản Thảo để quản lý / gửi lời nhắn sau
  const handleLuuBanThao = async () => {
    if (!maSinhVien) {
      alert('Vui lòng đăng nhập lại!');
      return;
    }
    if (danhSachMon.length === 0) {
      alert('Danh sách kế hoạch đang trống!');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/plan/luu-ban-thao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maSinhVien, hocKyMucTieu: hocKy, danhSachMon })
      });
      const data = await response.json();
      if (data.success) {
        alert("Đã lưu bản thảo thành công! Chuyển hướng sang trang Quản lý kế hoạch.");
        window.location.href = '/quan-ly-ke-hoach';
      } else {
        alert(data.message || 'Lỗi khi lưu bản thảo.');
      }
    } catch {
      alert('Lỗi kết nối đến máy chủ.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <Layout user={currentUser} onLogout={handleLogout}>
      <div className="lapkehoach-container">
        <h2>Lập Kế Hoạch Học Tập Tự Động</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          {currentUser && <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Sinh viên: <b>{currentUser.HoTen || maSinhVien}</b></p>}
          <Link to="/quan-ly-ke-hoach" style={{ background: '#007bff', color: '#fff', padding: '6px 12px', borderRadius: '4px', textDecoration: 'none', fontSize: '14px' }}>
            📁 Xem Quản Lý Kế Hoạch Đã Lưu
          </Link>
        </div>

        <div className="top-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <label>Học kỳ mục tiêu:</label>
            <select value={hocKy} onChange={(e) => setHocKy(e.target.value)}>
              <option value="20241">20241</option>
              <option value="20242">20242</option>
              <option value="20251">20251</option>
              <option value="20252">20252</option>
            </select>
            <button className="btn-thuattoan" onClick={handleChayThuatToan}>Chạy thuật toán đề xuất</button>
          </div>

          {daChayThuatToan && (
            <Link to="/chi-tiet-mon-khoa" className="btn-thuattoan" style={{ backgroundColor: '#dc3545', textDecoration: 'none' }}>
              Xem chi tiết các môn bị khóa & lý do
            </Link>
          )}
        </div>

        <table className="plan-table" style={{ marginTop: '15px' }}>
          <thead>
            <tr>
              <th>Chọn</th>
              <th>Mã Học Phần</th>
              <th>Tên Học Phần</th>
              <th>Số Tín Chỉ</th>
              <th>Phân Loại</th>
              <th>Học Kỳ Gợi Ý</th>
            </tr>
          </thead>
          <tbody>
            {danhSachMon.length > 0 ? (
              danhSachMon.map((mon) => (
                <tr key={mon.MaHocPhan} onClick={() => setSelectedMaHP(mon.MaHocPhan)} className={selectedMaHP === mon.MaHocPhan ? 'selected-row' : ''}>
                  <td><input type="radio" checked={selectedMaHP === mon.MaHocPhan} onChange={() => setSelectedMaHP(mon.MaHocPhan)} /></td>
                  <td>{mon.MaHocPhan}</td>
                  <td>{mon.TenHocPhan}</td>
                  <td>{mon.SoTinChi}</td>
                  <td>
                    <span style={{ color: mon.PhanLoai === 'BatBuoc' ? '#007acc' : '#28a745', fontWeight: 'bold' }}>
                      {mon.PhanLoai}
                    </span>
                  </td>
                  <td>{mon.HocKyGoiY}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>Chưa có dữ liệu đề xuất. Nhấn chạy thuật toán để bắt đầu.</td></tr>
            )}
          </tbody>
        </table>

        <div className="bottom-actions">
          <button className="btn-xoa" onClick={handleXoaMon}>Xóa môn đã chọn (Chỉ cho phép xóa môn tự chọn)</button>
          {/* Nút lưu bản thảo thay thế cho hàm handleLuuVaGui cũ */}
          <button className="btn-luu" onClick={handleLuuBanThao}>Lưu Bản Thảo Kế Hoạch</button>
        </div>
      </div>
    </Layout>
  );
}