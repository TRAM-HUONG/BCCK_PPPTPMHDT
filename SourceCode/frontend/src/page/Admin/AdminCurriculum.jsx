import React, { useState, useEffect } from 'react';
import Layout from '../layout';
import './AdminCurriculum.css';

export default function AdminCurriculum() {
  const [activeTab, setActiveTab] = useState('hocPhan');
  const [chuyenNganhList, setChuyenNganhList] = useState([]);
  const [hocPhanList, setHocPhanList] = useState([]);
  const [adminInfo, setAdminInfo] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const fetchData = () => {
    fetch('http://localhost:5000/api/admin/ctdt/chuyen-nganh')
      .then(res => res.json())
      .then(data => { if (data.success) setChuyenNganhList(data.data); });

    fetch('http://localhost:5000/api/admin/ctdt/hoc-phan')
      .then(res => res.json())
      .then(data => { if (data.success) setHocPhanList(data.data); });
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setAdminInfo(user);
    }
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // frontend/src/page/Admin/AdminCurriculum.jsx
  const handleOpenAdd = () => {
    setIsEditing(false);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const defaultNganh = chuyenNganhList[0]?.MaNganh || '';
    setFormData({
      MaHocPhan: `HP${randomSuffix}`,
      maHocPhan: `HP${randomSuffix}`,
      PhanLoai: 'BatBuoc',
      phanLoai: 'BatBuoc',
      MaNganh: defaultNganh,
      maNganh: defaultNganh
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setFormData(item);
    setShowModal(true);
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa?')) return;
    const url = type === 'hp'
      ? `http://localhost:5000/api/admin/ctdt/hoc-phan/${id}`
      : `http://localhost:5000/api/admin/ctdt/chuyen-nganh/${id}`;

    const res = await fetch(url, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      alert(data.message);
      fetchData();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isHP = activeTab === 'hocPhan';
    const id = isHP ? formData.MaHocPhan : formData.MaNganh;

    const url = isEditing
      ? `http://localhost:5000/api/admin/ctdt/${isHP ? 'hoc-phan' : 'chuyen-nganh'}/${id}`
      : `http://localhost:5000/api/admin/ctdt/${isHP ? 'hoc-phan' : 'chuyen-nganh'}`;

    const res = await fetch(url, {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
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

  return (
    <Layout user={adminInfo} onLogout={handleLogout}>
      <div className="admin-dashboard-container">
        <aside className="admin-sidebar">
          <h2>Quản Trị Hệ Thống</h2>
          <nav className="admin-nav">
            <a href="/admin">📊 Tổng quan hệ thống</a>
            <a href="/admin/users">👥 Quản lý người dùng</a>
            <a href="/admin/curriculum" className="active">📚 Chương trình đào tạo</a>
            <a href="/admin/grades">📊 Dữ liệu học tập chung</a>
            <a href="/admin/prerequisites">⚙️ Quy tắc tiên quyết</a>
            <a href="/admin/reset-password">🔑 Reset mật khẩu SV</a>
          </nav>
        </aside>

        <main className="admin-main">
          <header className="admin-header">
            <h1>Quản Lý Chương Trình Đào Tạo</h1>
            <button className="btn-add" onClick={handleOpenAdd}>
              + Thêm mới {activeTab === 'hocPhan' ? 'Học Phần' : 'Chuyên Ngành'}
            </button>
          </header>

          <div className="tab-buttons">
            <button className={activeTab === 'hocPhan' ? 'active' : ''} onClick={() => setActiveTab('hocPhan')}>Quản Lý Học Phần</button>
            <button className={activeTab === 'chuyenNganh' ? 'active' : ''} onClick={() => setActiveTab('chuyenNganh')}>Quản Lý Chuyên Ngành</button>
          </div>

          {activeTab === 'hocPhan' ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã HP</th>
                  <th>Tên Học Phần</th>
                  <th>Số Tín Chỉ</th>
                  <th>Phân Loại</th>
                  <th>Mã Ngành</th>
                  <th>Học Kỳ Gợi Ý</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {hocPhanList.map(hp => (
                  <tr key={hp.MaHocPhan}>
                    <td>{hp.MaHocPhan}</td>
                    <td>{hp.TenHocPhan}</td>
                    <td>{hp.SoTinChi}</td>
                    <td>{hp.PhanLoai}</td>
                    <td>{hp.MaNganh}</td>
                    <td>{hp.HocKyGoiY}</td>
                    <td>
                      <button className="btn-edit" onClick={() => handleOpenEdit(hp)}>Sửa</button>
                      <button className="btn-delete" onClick={() => handleDelete(hp.MaHocPhan, 'hp')}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã Ngành</th>
                  <th>Tên Chuyên Ngành</th>
                  <th>Khóa Học</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {chuyenNganhList.map(cn => (
                  <tr key={cn.MaNganh}>
                    <td>{cn.MaNganh}</td>
                    <td>{cn.TenNganh}</td>
                    <td>{cn.KhoaHoc}</td>
                    <td>
                      <button className="btn-edit" onClick={() => handleOpenEdit(cn)}>Sửa</button>
                      <button className="btn-delete" onClick={() => handleDelete(cn.MaNganh, 'cn')}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>{isEditing ? 'Cập Nhật' : 'Thêm'} {activeTab === 'hocPhan' ? 'Học Phần' : 'Chuyên Ngành'}</h3>
                <form onSubmit={handleSubmit}>
                  {activeTab === 'hocPhan' ? (
                    <>
                      <div className="form-group"><label>Mã HP:</label><input type="text" value={formData.MaHocPhan || ''} disabled={isEditing} onChange={e => setFormData({ ...formData, maHocPhan: e.target.value, MaHocPhan: e.target.value })} required /></div>
                      <div className="form-group"><label>Tên Học Phần:</label><input type="text" value={formData.TenHocPhan || ''} onChange={e => setFormData({ ...formData, tenHocPhan: e.target.value, TenHocPhan: e.target.value })} required /></div>
                      <div className="form-group"><label>Số Tín Chỉ:</label><input type="number" value={formData.SoTinChi || ''} onChange={e => setFormData({ ...formData, soTinChi: e.target.value, SoTinChi: e.target.value })} required /></div>
                      <div className="form-group"><label>Phân Loại:</label><select value={formData.PhanLoai || 'BatBuoc'} onChange={e => setFormData({ ...formData, phanLoai: e.target.value, PhanLoai: e.target.value })}><option value="BatBuoc">Bắt buộc</option><option value="TuChon">Tự chọn</option></select></div>
                      <div className="form-group">
                        <label>Mã Ngành:</label>
                        <select
                          value={formData.MaNganh || ''}
                          onChange={e => setFormData({ ...formData, maNganh: e.target.value, MaNganh: e.target.value })}
                          required
                        >
                          {chuyenNganhList.map(cn => (
                            <option key={cn.MaNganh} value={cn.MaNganh}>
                              {cn.MaNganh} - {cn.TenNganh}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group"><label>Học Kỳ Gợi Ý:</label><input type="number" value={formData.HocKyGoiY || ''} onChange={e => setFormData({ ...formData, hocKyGoiY: e.target.value, HocKyGoiY: e.target.value })} required /></div>
                    </>
                  ) : (
                    <>
                      <div className="form-group"><label>Mã Ngành:</label><input type="text" value={formData.MaNganh || ''} disabled={isEditing} onChange={e => setFormData({ ...formData, maNganh: e.target.value, MaNganh: e.target.value })} required /></div>
                      <div className="form-group"><label>Tên Ngành:</label><input type="text" value={formData.TenNganh || ''} onChange={e => setFormData({ ...formData, tenNganh: e.target.value, TenNganh: e.target.value })} required /></div>
                      <div className="form-group"><label>Khóa Học:</label><input type="text" value={formData.KhoaHoc || ''} onChange={e => setFormData({ ...formData, khoaHoc: e.target.value, KhoaHoc: e.target.value })} required /></div>
                    </>
                  )}
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