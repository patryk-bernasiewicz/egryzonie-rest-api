const path = require('path');
const { APP_ENV, NODE_ENV } = require(path.resolve('src/environment'));
const router = require('express').Router();
const logger = require('../helpers/logger');

const express = require('express');
const auth = require(path.resolve('src/routes/auth'));
const remindPassword = require(path.resolve('src/routes/remind-password'));
const vets = require(path.resolve('src/routes/vets'));

const admin = require(path.resolve('src/routes/admin'));

router.use(express.json());

router.get('/', (req, res) => {
  res.json({
    message: 'Hello!',
    systemEnvironment: NODE_ENV,
    appEnvironment: APP_ENV
  });
});

router.use('/auth', auth);
router.use('/vets', vets);
router.use('/remind-password', remindPassword);

router.use('/admin', admin);

// Error Handling Middleware
router.use(function(err, req, res, next) {
  logger.error(`${err.message}\n\n${err.stack}\n\n`);

  if (NODE_ENV !== 'development') {
    delete err.stack;
  }

  return res.status(err.statusCode || 500).json(err);
});

module.exports = router;