// backend/controllers/prerequisiteController.js
const PrerequisiteModel = require('../models/prerequisiteModel');

// Lấy danh sách quy tắc ràng buộc học phần
exports.getPrerequisites = async (req, res) => {
    try {
        const data = await PrerequisiteModel.getAllPrerequisites();
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Thêm mới quy tắc ràng buộc
exports.createPrerequisite = async (req, res) => {
    try {
        const { maRB, maHocPhan, maHocPhanDieuKien, loaiRangBuoc } = req.body;
        await PrerequisiteModel.createPrerequisite(maRB, maHocPhan, maHocPhanDieuKien, loaiRangBuoc);
        res.status(200).json({ success: true, message: 'Thêm cấu hình quy tắc tiên quyết thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Xóa quy tắc ràng buộc
exports.deletePrerequisite = async (req, res) => {
    try {
        const { maRB } = req.params;
        await PrerequisiteModel.deletePrerequisite(maRB);
        res.status(200).json({ success: true, message: 'Xóa quy tắc thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Cập nhật quy tắc ràng buộc
exports.updatePrerequisite = async (req, res) => {
    try {
        const { maRB } = req.params;
        const { maHocPhan, maHocPhanDieuKien, loaiRangBuoc } = req.body;
        
        await PrerequisiteModel.updatePrerequisite(maRB, maHocPhan, maHocPhanDieuKien, loaiRangBuoc);
        res.status(200).json({ success: true, message: 'Cập nhật quy tắc thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Lấy học phần theo chuyên ngành
exports.getHocPhanByNganh = async (req, res) => {
    try {
        const { maNganh } = req.params;
        const data = await PrerequisiteModel.getHocPhanByNganh(maNganh);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};