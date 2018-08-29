const mongoose = require("mongoose");
const imageSchema = require("./image");

const offerSchema = new mongoose.Schema({

    //validators & field scheme will be added later
    //TODO: why it is needed to describe it after module.export?
    //TODO: when adding a single tag, for example - validator is firedfew times. Why?

    desc: {
        type: String,
    },
    image: {
        type: imageSchema,
    },
    date: {
        type: Date,
    },
    expireDate: {
        type: Date,
    },
    placeID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "place",
        required: true,
    },
    agentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "agent",
        required: true,
    },
    addOnID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "addOn",
        required: true,
    },

});

module.exports = offerSchema;