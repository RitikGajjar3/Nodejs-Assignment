const express = require('express');

const commentController = require('../controllers/commentController');

const router = express.Router();

router.post('/create', commentController.createComment);
router.get('/list', commentController.getComments);

module.exports = router;

