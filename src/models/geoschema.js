const mongoose = require('mongoose');

const GeoSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    index: '2dsphere'
  }
}, { _id: false });

exports.GeoSchema = GeoSchema;
exports.GeoModel = mongoose.model('geo', GeoSchema);