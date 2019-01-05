const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Joi = require('joi');

const nicknameRegex = /^[a-zA-Z0-9ąćęłńóśżźĄĆĘŁŃÓŚŻŹ .,-:_]{1,}$/;
const emailRegex =  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
  return emailRegex.test(email);
}

function validateNickname(nickname) {
  return nicknameRegex.test(nickname);
}

const userSchema = mongoose.Schema({
  nickname: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
    validate: {
      validator: validateNickname,
      message: 'invalid nickname'
    }
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    validate: {
      validator: validateEmail,
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

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema._middleware = {  
  hashPassword: async function() {
    const salt = await bcrypt.genSalt(6);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
  }
};

userSchema.pre('save', userSchema._middleware.hashPassword);

function validateUser(user) {
  const schema = {
    nickname: Joi.string().min(5).max(50).regex(nicknameRegex).required(),
    email: Joi.string().email().min(5).max(255).required(),
    password: Joi.string().min(5).required()
  };

  return Joi.validate(user, schema);
}

exports.userSchema = userSchema;
exports.User = mongoose.model('User', userSchema);
exports.validateUser = validateUser;
exports.validateEmail = validateEmail;
exports.validateNickname = validateNickname;
