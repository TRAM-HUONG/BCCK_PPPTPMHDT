// models/simulationModel.js
const { poolPromise } = require('../config/db');
const sql = require('mssql');

const SimulationModel = {
    // 1. Lấy thông tin sinh viên cơ bản
    async getStudentInfo(maSinhVien) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaSV', sql.VarChar, maSinhVien)
            .query('SELECT MaSinhVien, HoTen, MaNganh, GPA_TichLuy, TongTinChiTichLuy FROM SinhVien WHERE MaSinhVien = @MaSV');
        return result.recordset[0];
    },

    // 2. Lấy danh sách mã học phần sinh viên đã qua
    async getPassedCourses(maSinhVien) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaSV', sql.VarChar, maSinhVien)
            .query('SELECT MaHocPhan FROM BangDiem WHERE MaSinhVien = @MaSV AND TrangThaiDat = 1');
        return new Set(result.recordset.map(r => r.MaHocPhan));
    },

    // 3. Lấy tất cả học phần theo chuyên ngành
    async getCoursesByMajor(maNganh) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaNganh', sql.VarChar, maNganh)
            .query('SELECT MaHocPhan, TenHocPhan, SoTinChi, PhanLoai, HocKyGoiY FROM HocPhan WHERE MaNganh = @MaNganh');
        return result.recordset;
    },

    // 4. Lấy toàn bộ ràng buộc học phần
    async getAllRules() {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT MaHocPhan, MaHocPhanDieuKien, LoaiRangBuoc FROM RangBuocHocPhan');
        return result.recordset;
    },

    // 5. Lấy danh sách các môn bị ảnh hưởng (khởi phát khi giả định rớt môn)
    async getAffectedCourses(maHPRot) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaHP', sql.VarChar, maHPRot)
            .query(`
                SELECT hp.MaHocPhan, hp.TenHocPhan, rb.LoaiRangBuoc, 
                       N'Bị khóa do vướng môn rớt' AS TrangThaiAnhHuong
                FROM RangBuocHocPhan rb 
                JOIN HocPhan hp ON rb.MaHocPhan = hp.MaHocPhan 
                WHERE rb.MaHocPhanDieuKien = @MaHP
            `);
        return result.recordset;
    },

    // 6. Lưu lịch sử mô phỏng vào CSDL
    async saveSimulationHistory(maSinhVien, tenKichBan, duLieuGiaLap, gpaDuKien) {
        const pool = await poolPromise;
        await pool.request()
            .input('MaSV', sql.VarChar, maSinhVien)
            .input('TenKB', sql.NVarChar, tenKichBan)
            .input('Data', sql.VarChar, duLieuGiaLap)
            .input('GPAMoi', sql.Decimal(4,2), gpaDuKien)
            .query(`
                INSERT INTO LichSuMoPhong (MaSinhVien, TenKichBan, DuLieuGiaLap, GPA_DuKien, NgayMoPhong) 
                VALUES (@MaSV, @TenKB, @Data, @GPAMoi, GETDATE())
            `);
    }
};

module.exports = SimulationModel;