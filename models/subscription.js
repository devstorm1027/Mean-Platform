const mongoose = require("mongoose");

const STATUS = {
    ACTIVE: "ACTIVE",
    HOLD: "HOLD",
    BLOCKED: "BLOCKED"
};


const subscriptionSchema = new mongoose.Schema({

    //validators & field scheme will be added later
    //TODO: why it is needed to describe it after module.export?
    //TODO: when adding a single tag, for example - validator is fired few times. Why?

    startDate: {
        type: Date,
    },
    expireDate: {
        type: Date  ,
    },
    price: {
        type: Number,
    },
    Status: {
        type: String,
        enum: [ STATUS.ACTIVE, STATUS.HOLD, STATUS.BLOCKED ],
        default: STATUS.HOLD
    },
    agentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "agent",
        required: true,
    },
    planID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "plan",
        required: true,
    },

});

module.exports = subscriptionSchema;