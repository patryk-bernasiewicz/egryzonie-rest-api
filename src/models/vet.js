const mongoose = require('mongoose');
// const slugHero = require('mongoose-slug-hero');
const Joi = require('joi');
const slugs = require('mongoose-url-slugs');
const { AssertionError } = require('../error-types');
const { GeoSchema } = require('./geoschema');

const VetSchema = new mongoose.Schema({
  position: GeoSchema,
  googleId: String,
  slug: String,
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  rodents: Boolean,
  exoticAnimals: Boolean,
  websiteUrl: String,
  phone: String,
  accepted: Boolean,
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acceptedDate: {
    type: Date,
    default: Date.now()
  }
});

VetSchema.index({ position: '2dsphere' });

VetSchema.plugin(slugs('name'));

const Vet = mongoose.model('Vet', VetSchema);

const nameRegex = /^[a-zA-Z0-9ąćęłńóśżźĄĆĘŁŃÓŚŻŹ .,-:_]{1,}$/i;
const urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;

// Validation middleware
function validateVet(payload) {
  const schema = {
    position: Joi.object().keys({
      type: Joi.string().optional(),
      coordinates: Joi.array().items(
        Joi.number().min(-90).max(90).required(),
        Joi.number().min(-180).max(180).required()
      )
    }).error(new AssertionError('invalid position')),
    googleId: Joi.string().error(new AssertionError('invalid google id')),
    name: Joi.string().regex(nameRegex).required().error(new AssertionError('invalid name')),
    address: Joi.string().required().error(new AssertionError('invalid address')),
    rodents: Joi.boolean().error(new AssertionError('invalid rodents value')),
    exoticAnimals: Joi.boolean().error(new AssertionError('invalid exotic animals value')),
    websiteUrl: Joi.string().regex(urlRegex).error(new AssertionError('invalid website url')),
    phone: Joi.string().error(new AssertionError('invalid phone number'))
  };

  return Joi.validate(payload, schema);
}

exports.Vet = Vet;
exports.VetSchema = VetSchema;
exports.validateVet = validateVet;
exports.vetUpdatableFields = ['position', 'googleId', 'name', 'address', 'rodents', 'exoticAnimals', 'websiteUrl', 'phone'];