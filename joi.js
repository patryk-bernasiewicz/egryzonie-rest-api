const Joi = require('joi');

const validationSchema = Joi.object().keys({
  nickname: Joi.string().min(5).max(50).regex(/^[a-zA-Z0-9ąćęłńóśżźĄĆĘŁŃÓŚŻŹ .,-:_]{1,}$/).required(),
  email: Joi.string().email().min(5).max(255).required(),
  password: Joi.string()
});

const payload = {
  nickname: 'enslaved#eagle',
  email: 'kontakt@patrykb.pl',
  password: 'a748cf4213'
};

const { error, value } = Joi.validate(payload, validationSchema);
console.log(error.details[0].message);