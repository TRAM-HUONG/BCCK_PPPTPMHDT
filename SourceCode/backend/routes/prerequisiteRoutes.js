// backend/routes/prerequisiteRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/prerequisiteController');

router.get('/', controller.getPrerequisites);
router.post('/', controller.createPrerequisite);
router.delete('/:maRB', controller.deletePrerequisite);

module.exports = router;