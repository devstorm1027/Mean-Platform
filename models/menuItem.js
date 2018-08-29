const mongoose = require("mongoose");
const imageSchema = require("./image");

const menuItemSchema = new mongoose.Schema({

    //validators & field scheme will be added later
    //TODO: why it is needed to describe it after module.export?
    //TODO: when adding a single tag, for example - validator is fired few times. Why?

    name: {
        type: String,
    },
    desc: {
        type: String,
    },
    price: {
        type: Number,
    },
    image: {
        type: imageSchema,
    },
    viewNo: {
        type: Number,
        //arr: [0],
    },
    sharesNo: {
        type: Number,
        //arr: [0],
    },
    menuID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "menuSection",
        required: true,
    },

});

module.exports = menuItemSchema;