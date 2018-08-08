const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

userSchema._middleware = {
  hashPassword: async function(next) {
    const salt = await bcrypt.genSalt(6);
    const hash = await bcrypt.hash(this.password, salt);

    this.password = hash;

    next();

    return Promise.resolve(true);
  }
};

userSchema.pre('save', userSchema._middleware.hashPassword);

exports.userSchema = userSchema;
exports.User = mongoose.model('User', userSchema);