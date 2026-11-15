const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const adminGradeController = require('../controllers/adminGradeController');

router.get('/hoc-phan-theo-lop', adminGradeController.getSubjectsByClass);
router.get('/students-by-class', adminGradeController.getStudentsByClass);
router.get('/grades-by-class', adminGradeController.getGradesByClassAndSubject);
router.get('/export-excel', adminGradeController.exportGradesExcel);
router.post('/upsert-grade', adminGradeController.upsertSingleGrade);
router.post('/add-student', adminGradeController.addStudentToClass);
router.delete('/delete-student/:maSinhVien', adminGradeController.deleteStudent);
router.post('/import-excel', upload.single('file'), adminGradeController.importGradesExcel);

module.exports = router;