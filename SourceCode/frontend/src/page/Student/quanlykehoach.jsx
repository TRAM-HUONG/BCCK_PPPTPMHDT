import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../layout.jsx';
import './lapkehoach.css';

export default function QuanLyKeHoach() {
  const [danhSachKH, setDanhSachKH] = useState([]);
  const [selectedKH, setSelectedKH] = useState(null);
  const [chiTietMon, setChiTietMon] = useState([]);
  const [phanHoiCoVan, setPhanHoiCoVan] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // State phục vụ việc thêm môn học khi chỉnh sửa
  const [danhSachDeXuat, setDanhSachDeXuat] = useState([]);
  const [selectedMonThem, setSelectedMonThem] = useState('');

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser) {
      setCurrentUser(savedUser);
      const maSV = savedUser.MaSinhVien || savedUser.MaSV || savedUser.MaTK?.replace('TK_', '');
      loadDanhSach(maSV);
      loadMonDeXuat(maSV);
    }
  }, []);

  const loadDanhSach = async (maSV) => {
    try {
      const res = await fetch(`http://localhost:5000/api/plan/danh-sach/${maSV}`);
      const data = await res.json();
      if (data.success) {
        setDanhSachKH(data.data);
      }
    } catch {
      alert('Lỗi tải danh sách kế hoạch.');
    }
  };

  const loadMonDeXuat = async (maSV) => {
    try {
      const res = await fetch(`http://localhost:5000/api/plan/de-xuat/${maSV}`);
      const data = await res.json();
      if (data.success) {
        setDanhSachDeXuat(data.data);
      }
    } catch {
      console.error('Lỗi tải danh sách môn đề xuất.');
    }
  };

  const handleChonKeHoach = async (maKeHoach) => {
    try {
      const res = await fetch(`http://localhost:5000/api/plan/chi-tiet-kh/${maKeHoach}`);
      const data = await res.json();
      if (data.success) {
        setSelectedKH(data.keHoach);
        setChiTietMon(data.danhSachMon);
        setPhanHoiCoVan(data.phanHoi);
      }
    } catch {
      alert('Lỗi tải chi tiết kế hoạch.');
    }
  };

  // Xóa toàn bộ kế hoạch
  const handleXoaKeHoach = async (maKeHoach, trangThai) => {
    if (trangThai !== 'BanThao' && trangThai !== 'YeuCauChinhSua') {
      alert('Chỉ được xóa các kế hoạch đang ở trạng thái Bản Thảo hoặc Yêu Cầu Chỉnh Sửa!');
      return;
    }
    if (!window.confirm('Bạn có chắc chắn muốn xóa kế hoạch này?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/plan/xoa/${maKeHoach}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('Đã xóa kế hoạch thành công!');
        setSelectedKH(null);
        setChiTietMon([]);
        setPhanHoiCoVan(null);
        const maSV = currentUser?.MaSinhVien || currentUser?.MaSV;
        loadDanhSach(maSV);
      } else {
        alert(data.message || 'Không thể xóa kế hoạch.');
      }
    } catch {
      alert('Lỗi kết nối khi xóa kế hoạch.');
    }
  };

  // Xóa một môn học khỏi danh sách chi tiết khi đang chỉnh sửa
  const handleXoaMon = (maHocPhan) => {
    if (chiTietMon.length <= 1) {
      alert('Kế hoạch phải có ít nhất một học phần!');
      return;
    }
    setChiTietMon(chiTietMon.filter(m => m.MaHocPhan !== maHocPhan));
  };

  // Thêm môn học từ danh sách đề xuất
  const handleThemMon = () => {
    if (!selectedMonThem) return;
    const monDaCo = chiTietMon.find(m => m.MaHocPhan === selectedMonThem);
    if (monDaCo) {
      alert('Môn học này đã có trong kế hoạch!');
      return;
    }
    const monInfo = danhSachDeXuat.find(m => m.MaHocPhan === selectedMonThem);
    if (monInfo) {
      setChiTietMon([...chiTietMon, { ...monInfo, TrangThaiMon: 'DeXuat' }]);
      setSelectedMonThem('');
    }
  };

  // Lưu lại thay đổi chỉnh sửa vào database
  const handleLuuThayDoi = async () => {
    if (!selectedKH) return;
    try {
      const res = await fetch('http://localhost:5000/api/plan/cap-nhat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maKeHoach: selectedKH.MaKeHoach,
          danhSachMon: chiTietMon
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        const maSV = currentUser?.MaSinhVien || currentUser?.MaSV;
        loadDanhSach(maSV);
        handleChonKeHoach(selectedKH.MaKeHoach);
      } else {
        alert(data.message || 'Lỗi cập nhật kế hoạch.');
      }
    } catch {
      alert('Lỗi kết nối khi cập nhật kế hoạch.');
    }
  };

  const handleGuiChoCoVan = async () => {
    if (!selectedKH) return;
    try {
      const res = await fetch('http://localhost:5000/api/plan/gui-co-van', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maKeHoach: selectedKH.MaKeHoach })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        const maSV = currentUser?.MaSinhVien || currentUser?.MaSV;
        loadDanhSach(maSV);
        handleChonKeHoach(selectedKH.MaKeHoach);
      }
    } catch {
      alert('Lỗi gửi cố vấn.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'BanThao': return <span style={{ color: '#faad14' }}>[Bản Thảo]</span>;
      case 'ChoDuyet': return <span style={{ color: '#1890ff' }}>[Chờ Duyệt]</span>;
      case 'DaDuyet': return <span style={{ color: '#52c41a' }}>[Đã Duyệt]</span>;
      case 'YeuCauChinhSua': return <span style={{ color: '#ff4d4f' }}>[Yêu Cầu Chỉnh Sửa]</span>;
      default: return <span>[{status}]</span>;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const isEditable = selectedKH && (selectedKH.TrangThaiDuyet === 'BanThao' || selectedKH.TrangThaiDuyet === 'YeuCauChinhSua');

  return (
    <Layout user={currentUser} onLogout={handleLogout}>
      <div className="lapkehoach-container">
        <h2>Quản Lý Các Kế Hoạch Học Tập Đã Lưu</h2>
        
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          {/* Danh sách kế hoạch */}
          <div style={{ flex: '1', background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>Danh sách kế hoạch</h3>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
              {danhSachKH.length > 0 ? (
                danhSachKH.map(kh => (
                  <li 
                    key={kh.MaKeHoach} 
                    style={{ 
                      padding: '10px', 
                      borderBottom: '1px solid #eee', 
                      cursor: 'pointer', 
                      background: selectedKH?.MaKeHoach === kh.MaKeHoach ? '#e6f7ff' : 'transparent',
                      borderRadius: '4px',
                      marginBottom: '5px'
                    }} 
                    onClick={() => handleChonKeHoach(kh.MaKeHoach)}
                  >
                    <b>Kỳ: {kh.HocKyMucTieu}</b> - Tổng TC: {kh.TongSoTinChi} <br />
                    <div style={{ fontSize: '12px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Trạng thái: {getStatusBadge(kh.TrangThaiDuyet)}</span>
                      {(kh.TrangThaiDuyet === 'BanThao' || kh.TrangThaiDuyet === 'YeuCauChinhSua') && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleXoaKeHoach(kh.MaKeHoach, kh.TrangThaiDuyet); }} 
                          style={{ background: '#ff4d4f', color: '#fff', border: 'none', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                        >
                          Xóa KH
                        </button>
                      )}
                    </div>
                  </li>
                ))
              ) : (
                <p>Chưa có kế hoạch nào được lưu.</p>
              )}
            </ul>
          </div>

          {/* Chi tiết kế hoạch */}
          <div style={{ flex: '2', background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {selectedKH ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Chi tiết học phần (Kỳ: {selectedKH.HocKyMucTieu})</h3>
                  <div>Trạng thái: {getStatusBadge(selectedKH.TrangThaiDuyet)}</div>
                </div>

                {/* Hiển thị phản hồi của cố vấn nếu có yêu cầu chỉnh sửa */}
                {phanHoiCoVan && (
                  <div style={{ background: '#fff1f0', border: '1px solid #ffa39e', padding: '10px', borderRadius: '6px', margin: '15px 0' }}>
                    <h4 style={{ color: '#cf1322', margin: '0 0 5px 0' }}>Ý kiến từ Giảng viên cố vấn:</h4>
                    <p style={{ margin: 0, fontSize: '14px' }}>{phanHoiCoVan.NoiDungGopY}</p>
                  </div>
                )}

                {/* Phần thêm môn học nếu được phép chỉnh sửa */}
                {isEditable && (
                  <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', padding: '10px', borderRadius: '6px', marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select 
                      value={selectedMonThem} 
                      onChange={(e) => setSelectedMonThem(e.target.value)}
                      style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
                    >
                      <option value="">-- Chọn môn học có thể học để thêm vào kỳ --</option>
                      {danhSachDeXuat.map(m => (
                        <option key={m.MaHocPhan} value={m.MaHocPhan}>
                          [{m.MaHocPhan}] {m.TenHocPhan} ({m.SoTinChi} TC - Kỳ gợi ý: {m.HocKyGoiY})
                        </option>
                      ))}
                    </select>
                    <button 
                      onClick={handleThemMon} 
                      style={{ background: '#52c41a', color: '#fff', border: 'none', padding: '7px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Thêm Môn
                    </button>
                  </div>
                )}

                <table className="plan-table" style={{ marginTop: '10px', width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#fafafa', textAlign: 'left' }}>
                      <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Mã HP</th>
                      <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Tên Học Phần</th>
                      <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Số TC</th>
                      <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Phân Loại</th>
                      {isEditable && <th style={{ padding: '8px', borderBottom: '1px solid #ddd', textAlign: 'center' }}>Thao tác</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {chiTietMon.map(m => (
                      <tr key={m.MaHocPhan}>
                        <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{m.MaHocPhan}</td>
                        <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{m.TenHocPhan}</td>
                        <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{m.SoTinChi}</td>
                        <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{m.PhanLoai}</td>
                        {isEditable && (
                          <td style={{ padding: '8px', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                            <button 
                              onClick={() => handleXoaMon(m.MaHocPhan)}
                              style={{ background: '#ff4d4f', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                            >
                              Xóa môn
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  {isEditable && (
                    <>
                      <button 
                        className="btn-luu" 
                        onClick={handleLuuThayDoi} 
                        style={{ background: '#1890ff', flex: 1, padding: '10px', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Lưu Thay Đổi
                      </button>
                      <button 
                        className="btn-luu" 
                        onClick={handleGuiChoCoVan} 
                        style={{ background: '#52c41a', flex: 1, padding: '10px', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        {selectedKH.TrangThaiDuyet === 'YeuCauChinhSua' ? 'Gửi Lại Kế Hoạch Cho Cố Vấn' : 'Gửi Kế Hoạch Cho Cố Vấn Học Tập'}
                      </button>
                    </>
                  )}
                  {selectedKH.TrangThaiDuyet === 'ChoDuyet' && (
                    <p style={{ color: '#1890ff', fontWeight: 'bold', textAlign: 'center', width: '100%' }}>Kế hoạch đang chờ cố vấn xem xét và phê duyệt.</p>
                  )}
                  {selectedKH.TrangThaiDuyet === 'DaDuyet' && (
                    <p style={{ color: '#52c41a', fontWeight: 'bold', textAlign: 'center', width: '100%' }}>Kế hoạch đã được cố vấn phê duyệt thành công!</p>
                  )}
                </div>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#888' }}>Chọn một kế hoạch bên trái để xem chi tiết.</p>
            )}
          </div>
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