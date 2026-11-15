import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TrangChu from './page/Home/trangchu.jsx';
import SinhVienPage from './page/Student/sinhvien.jsx';
import TraCuuCTDT from './page/Student/tracuuctdt.jsx';
import LapKeHoach from './page/Student/lapkehoach.jsx';
import ChiTietMonKhoa from './page/Student/chitietmonkhoa.jsx';
import QuanLyKeHoach from './page/Student/quanlykehoach.jsx';
import MoPhongKichBan from './page/Student/mophong.jsx';
import AdvisorDashboard from './page/Advisor/AdvisorDashboard';
import AdvisorStudents from './page/Advisor/AdvisorStudents';
import AdvisorStudentPlans from './page/Advisor/AdvisorStudentPlans';
import AdvisorStudentTranscript from './page/Advisor/AdvisorStudentTranscript';
import AdminDashboard from './page/Admin/AdminDashboard.jsx';
import AdminUsers from './page/Admin/AdminUsers.jsx';
import AdminCurriculum from './page/Admin/AdminCurriculum.jsx';
import AdminPrerequisites from './page/Admin/AdminPrerequisites.jsx';
import AdminResetPassword from './page/Admin/AdminResetPassword.jsx';
import AdminGradesManagement from './page/Admin/AdminGradesManagement.jsx';



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TrangChu />} />
        <Route path="/sinh-vien" element={<SinhVienPage />} />
        <Route path="/tra-cuu-ctdt" element={<TraCuuCTDT />} />
        <Route path="/lap-ke-hoach" element={<LapKeHoach />} />
        <Route path="/chi-tiet-mon-khoa" element={<ChiTietMonKhoa />} />
        <Route path="/quan-ly-ke-hoach" element={<QuanLyKeHoach />} />
        <Route path="/mo-phong" element={<MoPhongKichBan />} />

        {/* Cố vấn */}
        <Route path="/advisor/pending-plans" element={<AdvisorDashboard />} />
        <Route path="/advisor/students" element={<AdvisorStudents />} />
        <Route path="/advisor/student-plans" element={<AdvisorStudentPlans />} />
        <Route path="/advisor/student-transcript/:maSinhVien" element={<AdvisorStudentTranscript />} />

        {/*Admin*/}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />

        <Route path="/admin/curriculum" element={<AdminCurriculum />} />
        <Route path="/admin/prerequisites" element={<AdminPrerequisites />} />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />
        <Route path="/admin/grades" element={<AdminGradesManagement />} />
      </Routes>
    </BrowserRouter>
  );
}