const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulationController');

router.get('/mon-hop-le/:maSinhVien', simulationController.getMonHopLeChoMoPhong);
router.post('/mophong', simulationController.chayMoPhong);

module.exports = router;