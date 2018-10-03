const path = require('path');
const router = require('express').Router();
const querymen = require('querymen');
const { Vet } = require(path.resolve('src/models/vet'));

const querySchema = new querymen.Schema({
  term: {
    type: RegExp,
    paths: ['name', 'address'],
    bindTo: 'search'
  }
});

// GET /vets
router.get('/', querymen.middleware(querySchema), async ({ querymen: { search, cursor: { skip, limit }, sort } }, res) => {
  const vets = await Vet
    .find(search)
    .skip(skip)
    .limit(limit)
    .sort(sort);

  return res.json(vets);
});

// GET /vets/:slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  const vet = await Vet
    .findOne({ slug })

  if (!vet) {
    return res.sendStatus(404);
  }

  return res.status(200).json({ vet });
});

module.exports = router;
