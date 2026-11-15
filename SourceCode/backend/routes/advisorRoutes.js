// backend/routes/advisorRoutes.js
const express = require('express');
const router = express.Router();
const advisorController = require('../controllers/advisorController');

router.get('/students', advisorController.getAssignedStudents);
router.get('/pending-plans', advisorController.getPendingPlans);
router.get('/all-plans', advisorController.getAllStudentPlans);
router.get('/plan-detail/:maKeHoach', advisorController.getStudentPlanDetail);
router.post('/review-plan', advisorController.reviewPlan);
router.get('/transcript/:maSinhVien', advisorController.getBangDiemSinhVien);

module.exports = router;