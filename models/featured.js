const mongoose = require("mongoose");

const STATUS = {
    ACTIVE: "ACTIVE",
    BLOCKED: "BLOCKED"
};


const featuredSchema = new mongoose.Schema({

    //validators & field scheme will be added later
    //TODO: why it is needed to describe it after module.export?
    //TODO: when adding a single tag, for example - validator is firedfew times. Why?

    date: {
        type: Date,
    },
    expireDate: {
        type: Date,
    },
    price: {
        type: Number,
    },
    Status: {
        type: String,
        enum: [ STATUS.ACTIVE, STATUS.BLOCKED ],
        default: STATUS.ACTIVE
    },
    placeID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "place",
        required: true,
    },
    addOnID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "addOn",
        required: true,
    },

});

module.exports = {
    featuredSchema: featuredSchema,
    Featured: mongoose.model("Featured", featuredSchema),
    STATUS: STATUS,
    //USERTYPE: USER
};

module.exports = featuredSchema;