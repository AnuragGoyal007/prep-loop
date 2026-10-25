const express = require('express');
const router = express.Router();
const { getSheetTopics, getTopicById } = require('../controllers/sheetController');

router.get('/', getSheetTopics);
router.get('/core', getSheetTopics);
router.get('/core/:topicId', getTopicById);

module.exports = router;
