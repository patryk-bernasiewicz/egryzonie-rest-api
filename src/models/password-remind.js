const crypto = require('crypto');
const mongoose = require('mongoose');
const Joi = require('joi');
const { validateEmail } = require('./user');

const passwordRemindSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true  
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
  token: {
    type: String,
    required: true
  },
  revoked: {
    type: Boolean,
    default: false
  }
});

passwordRemindSchema.statics.generateToken = async function() {
  const buffer = await crypto.randomBytes(8);
  return buffer.toString('hex');
};

const PasswordRemind = mongoose.model('PasswordRemind', passwordRemindSchema);

function validatePasswordRemind(passwordRemind) {
  const schema = {
    user: Joi.string().required(),
    email: Joi.string().email().min(5).max(255).required(),
    token: Joi.string().required(),
  };

  return Joi.validate(passwordRemind, schema);
}

exports.passwordRemindSchema = passwordRemindSchema;
exports.PasswordRemind = PasswordRemind;
exports.validatePasswordRemind = validatePasswordRemind;