const mongoose = require('mongoose');

const dancerSchema = new mongoose.Schema({
    identifier: { type: Number, require: true, unique: true },
    name: { type: String, require: true },
    race: { type: String },
    description: { type: String }
});

const model = mongoose.model('DancerModels', dancerSchema);

module.exports = model;