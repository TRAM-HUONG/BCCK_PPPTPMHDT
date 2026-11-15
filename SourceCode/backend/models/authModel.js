// models/authModel.js
const { poolPromise } = require('../config/db');
const sql = require('mssql');

const AuthModel = {
    // 1. Tìm tài khoản theo Email và Mật khẩu
    async findByCredentials(email, matKhau) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Email', email)
            .input('MatKhau', matKhau)
            .query('SELECT * FROM TaiKhoan WHERE Email = @Email AND MatKhau = @MatKhau AND TrangThai = 1');
        return result.recordset[0]; // Trả về user đầu tiên hoặc undefined
    },

    // 2. Lấy thông tin chi tiết dựa vào VaiTrò (SinhVien, GiangVien, Admin)
    async getExtraInfo(maTK, vaiTro) {
        const pool = await poolPromise;
        let query = '';
        let inputName = 'MaTK';

        if (vaiTro === 'SinhVien') {
            query = 'SELECT MaSinhVien, HoTen, Lop, MaNganh FROM SinhVien WHERE MaTK = @MaTK';
        } else if (vaiTro === 'GiangVien') {
            query = 'SELECT MaCoVan, HoTen, ChuyenMon, LopPhuTrach FROM GiangVien WHERE MaTK = @MaTK';
        } else if (vaiTro === 'Admin') {
            query = 'SELECT MaAdmin, HoTen, QuyenHanQuanTri FROM Admin WHERE MaTK = @MaTK';
        }

        if (!query) return null;

        const res = await pool.request()
            .input(inputName, maTK)
            .query(query);

        return res.recordset[0] || {};
    },

    // 3. Lấy danh sách sinh viên phục vụ tìm kiếm/reset mật khẩu
    async getSinhVienList(keyword) {
        const pool = await poolPromise;
        let query = `
            SELECT sv.MaSinhVien, sv.HoTen, sv.Lop, tk.Email, tk.MaTK, tk.TenDangNhap 
            FROM SinhVien sv
            JOIN TaiKhoan tk ON sv.MaTK = tk.MaTK
        `;
        let request = pool.request();
        if (keyword) {
            query += ` WHERE sv.MaSinhVien LIKE @Keyword OR sv.HoTen LIKE @Keyword OR tk.Email LIKE @Keyword OR tk.TenDangNhap LIKE @Keyword`;
            request.input('Keyword', `%${keyword}%`);
        }
        const result = await request.query(query);
        return result.recordset;
    },

    // 4. Kiểm tra email có tồn tại không
    async findByEmail(email) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Email', sql.VarChar, email)
            .query('SELECT * FROM TaiKhoan WHERE Email = @Email');
        return result.recordset[0];
    },

    // 5. Cập nhật mật khẩu mới theo email
    async updatePassword(email, newPassword) {
        const pool = await poolPromise;
        await pool.request()
            .input('Email', sql.VarChar, email)
            .input('MatKhau', sql.VarChar, newPassword)
            .query('UPDATE TaiKhoan SET MatKhau = @MatKhau WHERE Email = @Email');
    }
};

Model = AuthModel; // Có thể export trực tiếp module.exports = AuthModel;
module.exports = AuthModel;