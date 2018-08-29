const mongoose = require("mongoose");
const imageSchema = require("./image");

const taggedCustomerSchema = new mongoose.Schema({

    //validators & field scheme will be added later
    //TODO: why it is needed to describe it after module.export?
    //TODO: when adding a single tag, for example - validator is firedfew times. Why?

    gatheringID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "gathering",
        required: true,
    },
    customerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer",
        required: true,
    },

});

module.exports = taggedCustomerSchema;