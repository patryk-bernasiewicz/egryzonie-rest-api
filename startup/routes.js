const express = require('express');
const error = require('../src/middleware/error');
const auth = require('../src/routes/auth');
const vets = require('../src/routes/vets');

const admin = require('../src/routes/admin');

module.exports = (app) => {
  app.get('/', (req, res) => {
    res.send('Hello!');
  });

  app.use(express.json());

  app.use('/auth', auth);
  app.use('/vets', vets);

  app.use('/admin', admin);

  app.use(error);
};
