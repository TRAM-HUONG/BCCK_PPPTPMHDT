// models/planModel.js
const { poolPromise } = require('../config/db');
const sql = require('mssql');

const PlanModel = {
    // 1. Lấy mã ngành của sinh viên
    async getStudentMajor(maSinhVien) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaSV', sql.VarChar, maSinhVien)
            .query('SELECT MaNganh FROM SinhVien WHERE MaSinhVien = @MaSV');
        return result.recordset[0] ? result.recordset[0].MaNganh : null;
    },

    // 2. Lấy danh sách các môn sinh viên đã qua (TrangThaiDat = 1)
    async getPassedCourses(maSinhVien) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaSV', sql.VarChar, maSinhVien)
            .query('SELECT MaHocPhan FROM BangDiem WHERE MaSinhVien = @MaSV AND TrangThaiDat = 1');
        return new Set(result.recordset.map(r => r.MaHocPhan));
    },

    // 3. Lấy toàn bộ học phần theo mã ngành
    async getCoursesByMajor(maNganh) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaNganh', sql.VarChar, maNganh)
            .query('SELECT MaHocPhan, TenHocPhan, SoTinChi, PhanLoai, HocKyGoiY FROM HocPhan WHERE MaNganh = @MaNganh');
        return result.recordset;
    },

    // 4. Lấy tất cả quy tắc ràng buộc học phần
    async getAllRules() {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT MaHocPhan, MaHocPhanDieuKien, LoaiRangBuoc FROM RangBuocHocPhan');
        return result.recordset;
    },

    // 5. Lấy danh sách dữ liệu kiểm tra môn bị khóa chi tiết
    async getLockedCoursesDetail(maNganh, maSinhVien) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaNganh', sql.VarChar, maNganh)
            .input('MaSV', sql.VarChar, maSinhVien)
            .query(`
                SELECT 
                    hp.MaHocPhan, 
                    hp.TenHocPhan, 
                    hp.SoTinChi, 
                    hp.PhanLoai, 
                    hp.HocKyGoiY,
                    rb.MaHocPhanDieuKien,
                    hpDK.TenHocPhan AS TenMonDieuKien,
                    rb.LoaiRangBuoc,
                    (SELECT COUNT(*) FROM BangDiem bd WHERE bd.MaSinhVien = @MaSV AND bd.MaHocPhan = rb.MaHocPhanDieuKien) AS DaTungHocDK,
                    (SELECT COUNT(*) FROM BangDiem bd WHERE bd.MaSinhVien = @MaSV AND bd.MaHocPhan = rb.MaHocPhanDieuKien AND bd.TrangThaiDat = 1) AS DaQuaDK
                FROM HocPhan hp
                JOIN RangBuocHocPhan rb ON hp.MaHocPhan = rb.MaHocPhan
                JOIN HocPhan hpDK ON rb.MaHocPhanDieuKien = hpDK.MaHocPhan
                WHERE hp.MaNganh = @MaNganh
                  AND hp.MaHocPhan NOT IN (
                      SELECT ISNULL(MaHocPhan, '') FROM BangDiem WHERE MaSinhVien = @MaSV AND TrangThaiDat = 1
                  )
            `);
        return result.recordset;
    },

    // 6. Tạo bản thảo kế hoạch học tập (Transaction)
    async createDraftPlan(maSinhVien, hocKyMucTieu, danhSachHopLe) {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);

        await transaction.begin();
        try {
            let tongTinChi = danhSachHopLe.reduce((sum, m) => sum + Number(m.SoTinChi), 0);

            const request = new sql.Request(transaction);
            request.input('MaSV', sql.VarChar, maSinhVien);
            request.input('HocKy', sql.VarChar, hocKyMucTieu);
            request.input('TongTC', sql.Int, tongTinChi);

            const insertPlanResult = await request.query(`
                INSERT INTO KeHoachHocTap (MaSinhVien, HocKyMucTieu, TongSoTinChi, TrangThaiDuyet, NgayTao, NgayCapNhat)
                OUTPUT INSERTED.MaKeHoach
                VALUES (@MaSV, @HocKy, @TongTC, 'BanThao', GETDATE(), GETDATE())
            `);

            const maKeHoach = insertPlanResult.recordset[0].MaKeHoach;

            let count = 1;
            for (const mon of danhSachHopLe) {
                const ctRequest = new sql.Request(transaction);
                const maCT = `CT${maKeHoach}_${count++}`;
                ctRequest.input('MaCT', sql.VarChar, maCT);
                ctRequest.input('MaKH', sql.Int, maKeHoach);
                ctRequest.input('MaHP', sql.VarChar, mon.MaHocPhan);
                ctRequest.input('TrangThai', sql.NVarChar, mon.TrangThaiMon);
                ctRequest.input('LyDo', sql.NVarChar, 'Lưu bản thảo cá nhân.');

                await ctRequest.query(`
                    INSERT INTO ChiTietKeHoach (MaCT, MaKeHoach, MaHocPhan, TrangThaiMon, LyDoGiaiThich)
                    VALUES (@MaCT, @MaKH, @MaHP, @TrangThai, @LyDo)
                `);
            }

            await transaction.commit();
            return maKeHoach;
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    },

    // 7. Lấy danh sách kế hoạch đã lưu của sinh viên
    async getDanhSachKeHoach(maSinhVien) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaSV', sql.VarChar, maSinhVien)
            .query(`
                SELECT MaKeHoach, HocKyMucTieu, TongSoTinChi, TrangThaiDuyet, NgayTao 
                FROM KeHoachHocTap 
                WHERE MaSinhVien = @MaSV
                ORDER BY NgayTao DESC
            `);
        return result.recordset;
    },

    // 8. Lấy thông tin chung của một kế hoạch
    async getPlanById(maKeHoach) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaKH', sql.Int, maKeHoach)
            .query('SELECT * FROM KeHoachHocTap WHERE MaKeHoach = @MaKH');
        return result.recordset[0];
    },

    // 9. Lấy chi tiết các môn học trong kế hoạch
    async getPlanDetails(maKeHoach) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaKH', sql.Int, maKeHoach)
            .query(`
                SELECT ct.MaCT, ct.MaHocPhan, hp.TenHocPhan, hp.SoTinChi, hp.PhanLoai, hp.HocKyGoiY, ct.TrangThaiMon
                FROM ChiTietKeHoach ct
                JOIN HocPhan hp ON ct.MaHocPhan = hp.MaHocPhan
                WHERE ct.MaKeHoach = @MaKH
            `);
        return result.recordset;
    },

    // 10. Lấy phản hồi mới nhất từ cố vấn cho kế hoạch
    async getLatestFeedback(maKeHoach) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaKH', sql.Int, maKeHoach)
            .query(`
                SELECT TOP 1 NoiDungGopY, TrangThaiPhanHoi, NgayPhanHoi 
                FROM PhanHoiCoVan 
                WHERE MaKeHoach = @MaKH 
                ORDER BY NgayPhanHoi DESC
            `);
        return result.recordset[0];
    },

    // 11. Cập nhật lại bản thảo kế hoạch (Transaction)
    async updateDraftPlan(maKeHoach, danhSachHopLe) {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);

        await transaction.begin();
        try {
            let tongTinChi = danhSachHopLe.reduce((sum, m) => sum + Number(m.SoTinChi), 0);

            // Xóa chi tiết cũ
            const delReq = new sql.Request(transaction);
            delReq.input('MaKH', sql.Int, maKeHoach);
            await delReq.query('DELETE FROM ChiTietKeHoach WHERE MaKH = @MaKH OR MaKeHoach = @MaKH');

            // Cập nhật trạng thái về BanThao
            const updateReq = new sql.Request(transaction);
            updateReq.input('MaKH', sql.Int, maKeHoach);
            updateReq.input('TongTC', sql.Int, tongTinChi);
            await updateReq.query(`
                UPDATE KeHoachHocTap 
                SET TongSoTinChi = @TongTC, 
                    TrangThaiDuyet = 'BanThao', 
                    NgayCapNhat = GETDATE() 
                WHERE MaKeHoach = @MaKH
            `);

            // Thêm chi tiết mới
            let count = 1;
            for (const mon of danhSachHopLe) {
                const ctRequest = new sql.Request(transaction);
                const maCT = `CT${maKeHoach}_${count++}`;
                ctRequest.input('MaCT', sql.VarChar, maCT);
                ctRequest.input('MaKH', sql.Int, maKeHoach);
                ctRequest.input('MaHP', sql.VarChar, mon.MaHocPhan);
                ctRequest.input('TrangThai', sql.NVarChar, mon.TrangThaiMon);
                ctRequest.input('LyDo', sql.NVarChar, 'Cập nhật lại theo góp ý của cố vấn.');

                await ctRequest.query(`
                    INSERT INTO ChiTietKeHoach (MaCT, MaKeHoach, MaHocPhan, TrangThaiMon, LyDoGiaiThich)
                    VALUES (@MaCT, @MaKH, @MaHP, @TrangThai, @LyDo)
                `);
            }

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    },

    // 12. Xóa kế hoạch khi ở trạng thái 'BanThao'
    async xoaKeHoach(maKeHoach) {
        const pool = await poolPromise;
        await pool.request()
            .input('MaKH', sql.Int, maKeHoach)
            .query('DELETE FROM KeHoachHocTap WHERE MaKeHoach = @MaKH AND TrangThaiDuyet = N\'BanThao\'');
    },

    // 13. Gửi kế hoạch cho cố vấn (Đổi trạng thái thành 'ChoDuyet')
    async guiCoVan(maKeHoach) {
        const pool = await poolPromise;
        await pool.request()
            .input('MaKH', sql.Int, maKeHoach)
            .query(`
                UPDATE KeHoachHocTap 
                SET TrangThaiDuyet = 'ChoDuyet', 
                    NgayCapNhat = GETDATE()
                WHERE MaKeHoach = @MaKH
            `);
    },

    // 14. Lấy danh sách các môn cần học lại hoặc cải thiện
    async getMonCanHocLaiCaiThem(maSinhVien) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaSV', sql.VarChar, maSinhVien)
            .query(`
                SELECT bd.MaHocPhan, hp.TenHocPhan, hp.SoTinChi, bd.DiemSo, bd.TrangThaiDat, bd.HocKyHoanThanh AS HocKy,
                       CASE 
                           WHEN bd.TrangThaiDat = 0 THEN N'Học Lại (Chưa Đạt)'
                           WHEN bd.DiemSo >= 4.1 AND bd.DiemSo <= 4.5 THEN N'Cần Cải Thiện (Điểm Thấp)'
                           ELSE N'Cần Cải Thiện'
                       END AS LoaiNhacNho
                FROM BangDiem bd
                JOIN HocPhan hp ON bd.MaHocPhan = hp.MaHocPhan
                WHERE bd.MaSinhVien = @MaSV AND (bd.TrangThaiDat = 0 OR (bd.DiemSo >= 4.1 AND bd.DiemSo <= 4.5))
            `);
        return result.recordset;
    }
};

module.exports = PlanModel;