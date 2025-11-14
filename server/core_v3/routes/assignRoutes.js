const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, assignmentController.createAssignment);
router.get('/user/:userId', authMiddleware, assignmentController.getUserAssignments);
router.put('/:id/status', authMiddleware, assignmentController.updateAssignmentStatus);

module.exports = router;

