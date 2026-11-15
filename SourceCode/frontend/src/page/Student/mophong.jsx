import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../layout.jsx';
import './lapkehoach.css';

export default function MoPhongKichBan() {
  const [currentUser, setCurrentUser] = useState(null);
  const [thongTinSV, setThongTinSV] = useState({ GPA_TichLuy: 0, TongTinChiTichLuy: 0 });
  const [loaiKichBan, setLoaiKichBan] = useState('0'); 
  const [danhSachMonAll, setDanhSachMonAll] = useState([]);
  const [maHPRot, setMaHPRot] = useState('');
  
  const [danhSachMonKyToi, setDanhSachMonKyToi] = useState([]);
  const [ketQuaMoPhong, setKetQuaMoPhong] = useState(null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser) {
      setCurrentUser(savedUser);
      const maSV = savedUser.MaSinhVien || savedUser.MaSV || savedUser.MaTK?.replace('TK_', '');
      loadMonHopLe(maSV);
    }
  }, []);

  const loadMonHopLe = async (maSV) => {
    try {
      const res = await fetch(`http://localhost:5000/api/simulation/mon-hop-le/${maSV}`);
      const data = await res.json();
      if (data.success) {
        setThongTinSV(data.sinhVien);
        setDanhSachMonAll(data.data);
        if (data.data.length > 0) setMaHPRot(data.data[0].MaHocPhan);

        const monKyToi = data.data.map(m => ({ ...m, DiemDuKien: 8.0 }));
        setDanhSachMonKyToi(monKyToi);
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    }
  };

  const handleChayMoPhong = async () => {
    const maSV = currentUser?.MaSinhVien || currentUser?.MaSV || currentUser?.MaTK?.replace('TK_', '');
    try {
      const payload = {
        maSinhVien: maSV,
        loaiKichBan: Number(loaiKichBan),
        maHPRot: loaiKichBan === '0' ? maHPRot : null,
        danhSachMonKyToi: loaiKichBan === '1' ? danhSachMonKyToi : []
      };

      const res = await fetch('http://localhost:5000/api/simulation/mophong', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setKetQuaMoPhong(data.ketQua);
        alert(data.ketQua.thongBao);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Lỗi kết nối đến máy chủ.');
    }
  };

  const handleDiemChange = (maHP, diemMoi) => {
    setDanhSachMonKyToi(danhSachMonKyToi.map(m => 
      m.MaHocPhan === maHP ? { ...m, DiemDuKien: Number(diemMoi) } : m
    ));
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <Layout user={currentUser} onLogout={handleLogout}>
      <div className="lapkehoach-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2>Mô Phỏng Kịch Bản Học Tập (What-if Analysis)</h2>
          <Link to="/lap-ke-hoach" style={{ background: '#007bff', color: '#fff', padding: '8px 15px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
            &larr; Quay lại trang Lập Kế Hoạch
          </Link>
        </div>

        {currentUser && (
          <div style={{ background: '#f8f9fa', padding: '10px 15px', borderRadius: '6px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #dee2e6' }}>
            <span>Sinh viên: <b>{thongTinSV.HoTen || currentUser.HoTen || currentUser.MaSinhVien}</b></span>
            <span>GPA Tích Lũy Hiện Tại: <b style={{ color: '#28a745', fontSize: '16px' }}>{thongTinSV.GPA_TichLuy} / 4.0</b></span>
            <span>Tổng TC Tích Lũy: <b>{thongTinSV.TongTinChiTichLuy} TC</b></span>
          </div>
        )}

        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
            <label><b>Chọn loại kịch bản:</b></label>
            <select value={loaiKichBan} onChange={(e) => { setLoaiKichBan(e.target.value); setKetQuaMoPhong(null); }} style={{ padding: '6px', borderRadius: '4px' }}>
              <option value="0">1. Giả định rớt môn (Xem ảnh hưởng GPA & môn bị khóa)</option>
              <option value="1">2. Dự kiến điểm các môn ở kỳ tiếp theo (Tính GPA dự kiến)</option>
            </select>
          </div>

          {loaiKichBan === '0' ? (
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
              <label><b>Chọn môn giả định rớt:</b></label>
              <select value={maHPRot} onChange={(e) => setMaHPRot(e.target.value)} style={{ padding: '6px', borderRadius: '4px', width: '300px' }}>
                {danhSachMonAll.map(m => (
                  <option key={m.MaHocPhan} value={m.MaHocPhan}>{m.MaHocPhan} - {m.TenHocPhan}</option>
                ))}
              </select>
            </div>
          ) : (
            <p style={{ color: '#007bff', fontStyle: 'italic' }}>* Danh sách bên dưới chỉ hiển thị các môn đủ điều kiện học (đã lọc bỏ các môn bị khóa).</p>
          )}

          <button className="btn-thuattoan" onClick={handleChayMoPhong} style={{ background: '#28a745', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Chạy Mô Phỏng What-if
          </button>
        </div>

        {ketQuaMoPhong && (
          <div style={{ background: '#e6f7ff', padding: '15px', borderRadius: '8px', border: '1px solid #91d5ff', marginTop: '20px' }}>
            <h3 style={{ color: '#0050b3', margin: '0 0 10px 0' }}>Kết quả mô phỏng dự kiến:</h3>
            <p style={{ fontSize: '16px', margin: '5px 0' }}>{ketQuaMoPhong.thongBao}</p>
            {ketQuaMoPhong.loai === 1 && ketQuaMoPhong.danhSachBiAnhHuong?.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <b>Các môn học sẽ bị khóa/ảnh hưởng dây chuyền:</b>
                <ul>
                  {ketQuaMoPhong.danhSachBiAnhHuong.map(kh => (
                    <li key={kh.MaHocPhan} style={{ color: '#ff4d4f' }}>{kh.MaHocPhan} - {kh.TenHocPhan} ({kh.LoaiRangBuoc})</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {loaiKichBan === '1' && (
          <div style={{ marginTop: '20px' }}>
            <h3>Danh sách môn học kỳ tới (Chỉ gồm các môn đủ điều kiện)</h3>
            <table className="plan-table">
              <thead>
                <tr>
                  <th>Mã HP</th>
                  <th>Tên Học Phần</th>
                  <th>Số TC</th>
                  <th>Phân Loại</th>
                  <th>Điểm Hệ 10 (Nhập dự kiến)</th>
                  <th>Điểm Quy Đổi Hệ 4 (Tự động)</th>
                </tr>
              </thead>
              <tbody>
                {danhSachMonKyToi.length > 0 ? (
                  danhSachMonKyToi.map(mon => {
                    const diemThang4 = ((Number(mon.DiemDuKien) / 10.0) * 4.0).toFixed(2);
                    return (
                      <tr key={mon.MaHocPhan}>
                        <td>{mon.MaHocPhan}</td>
                        <td>{mon.TenHocPhan}</td>
                        <td>{mon.SoTinChi}</td>
                        <td>{mon.PhanLoai}</td>
                        <td>
                          <input 
                            type="number" 
                            min="0" 
                            max="10" 
                            step="0.1"
                            value={mon.DiemDuKien} 
                            onChange={(e) => handleDiemChange(mon.MaHocPhan, e.target.value)}
                            style={{ width: '80px', padding: '4px', textAlign: 'center' }}
                          />
                        </td>
                        <td>
                          <b style={{ color: '#28a745' }}>{isNaN(diemThang4) ? '0.00' : diemThang4} / 4.0</b>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="6" style={{ textAlign: 'center' }}>Không có môn học hợp lệ nào để mô phỏng.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: '20px' }}>
          <Link to="/lap-ke-hoach" className="btn-thuattoan" style={{ textDecoration: 'none', display: 'inline-block' }}>
            &larr; Quay lại trang Lập Kế Hoạch
          </Link>
        </div>
      </div>
    </Layout>
  );
}