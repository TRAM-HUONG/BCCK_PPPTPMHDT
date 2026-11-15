import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../layout.jsx';
import './sinhvien.css';

export default function SinhVienPage() {
  const [user, setUser] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [monCanCaiThien, setMonCanCaiThien] = useState([]);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser) {
      setUser(savedUser);
      const maSV = savedUser.MaSinhVien || savedUser.MaSV;
      if (maSV) {
        loadStudentData(maSV);
      }
    }
  }, []);

  const loadStudentData = async (maSV) => {
    try {
      // 1. Lấy thông tin chi tiết sinh viên từ API
      const resSinhVien = await fetch(`http://localhost:5000/api/advisor/students?maCoVan=GV01`);
      const dataSinhVien = await resSinhVien.json();
      if (dataSinhVien.success) {
        const found = dataSinhVien.data.find(s => s.MaSinhVien === maSV);
        if (found) setStudentInfo(found);
      }

      // 2. Lấy bảng điểm của sinh viên
      const resDiem = await fetch(`http://localhost:5000/api/advisor/transcript/${maSV}`);
      const dataDiem = await resDiem.json();
      if (dataDiem.success) {
        setTranscript(dataDiem.data);
      }

      // 3. Lấy danh sách môn cần cải thiện / học lại
      const resCaiThien = await fetch(`http://localhost:5000/api/plan/mon-can-cai-thien/${maSV}`);
      const dataCaiThien = await resCaiThien.json();
      if (dataCaiThien.success) {
        setMonCanCaiThien(dataCaiThien.data);
      }
    } catch (error) {
      console.error('Lỗi tải dữ liệu sinh viên:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // Nhóm các môn học theo Học Kỳ
  const groupedBySemester = transcript.reduce((acc, item) => {
    const hk = item.HocKy || 'Chưa phân kỳ';
    if (!acc[hk]) acc[hk] = [];
    acc[hk].push(item);
    return acc;
  }, {});

  return (
    <Layout user={user} onLogout={handleLogout}>
      <div className="sinhvien-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        {/* Lời chào */}
        <h2 className="sinhvien-welcome" style={{ marginBottom: '20px' }}>
          Xin chào sinh viên: {studentInfo ? `${studentInfo.HoTen} (MSSV: ${studentInfo.MaSinhVien})` : (user?.HoTen || user?.Email)}
        </h2>

        {/* BỐ CỤC 3 CỘT */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 260px', gap: '20px', alignItems: 'start' }}>
          
          {/* ================= CỘT TRÁI: Thông tin cá nhân & Môn cần học lại/cải thiện ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Thông tin cá nhân */}
            {studentInfo && (
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid #2b579a' }}>
                <h3 style={{ marginTop: 0, color: '#2b579a', fontSize: '1.1rem', marginBottom: '15px' }}>👤 Thông Tin Cá Nhân</h3>
                <p style={{ margin: '8px 0', fontSize: '0.95rem' }}><strong>Họ và tên:</strong> {studentInfo.HoTen}</p>
                <p style={{ margin: '8px 0', fontSize: '0.95rem' }}><strong>MSSV:</strong> {studentInfo.MaSinhVien}</p>
                <p style={{ margin: '8px 0', fontSize: '0.95rem' }}><strong>Lớp:</strong> {studentInfo.Lop} | <strong>Ngành:</strong> {studentInfo.MaNganh}</p>
                <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '12px 0' }} />
                <p style={{ margin: '8px 0', fontSize: '0.95rem' }}><strong>GPA Tích Lũy:</strong> <span style={{ color: '#2b579a', fontWeight: 'bold' }}>{studentInfo.GPA_TichLuy}</span></p>
                <p style={{ margin: '8px 0', fontSize: '0.95rem' }}><strong>Tổng Tín Chỉ:</strong> <span style={{ color: '#2b579a', fontWeight: 'bold' }}>{studentInfo.TongTinChiTichLuy}</span></p>
              </div>
            )}

            {/* Đề xuất môn cần học lại / cải thiện */}
            <div style={{ background: '#fff9f6', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid #fa8c16' }}>
              <h3 style={{ marginTop: 0, color: '#d46b08', fontSize: '1.1rem', marginBottom: '15px' }}>🔔 Cần Học Lại / Cải Thiện</h3>
              {monCanCaiThien.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {monCanCaiThien.map((item, index) => (
                    <div key={index} style={{ background: 'white', padding: '10px', borderRadius: '6px', border: '1px solid #ffd8c2', fontSize: '0.9rem' }}>
                      <div style={{ fontWeight: 'bold', color: '#333' }}>[{item.MaHocPhan}] {item.TenHocPhan}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.85rem' }}>
                        <span>Điểm: <strong style={{ color: item.DiemSo < 5 ? '#ff4d4f' : '#fa8c16' }}>{item.DiemSo ?? 0}</strong></span>
                        <span style={{ 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          fontWeight: 'bold', 
                          background: item.TrangThaiDat === false ? '#fff1f0' : '#fffbe6',
                          color: item.TrangThaiDat === false ? '#cf1322' : '#d46b08',
                          fontSize: '0.75rem'
                        }}>
                          {item.LoaiNhacNho}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, color: '#52c41a', fontSize: '0.9rem', fontWeight: '500' }}>Tuyệt vời! Không có môn cần học lại hay cải thiện.</p>
              )}
            </div>
          </div>

          {/* ================= CỘT GIỮA: Bảng điểm học tập ================= */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, color: '#2b579a', marginBottom: '20px', fontSize: '1.2rem' }}>📊 Bảng Điểm Học Tập Cá Nhân</h3>

            {Object.keys(groupedBySemester).length > 0 ? (
              Object.keys(groupedBySemester).map(hocKy => (
                <div key={hocKy} style={{ marginBottom: '25px' }}>
                  <h4 style={{ background: '#2b579a', color: 'white', padding: '8px 12px', borderRadius: '4px', fontSize: '0.95rem', margin: '0 0 10px 0' }}>
                    Học Kỳ: {hocKy}
                  </h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                    <thead>
                      <tr style={{ background: '#f1f2f6', textAlign: 'left' }}>
                        <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Mã HP</th>
                        <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Tên Học Phần</th>
                        <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Số TC</th>
                        <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Điểm Số</th>
                        <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedBySemester[hocKy].map((item, index) => (
                        <tr key={index}>
                          <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{item.MaHocPhan}</td>
                          <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{item.TenHocPhan}</td>
                          <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{item.SoTinChi}</td>
                          <td style={{ padding: '8px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
                            {item.DiemSo !== null && item.DiemSo !== undefined ? item.DiemSo : 'Chưa có'}
                          </td>
                          <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                            {item.TrangThaiDat ? (
                              <span style={{ color: '#52c41a', fontWeight: 'bold' }}>Đạt</span>
                            ) : (
                              <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>Chưa đạt</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>Chưa có dữ liệu bảng điểm.</p>
            )}
          </div>

          {/* ================= CỘT PHẢI: Các nút chức năng ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginTop: 0, color: '#2b579a', fontSize: '1.1rem', marginBottom: '15px' }}>⚡ Chức Năng Nhanh</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link to="/tra-cuu-ctdt" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#2b579a', color: 'white', padding: '12px 15px', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem' }}>
                    Tra cứu CTĐT
                  </div>
                </Link>
                <Link to="/lap-ke-hoach" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#107c41', color: 'white', padding: '12px 15px', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem' }}>
                    Lập kế hoạch tự động
                  </div>
                </Link>
                <Link to="/mo-phong" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#d9534f', color: 'white', padding: '12px 15px', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem' }}>
                    Mô phỏng (What-if)
                  </div>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}