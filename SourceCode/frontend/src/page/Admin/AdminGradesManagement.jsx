import React, { useState, useEffect } from 'react';
import Layout from '../layout.jsx';
import './AdminGradesManagement.css';

export default function AdminGradesManagement() {
  const [adminInfo, setAdminInfo] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [studentGrades, setStudentGrades] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [hocKy, setHocKy] = useState('20232');

  const [newMaSV, setNewMaSV] = useState('');
  const [newHoTen, setNewHoTen] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) setAdminInfo(user);

    fetch('http://localhost:5000/api/admin/classes')
      .then(res => res.json())
      .then(data => { if (data.success) setClasses(data.data); })
      .catch(err => console.error('Lỗi tải danh sách lớp:', err));
  }, []);

  const handleClassChange = (e) => {
    const lop = e.target.value;
    setSelectedClass(lop);
    setSelectedSubject('');
    setStudentGrades([]);

    if (!lop) {
      setSubjects([]);
      return;
    }

    // 1. Lấy danh sách học phần theo ngành của lớp
    fetch(`http://localhost:5000/api/admin/grades/hoc-phan-theo-lop?lop=${lop}`)
      .then(res => res.json())
      .then(data => { if (data.success) setSubjects(data.data); });

    // 2. Tự động hiển thị danh sách sinh viên ngay khi chọn lớp
    fetch(`http://localhost:5000/api/admin/grades/students-by-class?lop=${lop}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStudentGrades(data.data.map(sv => ({ ...sv, DiemSo: '' })));
        }
      });
  };

  const handleLoadGrades = () => {
    if (!selectedClass || !selectedSubject) {
      alert('Vui lòng chọn đầy đủ Lớp và Học phần!');
      return;
    }
    fetch(`http://localhost:5000/api/admin/grades/grades-by-class?lop=${selectedClass}&maHocPhan=${selectedSubject}`)
      .then(res => res.json())
      .then(data => { if (data.success) setStudentGrades(data.data); });
  };

  const handleScoreChange = (index, value) => {
    const updated = [...studentGrades];
    updated[index].DiemSo = value;
    setStudentGrades(updated);
  };

  const handleSaveSingle = (student) => {
    if (!selectedSubject) {
      alert('Vui lòng chọn học phần trước khi lưu điểm!');
      return;
    }
    fetch('http://localhost:5000/api/admin/grades/upsert-grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        maSinhVien: student.MaSinhVien,
        maHocPhan: selectedSubject,
        diemSo: student.DiemSo,
        hocKyHoanThanh: hocKy
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert(`Đã lưu điểm sinh viên ${student.HoTen}!`);
          handleLoadGrades();
        } else {
          alert('Lỗi: ' + data.message);
        }
      });
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!selectedClass) {
      alert('Vui lòng chọn lớp trước khi thêm sinh viên!');
      return;
    }
    if (!newMaSV || !newHoTen) {
      alert('Vui lòng nhập đầy đủ Mã sinh viên và Họ tên!');
      return;
    }

    fetch('http://localhost:5000/api/admin/grades/add-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maSinhVien: newMaSV, hoTen: newHoTen, lop: selectedClass })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert(data.message);
          setNewMaSV('');
          setNewHoTen('');
          handleClassChange({ target: { value: selectedClass } });
        } else {
          alert('Lỗi: ' + data.message);
        }
      });
  };

  const handleDeleteStudent = (maSinhVien) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sinh viên ${maSinhVien}?`)) return;

    fetch(`http://localhost:5000/api/admin/grades/delete-student/${maSinhVien}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert(data.message);
          handleClassChange({ target: { value: selectedClass } });
        }
      });
  };

  const handleExportExcel = () => {
    if (!selectedClass) {
      alert('Vui lòng chọn Lớp!');
      return;
    }
    let url = `http://localhost:5000/api/admin/grades/export-excel?lop=${selectedClass}`;
    if (selectedSubject) {
      url += `&maHocPhan=${selectedSubject}`;
    }
    window.location.href = url;
  };

  const handleUploadExcel = (e) => {
    e.preventDefault();
    if (!selectedFile || !selectedSubject) {
      alert('Vui lòng chọn file Excel và chọn học phần áp dụng!');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('maHocPhan', selectedSubject);
    formData.append('hocKyHoanThanh', hocKy);

    fetch('http://localhost:5000/api/admin/grades/import-excel', { method: 'POST', body: formData })
      .then(async res => {
        const data = await res.json();
        if (res.ok && data.success) {
          alert(data.message);
          handleLoadGrades();
        } else {
          alert('Lỗi import: ' + data.message);
        }
      });
  };

  return (
    <Layout user={adminInfo} onLogout={() => { localStorage.removeItem('user'); window.location.href = '/'; }}>
      <div className="admin-grades-container">
        <h2>Quản lý dữ liệu học tập chung (Danh sách sinh viên & Bảng điểm)</h2>

        <div className="filter-section">
          <div className="filter-group">
            <label>Chọn Lớp:</label>
            <select value={selectedClass} onChange={handleClassChange}>
              <option value="">-- Chọn lớp sinh viên --</option>
              {classes.map((cls, idx) => (
                <option key={idx} value={cls.Lop}>{cls.Lop}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Chọn Học Phần:</label>
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} disabled={!selectedClass}>
              <option value="">-- Chọn học phần (tùy chọn xem điểm) --</option>
              {subjects.map((sub) => (
                <option key={sub.MaHocPhan} value={sub.MaHocPhan}>{sub.MaHocPhan} - {sub.TenHocPhan}</option>
              ))}
            </select>
          </div>

          <button className="btn-primary" onClick={handleLoadGrades} disabled={!selectedSubject}>Xem Điểm Môn</button>
          {selectedClass && (
  <button className="btn-success" onClick={() => {
    window.location.href = `http://localhost:5000/api/admin/grades/export-excel?lop=${selectedClass}`;
  }}>
    📤 Tải Danh Sách Lớp về Excel
  </button>
)}
        </div>

        {selectedClass && (
          <div className="add-student-section">
            <h3>➕ Thêm sinh viên mới vào lớp {selectedClass}</h3>
            <form onSubmit={handleAddStudent} className="add-student-form">
              <input type="text" placeholder="Mã sinh viên (VD: SV10)" value={newMaSV} onChange={(e) => setNewMaSV(e.target.value)} />
              <input type="text" placeholder="Họ và tên" value={newHoTen} onChange={(e) => setNewHoTen(e.target.value)} />
              <button type="submit" className="btn-primary">Thêm Sinh Viên</button>
            </form>
          </div>
        )}

        <div className="excel-import-section">
          <h3>📥 Import điểm hàng loạt bằng File Excel</h3>
          <form onSubmit={handleUploadExcel} className="excel-form">
            <input type="file" accept=".xlsx, .xls" onChange={(e) => setSelectedFile(e.target.files[0])} />
            <input type="text" placeholder="Học kỳ (VD: 20232)" value={hocKy} onChange={(e) => setHocKy(e.target.value)} />
            <button type="submit" className="btn-success">Upload & Áp dụng điểm</button>
          </form>
        </div>

        {studentGrades.length > 0 && (
          <div className="table-responsive">
            <h3>Danh sách sinh viên lớp {selectedClass} {selectedSubject ? `- Môn: ${selectedSubject}` : ''}</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã SV</th>
                  <th>Họ Tên</th>
                  <th>Lớp</th>
                  {selectedSubject && <th>Điểm Số</th>}
                  {selectedSubject && <th>Trạng Thái</th>}
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {studentGrades.map((sv, index) => {
                  const numScore = Number(sv.DiemSo);
                  const hasScore = sv.DiemSo !== null && sv.DiemSo !== undefined && sv.DiemSo !== '';
                  const isPass = hasScore && numScore >= 4.0;

                  return (
                    <tr key={sv.MaSinhVien}>
                      <td>{index + 1}</td>
                      <td>{sv.MaSinhVien}</td>
                      <td>{sv.HoTen}</td>
                      <td>{sv.Lop || selectedClass}</td>
                      {selectedSubject && (
                        <>
                          <td>
                            <input 
                              type="number" 
                              step="0.1" 
                              min="0" 
                              max="10"
                              value={hasScore ? sv.DiemSo : ''} 
                              onChange={(e) => handleScoreChange(index, e.target.value)}
                              placeholder="Nhập điểm"
                            />
                          </td>
                          <td>
                            <span className={`badge ${!hasScore ? 'badge-secondary' : isPass ? 'badge-success' : 'badge-danger'}`}>
                              {!hasScore ? 'Chưa có điểm' : isPass ? 'Đạt' : 'Rớt'}
                            </span>
                          </td>
                        </>
                      )}
                      <td>
                        {selectedSubject && (
                          <button className="btn-sm btn-save" onClick={() => handleSaveSingle(sv)}>Lưu</button>
                        )}
                        <button className="btn-sm btn-delete" onClick={() => handleDeleteStudent(sv.MaSinhVien)}>Xóa</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}