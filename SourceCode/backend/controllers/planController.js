// controllers/planController.js
const PlanModel = require('../models/planModel');

// 1. API Đề xuất môn học: Đã lọc bỏ hoàn toàn các môn bị khóa (Tiên quyết, Học trước, Song hành)
exports.getMonDeXuat = async (req, res) => {
    try {
        const { maSinhVien } = req.params;

        const maNganh = await PlanModel.getStudentMajor(maSinhVien);
        if (!maNganh) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên.' });
        }

        const passedCourses = await PlanModel.getPassedCourses(maSinhVien);
        const allCourses = await PlanModel.getCoursesByMajor(maNganh);
        const rules = await PlanModel.getAllRules();

        const danhSachDeXuat = [];

        for (const hp of allCourses) {
            if (passedCourses.has(hp.MaHocPhan)) continue;

            const courseRules = rules.filter(r => r.MaHocPhan === hp.MaHocPhan);
            let biKhoa = false;

            for (const r of courseRules) {
                if (r.LoaiRangBuoc === 'TienQuyet' || r.LoaiRangBuoc === 'HocTruoc') {
                    if (!passedCourses.has(r.MaHocPhanDieuKien)) {
                        biKhoa = true;
                        break;
                    }
                }
            }

            if (!biKhoa) {
                danhSachDeXuat.push({
                    ...hp,
                    TrangThaiMon: 'DeXuat'
                });
            }
        }

        res.status(200).json({ success: true, data: danhSachDeXuat });
    } catch (error) {
        console.error("Lỗi đề xuất:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2. API Lấy danh sách các môn bị khóa kèm lý do chi tiết
exports.getMonBiKhoa = async (req, res) => {
    try {
        const { maSinhVien } = req.params;

        const maNganh = await PlanModel.getStudentMajor(maSinhVien);
        if (!maNganh) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên.' });
        }

        const rawData = await PlanModel.getLockedCoursesDetail(maNganh, maSinhVien);
        const danhSachKhoa = [];

        for (const item of rawData) {
            let biKhoa = false;
            let lyDo = '';

            if (item.LoaiRangBuoc === 'HocTruoc' && item.DaTungHocDK === 0) {
                biKhoa = true;
                lyDo = `Bị khóa do quy tắc [Học Trước]: Chưa từng học môn điều kiện [${item.MaHocPhanDieuKien}] ${item.TenMonDieuKien}.`;
            } else if (item.LoaiRangBuoc === 'TienQuyet' && item.DaQuaDK === 0) {
                biKhoa = true;
                lyDo = `Bị khóa do quy tắc [Tiên Quyết]: Chưa qua môn điều kiện [${item.MaHocPhanDieuKien}] ${item.TenMonDieuKien}.`;
            } else if (item.LoaiRangBuoc === 'SongHanh' && item.DaTungHocDK === 0) {
                biKhoa = true;
                lyDo = `Bị khóa do quy tắc [Song Hành]: Phải học song song với môn [${item.MaHocPhanDieuKien}] ${item.TenMonDieuKien}.`;
            }

            if (biKhoa) {
                danhSachKhoa.push({ ...item, LyDoKhoa: lyDo });
            }
        }

        res.status(200).json({ success: true, data: danhSachKhoa });
    } catch (error) {
        console.error("Lỗi lấy môn bị khóa:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 3. Lưu bản thảo kế hoạch
exports.luuBanThaoKeHoach = async (req, res) => {
    try {
        const { maSinhVien, hocKyMucTieu, danhSachMon } = req.body;
        
        const danhSachHopLe = danhSachMon.filter(mon => mon.TrangThaiMon !== 'Khoa');
        if (danhSachHopLe.length === 0) {
            return res.status(400).json({ success: false, message: 'Danh sách môn học hợp lệ trống!' });
        }

        const maKeHoach = await PlanModel.createDraftPlan(maSinhVien, hocKyMucTieu, danhSachHopLe);
        res.status(200).json({ success: true, message: 'Đã lưu bản thảo kế hoạch thành công!', maKeHoach });
    } catch (error) {
        console.error("Lỗi lưu bản thảo:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 4. Lấy danh sách các kế hoạch đã lưu
exports.getDanhSachKeHoach = async (req, res) => {
    try {
        const { maSinhVien } = req.params;
        const data = await PlanModel.getDanhSachKeHoach(maSinhVien);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 5. Lấy chi tiết kế hoạch kèm phản hồi cố vấn
exports.getChiTietKeHoach = async (req, res) => {
    try {
        const { maKeHoach } = req.params;

        const keHoach = await PlanModel.getPlanById(maKeHoach);
        if (!keHoach) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy kế hoạch.' });
        }

        const danhSachMon = await PlanModel.getPlanDetails(maKeHoach);
        const phanHoi = await PlanModel.getLatestFeedback(maKeHoach);

        res.status(200).json({ 
            success: true, 
            keHoach, 
            danhSachMon,
            phanHoi: phanHoi || null
        });
    } catch (error) {
        console.error("Lỗi lấy chi tiết kế hoạch:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Cập nhật lại bản thảo
exports.capNhatKeHoach = async (req, res) => {
    try {
        const { maKeHoach, danhSachMon } = req.body;
        const danhSachHopLe = danhSachMon.filter(mon => mon.TrangThaiMon !== 'Khoa');

        await PlanModel.updateDraftPlan(maKeHoach, danhSachHopLe);
        res.status(200).json({ success: true, message: 'Đã cập nhật lại kế hoạch thành công!' });
    } catch (error) {
        console.error("Lỗi cập nhật kế hoạch:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 6. Xóa bản thảo kế hoạch
exports.xoaKeHoach = async (req, res) => {
    try {
        const { maKeHoach } = req.params;
        await PlanModel.xoaKeHoach(maKeHoach);
        res.status(200).json({ success: true, message: 'Đã xóa kế hoạch thành công.' });
    } catch (error) {
        console.error("Lỗi xóa kế hoạch:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 7. Gửi kế hoạch cho cố vấn
exports.guiCoVan = async (req, res) => {
    try {
        const { maKeHoach } = req.body;
        await PlanModel.guiCoVan(maKeHoach);
        res.status(200).json({ success: true, message: 'Đã gửi kế hoạch cho cố vấn học tập thành công!' });
    } catch (error) {
        console.error("Lỗi gửi cố vấn:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Lấy danh sách học lại / cải thiện
exports.getMonCanHocLaiCaiThem = async (req, res) => {
    try {
        const { maSinhVien } = req.params;
        const data = await PlanModel.getMonCanHocLaiCaiThem(maSinhVien);
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("Lỗi lấy danh sách học lại/cải thiện:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};