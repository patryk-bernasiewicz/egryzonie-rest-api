const mongoose = require('mongoose');
const Joi = require('joi');

const { GeoSchema } = require('./geoschema');

const VetSchema = new mongoose.Schema({
  position: {
    type: GeoSchema,
    required: true,
    unique: true
  },
  slug: {
    type: String
  },
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
  accepted: Boolean
});

const Vet = mongoose.model('Vet', VetSchema);

function validateVet(vet) {
  const schema = {
    position: Joi.array().items(Joi.number()),
    name: Joi.string().required().regex(/^([\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEFA-Za-z0-9._\- ]{5,55})$/g),
    address: Joi.string().required(),
    rodents: Joi.bool(),
    exoticAnimals: Joi.bool(),
    websiteUrl: Joi.string().regex(/^((http:\/\/www\.)|(www\.)|(http:\/\/))[a-zA-Z0-9._-]+\.[a-zA-Z./]{2,6}$/ig),
    phone: Joi.string().regex(/^[0-9- _]{3,15}\d+$/ig)
  };

  return Joi.validate(vet, schema);
}

exports.Vet = Vet;
exports.VetSchema = VetSchema;
exports.validateVet = validateVet;