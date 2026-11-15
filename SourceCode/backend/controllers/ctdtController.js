// backend/controllers/ctdtController.js
const CtdtModel = require('../models/ctdtModel');

// Lấy danh sách chuyên ngành cho ComboBox/Dropdown
exports.getChuyenNganh = async (req, res) => {
    try {
        const data = await CtdtModel.getChuyenNganh();
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Tra cứu học phần theo Mã ngành
exports.getCTDTByNganh = async (req, res) => {
    try {
        const { maNganh } = req.params;
        const data = await CtdtModel.getCTDTByNganh(maNganh);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
// Lấy danh sách quan hệ ràng buộc học phần theo Mã ngành
exports.getRangBuocByNganh = async (req, res) => {
    try {
        const { maNganh } = req.params;
        const data = await CtdtModel.getRangBuocByNganh(maNganh);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};