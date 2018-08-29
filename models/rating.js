const mongoose = require("mongoose");
const User = require("./user").User;

const ratingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
        validate: {
            validator: (userId, done) => {
                User.count({ _id: userId })
                    .then(count => {
                        return done(count);
                    }, err => {
                        //TODO: log
                        return done(false, err);
                    });
            },
            message: "User Does Not Exist"
        }
    },
    rating: {
        type: Number,
        min: [0, "The Rating Must Be Positive"],
        max: [5, "The Rating Must Not Exceeds 5"],
        required: true
    }
}, { timestamps: true });

module.exports = ratingSchema;