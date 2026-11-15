import React, { useState, useEffect } from 'react';
import Layout from '../layout.jsx';
import './tracuuctdt.css';

export default function TraCuuCTDT({ user, onLogout }) {
  const [chuyenNganhs, setChuyenNganhs] = useState([]);
  const [selectedNganh, setSelectedNganh] = useState('');
  const [danhSachHP, setDanhSachHP] = useState([]);
  const [danhSachRB, setDanhSachRB] = useState([]);
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/ctdt/chuyen-nganh')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setChuyenNganhs(data.data);
          if (data.data.length > 0) {
            setSelectedNganh(data.data[0].MaNganh);
          }
        }
      })
      .catch(err => setError('Không thể kết nối đến máy chủ.'));
  }, []);

  const handleTraCuu = async (e) => {
    e.preventDefault();
    if (!selectedNganh) return;
    try {
      const response = await fetch(`http://localhost:5000/api/ctdt/${selectedNganh}`);
      const data = await response.json();
      
      const rbResponse = await fetch(`http://localhost:5000/api/ctdt/rang-buoc/${selectedNganh}`);
      const rbData = await rbResponse.json();

      if (data.success && rbData.success) {
        setDanhSachHP(data.data);
        setDanhSachRB(rbData.data);
        setError('');
      } else {
        setError('Lỗi khi tải dữ liệu chương trình đào tạo.');
      }
    } catch (err) {
      setError('Lỗi kết nối đến máy chủ.');
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="tracuuctdt-container">
        <h2>Tra Cứu Khung Chương Trình Đào Tạo</h2>
        
        <form onSubmit={handleTraCuu} className="search-form">
          <label>Chọn Chuyên ngành:</label>
          <select 
            value={selectedNganh} 
            onChange={(e) => setSelectedNganh(e.target.value)}
          >
            {chuyenNganhs.map(cn => (
              <option key={cn.MaNganh} value={cn.MaNganh}>
                {cn.TenNganh}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-tracuu">Xem Chương Trình</button>
          <button 
            type="button" 
            className="btn-graph" 
            onClick={() => setShowGraphModal(true)}
            style={{ marginLeft: '10px', backgroundColor: '#28a745', color: '#white' }}
          >
            Xem Sơ Đồ Đồ Thị Tiên Quyết
          </button>
        </form>

        {error && <p className="error-msg">{error}</p>}

        <div className="table-responsive">
          <table className="ctdt-table">
            <thead>
              <tr>
                <th>Mã Học Phần</th>
                <th>Tên Học Phần</th>
                <th>Số Tín Chỉ</th>
                <th>Phân Loại</th>
                <th>Học Kỳ Gợi Ý</th>
                <th>Môn Tiên Quyết</th>
              </tr>
            </thead>
            <tbody>
              {danhSachHP.length > 0 ? (
                danhSachHP.map((hp) => (
                  <tr key={hp.MaHocPhan}>
                    <td>{hp.MaHocPhan}</td>
                    <td>{hp.TenHocPhan}</td>
                    <td>{hp.SoTinChi}</td>
                    <td>{hp.PhanLoai}</td>
                    <td>{hp.HocKyGoiY}</td>
                    <td>{hp.MonTienQuyet}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>Chưa có dữ liệu học phần.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal hiển thị sơ đồ đồ thị liên kết */}
        {/* Modal hiển thị sơ đồ đồ thị liên kết kèm tên môn học */}
        {showGraphModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ width: '85%', maxHeight: '80vh', overflowY: 'auto', background: '#fff', padding: '20px', borderRadius: '8px' }}>
              <h3>Sơ Đồ Đồ Thị Liên Kết Môn Điều Kiện </h3>
              <p>Danh sách các mối quan hệ ràng buộc :</p>
              
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {danhSachRB.length > 0 ? (
                  danhSachRB.map((rb) => (
                    <li key={rb.MaRB} style={{ padding: '10px 0', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1, textAlign: 'right', paddingRight: '15px' }}>
                        <strong>{rb.MaHocPhanDieuKien}</strong><br/>
                        <span style={{ fontSize: '13px', color: '#666' }}>{rb.TenHocPhanDieuKien}</span>
                      </div>
                      
                      <div style={{ textAlign: 'center', minWidth: '150px' }}>
                        <span style={{ padding: '4px 8px', background: '#e9ecef', borderRadius: '4px', color: '#007bff', fontWeight: 'bold', fontSize: '12px' }}>
                          [ {rb.LoaiRangBuoc} ] ➔
                        </span>
                      </div>

                      <div style={{ flex: 1, textAlign: 'left', paddingLeft: '15px' }}>
                        <strong>{rb.MaHocPhan}</strong><br/>
                        <span style={{ fontSize: '13px', color: '#666' }}>{rb.TenHocPhanChinh}</span>
                      </div>
                    </li>
                  ))
                ) : (
                  <li>Không có dữ liệu ràng buộc cho chuyên ngành này.</li>
                )}
              </ul>

              <button 
                onClick={() => setShowGraphModal(false)}
                style={{ marginTop: '20px', padding: '8px 16px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Đóng Sơ Đồ
              </button>
            </div>
          </div>
        )}
     
      </div>
    </Layout>
  );
}
