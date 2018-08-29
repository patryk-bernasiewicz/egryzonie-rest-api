const router = require('express').Router();
const vets = require('./admin/vets');

router.use('/vets', vets);

module.exports = router;