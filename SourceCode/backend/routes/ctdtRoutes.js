const express = require('express');
const router = express.Router();
const ctdtController = require('../controllers/ctdtController');

router.get('/chuyen-nganh', ctdtController.getChuyenNganh);
router.get('/rang-buoc/:maNganh', ctdtController.getRangBuocByNganh);
router.get('/:maNganh', ctdtController.getCTDTByNganh);

module.exports = router;