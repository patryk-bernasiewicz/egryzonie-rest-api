const path = require('path');
const router = require('express').Router();
const logger = require('../helpers/logger');

const express = require('express');
const auth = require(path.resolve('src/routes/auth'));
const vets = require(path.resolve('src/routes/vets'));

const admin = require(path.resolve('src/routes/admin'));

router.use(express.json());

router.get('/', (req, res) => {
  res.json({
    message: 'Hello!',
    environment: process.env.NODE_ENV || 'default'
  });
});

router.use('/auth', auth);
router.use('/vets', vets);

router.use('/admin', admin);

// Error Handling Middleware
router.use(function(err, req, res, next) {
  logger.error(`${err.message}\n\n${err.stack}\n\n`);

  if (process.env.NODE_ENV !== 'development') {
    delete err.stack;
  }

  return res.status(err.statusCode || 500).json(err);
});

module.exports = router;