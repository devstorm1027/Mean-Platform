const mongoose = require("mongoose");
const imageSchema = require("./image");

const STATUS = {
    ACTIVE: "ACTIVE",
    BLOCKED: "BLOCKED"
};

const agentSchema = new mongoose.Schema({

    //validators & field scheme will be added later
    //TODO: why it is needed to describe it after module.export?
    //TODO: when adding a single tag, for example - validator is firedfew times. Why?

    username: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: {
            validator: (email) => {
                return validator.isEmail(email);
            }
        }
    },
    phone: {
        type: String,
    },
    Status: {
        type: String,
        enum: [ STATUS.ACTIVE, STATUS.BLOCKED ],
        default: STATUS.ACTIVE
    },
    avatar: {
        type: imageSchema,
    },
    joiningDate: {
        type: Date,
        default: new Date()
    },
    password: {
        type: String,
        required: true,
        unique: false,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,

});

module.exports = {
    agentSchema: agentSchema,
    Agent: mongoose.model("Agent", agentSchema),
    STATUS: STATUS,
    //USERTYPE: USER
};