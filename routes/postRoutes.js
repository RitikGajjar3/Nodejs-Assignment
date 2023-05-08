const express = require('express');

const postController = require('../controllers/postController');

const router = express.Router();

router.post('/create', postController.createPost);
router.get('/list', postController.getPosts);

module.exports = router;

