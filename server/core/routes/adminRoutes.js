const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getSystemStats,
  updateUserStatus
} = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAdmin } = require('../controllers/adminController');

router.use(authMiddleware);
router.use(requireAdmin);

router.get('/users', getAllUsers);
router.get('/stats', getSystemStats);
router.patch('/users/:id', updateUserStatus);

module.exports = router;

