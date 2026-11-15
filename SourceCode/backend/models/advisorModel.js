// models/advisorModel.js
const { poolPromise } = require('../config/db');
const sql = require('mssql');

const AdvisorModel = {
    // 1. Lấy danh sách sinh viên phụ trách (khớp MaCoVan hoặc LopPhuTrach)
    async getAssignedStudents(maCoVan) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaCoVan', sql.VarChar, maCoVan)
            .query(`
                SELECT DISTINCT sv.MaSinhVien, sv.HoTen, sv.Lop, sv.MaNganh, sv.GPA_TichLuy, sv.TongTinChiTichLuy 
                FROM SinhVien sv
                LEFT JOIN GiangVien gv ON gv.MaCoVan = @MaCoVan
                WHERE sv.MaCoVan = @MaCoVan OR sv.Lop = gv.LopPhuTrach
            `);
        return result.recordset;
    },

    // 2. Lấy danh sách kế hoạch của sinh viên phụ trách (theo dõi trạng thái)
    async getPendingPlans(maCoVan) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaCoVan', sql.VarChar, maCoVan)
            .query(`
                SELECT kh.MaKeHoach, kh.MaSinhVien, sv.HoTen, sv.Lop, kh.HocKyMucTieu, kh.TongSoTinChi, kh.TrangThaiDuyet, kh.NgayTao 
                FROM KeHoachHocTap kh
                JOIN SinhVien sv ON kh.MaSinhVien = sv.MaSinhVien
                LEFT JOIN GiangVien gv ON gv.MaCoVan = @MaCoVan
                WHERE sv.MaCoVan = @MaCoVan OR sv.Lop = gv.LopPhuTrach
            `);
        return result.recordset;
    },

    // 3. Lấy tất cả kế hoạch của sinh viên phụ trách
    async getAllStudentPlans(maCoVan) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaCoVan', sql.VarChar, maCoVan)
            .query(`
                SELECT kh.MaKeHoach, kh.MaSinhVien, sv.HoTen, kh.HocKyMucTieu, kh.TongSoTinChi, kh.TrangThaiDuyet, kh.NgayTao 
                FROM KeHoachHocTap kh
                JOIN SinhVien sv ON kh.MaSinhVien = sv.MaSinhVien
                LEFT JOIN GiangVien gv ON gv.MaCoVan = @MaCoVan
                WHERE sv.MaCoVan = @MaCoVan OR sv.Lop = gv.LopPhuTrach
            `);
        return result.recordset;
    },

    // 4. Lấy thông tin chi tiết một kế hoạch học tập
    async getPlanById(maKeHoach) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaKH', sql.Int, Number(maKeHoach))
            .query(`
                SELECT kh.*, sv.HoTen, sv.Lop, sv.MaSinhVien, sv.GPA_TichLuy, sv.TongTinChiTichLuy 
                FROM KeHoachHocTap kh
                JOIN SinhVien sv ON kh.MaSinhVien = sv.MaSinhVien
                WHERE kh.MaKeHoach = @MaKH
            `);
        return result.recordset[0];
    },

    // 5. Lấy danh sách các môn học chi tiết trong kế hoạch
    async getPlanDetails(maKeHoach) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaKH', sql.Int, Number(maKeHoach))
            .query(`
                SELECT ct.MaCT, ct.MaHocPhan, hp.TenHocPhan, hp.SoTinChi, hp.PhanLoai, hp.HocKyGoiY, ct.TrangThaiMon
                FROM ChiTietKeHoach ct
                JOIN HocPhan hp ON ct.MaHocPhan = hp.MaHocPhan
                WHERE ct.MaKeHoach = @MaKH
            `);
        return result.recordset;
    },

    // 6. Cập nhật trạng thái duyệt kế hoạch học tập
    async updatePlanStatus(maKeHoach, trangThaiMoi) {
        const pool = await poolPromise;
        await pool.request()
            .input('MaKeHoach', sql.Int, maKeHoach)
            .input('TrangThaiDuyet', sql.VarChar, trangThaiMoi)
            .query('UPDATE KeHoachHocTap SET TrangThaiDuyet = @TrangThaiDuyet, NgayCapNhat = GETDATE() WHERE MaKeHoach = @MaKeHoach');
    },

    // 7. Lưu phản hồi / góp ý của cố vấn
    async insertFeedback(maKeHoach, maCoVan, noiDungGopY, trangThaiPhanHoi) {
        const pool = await poolPromise;
        await pool.request()
            .input('MaKeHoach', sql.Int, maKeHoach)
            .input('MaCoVan', sql.VarChar, maCoVan)
            .input('NoiDungGopY', sql.NVarChar, noiDungGopY)
            .input('TrangThaiPhanHoi', sql.VarChar, trangThaiPhanHoi)
            .query(`
                INSERT INTO PhanHoiCoVan (MaKeHoach, MaCoVan, NoiDungGopY, TrangThaiPhanHoi, NgayPhanHoi) 
                VALUES (@MaKeHoach, @MaCoVan, @NoiDungGopY, @TrangThaiPhanHoi, GETDATE())
            `);
    },

    // 8. Lấy thông tin sinh viên và email dựa theo mã kế hoạch (phục vụ gửi mail)
    async getStudentEmailByPlan(maKeHoach) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaKeHoach', sql.Int, maKeHoach)
            .query(`
                SELECT sv.HoTen, tk.Email 
                FROM KeHoachHocTap kh
                JOIN SinhVien sv ON kh.MaSinhVien = sv.MaSinhVien
                JOIN TaiKhoan tk ON sv.MaTK = tk.MaTK
                WHERE kh.MaKeHoach = @MaKeHoach
            `);
        return result.recordset[0];
    },

    // 9. Lấy bảng điểm của sinh viên theo mã sinh viên
    async getBangDiemSinhVien(maSinhVien) {
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
        return result.recordset;
    }
};

module.exports = AdvisorModel;