const express = require('express');
const router = express.Router();
const {
  assignItem,
  getAssignedItems,
  updateAssignmentStatus
} = require('../controllers/assignController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, assignItem);
router.get('/', authMiddleware, getAssignedItems);
router.patch('/:id/status', authMiddleware, updateAssignmentStatus);

module.exports = router;

