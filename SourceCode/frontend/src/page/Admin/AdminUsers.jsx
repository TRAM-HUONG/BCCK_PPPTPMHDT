// frontend/src/page/Admin/AdminUsers.jsx
import React, { useState, useEffect } from 'react';
import './AdminUsers.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [chuyenNganhList, setChuyenNganhList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [maTK, setMaTK] = useState('');
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Trạng thái ẩn/hiện mật khẩu
  const [vaiTro, setVaiTro] = useState('SinhVien');
  const [hoTen, setHoTen] = useState('');
  const [thongTinThem, setThongTinThem] = useState('');
  const [maNganh, setMaNganh] = useState('');
  const [trangThai, setTrangThai] = useState(1);

  const fetchUsers = () => {
    fetch('http://localhost:5000/api/admin/users')
      .then(res => res.json())
      .then(data => {
        if (data.success) setUsers(data.data);
      })
      .catch(err => console.error('Lỗi tải danh sách:', err));
  };

  useEffect(() => {
    fetchUsers();
    // Lấy danh sách chuyên ngành cho dropdown chọn mã ngành
    fetch('http://localhost:5000/api/admin/ctdt/chuyen-nganh')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setChuyenNganhList(data.data);
          if (data.data.length > 0) {
            setMaNganh(data.data[0].MaNganh);
          }
        }
      })
      .catch(err => console.error('Lỗi tải danh sách chuyên ngành:', err));
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setMaTK(`TK_${Date.now().toString().slice(-4)}`);
    setEmail('');
    setMatKhau('123456');
    setShowPassword(false);
    setVaiTro('SinhVien');
    setHoTen('');
    setThongTinThem('');
    if (chuyenNganhList.length > 0) {
      setMaNganh(chuyenNganhList[0].MaNganh);
    }
    setTrangThai(1);
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setIsEditing(true);
    setMaTK(user.MaTK);
    setEmail(user.Email);
    setVaiTro(user.VaiTro);
    setHoTen(user.HoTen);
    setThongTinThem(user.ThongTinThem || '');
    setMaNganh(user.MaNganh || (chuyenNganhList.length > 0 ? chuyenNganhList[0].MaNganh : ''));
    setTrangThai(user.TrangThai);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = 'http://localhost:5000/api/admin/users';
    const method = isEditing ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maTK, email, matKhau, vaiTro, hoTen, thongTinThem, maNganh, trangThai })
    });
    const data = await response.json();
    if (data.success) {
      alert(data.message);
      setShowModal(false);
      fetchUsers();
    } else {
      alert('Lỗi: ' + data.error);
    }
  };

  const handleDelete = async (maTK) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản ${maTK}?`)) {
      const response = await fetch(`http://localhost:5000/api/admin/users/${maTK}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchUsers();
      }
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>StudyPlanner Admin</h2>
        <nav className="admin-nav">
          <a href="/admin" className="active">📊 Tổng quan hệ thống</a>
          <a href="/admin/users">👥 Quản lý người dùng</a>
          <a href="/admin/curriculum">📚 Quản lý chương trình đào tạo</a>
          <a href="/admin/prerequisites">⚙️ Cấu hình quy tắc tiên quyết</a>
          <a href="/admin/data">🗂️ Quản lý dữ liệu học tập chung</a>
          <a href="/admin/reset-password">🔑 Reset mật khẩu cho sinh viên</a>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>Quản Lý Người Dùng Hệ Thống</h1>
          <button className="btn-add" onClick={handleOpenAdd}>+ Thêm tài khoản mới</button>
        </header>

        <table className="user-table">
          <thead>
            <tr>
              <th>Mã TK</th>
              <th>Email</th>
              <th>Họ Tên</th>
              <th>Vai Trò</th>
              <th>Thông Tin Thêm / Lớp</th>
              <th>Mã Ngành</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.MaTK}>
                <td>{u.MaTK}</td>
                <td>{u.Email}</td>
                <td>{u.HoTen}</td>
                <td><span className={`badge ${u.VaiTro}`}>{u.VaiTro}</span></td>
                <td>{u.ThongTinThem}</td>
                <td>{u.MaNganh || '-'}</td>
                <td>{u.TrangThai ? 'Hoạt động' : 'Đã khóa'}</td>
                <td>
                  <button className="btn-edit" onClick={() => handleOpenEdit(u)}>Sửa</button>
                  <button className="btn-delete" onClick={() => handleDelete(u.MaTK)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>{isEditing ? 'Cập Nhật Tài Khoản' : 'Thêm Tài Khoản Mới'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Mã Tài Khoản:</label>
                  <input type="text" value={maTK} disabled={isEditing} onChange={e => setMaTK(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                {!isEditing && (
                  <div className="form-group">
                    <label>Mật khẩu:</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={matKhau}
                        onChange={e => setMatKhau(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password-btn"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? '🙏' : '👐'}
                      </button>
                    </div>
                  </div>
                )}
                <div className="form-group">
                  <label>Vai Trò:</label>
                  <select value={vaiTro} disabled={isEditing} onChange={e => setVaiTro(e.target.value)}>
                    <option value="SinhVien">SinhVien</option>
                    <option value="GiangVien">GiangVien</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Họ Tên:</label>
                  <input type="text" value={hoTen} onChange={e => setHoTen(e.target.value)} required />
                </div>

                {/* Nếu là SinhVien thì hiện ô nhập Lớp */}
                {vaiTro === 'SinhVien' && (
                  <div className="form-group">
                    <label>Lớp:</label>
                    <input type="text" value={thongTinThem} onChange={e => setThongTinThem(e.target.value)} placeholder="VD: CNTT2023" required />
                  </div>
                )}

                {/* Nếu là SinhVien thì hiện thêm Dropdown chọn Mã Ngành */}
                {vaiTro === 'SinhVien' && (
                  <div className="form-group">
                    <label>Mã Ngành:</label>
                    <select value={maNganh} onChange={e => setMaNganh(e.target.value)} required>
                      {chuyenNganhList.map(cn => (
                        <option key={cn.MaNganh} value={cn.MaNganh}>
                          {cn.MaNganh} - {cn.TenNganh}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {vaiTro === 'GiangVien' && (
                  <div className="form-group">
                    <label>Chuyên Môn:</label>
                    <input type="text" value={thongTinThem} onChange={e => setThongTinThem(e.target.value)} />
                  </div>
                )}

                {vaiTro === 'Admin' && (
                  <div className="form-group">
                    <label>Quyền Hạn:</label>
                    <input type="text" value={thongTinThem} onChange={e => setThongTinThem(e.target.value)} />
                  </div>
                )}

                {isEditing && (
                  <div className="form-group">
                    <label>Trạng Thái:</label>
                    <select value={trangThai} onChange={e => setTrangThai(Number(e.target.value))}>
                      <option value={1}>Hoạt động</option>
                      <option value={0}>Khóa</option>
                    </select>
                  </div>
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
  );
}
