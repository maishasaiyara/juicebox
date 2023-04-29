const express = require('express');
const postsRouter = express.Router();
const { getAllPosts, createPost, updatePost, getPostById } = require('../db');
const { requireUser } = require('./utils');


postsRouter.use((req, res, next) => {
    console.log("A request is being made to /users");
    
    next();
});

postsRouter.post('/', requireUser, async (req, res, next) => {
    const { title, content, tags = "" } = req.body;
    
    const tagArr = tags.trim().split(/\s+/)
    const postData = {};
    console.log("before", postData);

    if (tagArr.length) {
        postData.tags = tagArr;
    }
    
    try {
        
    postData.authorId =  req.user.id; 
    postData.content = content; 
    postData.title = title; 
        
    console.log(postData);
    
    const post = await createPost(postData);
    if(post){
        res.send ({  post })
    } else {
        next({
            name: 'UnauthorizedPost',
            messsage: 'You cannot create a post'
        })
    }
    }   catch ({ name, message }) {
        next({ name, message });
    }
    });


  postsRouter.get('/', async (req, res) => {
    try{
      const allPosts = await getAllPosts();
      const posts = allPosts.filter(post => {

        if (post.active) {
            return true;
        }

        if (req.user && post.author.id === req.user.id){
            return true;
        }
        return false;
      });

      res.send({ 
      posts
  });
    } catch ({ name, message}) {
        next ({ name, message }); 
    }
  });


  postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
    const { postId } = req.params;
    const { title, content, tags } = req.body;
  
    const updateFields = {};
  
    if (tags && tags.length > 0) {
      updateFields.tags = tags.trim().split(/\s+/);
    }
  
    if (title) {
      updateFields.title = title;
    }
  
    if (content) {
      updateFields.content = content;
    }
  
    try {
      const originalPost = await getPostById(postId);
  
      if (originalPost.author.id === req.user.id) {
        const updatedPost = await updatePost(postId, updateFields);
        res.send({ post: updatedPost })
      } else {
        next({
          name: 'UnauthorizedUserError',
          message: 'You cannot update a post that is not yours'
        })
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  });


  postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
    try {
      const post = await getPostById(req.params.postId);
  
      if (post && post.author.id === req.user.id) {
        const updatedPost = await updatePost(post.id, { active: false });
  
        res.send({ post: updatedPost });
      } else {
          next(post ? { 
          name: "UnauthorizedUserError",
          message: "You cannot delete a post which is not yours"
        } : {
          name: "PostNotFoundError",
          message: "That post does not exist"
        });
      }
  
    } catch ({ name, message }) {
      next({ name, message })
    }
  });

  module.exports = postsRouter;



//  curl http://localhost:3000/api/posts -X POST -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJwYXNzd29yZCI6ImJlcnRpZTk5IiwibmFtZSI6Ik5ld25hbWUgU29nb29kIiwibG9jYXRpb24iOiJMZXN0ZXJ2aWxsZSwgS1kiLCJhY3RpdmUiOnRydWUsImlhdCI6MTY4MjYxNjg0MSwiZXhwIjoxNjgzMjIxNjQxfQ.IxA32hFXesBoAuzII3cqTDDNHS9z3M0mt4WJsMhIPFY' -H 'Content-Type: application/json' -d '{"title": "test post", "content": "how is this?", "tags": " #once #twice    #happy"}'
//  curl http://localhost:3000/api/posts -X POST -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJwYXNzd29yZCI6ImJlcnRpZTk5IiwibmFtZSI6Ik5ld25hbWUgU29nb29kIiwibG9jYXRpb24iOiJMZXN0ZXJ2aWxsZSwgS1kiLCJhY3RpdmUiOnRydWUsImlhdCI6MTY4MjYxNjg0MSwiZXhwIjoxNjgzMjIxNjQxfQ.IxA32hFXesBoAuzII3cqTDDNHS9z3M0mt4WJsMhIPFY' -H 'Content-Type: application/json' -d '{"title": "I still do not like tags", "content": "CMON! why do people use them?"}'
//  curl http://localhost:3000/api/posts -X POST -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJwYXNzd29yZCI6ImJlcnRpZTk5IiwibmFtZSI6Ik5ld25hbWUgU29nb29kIiwibG9jYXRpb24iOiJMZXN0ZXJ2aWxsZSwgS1kiLCJhY3RpdmUiOnRydWUsImlhdCI6MTY4MjYxNjg0MSwiZXhwIjoxNjgzMjIxNjQxfQ.IxA32hFXesBoAuzII3cqTDDNHS9z3M0mt4WJsMhIPFY' -H 'Content-Type: application/json' -d '{"title": "I am quite frustrated"}'
//  curl http://localhost:3000/api/posts/1 -X PATCH -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJwYXNzd29yZCI6ImJlcnRpZTk5IiwibmFtZSI6Ik5ld25hbWUgU29nb29kIiwibG9jYXRpb24iOiJMZXN0ZXJ2aWxsZSwgS1kiLCJhY3RpdmUiOnRydWUsImlhdCI6MTY4MjYxNjg0MSwiZXhwIjoxNjgzMjIxNjQxfQ.IxA32hFXesBoAuzII3cqTDDNHS9z3M0mt4WJsMhIPFY' -H 'Content-Type: application/json' -d '{"title": "updating my old stuff", "tags": "#oldisnewagain"}'
// curl http://localhost:3000/api/posts/1 -X PATCH -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJwYXNzd29yZCI6ImJlcnRpZTk5IiwibmFtZSI6Ik5ld25hbWUgU29nb29kIiwibG9jYXRpb24iOiJMZXN0ZXJ2aWxsZSwgS1kiLCJhY3RpdmUiOnRydWUsImlhdCI6MTY4MjY5NTE2NywiZXhwIjoxNjgzMjk5OTY3fQ.FvP44QOVWVXRpoOHhp6OOEDfNUxl8KY2DWGEEfNTdCI'

// curl http://localhost:3000/api/posts -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJwYXNzd29yZCI6ImJlcnRpZTk5IiwibmFtZSI6Ik5ld25hbWUgU29nb29kIiwibG9jYXRpb24iOiJMZXN0ZXJ2aWxsZSwgS1kiLCJhY3RpdmUiOnRydWUsImlhdCI6MTY4MjY5NTE2NywiZXhwIjoxNjgzMjk5OTY3fQ.FvP44QOVWVXRpoOHhp6OOEDfNUxl8KY2DWGEEfNTdCI'