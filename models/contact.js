const mongoose = require("mongoose");
const validator = require("validator");
const replySchema = require("./reply");

const TYPE = {
    OPEN: "Open",
    CLOSED: "Closed",
    PENDING: "Pending"
};

const contactSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: [ TYPE.OPEN, TYPE.CLOSED, TYPE.PENDING],
    },
    category: {
        type: String,
        required: true
    },
    person: {
        name: String,
        email: String,
        phone: String
    },
    message: {
        title: {
            type: String,
            required: true
        },
        body: {
            type: String,
            required: true
        }
    },
    is_seen: {
        type: Boolean,
        required: true
    },
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
    replies: [replySchema]
}, { timestamps: true });

contactSchema.statics.createContact = function (contactInfo) {
    return this.create(contactInfo)
};

contactSchema.methods.updateContact = function (contactInfo) {
    return this.update(contactInfo);
};

contactSchema.methods.removeContact = function () {
    return this.remove();
};

contactSchema.statics.getContacts = function () {
    return this.find();
};

contactSchema.statics.getContact = function (contactId) {
    return this.findById(contactId);
};

contactSchema.methods.reply = function (replyInfo) {
    replyInfo.user
    this.replies.addToSet(replyInfo);
    return this.save();
};

module.exports = {
    contactSchema: contactSchema,
    Contact: mongoose.model("Contact", contactSchema)
};