const path = require('path');
const router = require('express').Router();
const passport = require('passport');
const url = require('url');
const _ = require('lodash');
const querymen = require('querymen');
const { Vet } = require('../../models/vet');

const error = err => console.error(err.message);

const querySchema = new querymen.Schema({
  term: {
    type: RegExp,
    paths: ['name', 'address'],
    bindTo: 'search'
  }
});


// GET /admin/vets

router.get('/', passport.authenticate('jwt', { session: false }), querymen.middleware(querySchema), async ({ querymen: { search, cursor: { skip, limit }, sort } }, res) => {
  // const vets = await Vet
  //   .find(search)
  //   .skip(skip)
  //   .limit(limit)
  //   .sort(sort)
  //   .catch(error);

  return res.status(200).json(Array(8).fill({}));
});


module.exports = router;