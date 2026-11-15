// controllers/adminGradeController.js
const AdminGradeModel = require('../models/adminGradeModel');
const xlsx = require('xlsx');

// 1. Lấy danh sách học phần theo chuyên ngành của lớp
exports.getSubjectsByClass = async (req, res) => {
    try {
        const { lop } = req.query;
        const data = await AdminGradeModel.getSubjectsByClass(lop);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2. Lấy danh sách sinh viên theo lớp
exports.getStudentsByClass = async (req, res) => {
    try {
        const { lop } = req.query;
        if (!lop) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp lớp!' });
        }
        const data = await AdminGradeModel.getStudentsByClass(lop);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 3. Lấy bảng điểm theo Lớp và Học Phần
exports.getGradesByClassAndSubject = async (req, res) => {
    try {
        const { lop, maHocPhan } = req.query;
        if (!lop || !maHocPhan) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp lớp và mã học phần!' });
        }

        const data = await AdminGradeModel.getGradesByClassAndSubject(lop, maHocPhan);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 4. Cập nhật hoặc Thêm điểm trực tiếp cho 1 sinh viên
exports.upsertSingleGrade = async (req, res) => {
    try {
        const { maSinhVien, maHocPhan, diemSo, hocKyHoanThanh } = req.body;

        const numericDiem = Number(diemSo);
        const trangThaiDat = numericDiem >= 4.0 ? 1 : 0;
        const hocKy = hocKyHoanThanh || '20232';

        const checkExist = await AdminGradeModel.checkExistingGrade(maSinhVien, maHocPhan);

        if (checkExist) {
            await AdminGradeModel.updateGrade(maSinhVien, maHocPhan, numericDiem, trangThaiDat);
        } else {
            const maBangDiem = `BD_${maSinhVien}_${maHocPhan}`.substring(0, 20);
            await AdminGradeModel.insertGrade(maBangDiem, maSinhVien, maHocPhan, numericDiem, trangThaiDat, hocKy);
        }

        res.status(200).json({ success: true, message: 'Cập nhật điểm thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Thêm sinh viên mới vào lớp
exports.addStudentToClass = async (req, res) => {
    try {
        const { maSinhVien, hoTen, lop, maNganh } = req.body;
        if (!maSinhVien || !hoTen || !lop) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ Mã SV, Họ Tên và Lớp!' });
        }

        const checkSV = await AdminGradeModel.checkStudentExist(maSinhVien);
        if (checkSV) {
            return res.status(400).json({ success: false, message: 'Mã sinh viên này đã tồn tại trong hệ thống!' });
        }

        await AdminGradeModel.createStudentAndAccount(maSinhVien, hoTen, lop, maNganh);

        res.status(200).json({ success: true, message: 'Thêm sinh viên mới thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 6. Xóa sinh viên khỏi lớp
exports.deleteStudent = async (req, res) => {
    try {
        const { maSinhVien } = req.params;
        await AdminGradeModel.deleteStudentData(maSinhVien);

        res.status(200).json({ success: true, message: 'Đã xóa sinh viên khỏi hệ thống thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 7. Xuất file Excel danh sách sinh viên của lớp
exports.exportGradesExcel = async (req, res) => {
    try {
        const { lop } = req.query;
        if (!lop) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin lớp để xuất file!' });
        }

        const fileName = `DanhSachSinhVien_${lop}.xlsx`;
        const data = await AdminGradeModel.getStudentsByClass(lop); // Tái sử dụng hàm lấy danh sách sinh viên

        // Format thêm STT và tiêu đề tiếng Việt cho đẹp
        const formattedData = data.map((item, index) => ({
            'STT': index + 1,
            'Mã Sinh Viên': item.MaSinhVien,
            'Họ và Tên': item.HoTen,
            'Lớp': item.Lop,
            'Mã Ngành': item.MaNganh || 'CNTT',
            'GPA Tích Lũy': item.GPA_TichLuy || 0,
            'Tổng Tín Chỉ Tích Lũy': item.TongTinChiTichLuy || 0
        }));

        const worksheet = xlsx.utils.json_to_sheet(formattedData);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "DanhSachSinhVien");

        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 8. Import điểm từ file Excel (Tự động đồng bộ sinh viên mới nếu chưa tồn tại)
exports.importGradesExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Vui lòng tải lên file Excel!' });
        }

        const { maHocPhan, hocKyHoanThanh } = req.body;
        if (!maHocPhan) {
            return res.status(400).json({ success: false, message: 'Thiếu mã học phần áp dụng điểm!' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        
        let headerRowIndex = -1;
        let msvColIndex = -1;
        let diemColIndex = -1;

        for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i];
            if (!row) continue;
            for (let j = 0; j < row.length; j++) {
                if (!row[j]) continue;
                const val = String(row[j]).trim().toLowerCase().replace(/\s+/g, '');
                
                if (val.includes('masinhvien') || val.includes('mãsinhviên') || val.includes('masv')) {
                    headerRowIndex = i;
                    msvColIndex = j;
                }
                if (val.includes('diemso') || val.includes('diểmsố') || val.includes('diem') || val.includes('điểm')) {
                    diemColIndex = j;
                }
            }
            if (headerRowIndex !== -1 && diemColIndex !== -1) break;
        }

        if (headerRowIndex === -1 || msvColIndex === -1 || diemColIndex === -1) {
            headerRowIndex = 0;
            msvColIndex = 1; 
            diemColIndex = 3; 
        }

        let countUpdated = 0;

        for (let i = headerRowIndex + 1; i < rawData.length; i++) {
            const row = rawData[i];
            if (!row || row.length === 0) continue;

            const maSinhVien = row[msvColIndex] ? String(row[msvColIndex]).trim() : null;
            let diemSoRaw = row[diemColIndex];

            if (diemSoRaw === undefined || diemSoRaw === null || isNaN(Number(String(diemSoRaw).replace(',', '.')))) {
                for (let c = 0; c < row.length; c++) {
                    const val = Number(String(row[c] || '').replace(',', '.'));
                    if (!isNaN(val) && val >= 0 && val <= 10) {
                        diemSoRaw = row[c];
                        break;
                    }
                }
            }

            if (maSinhVien && diemSoRaw !== undefined && diemSoRaw !== null && String(diemSoRaw).trim() !== '') {
                const diemSo = Number(String(diemSoRaw).replace(',', '.'));
                if (isNaN(diemSo)) continue;

                const trangThaiDat = diemSo >= 4.0 ? 1 : 0;
                const hocKy = hocKyHoanThanh || '20232';

                const checkSV = await AdminGradeModel.checkStudentExist(maSinhVien);
                if (!checkSV) {
                    await AdminGradeModel.createStudentAndAccount(maSinhVien, `Sinh Viên ${maSinhVien}`, 'CNTT2023', 'CNTT');
                }

                const checkExist = await AdminGradeModel.checkExistingGrade(maSinhVien, maHocPhan);
                if (checkExist) {
                    await AdminGradeModel.updateGrade(maSinhVien, maHocPhan, diemSo, trangThaiDat);
                } else {
                    const maBangDiem = `BD_${maSinhVien}_${maHocPhan}`.substring(0, 20);
                    await AdminGradeModel.insertGrade(maBangDiem, maSinhVien, maHocPhan, diemSo, trangThaiDat, hocKy);
                }
                countUpdated++;
            }
        }

        res.status(200).json({ success: true, message: `Import thành công điểm cho ${countUpdated} sinh viên!` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};