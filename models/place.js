const mongoose = require("mongoose");
const imageSchema = require("./image");

const STATUS = {
    ACTIVE: "ACTIVE",
    HOLD: "HOLD",
    BLOCKED: "BLOCKED"
};

const TYPE = {
    RESTAURANT: "Restaurant",
    CAFE: "Cafe"
};

const placeSchema = new mongoose.Schema({

    //validators & field scheme will be added later
    //TODO: why it is needed to describe it after module.export?
    //TODO: when adding a single tag, for example - validator is fired few times. Why?

    name: {
        type: String,
    },
    desc: {
        type: String,
    },
    Status: {
        type: String,
        enum: [ STATUS.ACTIVE, STATUS.HOLD, STATUS.BLOCKED ],
        default: STATUS.HOLD
    },
    coverImage: {
        type: imageSchema,
    },
    logo: {
        type: imageSchema,
    },
    website: {
        type: String,
    },
    placeType: {
        type: String,
        enum: [ TYPE.REGISTER, TYPE.CAFE ],
        default: STATUS.REGISTER
    },
    family: {
        type: Boolean,
    },
    best: {
        type: Boolean,
    },
    viewNo: {
        type: Number,
        //arr: [0],
    },
    sharesNo: {
        type: Number,
        //arr: [0],
    },
    agentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "agent",
        required: true,
    },

});

module.exports = placeSchema;
