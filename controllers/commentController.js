const Comment = require('../models/comment');
const Post = require('../models/post');
const commentValidation = require('../validation/commentValidation');
const commentHelper = require('../helper/commentHelper');
const sequelize = require('../util/database');

exports.createComment = async (req, res, next) => {

    const { postId, commentId, text } = req.body;

    // 1. validate Input
    const validationError = commentValidation.validateCreateCommentInput(postId, commentId, text);
    if (validationError) {
        return res.status(400).json(validationError);
    }

    try {
        let comment;
        // 2. If postId is passed 
        if (postId) {
            comment = await createCommentForPost(postId, text);
        } 
        // 3. If commentId is passed 
        else if (commentId) {
            comment = await createCommentOnExistingComment(commentId, text);
        }

        // 4. Return the response 
        return res.status(201).json({
          id: comment.id,
          text: comment.text,
          creationDate: comment.createdAt,
          childComments: [],                // For the first time comment creation, child comments will be empty.
        });
    } catch (error) {
        console.log("Error occured while executing createComment - ", error);
        return res.status(500).json({ error: "Something went wrong" });
    }
};

exports.getComments = async (req, res, next) => {

    const queryParams = req.query;
    console.log("queryParams - ", queryParams);

    const {postId, commentId} = queryParams;

    // 1. validate Input
    const validationError = commentValidation.validateGetCommentsInput(postId, commentId);
    if (validationError) {
      return res.status(400).json({error : validationError});
    }

    try{
        // 2. Fetch the comments by postId or commentId
        let result;
        if(postId){
            result = await getCommentsByPostId(result, postId);
        }else {
            result = await getCommentsByParentId(result, commentId);
        }

        // 3. Extract comment Ids
        const commentIdList = commentHelper.getCommentIdList(result);

        // 4. Fetch just next sub level comments, Here commentId List becomes parentIds for sub comments 
        const childComments = await getChildCommentsByParentIdList(commentIdList)

        // 5. Create parentId to child comments map
        const childCommentsByParentCommentIdMap = commentHelper.getChildCommentsByParentCommentIdMap(childComments);

        // 6. Return the response 
        res.status(200).json({
            comments: result.map(comment => ({
                id: comment.id,
                text: comment.text,
                createdAt: comment.createdAt,
                childComments: childCommentsByParentCommentIdMap[comment.id]
            }))

        })
    }catch (error) {
        console.log("Error occured while executing getComments - ", error);
        return res.status(500).json({ error: "Something went wrong" });
    }
};


const createCommentForPost = async (postId, text) => {
    // 1. validate the post on given postId
    const post = await Post.findByPk(postId);

    // 2. If post is not available return the error respose.
    if (!post) {
        throw { status: 400, message: "Invalid postId" };
    }

    // 3. Create new comment on that post, parentId is -1 because this is first level
    //    comment of the post so parent comment does not exist.
    return await createNewComment(postId, -1, text, 1);
};

const createCommentOnExistingComment = async (commentId, text) => {
    // 1. validate the comment on given commentId
    const parentComment = await Comment.findByPk(commentId);

    // 2. If comment is not available return the error respose.
    if (!parentComment) {
        throw { status: 400, message: "Invalid commentId" };
    }

    // 3. Create new comment on the give commentId, Here given commentId becomes the parent comment 
    //    of new comment. 
    return await createNewComment(parentComment.postId, parentComment.id, text, parentComment.level+1);
};

const createNewComment = async (postId, parentId, text, level) => {
    const comment = await Comment.create({
      text: text,
      parentId: parentId,
      deleted: 0,
      postId: postId,
      level: level
    });
  
    return comment;
};

const getChildCommentsByParentIdList = async (parentIdList) => {
    return await Comment.findAll({
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'text', 'createdAt', 'parentId'],
        where: {
            parentId: parentIdList
        }
    });
}

const getCommentsByParentId = async (result, parentId) => {
    result = await Comment.findAll({
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'text', 'createdAt'],
        where: {
            parentId: parentId
        }
    });
    return result;
}

const getCommentsByPostId = async (result, postId) => {
    result = await Comment.findAll({
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'text', 'createdAt'],
        where: {
            postId: postId,
            parentId: -1            // Fetch Level 1 Comments 
        }
    });
    return result;
}
