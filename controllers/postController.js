const Post = require('../models/post');
const Comment = require('../models/comment');
const postValidation = require('../validation/postValidation');
const sequelize = require('../util/database');
// const Sequelize = require('sequelize');
const { Op } = require('sequelize');


exports.createPost = async (req, res, next) => {

    const { title, description } = req.body;

    // 1. validate Input
    const validationError = postValidation.validateCreatePostInput(title, description);
    if (validationError) {
      return res.status(400).json({error : validationError});
    }

    try {
        // 2. Fetch the data from database 
        const post = await Post.create({
            title: title,
            description: description,
            deleted: 0
        });

        // 3. Return the Response 
        console.log('Post Created, Post - ',post);
        res.status(201).json({
            id: post.id,
            title: post.title,
            description: post.description,
            createdAt: post.createdAt,
            levelOneCommentsCount: 0,   // For the first time post creation, comments will be zero.
        });
    } catch (error) {
        console.log("Error occured while executing createPost - ", error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

exports.getPosts = async (req, res, next) => {
    const queryParams = req.query;
    console.log("queryParams - ", queryParams);

    const pageNo = parseInt(queryParams.pageNo ?? 1);
    const pageSize = parseInt(queryParams.pageSize ?? 10);

    // 1. validate Input
    const validationError = postValidation.validateGetPostsInput(pageNo, pageSize);
    if (validationError) {
      return res.status(400).json({error : validationError});
    }

    try {
        // 2. Fetch the data from database 
        const result = await Post.findAll({
            limit: pageSize,
            offset: (pageNo - 1) * pageSize,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'title', 'description', 'createdAt']
        });
        
        // 3. Extract the postIds
        const postIds = result.map(post => post.id);
        console.log("PostIds - ",postIds);

        // 4. Get level one comment counts by postId
        const commentCounts = await Comment.findAll({
            where: { parentId: -1, postId: postIds },                   // parentId : -1 for level 1 comment 
            attributes: ['postId', [sequelize.fn('count', sequelize.col('id')), 'count']],
            group: ['postId']
        });

        // 5. Create Map of PostId to comment counts 
        const commentCountsByPostIdMap = {};
        commentCounts.forEach(commentCount => {
            commentCountsByPostIdMap[commentCount.postId] = commentCount.get('count');
        });

        // 6. Return the Response 
        res.status(200).json({
            pageNo: pageNo,
            pageSize: pageSize,
            posts: result.map(post => ({
                id: post.id,
                title: post.title,
                createdAt: post.createdAt,
                description: post.description,
                levelOneCommentsCount: commentCountsByPostIdMap[post.id] || 0
            }))
        });
    } catch (error) {
        console.log("Error occured while executing getPosts - ", error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};