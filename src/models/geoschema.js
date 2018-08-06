const mongoose = require('mongoose');

const GeoSchema = new mongoose.Schema({
  type: {
    default: 'Point',
    type: String
  },
  coordinates: {
    type: [Number],
    index: '2dsphere'
  }
});

exports.GeoSchema = GeoSchema;
exports.GeoModel = mongoose.model('geo', GeoSchema);