const mongoose = require('mongoose');

const { GeoSchema } = require('./geoschema');

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
      validator: value => value.match(/^[a-z0-9-]$/),
      message: 'invalid slug'
    }
  },
  name: {
    type: String,
    required: true,
    validate: {
      validator: value => value.match(/^[a-zA-Z0-9 .,-:_]$/),
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
  accepted: Boolean
});

VetSchema.index({ position: '2dsphere' });

const Vet = mongoose.model('Vet', VetSchema);

exports.Vet = Vet;
exports.VetSchema = VetSchema;