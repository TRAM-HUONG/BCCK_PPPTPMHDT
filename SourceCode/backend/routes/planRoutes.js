// backend/routes/planRoutes.js
const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');

// Đảm bảo route này tồn tại:
router.get('/mon-khoa/:maSinhVien', planController.getMonBiKhoa);

// Các route khác...
router.get('/de-xuat/:maSinhVien', planController.getMonDeXuat);
router.post('/luu-ban-thao', planController.luuBanThaoKeHoach);
router.get('/danh-sach/:maSinhVien', planController.getDanhSachKeHoach);
router.get('/chi-tiet-kh/:maKeHoach', planController.getChiTietKeHoach);
router.put('/cap-nhat', planController.capNhatKeHoach);
router.delete('/xoa/:maKeHoach', planController.xoaKeHoach);
router.post('/gui-co-van', planController.guiCoVan);
router.get('/mon-can-cai-thien/:maSinhVien', planController.getMonCanHocLaiCaiThem);
module.exports = router;