const path = require('path');
const express = require('express');
const auth = require(path.resolve('src/routes/auth'));
const vets = require(path.resolve('src/routes/vets'));
const { logger } = require(path.resolve('startup/logging'));

const { ValidationError, DatabaseError, AuthorizationError } = require(path.resolve('src/error-types'));

const admin = require('../src/routes/admin');

module.exports = (app) => {
  app.get('/', (req, res) => {
    res.send('Hello!');
  });

  app.use(express.json());

  app.use('/auth', auth);
  app.use('/vets', vets);

  app.use('/admin', admin);


  // Error Handling Middleware
  app.use((err, req, res, next) => {
    logger.error(`${err.name}\n${err.message}`);
    return res.status(err.statusCode).json({ message: err.message });
  });
};
