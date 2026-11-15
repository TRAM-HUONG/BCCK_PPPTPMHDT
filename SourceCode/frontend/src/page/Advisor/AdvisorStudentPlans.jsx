
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../layout';


export default function AdvisorStudentPlans() {
    const [user, setUser] = useState(null);
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [planDetails, setPlanDetails] = useState([]);
    const [lockedCourses, setLockedCourses] = useState([]); // Thêm state danh sách môn bị khóa
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
        }
        const maCoVan = storedUser?.MaCoVan || 'GV01';
        loadPlans(maCoVan);
    }, []);

    const loadPlans = (maCoVan) => {
        fetch(`/api/advisor/pending-plans?maCoVan=${maCoVan}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setPlans(data.data);
            });
    };

    const handleSelectPlan = async (plan) => {
        setSelectedPlan(plan);
        setFeedback('');
        try {
            // 1. Lấy chi tiết kế hoạch môn học
            const res = await fetch(`/api/advisor/plan-detail/${plan.MaKeHoach}`);
            const data = await res.json();
            if (data.success) {
                setPlanDetails(data.danhSachMon);
            }

            // 2. Lấy danh sách môn bị khóa của sinh viên đó dựa theo mã sinh viên
            const resLock = await fetch(`http://localhost:5000/api/plan/mon-khoa/${plan.MaSinhVien}`);
            const dataLock = await resLock.json();
            if (dataLock.success) {
                setLockedCourses(dataLock.data);
            }
        } catch {
            alert('Lỗi tải chi tiết kế hoạch hoặc môn bị khóa.');
        }
    };

    const handleReview = (status) => {
        if (!selectedPlan) return;
        const storedUser = JSON.parse(localStorage.getItem('user'));

        fetch('/api/advisor/review-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                maKeHoach: selectedPlan.MaKeHoach,
                maCoVan: storedUser?.MaCoVan || 'GV01',
                trangThaiPhanHoi: status,
                noiDungGopY: feedback
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('Đã gửi phản hồi thành công cho sinh viên!');
                setSelectedPlan(null);
                loadPlans(storedUser?.MaCoVan || 'GV01');
            }
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    return (
        <Layout user={user} onLogout={handleLogout}>
            <div className="advisor-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                <div className="nav-sub-links" style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
                    <Link to="/advisor/pending-plans" style={{ padding: '10px 20px', background: '#f3f3f3', color: '#333', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                        📝 Ghi Chú Nhắc Việc
                    </Link>
                    <Link to="/advisor/students" style={{ padding: '10px 20px', background: '#2b579a', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                        👥 Danh Sách Sinh Viên
                    </Link>
                    <Link to="/advisor/student-plans" style={{ padding: '10px 20px', background: '#107c41', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                        📑 Xem & Duyệt Kế Hoạch Sinh Viên
                    </Link>
                </div>

                <h2>Xem Kế Hoạch & Góp Ý Cho Sinh Viên</h2>

                <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                    {/* Cột trái: Danh sách kế hoạch */}
                    <div style={{ flex: '1', background: 'white', padding: '15px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <h3>Danh sách kế hoạch</h3>
                        <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
                            {plans.length > 0 ? (
                                plans.map(p => (
                                    <li 
                                        key={p.MaKeHoach} 
                                        onClick={() => handleSelectPlan(p)}
                                        style={{ 
                                            padding: '12px', 
                                            borderBottom: '1px solid #eee', 
                                            cursor: 'pointer',
                                            background: selectedPlan?.MaKeHoach === p.MaKeHoach ? '#e6f7ff' : 'transparent',
                                            borderRadius: '4px',
                                            marginBottom: '8px'
                                        }}
                                    >
                                        <strong>{p.HoTen}</strong> ({p.MaSinhVien})<br />
                                        <span style={{ fontSize: '0.85rem', color: '#666' }}>Kỳ: {p.HocKyMucTieu} | {p.TongSoTinChi} TC</span><br />
                                        <span style={{ 
                                            fontSize: '0.8rem', 
                                            fontWeight: 'bold', 
                                            color: p.TrangThaiDuyet === 'DaDuyet' ? '#52c41a' : p.TrangThaiDuyet === 'YeuCauChinhSua' ? '#ff4d4f' : '#1890ff' 
                                        }}>
                                            Trạng thái: [{p.TrangThaiDuyet}]
                                        </span>
                                    </li>
                                ))
                            ) : (
                                <p style={{ color: '#888', textAlign: 'center', marginTop: '20px' }}>Không có kế hoạch nào.</p>
                            )}
                        </ul>
                    </div>

                    {/* Cột phải: Chi tiết học phần đăng ký, môn bị khóa và khung góp ý */}
                    <div style={{ flex: '2', background: 'white', padding: '20px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        {selectedPlan ? (
                            <div>
                                <h3>Chi Tiết Kế Hoạch - Sinh viên: {selectedPlan.HoTen} ({selectedPlan.MaSinhVien})</h3>
                                <p><strong>Lớp:</strong> {selectedPlan.Lop} | <strong>Học kỳ mục tiêu:</strong> {selectedPlan.HocKyMucTieu} | <strong>Tổng tín chỉ:</strong> {selectedPlan.TongSoTinChi}</p>

                                <h4 style={{ marginTop: '15px', color: '#2b579a' }}>📚 Danh sách môn sinh viên đăng ký trong kế hoạch:</h4>
                                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px', marginBottom: '20px' }}>
                                    <thead>
                                        <tr style={{ background: '#f1f2f6', textAlign: 'left' }}>
                                            <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Mã HP</th>
                                            <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Tên Học Phần</th>
                                            <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Số TC</th>
                                            <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Phân Loại</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {planDetails.map(m => (
                                            <tr key={m.MaHocPhan}>
                                                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{m.MaHocPhan}</td>
                                                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{m.TenHocPhan}</td>
                                                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{m.SoTinChi}</td>
                                                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{m.PhanLoai}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <h4 style={{ marginTop: '15px', color: '#d9534f' }}>🔒 Các môn học hiện đang bị khóa (chưa đủ điều kiện tiên quyết/học trước):</h4>
                                <div style={{ background: '#fff9f9', border: '1px solid #ffcccc', padding: '10px', borderRadius: '4px', maxHeight: '160px', overflowY: 'auto', marginBottom: '20px' }}>
                                    {lockedCourses.length > 0 ? (
                                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem' }}>
                                            {lockedCourses.map(lc => (
                                                <li key={lc.MaHocPhan} style={{ marginBottom: '6px' }}>
                                                    <strong>[{lc.MaHocPhan}] {lc.TenHocPhan}</strong>: <span style={{ color: '#c0392b' }}>{lc.LyDoKhoa}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p style={{ margin: 0, color: '#27ae60', fontSize: '0.9rem' }}>Sinh viên này hiện không bị khóa môn nào, đủ điều kiện học tập tốt.</p>
                                    )}
                                </div>

                                <div style={{ marginTop: '15px' }}>
                                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Nhập nội dung nhận xét / góp ý cho sinh viên:</label>
                                    <textarea 
                                        value={feedback} 
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Nhập ý kiến góp ý dựa trên danh sách môn đăng ký và các môn bị khóa..."
                                        style={{ width: '100%', height: '90px', padding: '10px', borderRadius: '4px', border: '1px solid #dcdde1', marginBottom: '15px', fontFamily: 'Arial' }}
                                    />

                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <button 
                                            onClick={() => handleReview('PheDuyet')} 
                                            style={{ flex: 1, background: '#52c41a', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            Phê Duyệt Kế Hoạch
                                        </button>
                                        <button 
                                            onClick={() => handleReview('YeuCauChinhSua')} 
                                            style={{ flex: 1, background: '#ff4d4f', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            Yêu Cầu Chỉnh Sửa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center', color: '#888', marginTop: '50px' }}>Vui lòng chọn một kế hoạch bên cột trái để xem chi tiết và đánh giá.</p>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}