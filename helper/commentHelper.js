exports.getChildCommentsByParentCommentIdMap = (childComments) => {
    const childCommentsByParentCommentIdMap = {};
    childComments.map(comment => {
        const { parentId, ...commentWithoutParentId } = comment.toJSON();
        if (!childCommentsByParentCommentIdMap[parentId]) {
            childCommentsByParentCommentIdMap[parentId] = [];
        }
        childCommentsByParentCommentIdMap[parentId].push(commentWithoutParentId);
    });
    console.log("childCommentsByParentCommentIdMap - ",childCommentsByParentCommentIdMap);
    return childCommentsByParentCommentIdMap;
};

exports.getCommentIdList = (result) => {
    const commentIdList = [];
    result.forEach(comment => {
        commentIdList.push(comment.id);
    });
    console.log("commentIdList - ",commentIdList);
    return commentIdList;
};
