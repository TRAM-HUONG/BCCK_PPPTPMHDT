// frontend/src/page/Admin/AdminResetPassword.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../layout.jsx';
import './AdminResetPassword.css';

export default function AdminResetPassword() {
  const [adminInfo, setAdminInfo] = useState(null);
  const [classList, setClassList] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [admins, setAdmins] = useState([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('123456');

  // Lấy danh sách lớp và toàn bộ dữ liệu ban đầu
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) setAdminInfo(user);

    // Lấy danh sách lớp
    fetch('http://localhost:5000/api/admin/classes')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          setClassList(data.data);
          setSelectedClass(data.data[0].Lop); // Mặc định chọn lớp đầu tiên
        }
      })
      .catch(err => console.error('Lỗi tải danh sách lớp:', err));

    // Lấy danh sách user (Admin, Giảng viên, Sinh viên)
    fetchData();
  }, []);

  const fetchData = () => {
    fetch('http://localhost:5000/api/admin/reset-users-list')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAdmins(data.admins || []);
          setStudents(data.students || []);
          setTeachers(data.teachers || []);
        }
      })
      .catch(err => console.error('Lỗi tải dữ liệu người dùng:', err));
  };

  const openResetModal = (user) => {
    setSelectedUser(user);
    setNewPassword('123456');
    setShowModal(true);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    const res = await fetch(`http://localhost:5000/api/admin/reset-password/${selectedUser.MaTK}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword })
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

  // Lọc sinh viên thuộc lớp đang chọn bên trái
  const filteredStudents = students.filter(sv => sv.ThongTinPhu === selectedClass);
  
  // Tìm giảng viên cố vấn phụ trách lớp đang chọn
  const assignedTeacher = teachers.find(gv => gv.TenCoVan === selectedClass || gv.LopPhuTrach === selectedClass);

  return (
    <Layout user={adminInfo} onLogout={() => { localStorage.removeItem('user'); window.location.href = '/'; }}>
      <div className="admin-dashboard-container">
        <aside className="admin-sidebar">
          <h2>Quản Trị Hệ Thống</h2>
          <nav className="admin-nav">
            <a href="/admin">📊 Tổng quan hệ thống</a>
            <a href="/admin/users">👥 Quản lý người dùng</a>
            <a href="/admin/curriculum">📚 Chương trình đào tạo</a>
            <a href="/admin/grades">📊 Dữ liệu học tập chung</a>
            <a href="/admin/prerequisites">⚙️ Quy tắc tiên quyết</a>
            <a href="/admin/reset-password" className="active">🔑 Reset Mật Khẩu</a>
          </nav>
        </aside>

        <main className="admin-main">
          <header className="admin-header">
            <h1>Quản Lý Reset Mật Khẩu Theo Lớp & Vai Trò</h1>
          </header>

          {/* BỐ CỤC CHÍNH: TRÁI LÀ DANH SÁCH LỚP, PHẢI LÀ CHI TIẾT */}
          <div className="reset-container-layout" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            
            {/* KHUNG TRÁI: DANH SÁCH LỚP & QUẢN TRỊ VIÊN */}
            <div className="reset-sidebar-left" style={{ width: '280px', background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '12px', borderBottom: '2px solid #e2e8f0', paddingBottom: '6px' }}>
                📚 Chọn Lớp Quản Lý
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {classList.map(cls => (
                  <li key={cls.Lop}>
                    <button
                      onClick={() => setSelectedClass(cls.Lop)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: selectedClass === cls.Lop ? '#0284c7' : '#f8fafc',
                        color: selectedClass === cls.Lop ? '#fff' : '#334155',
                        fontWeight: selectedClass === cls.Lop ? '600' : 'normal',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      🎓 Lớp: {cls.Lop}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Mục riêng cho Admin ở dưới khung trái */}
              <h3 style={{ fontSize: '1rem', color: '#1e293b', marginTop: '25px', marginBottom: '12px', borderBottom: '2px solid #e2e8f0', paddingBottom: '6px' }}>
                🛡️ Quản Trị Viên (Admin)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {admins.map(ad => (
                  <div key={ad.MaTK} style={{ padding: '8px', background: '#fef2f2', borderRadius: '6px', border: '1px solid #fee2e2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#991b1b' }}>{ad.HoTen}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ad.Email}</div>
                    </div>
                    <button 
                      onClick={() => openResetModal(ad)}
                      style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Reset
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* KHUNG PHẢI: HIỂN THỊ GIẢNG VIÊN CỐ VẤN VÀ SINH VIÊN CỦA LỚP ĐƯỢC CHỌN */}
            <div className="reset-content-right" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* 1. Phần Giảng viên cố vấn của lớp */}
              <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: '#1e293b', marginBottom: '15px', fontSize: '1.1rem' }}>
                  👨‍🏫 Giảng Viên Hướng Dẫn (Cố Vấn) Lớp: <span style={{ color: '#0284c7' }}>{selectedClass}</span>
                </h3>
                {assignedTeacher ? (
                  <table className="admin-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Mã GV</th>
                        <th>Họ và Tên</th>
                        <th>Chuyên Môn</th>
                        <th>Email</th>
                        <th>Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{assignedTeacher.MaDinhDanh}</td>
                        <td><strong>{assignedTeacher.HoTen}</strong></td>
                        <td>{assignedTeacher.ThongTinPhu}</td>
                        <td>{assignedTeacher.Email}</td>
                        <td>
                          <button className="btn-sm btn-edit" onClick={() => openResetModal(assignedTeacher)}>🔑 Reset Mật Khẩu</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: '#64748b', fontStyle: 'italic', margin: 0 }}>Chưa có giảng viên cố vấn phụ trách trực tiếp lớp này.</p>
                )}
              </div>

              {/* 2. Phần Danh sách sinh viên thuộc lớp */}
              <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: '#1e293b', marginBottom: '15px', fontSize: '1.1rem' }}>
                  🎓 Danh Sách Sinh Viên Lớp: <span style={{ color: '#0284c7' }}>{selectedClass}</span> ({filteredStudents.length} sinh viên)
                </h3>
                <table className="admin-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Mã Sinh Viên</th>
                      <th>Họ và Tên</th>
                      <th>Email</th>
                      <th>Vai Trò</th>
                      <th>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map(sv => (
                        <tr key={sv.MaTK}>
                          <td>{sv.MaDinhDanh}</td>
                          <td><strong>{sv.HoTen}</strong></td>
                          <td>{sv.Email}</td>
                          <td><span className="badge SinhVien">Sinh Viên</span></td>
                          <td>
                            <button className="btn-sm btn-edit" onClick={() => openResetModal(sv)}>🔑 Reset Mật Khẩu</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                          Không có sinh viên nào trong lớp này.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>

          {/* MODAL NHẬP MẬT KHẨU MỚI */}
          {showModal && selectedUser && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Reset Mật Khẩu Tài Khoản</h3>
                <p>Đang thao tác cho: <strong>{selectedUser.HoTen}</strong> ({selectedUser.VaiTro === 'SinhVien' ? 'Sinh Viên' : selectedUser.VaiTro === 'GiangVien' ? 'Giảng Viên' : 'Admin'})</p>
                <form onSubmit={handleResetSubmit}>
                  <div className="form-group">
                    <label>Mật khẩu mới:</label>
                    <input 
                      type="text" 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="btn-save">Xác Nhận Reset</button>
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