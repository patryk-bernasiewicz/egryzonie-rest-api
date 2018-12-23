const mongoose = require('mongoose');
const Joi = require('joi');

const AgreementSchema = new mongoose.Schema({
  agreement: String,
  dateCreated: {
    type: Date,
    default: Date.now()
  },
  dateRevoked: {
    type: Date,
    default: null
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const Agreement = mongoose.model('Agreement', AgreementSchema);

// Validation middleware
function validateAgreement(payload) {
  const schema = {
    agreement: Joi.string().allow(['signup']).required(),
    dateCreated: Joi.date(),
    dateRevoked: Joi.date().allow([null]),
    user: Joi.string().required()
  };

  return Joi.validate(payload, schema);
}

exports.Agreement = Agreement;
exports.AgreementSchema = AgreementSchema;
exports.validateAgreement = validateAgreement;
exports.agreementUpdatableFields = ['agreement'];
