exports.validateCreatePostInput = (title, description) => {

    console.log("Title - ", title, "Description - ", description);

    if (!title) {
      return { error: 'title is missing' };
    }
    if (!description) {
      return { error: 'description is missing' };
    }
    console.log("CreatePost inputs are valid");

    return null;
};

exports.validateGetPostsInput = (pageNo, pageSize) => {

    console.log("pageNo - ", pageNo, "pageSize - ", pageSize);

    if (isNaN(pageNo)) {
        return { error: 'Invalid page number' };
    }
    if (isNaN(pageSize)) {
        return { error: 'Invalid page size' };
    }
    console.log("GetPosts inputs are valid");

    return null;
};
