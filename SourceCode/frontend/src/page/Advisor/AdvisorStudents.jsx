// frontend/src/page/Advisor/AdvisorStudents.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../layout';

export default function AdvisorStudents() {
    const [user, setUser] = useState(null);
    const [students, setStudents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
        }
        const maCoVan = storedUser?.MaCoVan || 'GV01';
        fetch(`/api/advisor/students?maCoVan=${maCoVan}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setStudents(data.data);
            });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    return (
        <Layout user={user} onLogout={handleLogout}>
            <div className="advisor-container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
                <div className="nav-sub-links" style={{ marginBottom: '15px', display: 'flex', gap: '15px' }}>
                    <Link to="/advisor/pending-plans" style={{ textDecoration: 'none', color: '#2c3e50', fontWeight: 'bold' }}>📋 Trang chủ</Link>
                    <Link to="/advisor/students" style={{ textDecoration: 'none', color: '#3498db', fontWeight: 'bold' }}>👥 Danh Sách Sinh Viên</Link>
                </div>
                <h2>Tra Cứu Danh Sách Sinh Viên Phụ Trách</h2>
                <div className="list-section" style={{ background: 'white', padding: '20px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f1f2f6', textAlign: 'left' }}>
                                <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Mã SV</th>
                                <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Họ Tên</th>
                                <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Lớp</th>
                                <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Ngành</th>
                                <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>GPA Tích Lũy</th>
                                <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Tổng Tín Chỉ</th>
                                <th style={{ padding: '10px', borderBottom: '1px solid #ddd', textAlign: 'center' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(sv => (
                                <tr key={sv.MaSinhVien}>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{sv.MaSinhVien}</td>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{sv.HoTen}</td>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{sv.Lop}</td>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{sv.MaNganh}</td>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{sv.GPA_TichLuy}</td>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{sv.TongTinChiTichLuy}</td>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                                        <button 
                                            onClick={() => navigate(`/advisor/student-transcript/${sv.MaSinhVien}`)}
                                            style={{ background: '#2b579a', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Xem Bảng Điểm
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
}