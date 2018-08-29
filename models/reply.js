const mongoose = require("mongoose");
const User = require("./user").User;


const replySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
        validate: {
            validator: (userId, done) => {
                User.count({ _id: userId })
                    .then(count => {
                        return done(count)
                    }, err => {
                        //TODO: log
                        return done(false, err)
                    })
            },
            message: "User Does Not Exist"
        }
    },
    reply: {
        type: String,
        required: true
    }
}, { timestamps: true });


module.exports = replySchema;