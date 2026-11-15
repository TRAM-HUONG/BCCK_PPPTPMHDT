// models/ctdtModel.js
const { poolPromise } = require('../config/db');

const CtdtModel = {
    // 1. Lấy danh sách chuyên ngành cho ComboBox/Dropdown
    async getChuyenNganh() {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT MaNganh, TenNganh FROM ChuyenNganh');
        return result.recordset;
    },

    // 2. Tra cứu học phần theo Mã ngành và ràng buộc tiên quyết
    async getCTDTByNganh(maNganh) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaNganh', maNganh)
            .query(`
                SELECT 
                    hp.MaHocPhan, 
                    hp.TenHocPhan, 
                    hp.SoTinChi, 
                    hp.PhanLoai, 
                    hp.HocKyGoiY,
                    ISNULL(rb.MaHocPhanDieuKien, N'Không') AS MonTienQuyet
                FROM HocPhan hp
                LEFT JOIN RangBuocHocPhan rb ON hp.MaHocPhan = rb.MaHocPhan AND rb.LoaiRangBuoc = 'TienQuyet'
                WHERE hp.MaNganh = @MaNganh
            `);
        return result.recordset;
    },
    // 3. Lấy danh sách ràng buộc học phần theo chuyên ngành
  // 3. Lấy danh sách ràng buộc học phần kèm theo tên môn theo chuyên ngành
    async getRangBuocByNganh(maNganh) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaNganh', maNganh)
            .query(`
                SELECT 
                    rb.MaRB,
                    rb.MaHocPhan,
                    hp1.TenHocPhan AS TenHocPhanChinh,
                    rb.MaHocPhanDieuKien,
                    hp2.TenHocPhan AS TenHocPhanDieuKien,
                    rb.LoaiRangBuoc
                FROM RangBuocHocPhan rb
                JOIN HocPhan hp1 ON rb.MaHocPhan = hp1.MaHocPhan
                LEFT JOIN HocPhan hp2 ON rb.MaHocPhanDieuKien = hp2.MaHocPhan
                WHERE hp1.MaNganh = @MaNganh
            `);
        return result.recordset;
    }
};

module.exports = CtdtModel;