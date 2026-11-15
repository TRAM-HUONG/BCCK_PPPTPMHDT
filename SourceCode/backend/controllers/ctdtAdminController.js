// backend/controllers/ctdtAdminController.js
const { poolPromise } = require('../config/db');

// --- QUẢN LÝ CHUYÊN NGÀNH ---
exports.getChuyenNganh = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM ChuyenNganh');
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createChuyenNganh = async (req, res) => {
    try {
        const { maNganh, tenNganh, khoaHoc } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('MaNganh', maNganh)
            .input('TenNganh', tenNganh)
            .input('KhoaHoc', khoaHoc)
            .query('INSERT INTO ChuyenNganh (MaNganh, TenNganh, KhoaHoc) VALUES (@MaNganh, @TenNganh, @KhoaHoc)');
        res.status(200).json({ success: true, message: 'Thêm chuyên ngành thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateChuyenNganh = async (req, res) => {
    try {
        const { maNganh } = req.params;
        const tenNganh = req.body.tenNganh || req.body.TenNganh;
        const khoaHoc = req.body.khoaHoc || req.body.KhoaHoc;

        const pool = await poolPromise;
        await pool.request()
            .input('MaNganh', maNganh)
            .input('TenNganh', tenNganh)
            .input('KhoaHoc', khoaHoc)
            .query('UPDATE ChuyenNganh SET TenNganh = @TenNganh, KhoaHoc = @KhoaHoc WHERE MaNganh = @MaNganh');
        res.status(200).json({ success: true, message: 'Cập nhật chuyên ngành thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteChuyenNganh = async (req, res) => {
    try {
        const { maNganh } = req.params;
        const pool = await poolPromise;
        await pool.request().input('MaNganh', maNganh).query('DELETE FROM ChuyenNganh WHERE MaNganh = @MaNganh');
        res.status(200).json({ success: true, message: 'Xóa chuyên ngành thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- QUẢN LÝ HỌC PHẦN ---
exports.getHocPhan = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT hp.*, cn.TenNganh 
            FROM HocPhan hp 
            LEFT JOIN ChuyenNganh cn ON hp.MaNganh = cn.MaNganh
        `);
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createHocPhan = async (req, res) => {
    try {
        const { maHocPhan, tenHocPhan, soTinChi, phanLoai, maNganh, hocKyGoiY } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('MaHocPhan', maHocPhan)
            .input('TenHocPhan', tenHocPhan)
            .input('SoTinChi', soTinChi)
            .input('PhanLoai', phanLoai)
            .input('MaNganh', maNganh)
            .input('HocKyGoiY', hocKyGoiY)
            .query('INSERT INTO HocPhan (MaHocPhan, TenHocPhan, SoTinChi, PhanLoai, MaNganh, HocKyGoiY) VALUES (@MaHocPhan, @TenHocPhan, @SoTinChi, @PhanLoai, @MaNganh, @HocKyGoiY)');
        res.status(200).json({ success: true, message: 'Thêm học phần thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateHocPhan = async (req, res) => {
    try {
        const { maHocPhan } = req.params;
        const tenHocPhan = req.body.tenHocPhan || req.body.TenHocPhan;
        const soTinChi = req.body.soTinChi !== undefined ? req.body.soTinChi : req.body.SoTinChi;
        const phanLoai = req.body.phanLoai || req.body.PhanLoai;
        const maNganh = req.body.maNganh || req.body.MaNganh;
        const hocKyGoiY = req.body.hocKyGoiY !== undefined ? req.body.hocKyGoiY : req.body.HocKyGoiY;

        const pool = await poolPromise;
        await pool.request()
            .input('MaHocPhan', maHocPhan)
            .input('TenHocPhan', tenHocPhan)
            .input('SoTinChi', soTinChi)
            .input('PhanLoai', phanLoai)
            .input('MaNganh', maNganh)
            .input('HocKyGoiY', hocKyGoiY)
            .query('UPDATE HocPhan SET TenHocPhan = @TenHocPhan, SoTinChi = @SoTinChi, PhanLoai = @PhanLoai, MaNganh = @MaNganh, HocKyGoiY = @HocKyGoiY WHERE MaHocPhan = @MaHocPhan');
        
        res.status(200).json({ success: true, message: 'Cập nhật học phần thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteHocPhan = async (req, res) => {
    try {
        const { maHocPhan } = req.params;
        const pool = await poolPromise;
        await pool.request().input('MaHocPhan', maHocPhan).query('DELETE FROM HocPhan WHERE MaHocPhan = @MaHocPhan');
        res.status(200).json({ success: true, message: 'Xóa học phần thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};