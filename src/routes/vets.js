const router = require('express').Router();
const { Vet } = require('../models/vet');

router.get('/', async (req, res) => {
  const vets = await Vet
    .find({})
    .sort({ name: -1 })
    .limit(20);

  res.json(vets);
});

module.exports = router;
