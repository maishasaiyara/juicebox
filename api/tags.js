const express = require('express');
const tagsRouter = express.Router();
const { getAllTags, getPostsByTagName } = require('../db');

tagsRouter.use((req, res, next) => {
    console.log("A request is being made to /users");
  
    next();
  });
  
  tagsRouter.get('/', async (req, res) => {
      const tags = await getAllTags();
      res.send({ 
      tagname
  });
  });


  tagsRouter.get('/:tagName/posts', async (req, res, next) => {
    const { tagName } = req.params;
    
    try {
        const posts = await getPostsByTagName(tagName);
    
    if(posts) {
    console.log(`these are posts with tagnames: ${tagName}:`, posts[1].tags);
        res.send({
            posts
         });

    } else {
        next({
        name: "Error getting posts by tagname",
        message: "Not able to get posts by tagname"
  })
}
    } catch ({ name, message }) {
        next({ name, message });
    }
  });


  module.exports = tagsRouter;
