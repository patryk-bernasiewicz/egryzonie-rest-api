const path = require('path');
const router = require('express').Router();
const passport = require('passport');
const _ = require('lodash');
const querymen = require('querymen');
const { Vet, validateVet, vetUpdatableFields } = require(path.resolve('src/models/vet'));
const adminGuard = require(path.resolve('src/middleware/admin-guard'));

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

  return res.status(200).json(vets);
});


// GET /admin/vets/:slug

router.get('/:slug', async (req, res) => {
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
  const payload = _.pick(req.body, vetUpdatableFields);
  payload.position = Vet.toCoordinates(payload.position);

  const { error } = validateVet(payload);

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const vet = await new Vet(payload).save().catch(next);

  const location = '/admin/vets/' + vet.slug;

  return res.status(201).json({ vet, location });
});


// PUT /admin/vets/:id
router.put('/:id', async (req, res, next) => {
  const payload = _.pick(req.body, vetUpdatableFields);
  payload.position = Vet.toCoordinates(payload.position);

  const { error } = validateVet(payload);
  const { id } = req.params;

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const options = {
    new: true
  };

  const vet = await Vet
    .findByIdAndUpdate(id, payload, options)
    .catch(err => next(new Error(err.message)));

  const location = '/admin/vets/' + vet.slug;
  
  return res.json({ vet, location });
});


// DELETE /admin/vets/:id
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;

  const vet = await Vet
    .findByIdAndRemove(id)
    .catch(err => next(new Error(err.message)));

  return res.json({ vet });
});

module.exports = router;