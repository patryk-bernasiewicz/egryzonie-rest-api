const express = require('express');
const error = require('../src/middleware/error');
const vets = require('../src/routes/vets');

module.exports = (app) => {
  app.get('/', (req, res) => {
    res.send('Hello!');
  });

  app.use(express.json());

  app.use('/vets', vets);

  app.use(error);
};
