const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({

    //validators & field scheme will be added later
    //TODO: why it is needed to describe it after module.export?
    //TODO: when adding a single tag, for example - validator is firedfew times. Why?

    name: {
        type: String,
    },
    placeID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "place",
        required: true,
    },

});

module.exports = categorySchema;