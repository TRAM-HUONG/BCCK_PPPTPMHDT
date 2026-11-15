// backend/controllers/advisorController.js
const { poolPromise } = require('../config/db');
const sql = require('mssql');

// backend/controllers/advisorController.js
exports.getAssignedStudents = async (req, res) => {
    try {
        const { maCoVan } = req.query;
        const pool = await poolPromise;
        
        // Tự động lấy sinh viên có MaCoVan khớp HOẶC có Lop trùng với lớp phụ trách của giảng viên đó
        const result = await pool.request()
            .input('MaCoVan', sql.VarChar, maCoVan)
            .query(`
                SELECT DISTINCT sv.MaSinhVien, sv.HoTen, sv.Lop, sv.MaNganh, sv.GPA_TichLuy, sv.TongTinChiTichLuy 
                FROM SinhVien sv
                LEFT JOIN GiangVien gv ON gv.MaCoVan = @MaCoVan
                WHERE sv.MaCoVan = @MaCoVan OR sv.Lop = gv.LopPhuTrach
            `);

        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error("Lỗi getAssignedStudents:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Lấy danh sách kế hoạch của sinh viên phụ trách (tất cả các trạng thái cần theo dõi)
exports.getPendingPlans = async (req, res) => {
    try {
        const { maCoVan } = req.query;
        const pool = await poolPromise;
        
        const result = await pool.request()
            .input('MaCoVan', sql.VarChar, maCoVan)
            .query(`
                SELECT kh.MaKeHoach, kh.MaSinhVien, sv.HoTen, sv.Lop, kh.HocKyMucTieu, kh.TongSoTinChi, kh.TrangThaiDuyet, kh.NgayTao 
                FROM KeHoachHocTap kh
                JOIN SinhVien sv ON kh.MaSinhVien = sv.MaSinhVien
                WHERE sv.MaCoVan = @MaCoVan
            `);

        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error("Lỗi getPendingPlans:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Lấy tất cả kế hoạch của sinh viên phụ trách
exports.getAllStudentPlans = async (req, res) => {
    try {
        const { maCoVan } = req.query;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaCoVan', sql.VarChar, maCoVan)
            .query(`
                SELECT kh.MaKeHoach, kh.MaSinhVien, sv.HoTen, kh.HocKyMucTieu, kh.TongSoTinChi, kh.TrangThaiDuyet, kh.NgayTao 
                FROM KeHoachHocTap kh
                JOIN SinhVien sv ON kh.MaSinhVien = sv.MaSinhVien
                WHERE sv.MaCoVan = @MaCoVan
            `);

        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error("Lỗi getAllStudentPlans:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Lấy chi tiết một kế hoạch học tập của sinh viên để cố vấn xem
exports.getStudentPlanDetail = async (req, res) => {
    try {
        const { maKeHoach } = req.params;
        const pool = await poolPromise;

        const planRes = await pool.request()
            .input('MaKH', sql.Int, Number(maKeHoach))
            .query(`
                SELECT kh.*, sv.HoTen, sv.Lop, sv.MaSinhVien, sv.GPA_TichLuy, sv.TongTinChiTichLuy 
                FROM KeHoachHocTap kh
                JOIN SinhVien sv ON kh.MaSinhVien = sv.MaSinhVien
                WHERE kh.MaKeHoach = @MaKH
            `);

        if (planRes.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy kế hoạch.' });
        }

        const detailsRes = await pool.request()
            .input('MaKH', sql.Int, Number(maKeHoach))
            .query(`
                SELECT ct.MaCT, ct.MaHocPhan, hp.TenHocPhan, hp.SoTinChi, hp.PhanLoai, hp.HocKyGoiY, ct.TrangThaiMon
                FROM ChiTietKeHoach ct
                JOIN HocPhan hp ON ct.MaHocPhan = hp.MaHocPhan
                WHERE ct.MaKeHoach = @MaKH
            `);

        res.status(200).json({ 
            success: true, 
            keHoach: planRes.recordset[0], 
            danhSachMon: detailsRes.recordset 
        });
    } catch (error) {
        console.error("Lỗi getStudentPlanDetail:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Phê duyệt hoặc Yêu cầu chỉnh sửa kế hoạch học tập
exports.reviewPlan = async (req, res) => {
    try {
        const { maKeHoach, maCoVan, trangThaiPhanHoi, noiDungGopY } = req.body;
        const pool = await poolPromise;
        const trangThaiMoi = trangThaiPhanHoi === 'PheDuyet' ? 'DaDuyet' : 'YeuCauChinhSua';

        // 1. Cập nhật trạng thái kế hoạch
        await pool.request()
            .input('MaKeHoach', sql.Int, maKeHoach)
            .input('TrangThaiDuyet', sql.VarChar, trangThaiMoi)
            .query('UPDATE KeHoachHocTap SET TrangThaiDuyet = @TrangThaiDuyet, NgayCapNhat = GETDATE() WHERE MaKeHoach = @MaKeHoach');

        // 2. Lưu phản hồi góp ý của cố vấn
        const defaultGopY = noiDungGopY || (trangThaiMoi === 'DaDuyet' ? 'Kế hoạch hợp lý, đã được phê duyệt.' : 'Cần chỉnh sửa lại lộ trình học phần.');
        
        await pool.request()
            .input('MaKeHoach', sql.Int, maKeHoach)
            .input('MaCoVan', sql.VarChar, maCoVan)
            .input('NoiDungGopY', sql.NVarChar, defaultGopY)
            .input('TrangThaiPhanHoi', sql.VarChar, trangThaiPhanHoi)
            .query(`
                INSERT INTO PhanHoiCoVan (MaKeHoach, MaCoVan, NoiDungGopY, TrangThaiPhanHoi, NgayPhanHoi) 
                VALUES (@MaKeHoach, @MaCoVan, @NoiDungGopY, @TrangThaiPhanHoi, GETDATE())
            `);

        // 3. Lấy thông tin Email và Họ tên sinh viên để gửi thông báo
        const studentInfoRes = await pool.request()
            .input('MaKeHoach', sql.Int, maKeHoach)
            .query(`
                SELECT sv.HoTen, tk.Email 
                FROM KeHoachHocTap kh
                JOIN SinhVien sv ON kh.MaSinhVien = sv.MaSinhVien
                JOIN TaiKhoan tk ON sv.MaTK = tk.MaTK
                WHERE kh.MaKeHoach = @MaKeHoach
            `);

        if (studentInfoRes.recordset.length > 0) {
            const { HoTen, Email } = studentInfoRes.recordset[0];
            if (Email) {
                // Gọi gửi email bất đồng bộ
                sendPlanNotification(Email, HoTen, trangThaiMoi, defaultGopY);
            }
        }

        res.status(200).json({ success: true, message: 'Đã cập nhật phản hồi kế hoạch và gửi email thành công.' });
    } catch (error) {
        console.error("Lỗi reviewPlan:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};
// backend/controllers/advisorController.js
exports.getBangDiemSinhVien = async (req, res) => {
    try {
        const { maSinhVien } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaSV', sql.VarChar, maSinhVien)
            .query(`
                SELECT 
                    bd.MaHocPhan, 
                    hp.TenHocPhan, 
                    hp.SoTinChi, 
                    bd.DiemSo, 
                    bd.TrangThaiDat, 
                    bd.HocKyHoanThanh AS HocKy
                FROM BangDiem bd
                JOIN HocPhan hp ON bd.MaHocPhan = hp.MaHocPhan
                WHERE bd.MaSinhVien = @MaSV
                ORDER BY bd.HocKyHoanThanh ASC
            `);
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error("Lỗi lấy bảng điểm:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};