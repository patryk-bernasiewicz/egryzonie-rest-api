const path = require('path');
const router = require('express').Router();
const passport = require('passport');
const { User, validateUser } = require(path.resolve('src/models/user'));
const _ = require('lodash');
const error = require(path.resolve('src/helpers/error-helper'));

// POST /auth/signup
router.post('/signup', async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { nickname, email, password } = req.body;

  const existingUser = await User
    .findOne({ email })
    .catch(error.database);

  if (existingUser) {
    return res.status(400).json({ error: 'user exists' });
  }

  const newUser = await User
    .create({ nickname, email, password })
    .catch(error.database);
  if (!newUser) {
    throw new Error('Something went terribly wrong!');
  }

  const token = newUser.generateAuthToken();

  return res.status(201).header('x-auth-token', token).send();
});



// POST /auth/signin
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'invalid payload' });
  }

  const user = await User
    .findOne({ email })
    .catch(error.database);
  
  if (!user) {
    return res.status(401).json({ error: 'invalid login' });
  }

  const validatePassword = await user
    .validatePassword(password)
    .catch(error.internal);

  if (!validatePassword) {
    return res.status(401).json({ error: 'invalid login' });
  }

  const token = user.generateAuthToken();

  return res.status(201).header('x-auth-token', token).send();
});



// GET /auth/me
router.get('/me', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if (!req.user) {
    return res.status(500).send('Something went terribly wrong!');
  }

  return res.status(200).json(_.pick(req.user, ['email', 'role']));
});


module.exports = router;