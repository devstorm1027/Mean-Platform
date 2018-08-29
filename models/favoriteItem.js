const mongoose = require("mongoose");

const favoriteItemSchema = new mongoose.Schema({

    //validators & field scheme will be added later
    //TODO: why it is needed to describe it after module.export?
    //TODO: when adding a single tag, for example - validator is fired few times. Why?

    menuItemID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "menuItem",
        required: true,
    },
    customerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer",
        required: true,
    },

});

module.exports = favoriteItemSchema;