const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, systemController.getAllConfigs);
router.get('/:key', systemController.getConfigByKey);
router.post('/', authMiddleware, systemController.createConfig);
router.put('/:key', authMiddleware, systemController.updateConfig);
router.delete('/:key', authMiddleware, systemController.deleteConfig);

module.exports = router;

