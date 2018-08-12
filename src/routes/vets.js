const router = require('express').Router();
const url = require('url');
const _ = require('lodash');
const querymen = require('querymen');
const { Vet } = require('../models/vet');

const querySchema = new querymen.Schema({
  term: {
    type: RegExp,
    paths: ['name', 'address'],
    bindTo: 'search'
  }
});

router.get('/', querymen.middleware(querySchema), async ({ querymen: { search, cursor: { skip, limit }, sort } }, res) => {
  const vets = await Vet
    .find(search)
    .skip(skip)
    .limit(limit)
    .sort(sort);

  return res.json(vets);
});

module.exports = router;
