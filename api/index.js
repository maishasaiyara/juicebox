require('dotenv').config();
const apiRouter = require("express").Router ()
const jwt = require('jsonwebtoken');
const { getUserById } = require('../db');
const {  JWT_SECRET } = process.env;

apiRouter.use(async (req, res, next) => {
    const prefix = "Bearer ";
    const auth = req.header('Authorization');

    if (!auth) {
        next();
    }else if (auth.startsWith(prefix)){
        const token = auth.slice(prefix.length);
        console.log(JWT_SECRET);

        try{ 
            console.log(token);
            const {  id  } = jwt.verify(token, JWT_SECRET);
            console.log(id);
            if (id) {
                req.user = await getUserById(id);
                next();
            }
        } catch (error){    
          next (error);
        }
    } else {
        next ({
                name: 'AuthorizationHeaderError',
                message: `Authorization token must start with ${ prefix }`
            });
        } 
    });

  
    apiRouter.use((req, res, next) => {
        if (req.user) {
          console.log("User is set:", req.user);
        }
      
        next();
      });
      

const usersRouter = require('./users');
apiRouter.use('/users', usersRouter);

const tagsRouter = require('./tags');
apiRouter.use('/tags', tagsRouter);

const postsRouter = require('./posts');
apiRouter.use('/posts', postsRouter);


apiRouter.use((error, req, res, next) => {
    res.send({
        name: error.name,
        message: error.message
    });
});

module.exports = apiRouter;








