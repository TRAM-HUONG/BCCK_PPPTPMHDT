// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/stats', adminController.getAdminDashboardStats);
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.put('/users', adminController.updateUser);
router.delete('/users/:maTK', adminController.deleteUser);

router.get('/sinh-vien', adminController.getSinhVienList);
router.get('/classes', adminController.getClassesList);
router.get('/reset-users-list', adminController.getUsersForResetPassword);
router.put('/reset-password/:maTK', adminController.resetUserPassword);

module.exports = router;