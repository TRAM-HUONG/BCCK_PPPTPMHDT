// frontend/src/page/Advisor/AdvisorStudentTranscript.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../layout';

export default function AdvisorStudentTranscript() {
    const { maSinhVien } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [transcript, setTranscript] = useState([]);
    const [studentInfo, setStudentInfo] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
        }

        const maCoVan = storedUser?.MaCoVan || 'GV01';
        fetch(`/api/advisor/students?maCoVan=${maCoVan}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const found = data.data.find(s => s.MaSinhVien === maSinhVien);
                    if (found) setStudentInfo(found);
                }
            });

        fetch(`/api/advisor/transcript/${maSinhVien}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setTranscript(data.data);
            });
    }, [maSinhVien]);

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
            <div className="advisor-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
                <button 
                    onClick={() => navigate('/advisor/students')}
                    style={{ background: '#7f8c8d', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', marginBottom: '15px', fontWeight: 'bold' }}
                >
                    &larr; Quay lại danh sách sinh viên
                </button>

                <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h2>Bảng Điểm Học Tập Của Sinh Viên</h2>
                    {studentInfo && (
                        <div style={{ margin: '15px 0', padding: '12px', background: '#f8f9fa', borderRadius: '6px', borderLeft: '4px solid #2b579a' }}>
                            <p style={{ margin: '4px 0' }}><strong>Họ và tên:</strong> {studentInfo.HoTen} ({studentInfo.MaSinhVien})</p>
                            <p style={{ margin: '4px 0' }}><strong>Lớp:</strong> {studentInfo.Lop} | <strong>Ngành:</strong> {studentInfo.MaNganh}</p>
                            <p style={{ margin: '4px 0' }}><strong>GPA Tích Lũy:</strong> {studentInfo.GPA_TichLuy} | <strong>Tổng Tín Chỉ Tích Lũy:</strong> {studentInfo.TongTinChiTichLuy}</p>
                        </div>
                    )}

                    {Object.keys(groupedBySemester).length > 0 ? (
                        Object.keys(groupedBySemester).map(hocKy => (
                            <div key={hocKy} style={{ marginBottom: '25px' }}>
                                <h3 style={{ background: '#2b579a', color: 'white', padding: '8px 12px', borderRadius: '4px', fontSize: '1rem' }}>
                                    Học Kỳ: {hocKy}
                                </h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
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
                        <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>Chưa có dữ liệu bảng điểm của sinh viên này.</p>
                    )}
                </div>
            </div>
        </Layout>
    );
}