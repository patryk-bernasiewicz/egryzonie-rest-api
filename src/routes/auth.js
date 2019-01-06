const path = require('path');
const router = require('express').Router();
const passport = require('passport');
const { APP_ENV, NODE_ENV } = require(path.resolve('src/environment'));
const { User, validateUser, validateEmail } = require(path.resolve('src/models/user'));
const { Agreement } = require(path.resolve('src/models/agreement'));
const { PasswordRemind } = require(path.resolve('src/models/password-remind'));
const _ = require('lodash');
const Mailer = require(path.resolve('src/helpers/mailer'));



// POST /auth/signup
router.post('/signup', async (req, res) => {
  const userPayload = _.pick(req.body, ['nickname', 'email', 'password']);

  const validate = validateUser(userPayload);
  if (validate.error) return res.status(400).json({ message: validate.error.details[0].message });

  if (!req.body.signupAgreement) {
    return res.status(400).json({ message: '"signupAgreement" must be checked' });
  }

  const existingUser = await User
    .findOne({ email: userPayload.email }, 'username role');
  if (existingUser) {
    return res.status(400).json({ message: 'user exists' });
  }

  const newUser = await User
    .create(userPayload);
  if (!newUser) {
    throw new Error('Something went terribly wrong!');
  }

  const agreement = await Agreement
    .create({ agreement: 'signup', user: newUser });
  if (!agreement) {
    throw new Error('Could not save the Agreement.');
  }

  const token = newUser.generateAuthToken();

  return res.status(201).header('x-auth-token', token).json(_.pick(newUser, ['nickname', 'email', 'role']));
});



// POST /auth/signin
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'invalid payload' });
  }

  const user = await User
    .findOne({ email });
  
  if (!user) {
    return res.status(401).json({ message: 'invalid login' });
  }

  const validatePassword = await user
    .validatePassword(password);

  if (!validatePassword) {
    return res.status(401).json({ message: 'invalid login' });
  }

  const token = user.generateAuthToken();

  return res.status(201).header('x-auth-token', token).json(_.pick(user, ['nickname', 'role']));
});



// GET /auth/me
router.get('/me', passport.authenticate('jwt', { session: false }), async (req, res) => {
  return res.status(200).json(_.pick(req.user, ['email', 'role']));
});



// GET /auth/remind_password
router.get('/remind_password', async (req, res, next) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({ message: 'email address is required' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'invalid email' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json();
  }

  const token = await PasswordRemind.generateToken().catch(next);
  await new PasswordRemind({ user, email, token })
    .save()
    .catch(next);

  const data = {
    address: APP_ENV === 'local',
    token
  };
  const mailer = new Mailer();

  await mailer.send(email, 'auth/password-remind', data).catch(next);

  return res.status(200).json();
});

module.exports = router;
