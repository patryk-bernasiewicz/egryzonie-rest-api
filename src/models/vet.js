const mongoose = require('mongoose');
const slugHero = require('mongoose-slug-hero');

const { GeoSchema } = require('./geoschema');

const slugRegex = /^[a-z0-9-]{1,}$/;
const nameRegex = /^[a-zA-Z0-9ąćęłńóśżźĄĆĘŁŃÓŚŻŹ .,-:_]{1,}$/;

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

exports.Vet = Vet;
exports.VetSchema = VetSchema;