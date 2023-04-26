require('dotenv').config();

const express = require('express');
const usersRouter = express.Router();
const {  getAllUsers, getUserByUsername  } = require('../db'); 
const jwt = require('jsonwebtoken');
const  { JWT_SECRET } = process.env;

usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
});

usersRouter.get('/', async (req, res) => {
  console.log("getUsersRoute") 
  const users = await getAllUsers();
  console.log(users)
  res.send({ 
    users
    });
    });

usersRouter.post('/login', async (req, res, next) => {
  const {  username, password } = req.body;
  
  if (!username || ! password){
    next ({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password!"
    });
  }
  
  try {
    const user = await getUserByUsername(username);
    
    
    if (user && user.password === password){
      console.log("------------------------------>", JWT_SECRET);
      const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1hr' });
      res.send({ message: "you're logged in!", token: token});
    } else {
      next ({
        name: 'IncorrectCredentialsError',
        message: 'Username or password is incorrect'
      });
    }
  } catch(error){
    console.log(error);
    next(error);
  }
});


module.exports = usersRouter;