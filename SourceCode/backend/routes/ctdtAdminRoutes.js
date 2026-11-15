const express = require('express');
const router = express.Router();
const ctdtController = require('../controllers/ctdtAdminController');

router.get('/chuyen-nganh', ctdtController.getChuyenNganh);
router.post('/chuyen-nganh', ctdtController.createChuyenNganh);
router.delete('/chuyen-nganh/:maNganh', ctdtController.deleteChuyenNganh);

router.get('/hoc-phan', ctdtController.getHocPhan);
router.post('/hoc-phan', ctdtController.createHocPhan);
router.delete('/hoc-phan/:maHocPhan', ctdtController.deleteHocPhan);
router.put('/chuyen-nganh/:maNganh', ctdtController.updateChuyenNganh);
router.put('/hoc-phan/:maHocPhan', ctdtController.updateHocPhan);
module.exports = router;