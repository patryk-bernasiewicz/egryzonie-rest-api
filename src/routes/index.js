const path = require('path');
const router = require('express').Router();

const express = require('express');
const auth = require(path.resolve('src/routes/auth'));
const vets = require(path.resolve('src/routes/vets'));

const admin = require(path.resolve('src/routes/admin'));

router.use(express.json());

router.get('/', (req, res) => {
  res.send('Hello!');
});

router.use('/auth', auth);
router.use('/vets', vets);

router.use('/admin', admin);

// Error Handling Middleware
router.use((err, req, res) => {
  console.log('Does error even get called?');
  console.log(err.message);
  return res.status(err.statusCode).json({ message: err.message });
});

module.exports = router;