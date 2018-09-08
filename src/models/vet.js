const mongoose = require('mongoose');
const slugHero = require('mongoose-slug-hero');
const Joi = require('joi');

const { GeoSchema } = require('./geoschema');

const slugRegex = /^[a-z0-9-]{1,}$/;
const nameRegex = /^[a-zA-Z0-9ąćęłńóśżźĄĆĘŁŃÓŚŻŹ .,-:_]{1,}$/i;
const urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;

const VetSchema = new mongoose.Schema({
  position: {
    type: GeoSchema,
    validate: {
      validator: value => {
        const { coordinates } = value;
        return Array.isArray(coordinates)
          && coordinates.length === 2
          && coordinates[0] >= -90 && coordinates[0] <= 90
          && coordinates[0] >= -180 && coordinates[1] <= 180;
      },
      message: 'invalid position'
    }
  },
  slug: {
    type: String,
    validate: {
      validator: value => slugRegex.test(value),
      message: 'invalid slug'
    }
  },
  name: {
    type: String,
    required: true,
    validate: {
      validator: value => nameRegex.test(value),
      message: 'invalid name'
    }
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

VetSchema.plugin(slugHero, { doc: 'vet', field: 'name' });

const Vet = mongoose.model('Vet', VetSchema);

function validateVet(vet) {
  const schema = {
    position: Joi.array().length(2).items(
      Joi.number().min(-180).max(180).required(),
      Joi.number().min(-90).max(90).required()
    ).error(() => 'invalid position'),
    name: Joi.string().regex(nameRegex).required().error(() => 'invalid name'),
    address: Joi.string().required().error(() => 'invalid address'),
    rodents: Joi.boolean().error(() => 'invalid rodents value'),
    exoticAnimals: Joi.boolean().error(() => 'invalid exotic animals value'),
    websiteUrl: Joi.string().error(() => 'invalid website url'),
    phone: Joi.string().error(() => 'invalid phone number')
  };

  return Joi.validate(vet, schema);
}

exports.Vet = Vet;
exports.VetSchema = VetSchema;
exports.validateVet = validateVet;