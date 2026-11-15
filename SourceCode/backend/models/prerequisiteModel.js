// models/prerequisiteModel.js
const { poolPromise } = require('../config/db');

const PrerequisiteModel = {
    // 1. Lấy danh sách quy tắc ràng buộc học phần
    async getAllPrerequisites() {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT rb.MaRB, rb.LoaiRangBuoc, 
                   hp1.MaHocPhan AS MaHP, hp1.TenHocPhan AS TenHP,
                   hp2.MaHocPhan AS MaHPDieuKien, hp2.TenHocPhan AS TenHPDieuKien
            FROM RangBuocHocPhan rb
            JOIN HocPhan hp1 ON rb.MaHocPhan = hp1.MaHocPhan
            JOIN HocPhan hp2 ON rb.MaHocPhanDieuKien = hp2.MaHocPhan
        `);
        return result.recordset;
    },

    // 2. Thêm mới quy tắc ràng buộc
    async createPrerequisite(maRB, maHocPhan, maHocPhanDieuKien, loaiRangBuoc) {
        const pool = await poolPromise;
        await pool.request()
            .input('MaRB', maRB)
            .input('MaHocPhan', maHocPhan)
            .input('MaHocPhanDieuKien', maHocPhanDieuKien)
            .input('LoaiRangBuoc', loaiRangBuoc)
            .query('INSERT INTO RangBuocHocPhan (MaRB, MaHocPhan, MaHocPhanDieuKien, LoaiRangBuoc) VALUES (@MaRB, @MaHocPhan, @MaHocPhanDieuKien, @LoaiRangBuoc)');
    },

    // 3. Xóa quy tắc ràng buộc
    async deletePrerequisite(maRB) {
        const pool = await poolPromise;
        await pool.request()
            .input('MaRB', maRB)
            .query('DELETE FROM RangBuocHocPhan WHERE MaRB = @MaRB');
    },

    // 4. Cập nhật quy tắc ràng buộc
    async updatePrerequisite(maRB, maHocPhan, maHocPhanDieuKien, loaiRangBuoc) {
        const pool = await poolPromise;
        await pool.request()
            .input('MaRB', maRB)
            .input('MaHocPhan', maHocPhan)
            .input('MaHocPhanDieuKien', maHocPhanDieuKien)
            .input('LoaiRangBuoc', loaiRangBuoc)
            .query('UPDATE RangBuocHocPhan SET MaHocPhan = @MaHocPhan, MaHocPhanDieuKien = @MaHocPhanDieuKien, LoaiRangBuoc = @LoaiRangBuoc WHERE MaRB = @MaRB');
    },

    // 5. Lấy danh sách học phần theo chuyên ngành
    async getHocPhanByNganh(maNganh) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaNganh', maNganh)
            .query('SELECT * FROM HocPhan WHERE MaNganh = @MaNganh');
        return result.recordset;
    }
};

module.exports = PrerequisiteModel;