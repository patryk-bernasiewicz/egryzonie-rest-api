const path = require('path');
const router = require('express').Router();
const passport = require('passport');
const url = require('url');
const _ = require('lodash');
const querymen = require('querymen');
const { Vet, validateVet, vetUpdatableFields } = require('../../models/vet');
const adminGuard = require('../../middleware/admin-guard');
const Joi = require('joi');

const error = err => console.error(err.message);

const querySchema = new querymen.Schema({
  term: {
    type: RegExp,
    paths: ['name', 'address'],
    bindTo: 'search'
  }
});

router.use('/', passport.authenticate('jwt', { session: false }));
router.use('/', adminGuard);


// GET /admin/vets

router.get('/', querymen.middleware(querySchema), async ({ querymen: { search, cursor: { skip, limit }, sort } }, res) => {
  const vets = await Vet
    .find(search)
    .skip(skip)
    .limit(limit)
    .sort(sort)
    .catch(error);

  return res.status(200).json(Array(8).fill({}));
});


// GET /admin/vets/:slug

router.get('/:slug', async (req, res, next) => {
  const slug = req.params.slug || '';
  const vet = await Vet
    .findOne({ slug })
    .catch(error);

  if (!vet) {
    return res.status(404).json({ message: 'no vet found' });
  }

  return res.status(200).json(vet);
});


// POST /admin/vets

router.post('/', async (req, res, next) => {
  const { error, result } = validateVet(req.body);

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const payload = _.pick(req.body, vetUpdatableFields);
  payload.position = {
    type: 'Point',
    coordinates: payload.position
  };
  const vet = await new Vet(payload).save().catch(next);

  return res.status(201).json({ vet, location: '/admin/vets/' + vet.slug });
});


// PUT /admin/vets

router.put('/', async (req, res, next) => {
  const { error, result } = validateVet(req.body);

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  return res.json({ message: 'fuck me' });
});


module.exports = router;