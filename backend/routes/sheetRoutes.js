const express = require('express');
const router = express.Router();
const { getSheetTopics, getTopicById ,toggleTopicBookmark} = require('../controllers/sheetController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getSheetTopics);
router.get('/core', getSheetTopics);
router.get('/core/:topicId', getTopicById);
router.post('/bookmark/:topicId', protect, toggleTopicBookmark);

module.exports = router;
