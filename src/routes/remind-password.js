const path = require('path');
const router = require('express').Router();
const { APP_ENV } = require(path.resolve('src/environment'));
const { PasswordRemind } = require(path.resolve('src/models/password-remind'));
const { User, validateEmail } = require(path.resolve('src/models/user'));
const Mailer = require(path.resolve('src/helpers/mailer'));

// GET /remind_password
router.get('/', async (req, res, next) => {
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
  await new PasswordRemind({ user, email, token }).save().catch(next);

  const data = {
    address: APP_ENV === 'local',
    token
  };
  const mailer = new Mailer();

  await mailer.send(email, 'remind-password/remind', data).catch(next);

  return res.status(200).json();
});

// GET /remind_password/validate_token
router.get('/validate', async (req, res, next) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'token must be specified' });
  }

  const remind = await PasswordRemind.findOne({ token }).catch(next);
  if (!remind) {
    return res
      .status(404)
      .json({ message: 'password remind request not found' });
  }

  return res.status(200).json();
});

// POST /remind_password/change
router.post('/change', async (req, res, next) => {
  const { token } = req.query;
  const { password } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'token must be specified' });
  }

  if (!password) {
    return res.status(400).json({ message: 'new password is required' });
  }

  const remind = await PasswordRemind.findOne({ token })
    .populate('user')
    .catch(next);
  if (!remind) {
    return res
      .status(404)
      .json({ message: 'password remind request not found' });
  }

  const result = await User.findOneAndUpdate(
    { _id: remind.user._id },
    { password }
  ).catch(next);

  return res.sendStatus(204);
});

module.exports = router;
