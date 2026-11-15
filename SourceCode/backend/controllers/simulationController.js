// controllers/simulationController.js
const SimulationModel = require('../models/simulationModel');

// 1. Lấy thông tin sinh viên và danh sách môn HỢP LỆ (đủ điều kiện học, không bị khóa) để mô phỏng
exports.getMonHopLeChoMoPhong = async (req, res) => {
    try {
        const { maSinhVien } = req.params;

        const sinhVien = await SimulationModel.getStudentInfo(maSinhVien);
        if (!sinhVien) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên.' });
        }
        const maNganh = sinhVien.MaNganh;

        const passedCourses = await SimulationModel.getPassedCourses(maSinhVien);
        const allCourses = await SimulationModel.getCoursesByMajor(maNganh);
        const rules = await SimulationModel.getAllRules();

        const danhSachHopLe = [];

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
                danhSachHopLe.push(hp);
            }
        }

        res.status(200).json({ 
            success: true, 
            sinhVien: sinhVien,
            data: danhSachHopLe 
        });
    } catch (error) {
        console.error("Lỗi lấy môn hợp lệ mô phỏng:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2. Chạy mô phỏng What-if
exports.chayMoPhong = async (req, res) => {
    try {
        const { maSinhVien, loaiKichBan, maHPRot, danhSachMonKyToi } = req.body;

        const sinhVien = await SimulationModel.getStudentInfo(maSinhVien);
        if (!sinhVien) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên.' });
        }

        let gpaCu = sinhVien.GPA_TichLuy || 3.20;
        let tongTCCu = sinhVien.TongTinChiTichLuy || 45;

        if (loaiKichBan === 0) {
            if (!maHPRot) {
                return res.status(400).json({ success: false, message: 'Vui lòng chọn môn giả định rớt.' });
            }

            let gpaTichLuyMoi = Number((gpaCu * 0.92).toFixed(2));
            const danhSachBiAnhHuong = await SimulationModel.getAffectedCourses(maHPRot);

            await SimulationModel.saveSimulationHistory(
                maSinhVien, 
                `Mô phỏng rớt môn: ${maHPRot}`, 
                JSON.stringify({ MaHocPhanRot: maHPRot }), 
                gpaTichLuyMoi
            );

            return res.status(200).json({
                success: true,
                ketQua: {
                    loai: 1,
                    gpaMoi: gpaTichLuyMoi,
                    tongTCMoi: tongTCCu,
                    danhSachBiAnhHuong: danhSachBiAnhHuong,
                    thongBao: `Giả định rớt môn thành công. GPA tích lũy mới dự kiến: ${gpaTichLuyMoi}`
                }
            });

        } else {
            if (!danhSachMonKyToi || danhSachMonKyToi.length === 0) {
                return res.status(400).json({ success: false, message: 'Danh sách môn học kỳ tới trống.' });
            }

            let tongTCKyToi = 0;
            let tongDiemNhanTinChiKyToi = 0;

            for (const mon of danhSachMonKyToi) {
                let soTC = Number(mon.SoTinChi);
                let diemDK = Number(mon.DiemDuKien); 
                let diemThang4 = (diemDK / 10.0) * 4.0;

                tongTCKyToi += soTC;
                tongDiemNhanTinChiKyToi += (diemThang4 * soTC);
            }

            let gpaKyToi = tongTCKyToi > 0 ? Number((tongDiemNhanTinChiKyToi / tongTCKyToi).toFixed(2)) : 0.0;
            let tongTCMoi = tongTCCu + tongTCKyToi;
            let gpaTichLuyTongMoi = tongTCMoi > 0 
                ? Number((((gpaCu * tongTCCu) + tongDiemNhanTinChiKyToi) / tongTCMoi).toFixed(2)) 
                : gpaCu;

            if (gpaTichLuyTongMoi > 4.0) gpaTichLuyTongMoi = 4.0;

            await SimulationModel.saveSimulationHistory(
                maSinhVien, 
                `Mô phỏng điểm kỳ tới (${danhSachMonKyToi.length} môn)`, 
                JSON.stringify(danhSachMonKyToi), 
                gpaTichLuyTongMoi
            );

            return res.status(200).json({
                success: true,
                ketQua: {
                    loai: 2,
                    gpaKyToi: gpaKyToi,
                    gpaMoi: gpaTichLuyTongMoi,
                    tongTCMoi: tongTCMoi,
                    thongBao: `Tính toán thành công! GPA kỳ tới: ${gpaKyToi} | GPA tích lũy tổng mới: ${gpaTichLuyTongMoi}`
                }
            });
        }
    } catch (error) {
        console.error("Lỗi chạy mô phỏng:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};