const Post = require('../models/post');
const Comment = require('../models/comment');
const postValidation = require('../validation/postValidation');

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
        const result = await Post.findAndCountAll({
            limit: pageSize,
            offset: (pageNo - 1) * pageSize,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'title', 'description', 'createdAt'],
            include: [{
                model: Comment,
                required: false,
                attributes: [],
                where: {
                    parentId: -1                // ParentId -1 means first level of posts
                }
            }],
            group: ['post.id']
        });
        
        // 3. Create a map of postCount by postId
        const postCountsMap = {};
        result.count.forEach(postCount => {
            postCountsMap[postCount.id] = postCount.count;
        });
        console.log('postCountsMap - ',postCountsMap);
      
        // 4. Return the Response 
        res.status(200).json({
            pageNo: pageNo,
            pageSize: pageSize,
            posts: result.rows.map(post => ({
                id: post.id,
                title: post.title,
                createdAt: post.createdAt,
                description: post.description,
                levelOneCommentsCount: postCountsMap[post.id]
            }))
        });
    } catch (error) {
        console.log("Error occured while executing getPosts - ", error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};