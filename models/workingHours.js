const mongoose = require("mongoose");

const DAY = {
    SUNDAY: "Sunday",
    MONDAY: "Monday",
    TUESDAY: "Tuesday",
    WEDNESDAY: "Wednesday",
    THURSDAY: "Thursday",
    FRIDAY: "Friday",
    SATURDAY: "Saturday"
};

const workingHoursSchema = new mongoose.Schema({

    //validators & field scheme will be added later
    //TODO: why it is needed to describe it after module.export?
    //TODO: when adding a single tag, for example - validator is firedfew times. Why?

    startTime: {
        type: Date,
    },
    endTime: {
        type: Date,
    },
    Day: {
        type: String,
        enum: [ DAY.SUNDAY, DAY.MONDAY, DAY.TUESDAY, DAY.WEDNESDAY, DAY.THURSDAY, DAY.FRIDAY, DAY.SATURDAY ],
    },
    branchID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "branch",
        required: true,
    },

});

module.exports = workingHoursSchema;