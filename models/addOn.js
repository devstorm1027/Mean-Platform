const mongoose = require("mongoose");

const TYPE = {
    FEATURED: "Featured",
    OFFER: "Offer"
};

const addOnSchema = new mongoose.Schema({

    name: {
        type: String,
    },
    desc: {
        type: String,
    },
    period: {
        type: Number,
    },
    price: {
        type: Number,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    type:{
        type: String,
        enum: [ TYPE.FEATURED, TYPE.OFFER ],
        required: true,
    },
    isActive:{
        type:Boolean,
        default : false
    }


});
module.exports = {
    addOnSchema: addOnSchema,
    AddOn: mongoose.model("AddOn", addOnSchema),
    TYPE: TYPE,
    //USERTYPE: USER
};
