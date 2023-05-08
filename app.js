const express = require('express');
const bodyParser = require('body-parser');

const Post = require('./models/post');
const Comment = require('./models/comment');

const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');

const sequelize = require('./util/database');

const app = express();

// Parse the request body and response body
app.use(bodyParser.json());  

app.use('/post', postRoutes);
app.use('/comment', commentRoutes);

// Database Relationship 
Comment.belongsTo(Post);
Post.hasMany(Comment);

sequelize.sync().then(result => console.log("Database connected Successfully")).catch(error => console.log(error));

app.listen(3001);



