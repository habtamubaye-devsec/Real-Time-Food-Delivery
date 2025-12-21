const mongoose = require('mongoose');

const driverLocationSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
  updatedAt: { type: Date, default: Date.now }
});

driverLocationSchema.index({ location: '2dsphere' });
driverLocationSchema.index({ driverId: 1 });

module.exports = mongoose.model('DriverLocation', driverLocationSchema);
