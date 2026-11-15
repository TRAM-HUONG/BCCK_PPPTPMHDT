import React, { useState, useEffect } from 'react';
import Layout from '../layout.jsx';
import './AdminPrerequisites.css';

export default function AdminPrerequisites() {
  const [adminInfo, setAdminInfo] = useState(null);
  const [rules, setRules] = useState([]);
  const [chuyenNganhList, setChuyenNganhList] = useState([]);
  const [selectedNganh, setSelectedNganh] = useState('');
  const [hocPhanList, setHocPhanList] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [maRB, setMaRB] = useState('');
  const [maHocPhan, setMaHocPhan] = useState('');
  const [maHocPhanDieuKien, setMaHocPhanDieuKien] = useState('');
  const [loaiRangBuoc, setLoaiRangBuoc] = useState('TienQuyet');

  // Lấy danh sách quy tắc và danh sách chuyên ngành ban đầu
  const fetchData = () => {
    fetch('http://localhost:5000/api/admin/prerequisites')
      .then(res => res.json())
      .then(data => { if (data.success) setRules(data.data); });

    fetch('http://localhost:5000/api/admin/ctdt/chuyen-nganh')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          setChuyenNganhList(data.data);
          setSelectedNganh(data.data[0].MaNganh); // Mặc định chọn ngành đầu tiên
        }
      });
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) setAdminInfo(user);
    fetchData();
  }, []);

  // Khi chọn ngành, load danh sách học phần thuộc ngành đó
  useEffect(() => {
    if (selectedNganh) {
      fetch(`http://localhost:5000/api/admin/ctdt/hoc-phan`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // Lọc học phần theo MaNganh được chọn
            const filtered = data.data.filter(hp => hp.MaNganh === selectedNganh);
            setHocPhanList(filtered);
            if (filtered.length > 0) {
              setMaHocPhan(filtered[0].MaHocPhan);
              setMaHocPhanDieuKien(filtered[0].MaHocPhan);
            }
          }
        });
    }
  }, [selectedNganh]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setMaRB(`RB${Date.now().toString().slice(-4)}`);
    setMaHocPhan(hocPhanList[0]?.MaHocPhan || '');
    setMaHocPhanDieuKien(hocPhanList[0]?.MaHocPhan || '');
    setLoaiRangBuoc('TienQuyet');
    setShowModal(true);
  };

  const handleOpenEdit = (rule) => {
    setIsEditing(true);
    setMaRB(rule.MaRB);
    setMaHocPhan(rule.MaHP);
    setMaHocPhanDieuKien(rule.MaHPDieuKien);
    setLoaiRangBuoc(rule.LoaiRangBuoc);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (maHocPhan === maHocPhanDieuKien) {
      alert('Môn học và môn điều kiện không được trùng nhau!');
      return;
    }

    const url = isEditing
      ? `http://localhost:5000/api/admin/prerequisites/${maRB}`
      : 'http://localhost:5000/api/admin/prerequisites';

    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maRB, maHocPhan, maHocPhanDieuKien, loaiRangBuoc })
    });

    const data = await res.json();
    if (data.success) {
      alert(data.message);
      setShowModal(false);
      fetchData();
    } else {
      alert('Lỗi: ' + data.error);
    }
  };

  const handleDelete = async (maRB) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa quy tắc này?')) return;
    const res = await fetch(`http://localhost:5000/api/admin/prerequisites/${maRB}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      alert(data.message);
      fetchData();
    }
  };

  // Lọc danh sách quy tắc hiển thị theo ngành đang chọn
  const filteredRules = rules.filter(r => {
    const hp = hocPhanList.find(item => item.MaHocPhan === r.MaHP);
    return !selectedNganh || (hp && hp.MaNganh === selectedNganh);
  });

  return (
    <Layout user={adminInfo} onLogout={() => { localStorage.removeItem('user'); window.location.href = '/'; }}>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <h2>StudyPlanner Admin</h2>
          <nav className="admin-nav">
            <a href="/admin">📊 Tổng quan hệ thống</a>
            <a href="/admin/users">👥 Quản lý người dùng</a>
            <a href="/admin/curriculum">📚 Quản lý chương trình đào tạo</a>
            <a href="/admin/prerequisites" className="active">⚙️ Cấu hình quy tắc tiên quyết</a>
            <a href="/admin/reset-password">🔑 Reset mật khẩu cho sinh viên</a>
          </nav>
        </aside>

        <main className="admin-main">
          <header className="admin-header">
            <h1>Cấu Hình Quy Tắc Tiên Quyết Theo Ngành</h1>
            <button className="btn-add" onClick={handleOpenAdd}>+ Thêm Quy Tắc Mới</button>
          </header>

          {/* Thanh chọn chuyên ngành để lọc */}
          <div className="filter-container" style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: '600', marginRight: '10px' }}>Chọn Chuyên Ngành:</label>
            <select
              value={selectedNganh}
              onChange={e => setSelectedNganh(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            >
              {chuyenNganhList.map(cn => (
                <option key={cn.MaNganh} value={cn.MaNganh}>
                  {cn.MaNganh} - {cn.TenNganh}
                </option>
              ))}
            </select>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã RB</th>
                <th>Môn Học (Bị ràng buộc)</th>
                <th>Môn Điều Kiện / Tiên Quyết</th>
                <th>Loại Ràng Buộc</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredRules.map(r => (
                <tr key={r.MaRB}>
                  <td>{r.MaRB}</td>
                  <td>{r.MaHP} - {r.TenHP}</td>
                  <td>{r.MaHPDieuKien} - {r.TenHPDieuKien}</td>
                  <td><span className={`badge-rb ${r.LoaiRangBuoc}`}>{r.LoaiRangBuoc}</span></td>
                  <td>
                    <button className="btn-edit" onClick={() => handleOpenEdit(r)}>Sửa</button>
                    <button className="btn-delete" onClick={() => handleDelete(r.MaRB)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>{isEditing ? 'Cập Nhật Quy Tắc' : 'Thêm Quy Tắc Ràng Buộc'}</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Mã Ràng Buộc:</label>
                    <input type="text" value={maRB} disabled={isEditing} onChange={e => setMaRB(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Môn Học (Thuộc ngành {selectedNganh}):</label>
                    <select value={maHocPhan} onChange={e => setMaHocPhan(e.target.value)}>
                      {hocPhanList.map(hp => (
                        <option key={hp.MaHocPhan} value={hp.MaHocPhan}>{hp.MaHocPhan} - {hp.TenHocPhan}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Môn Học Điều Kiện:</label>
                    <select value={maHocPhanDieuKien} onChange={e => setMaHocPhanDieuKien(e.target.value)}>
                      {hocPhanList.map(hp => (
                        <option key={hp.MaHocPhan} value={hp.MaHocPhan}>{hp.MaHocPhan} - {hp.TenHocPhan}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Loại Ràng Buộc:</label>
                    <select value={loaiRangBuoc} onChange={e => setLoaiRangBuoc(e.target.value)}>
                      <option value="TienQuyet">Tiên Quyết (TienQuyet)</option>
                      <option value="HocTruoc">Học Trước (HocTruoc)</option>
                      <option value="SongHanh">Song Hành (SongHanh)</option>
                    </select>
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="btn-save">Lưu</button>
                    <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
}