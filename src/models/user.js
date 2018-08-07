const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const nicknameRegex = /^[a-zA-Z0-9ąćęłńóśżźĄĆĘŁŃÓŚŻŹ .,-:_]{1,}$/;
const emailRegex =  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = mongoose.Schema({
  nickname: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
    validate: {
      validator: value => nicknameRegex.test(value),
      message: 'invalid nickname'
    }
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    validate: {
      validator: value => {
        return emailRegex.test(value);
      },
      message: 'invalid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'moderator', 'admin', 'superadmin'],
    default: 'user'
  },
  avatarURL: String
});

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id, role: this.role }, config.get('jwtPrivateKey'));
  return token;
};

function validateUser(user) {
  const schema = {
    nickname: Joi.string().required().minlength(5).maxlength(50),
    email: Joi.email().required().minlength(5).maxlength(255),
    password: Joi.string().minlength(5).maxlength(1024)
  };

  return Joi.validate(user, schema);
}

exports.userSchema = userSchema;
exports.User = mongoose.model('User', userSchema);
exports.validateUser = validateUser;