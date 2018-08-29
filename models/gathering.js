const mongoose = require("mongoose");

const gatheringSchema = new mongoose.Schema({

    //validators & field scheme will be added later
    //TODO: why it is needed to describe it after module.export?
    //TODO: when adding a single tag, for example - validator is firedfew times. Why?

    hostID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer",
        required: true,
    },
    branchID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "branch",
        required: true,
    },

});

module.exports = gatheringSchema;