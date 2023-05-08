exports.validateCreateCommentInput = (postId, commentId, text) => {

    console.log("PostId - ", postId, "CommentId - ", commentId, "Text - ", text);

    if(!postId && !commentId){
        return { error: 'postId or commentId is required' };
    }else if(!text){
        return { error: 'text is missing' };
    }else if(!(typeof text === "string")) {
        return { error: 'text type is invalid, type should be string' };
    }

    console.log("CreateComment inputs are valid");
    return null;
};

exports.validateGetCommentsInput = (postId, commentId) => {
    console.log("PostId - ", postId, "CommentId - ", commentId);

    if(!postId && !commentId){
        return { error: 'postId or commentId is required' };
    }

     console.log("GetComments inputs are valid");

    return null;
};