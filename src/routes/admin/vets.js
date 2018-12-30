const path = require('path');
const router = require('express').Router();
const passport = require('passport');
const _ = require('lodash');
const querymen = require('querymen');
const { Vet, validateVet, vetUpdatableFields } = require(path.resolve('src/models/vet'));
const adminGuard = require(path.resolve('src/middleware/admin-guard'));
const Json2CSVParser = require('json2csv').Parser;

const querySchema = {
  term: {
    type: RegExp,
    paths: ['name', 'address'],
    bindTo: 'search'
  }
};

router.use('/', passport.authenticate('jwt', { session: false }));
router.use('/', adminGuard);


// GET /admin/vets
router.get('/', querymen.middleware(querySchema), async ({ querymen: { search, cursor, sort } }, res, next) => {
  const count = await Vet.count().catch(next);

  const vets = await Vet
    .find(search)
    .skip(cursor.skip)
    .limit(cursor.limit)
    .sort(sort)
    .catch(next);

  return res.status(200).json({ total: count, vets });
});


// GET /admin/vets/export
router.get('/export', async (req, res, next) => {
  let vets = await Vet.find({}).catch(next);

  const fields = [
    { label: 'Nazwa', value: 'name' },
    { label: 'Adres', value: 'address' },
    { label: 'Google Place ID', value: 'googleId' },
    { label: 'Gryzonie', value: 'rodents' },
    { label: 'Zwierzęta egzotyczne', value: 'exoticAnimals' },
    { label: 'WWW', value: 'websiteUrl' },
    { label: 'Telefon', value: 'phone' }
  ];

  const parser = new Json2CSVParser({ fields });
  const csv = parser.parse(vets);
  
  const filename = `placowki-weterynaryjne-${Date.now()}.csv`;

  return res
    .set('Content-Type', 'text/csv')
    .set('Content-Disposition', `attachment; filename="placowki-weterynaryjne-${filename}.csv"`)
    .status(200)
    .send(csv);
});


// GET /admin/vets/:slug
router.get('/:slug', async (req, res, next) => {
  const slug = req.params.slug || '';
  const vet = await Vet
    .findOne({ slug })
    .catch(next);

  if (!vet) {
    return res.status(404).json({ message: 'no vet found' });
  }

  return res.status(200).json(vet);
});


// POST /admin/vets/import
router.post('/import', async (req, res, next) => {
  if (!Array.isArray(req.body)) {
    return res.status(400).json({ message: 'import expects an array of Vets' });
  }

  const vets = req.body
    .filter(vet => !!vet.name && !!vet.address && !!vet.googleId)
    .map(vet => _.pick(vet, ['name', 'address', 'googleId', 'rodents', 'exoticAnimals', 'websiteUrl', 'phone']));

  const insert = await Vet.collection.insert(vets).catch(next);

  return res.status(201).json({ amount: insert.insertedCount });
});


// POST /admin/vets
router.post('/', async (req, res, next) => {
  const payload = _.pick(req.body, vetUpdatableFields);
  
  const validate = validateVet(payload);
  if (validate.error) {
    return res.status(400).json({ message: validate.error.message });
  }
  
  if (!payload.accepted) {
    payload.accepted = true;
    payload.acceptedDate = new Date;
    payload.acceptedBy = req.user._id;
  }

  const vet = await Vet.create(payload).catch(next);
  const location = '/admin/vets/' + vet.slug;

  return res.status(201).json({ vet, location });
});


// PUT /admin/vets/:id
router.put('/:id', async (req, res, next) => {
  const { id } = req.params;
  const payload = _.pick(req.body, vetUpdatableFields);
  
  const validate = validateVet(payload);
  if (validate.error) {
    return res.status(400).json({ message: validate.error.message });
  }

  const options = {
    new: true
  };

  const vet = await Vet
    .findOneAndUpdate({ _id: id }, payload, options)
    .catch(next);

  const location = '/admin/vets/' + vet.slug;
  
  return res.json({ vet, location });
});


// DELETE /admin/vets/:id
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;

  const vet = await Vet
    .findByIdAndRemove(id)
    .catch(next);

  return res.json({ vet });
});


module.exports = router;