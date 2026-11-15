// backend/controllers/adminController.js
const { poolPromise } = require('../config/db');
const { sendEmail } = require('../utils/mailer'); // Nhập hàm gửi email chung
// 1. Thống kê Dashboard
exports.getAdminDashboardStats = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                (SELECT COUNT(*) FROM SinhVien) AS TongSinhVien,
                (SELECT COUNT(*) FROM GiangVien) AS TongGiangVien,
                (SELECT COUNT(*) FROM HocPhan) AS TongHocPhan,
                (SELECT COUNT(*) FROM ChuyenNganh) AS TongNganh,
                (SELECT COUNT(*) FROM TaiKhoan WHERE TrangThai = 1) AS TaiKhoanHoatDong
        `);
        res.status(200).json({ success: true, data: result.recordset[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2. Quản lý tài khoản
exports.getAllUsers = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT tk.MaTK, tk.Email, tk.VaiTro, tk.TrangThai,
                   COALESCE(ad.HoTen, gv.HoTen, sv.HoTen, N'Chưa cập nhật') AS HoTen,
                   COALESCE(ad.QuyenHanQuanTri, gv.ChuyenMon, sv.Lop) AS ThongTinThem,
                   sv.MaNganh
            FROM TaiKhoan tk
            LEFT JOIN Admin ad ON tk.MaTK = ad.MaTK
            LEFT JOIN GiangVien gv ON tk.MaTK = gv.MaTK
            LEFT JOIN SinhVien sv ON tk.MaTK = sv.MaTK
        `);
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// backend/controllers/adminController.js
exports.createUser = async (req, res) => {
    try {
        const { maTK, email, matKhau, vaiTro, hoTen, thongTinThem, maNganh } = req.body;
        const pool = await poolPromise;

        await pool.request()
            .input('MaTK', maTK)
            .input('Email', email)
            .input('MatKhau', matKhau)
            .input('VaiTro', vaiTro)
            .query('INSERT INTO TaiKhoan (MaTK, Email, MatKhau, VaiTro, TrangThai) VALUES (@MaTK, @Email, @MatKhau, @VaiTro, 1)');

        if (vaiTro === 'Admin') {
            await pool.request()
                .input('MaAdmin', maTK.replace('TK_', 'AD_'))
                .input('MaTK', maTK)
                .input('HoTen', hoTen)
                .input('QuyenHanQuanTri', thongTinThem || 'Toàn quyền hệ thống')
                .query('INSERT INTO Admin (MaAdmin, MaTK, HoTen, QuyenHanQuanTri) VALUES (@MaAdmin, @MaTK, @HoTen, @QuyenHanQuanTri)');
        } else if (vaiTro === 'GiangVien') {
            await pool.request()
                .input('MaCoVan', maTK.replace('TK_', 'GV_'))
                .input('MaTK', maTK)
                .input('HoTen', hoTen)
                .input('ChuyenMon', thongTinThem)
                .query('INSERT INTO GiangVien (MaCoVan, MaTK, HoTen, ChuyenMon) VALUES (@MaCoVan, @MaTK, @HoTen, @ChuyenMon)');
        } else if (vaiTro === 'SinhVien') {
            const lopSinhVien = thongTinThem || 'CNTT2023';

            // --- TỰ ĐỘNG TÌM GIẢNG VIÊN CỐ VẤN PHỤ TRÁCH LỚP NÀY ---
            const gvRes = await pool.request()
                .input('Lop', lopSinhVien)
                .query('SELECT MaCoVan FROM GiangVien WHERE LopPhuTrach = @Lop');

            let maCoVanTuDong = null;
            if (gvRes.recordset.length > 0) {
                maCoVanTuDong = gvRes.recordset[0].MaCoVan;
            }

            // Thêm sinh viên mới với Mã Cố Vấn được tự động tìm thấy theo lớp
            await pool.request()
                .input('MaSinhVien', maTK.replace('TK_', 'SV_'))
                .input('MaTK', maTK)
                .input('HoTen', hoTen)
                .input('Lop', lopSinhVien)
                .input('MaNganh', maNganh || 'CNTT')
                .input('MaCoVan', maCoVanTuDong)
                .query(`
                    INSERT INTO SinhVien (MaSinhVien, MaTK, HoTen, Lop, MaNganh, MaCoVan) 
                    VALUES (@MaSinhVien, @MaTK, @HoTen, @Lop, @MaNganh, @MaCoVan)
                `);
        }
        res.status(200).json({ success: true, message: 'Thêm tài khoản thành công và tự động gán cố vấn theo lớp!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

   exports.updateUser = async (req, res) => {
    try {
        const { maTK, email, vaiTro, trangThai, hoTen, thongTinThem, maNganh } = req.body;
        const pool = await poolPromise;

        await pool.request()
            .input('MaTK', maTK)
            .input('Email', email)
            .input('TrangThai', trangThai)
            .query('UPDATE TaiKhoan SET Email = @Email, TrangThai = @TrangThai WHERE MaTK = @MaTK');

        if (vaiTro === 'Admin') {
            await pool.request().input('MaTK', maTK).input('HoTen', hoTen)
                .query('UPDATE Admin SET HoTen = @HoTen WHERE MaTK = @MaTK');
        } else if (vaiTro === 'GiangVien') {
            await pool.request().input('MaTK', maTK).input('HoTen', hoTen)
                .query('UPDATE GiangVien SET HoTen = @HoTen WHERE MaTK = @MaTK');
        } else if (vaiTro === 'SinhVien') {
            await pool.request()
                .input('MaTK', maTK)
                .input('HoTen', hoTen)
                .input('Lop', thongTinThem)
                .input('MaNganh', maNganh)
                .query('UPDATE SinhVien SET HoTen = @HoTen, Lop = @Lop, MaNganh = @MaNganh WHERE MaTK = @MaTK');
        }

        res.status(200).json({ success: true, message: 'Cập nhật thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { maTK } = req.params;
        const pool = await poolPromise;
        await pool.request()
            .input('MaTK', maTK)
            .query('DELETE FROM TaiKhoan WHERE MaTK = @MaTK');

        res.status(200).json({ success: true, message: 'Xóa tài khoản thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 3. Lấy danh sách chia nhóm phục vụ trang Reset Mật Khẩu
exports.getUsersForResetPassword = async (req, res) => {
    try {
        const pool = await poolPromise;
        
        const adminResult = await pool.request().query(`
            SELECT tk.MaTK, tk.Email, tk.VaiTro, ad.MaAdmin AS MaDinhDanh, ad.HoTen, ad.QuyenHanQuanTri AS ThongTinPhu, NULL AS TenCoVan
            FROM TaiKhoan tk
            JOIN Admin ad ON tk.MaTK = ad.MaTK
        `);

        const sinhVienResult = await pool.request().query(`
            SELECT tk.MaTK, tk.Email, tk.VaiTro, sv.MaSinhVien AS MaDinhDanh, sv.HoTen, sv.Lop AS ThongTinPhu, gv.HoTen AS TenCoVan
            FROM TaiKhoan tk
            JOIN SinhVien sv ON tk.MaTK = sv.MaTK
            LEFT JOIN GiangVien gv ON sv.MaCoVan = gv.MaCoVan
            ORDER BY sv.Lop ASC, sv.HoTen ASC
        `);

        const giangVienResult = await pool.request().query(`
            SELECT tk.MaTK, tk.Email, tk.VaiTro, gv.MaCoVan AS MaDinhDanh, gv.HoTen, gv.ChuyenMon AS ThongTinPhu, gv.LopPhuTrach AS TenCoVan
            FROM TaiKhoan tk
            JOIN GiangVien gv ON tk.MaTK = gv.MaTK
        `);

        res.status(200).json({ 
            success: true, 
            admins: adminResult.recordset,
            students: sinhVienResult.recordset,
            teachers: giangVienResult.recordset
        });
    } catch (error) {
        console.error('Lỗi getUsersForResetPassword:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getSinhVienList = async (req, res) => {
    try {
        const { keyword } = req.query;
        const pool = await poolPromise;
        let query = `
            SELECT sv.MaSinhVien, sv.HoTen, sv.Lop, tk.Email, tk.MaTK 
            FROM SinhVien sv
            JOIN TaiKhoan tk ON sv.MaTK = tk.MaTK
        `;
        let request = pool.request();
        if (keyword && keyword.trim() !== '') {
            query += ` WHERE sv.MaSinhVien LIKE @Keyword OR sv.HoTen LIKE @Keyword OR tk.Email LIKE @Keyword`;
            request.input('Keyword', `%${keyword.trim()}%`);
        }
        query += ` ORDER BY sv.Lop ASC, sv.HoTen ASC`;
        const result = await request.query(query);
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};



exports.resetUserPassword = async (req, res) => {
    try {
        const { maTK } = req.params;
        const { newPassword } = req.body;
        const matKhauMoi = newPassword || '123456';
        const pool = await poolPromise;

        // 1. Cập nhật mật khẩu mới vào CSDL
        await pool.request()
            .input('MaTK', maTK)
            .input('MatKhau', matKhauMoi)
            .query('UPDATE TaiKhoan SET MatKhau = @MatKhau WHERE MaTK = @MaTK');

        // 2. Lấy Email người dùng
        const userRes = await pool.request()
            .input('MaTK', maTK)
            .query('SELECT Email FROM TaiKhoan WHERE MaTK = @MaTK');

        if (userRes.recordset.length > 0) {
            const emailNhan = userRes.recordset[0].Email;
            if (emailNhan) {
                // 3. Gửi email thông báo mật khẩu mới
                const subject = '[StudyPlanner] Cấp lại mật khẩu tài khoản';
                const html = `<p>Mật khẩu mới của bạn là: <b>${matKhauMoi}</b></p>`;
                
                await sendEmail(emailNhan, subject, html);
            }
        }

        res.status(200).json({ success: true, message: 'Reset mật khẩu và gửi email thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
// backend/controllers/adminController.js
exports.getClassesList = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT DISTINCT Lop FROM (
                SELECT Lop FROM SinhVien WHERE Lop IS NOT NULL AND Lop != ''
                UNION
                SELECT LopPhuTrach AS Lop FROM GiangVien WHERE LopPhuTrach IS NOT NULL AND LopPhuTrach != ''
            ) AS AllClasses
            ORDER BY Lop ASC
        `);
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};