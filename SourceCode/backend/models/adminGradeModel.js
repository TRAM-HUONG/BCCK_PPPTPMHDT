// models/adminGradeModel.js
const { poolPromise } = require('../config/db');

const AdminGradeModel = {
    // 1. Lấy danh sách học phần theo chuyên ngành của lớp
    async getSubjectsByClass(lop) {
        const pool = await poolPromise;
        let query = `
            SELECT DISTINCT hp.MaHocPhan, hp.TenHocPhan, hp.MaNganh 
            FROM HocPhan hp
        `;
        let request = pool.request();

        if (lop) {
            query += `
                JOIN SinhVien sv ON sv.MaNganh = hp.MaNganh
                WHERE sv.Lop = @Lop
            `;
            request.input('Lop', lop);
        }
        query += ` ORDER BY hp.MaHocPhan ASC`;

        const result = await request.query(query);
        return result.recordset;
    },

    // 2. Lấy danh sách sinh viên theo lớp
    async getStudentsByClass(lop) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Lop', lop)
            .query(`
                SELECT MaSinhVien, HoTen, Lop, MaNganh, GPA_TichLuy, TongTinChiTichLuy
                FROM SinhVien
                WHERE Lop = @Lop
                ORDER BY MaSinhVien ASC
            `);
        return result.recordset;
    },

    // 3. Lấy bảng điểm theo Lớp và Học Phần
    async getGradesByClassAndSubject(lop, maHocPhan) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Lop', lop)
            .input('MaHocPhan', maHocPhan)
            .query(`
                SELECT 
                    sv.MaSinhVien, 
                    sv.HoTen, 
                    sv.Lop,
                    @MaHocPhan AS MaHocPhan,
                    bd.MaBangDiem,
                    bd.DiemSo,
                    bd.TrangThaiDat,
                    bd.HocKyHoanThanh
                FROM SinhVien sv
                LEFT JOIN BangDiem bd ON sv.MaSinhVien = bd.MaSinhVien AND bd.MaHocPhan = @MaHocPhan
                WHERE sv.Lop = @Lop
                ORDER BY sv.MaSinhVien ASC
            `);
        return result.recordset;
    },

    // 4. Kiểm tra sự tồn tại của điểm sinh viên
    async checkExistingGrade(maSinhVien, maHocPhan) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaSinhVien', maSinhVien)
            .input('MaHocPhan', maHocPhan)
            .query('SELECT MaBangDiem FROM BangDiem WHERE MaSinhVien = @MaSinhVien AND MaHocPhan = @MaHocPhan');
        return result.recordset[0];
    },

    // 5. Cập nhật điểm
    async updateGrade(maSinhVien, maHocPhan, numericDiem, trangThaiDat) {
        const pool = await poolPromise;
        await pool.request()
            .input('MaSinhVien', maSinhVien)
            .input('MaHocPhan', maHocPhan)
            .input('DiemSo', numericDiem)
            .input('TrangThaiDat', trangThaiDat)
            .query('UPDATE BangDiem SET DiemSo = @DiemSo, TrangThaiDat = @TrangThaiDat WHERE MaSinhVien = @MaSinhVien AND MaHocPhan = @MaHocPhan');
    },

    // 6. Thêm mới điểm
    async insertGrade(maBangDiem, maSinhVien, maHocPhan, numericDiem, trangThaiDat, hocKy) {
        const pool = await poolPromise;
        await pool.request()
            .input('MaBangDiem', maBangDiem)
            .input('MaSinhVien', maSinhVien)
            .input('MaHocPhan', maHocPhan)
            .input('DiemSo', numericDiem)
            .input('TrangThaiDat', trangThaiDat)
            .input('HocKyHoanThanh', hocKy)
            .query('INSERT INTO BangDiem (MaBangDiem, MaSinhVien, MaHocPhan, DiemSo, TrangThaiDat, HocKyHoanThanh) VALUES (@MaBangDiem, @MaSinhVien, @MaHocPhan, @DiemSo, @TrangThaiDat, @HocKyHoanThanh)');
    },

    // 7. Kiểm tra sinh viên tồn tại
    async checkStudentExist(maSinhVien) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaSinhVien', maSinhVien)
            .query('SELECT MaSinhVien FROM SinhVien WHERE MaSinhVien = @MaSinhVien');
        return result.recordset[0];
    },

    // 8. Thêm mới tài khoản và sinh viên
    async createStudentAndAccount(maSinhVien, hoTen, lop, maNganh) {
        const pool = await poolPromise;
        const maTK = `TK_${maSinhVien}`;
        
        await pool.request()
            .input('MaTK', maTK)
            .input('Email', `${maSinhVien.toLowerCase()}@student.edu.vn`)
            .input('MatKhau', '123456')
            .query('INSERT INTO TaiKhoan (MaTK, Email, MatKhau, VaiTro, TrangThai) VALUES (@MaTK, @Email, @MatKhau, \'SinhVien\', 1)');

        await pool.request()
            .input('MaSinhVien', maSinhVien)
            .input('MaTK', maTK)
            .input('HoTen', hoTen)
            .input('Lop', lop)
            .input('MaNganh', maNganh || 'CNTT')
            .query('INSERT INTO SinhVien (MaSinhVien, MaTK, HoTen, Lop, MaNganh) VALUES (@MaSinhVien, @MaTK, @HoTen, @Lop, @MaNganh)');
    },

    // 9. Xóa sinh viên và bảng điểm liên quan
    async deleteStudentData(maSinhVien) {
        const pool = await poolPromise;
        await pool.request()
            .input('MaSinhVien', maSinhVien)
            .query('DELETE FROM BangDiem WHERE MaSinhVien = @MaSinhVien');

        await pool.request()
            .input('MaSinhVien', maSinhVien)
            .query('DELETE FROM SinhVien WHERE MaSinhVien = @MaSinhVien');
    }
};

module.exports = AdminGradeModel;