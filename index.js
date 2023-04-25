const PORT = 3001;
const express = require('express');
const server = express();
const { client } = require('./db');
const morgan = require('morgan');
const apiRouter = require('./api');

client.connect();

server.use(morgan('dev'));

server.use(express.json())

server.use('/api', apiRouter);

server.use((req, res, next) => {
    console.log("<____Body Logger START____>");
    console.log(req.body);
    console.log("<_____Body Logger END_____>");
  
    next();
  });
    
  server.listen(PORT, () => {
    console.log('The server is up on port', PORT)
  });