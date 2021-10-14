const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    identifier: { type: Number, require: true, unique: true },
    type: { type: String, require: true },
    pricePerHalfHour: { type: Number, require: true },
    pricePerExtraPerson: { type: Number }
});

const model = mongoose.model('ServiceModels', serviceSchema);

module.exports = model;