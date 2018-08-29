const mongoose = require("mongoose");


const imageSchema = new mongoose.Schema({
    filename: {
        type: String,
        require: true
    }
});

module.exports = imageSchema;