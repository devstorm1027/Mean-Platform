const mongoose = require("mongoose");
const imageSchema = require("./image");
const optionsSchema = require("./option");
const socialMediaSchema = require("./socialMedia");
const ratingSchema = require("./rating");
const commentSchema = require("./comment");
const User = require("./user").User;
const Category = require("./eventCategory").EventCategory;
const Option = require("./eventOption").EventOption;
const validator = require("validator");
const _ = require("lodash");

const _promise = require('bluebird');

const STATUS = {
    PUBLISHED: "PUBLISHED",
    APPROVED: "APPROVED",
    PROVOKED: "PROVOKED",
    PENDING: "PENDING",
    ONHOLD: "ONHOLD",
    SUSPENDED: "SUSPENDED"
};

const DAYS = {
    SU: "SU",
    MO: "MO",
    TU: "TU",
    TH: "TH",
    FR: "FR",
    SA: "SA"
};

const eventSchema = new mongoose.Schema({
    title: {
        arabic: {
            type: String,
            required: true
        },
        english: {
            type: String,
            required: true
        }
    },
    description: {
        arabic: {
            type: String,
            required: true
        },
        english: {
            type: String,
            required: true
        }
    },
    host: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    location: {
        latitude: {
            type: String,
            required: true
        },
        longitude: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        }

    },
    phone: {
        type: Number,
        //TODO: validate
    },
    entranceFee: String,
    logo: {
        type: imageSchema,
        default: null
    },
    cover: imageSchema,
    socialMedias: [ socialMediaSchema ],
    attendants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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
    }],
    ratings: [ ratingSchema ],
    tags: [{
        type: String,
        required: false
    }],
    editorPick: {
        type:Boolean,
        default: false
    },
    status: {
        type: String,
        enum: [ STATUS.PUBLISHED, STATUS.APPROVED, STATUS.PROVOKED, STATUS.PENDING, STATUS.ONHOLD , STATUS.SUSPENDED ],
        default: STATUS.PENDING,
    },
    comments: [ commentSchema ],
    photos: [ imageSchema ],
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "EventCategory",
        validate: {
            validator: (categoryId, callback) => {
                Category.count({ _id: categoryId})
                    .then(count => {
                        return callback(count);
                    }, err => {
                        //TODO: log
                        return callback(0, err);
                    });
            },
            message: "Category Does Not Exist"
        }
    }],
    options: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "EventOption",
        validate: {
            validator: (optionId, callback) => {
                Option.count({ _id: optionId})
                    .then(count => {
                        return callback(count);
                    }, err => {
                        //TODO: log
                        return callback(0, err);
                    });
            },
            message: "Option Does Not Exist"
        }
    }],
    recurrence: [{
       repeat: [DAYS.SU, DAYS.MO, DAYS.TU, DAYS.TH, DAYS.FR, DAYS.SA],
       frequent: String
    }],
}, { timestamps: true });


eventSchema.statics.createEvent = function (eventInfo) {
    return this.create(eventInfo);
};

eventSchema.methods.updateEvent = function (eventInfo) {
    return this.update(eventInfo, { runValidators: false });
};

eventSchema.methods.removeEvent = function () {
    
    return User.update({}, {$pull: {attends: this._id}})
        .then(rows => {
            return this.remove();
        })
    
    //remove this from user attends colletion
    /*return User.find()
        .then(rows => {

            var actions = [];
            
            //remove from attends collection for all users
            _.forEach(rows, function(model){

                actions.push(model.removeAttend(this._id));
            });
            
            return _promise.all(actions);
        })
        .then(rows => {
        
            return this.remove();
        })
        ;*/
};

eventSchema.statics.getModel = function (id) {
    
    return this.findById(id)
        .populate('options')
        .populate({
            path: 'ratings.user',
            populate: {
                path: 'language'
            }
        })
        .populate('ratings')
        .populate('categories') //TODO: rewrite it - move populate to separate method
        .populate('comments.language')
        .populate({
            path: 'comments.user',
            populate: {
                path: 'language'
            }
        })
        ;
};

eventSchema.statics.getAll = function () {
    
    var query = this.find()
        .sort({'startDate': 'asc'})
        .populate('categories') //TODO: rewrite it - move populate to separate method
        .populate('options')
        .populate('comments.language')
        .populate({
            path: 'comments.user',
            populate: {
                path: 'language'
            }
        }).populate({
            path: 'ratings.user',
            populate: {
                path: 'language'
            }
        })
        .populate('ratings');
                
    return query;
};

eventSchema.statics.getEvents = function () {

    return this.getAll();
};


/**
 * @param int limit
 * @param date startDate,
 * @param date endDate
 */
eventSchema.statics.getUpcomingEvents = function (limit, startDate, endDate) {

    var query = this.getAll();
    
    startDate = startDate || new Date();

    if (typeof endDate !== 'undefined') {
        
        query.where('startDate').lte(endDate);
    }
    
    if (limit) {
        
        query.limit(limit);
    }
    
    query = query
        .where('startDate').gte(startDate)
        ;
    
    return query;

};

eventSchema.statics.getFilteredEvents = function (status) {
    
    return this.getAll()
        .where('status')
        .eq( status )
        ;
};

eventSchema.methods.addOption = function (optionInfo) {
    this.options.addToSet(optionInfo);
    return this.save();
};

eventSchema.methods.removeOption = function (optionId) {
    this.options.pull(optionId);
    return this.save();
};


eventSchema.methods.addSocialMedia = function (socialMediaInfo) {
    this.socialMedias.addToSet(socialMediaInfo);
    return this.save();
};

eventSchema.methods.removeSocialMedia = function (socialMediaId) {
    this.socialMedias.pull(socialMediaId);
    return this.save();
};


eventSchema.methods.addAttendant = function (attendantId) {
    this.attendants.addToSet(attendantId);
    return this.save();
};

eventSchema.methods.removeAttendant = function (attendantId) {
    this.attendants.pull(attendantId);
    return this.save();
};


eventSchema.methods.addRating = function (ratingInfo) {

    var rated = _.find(this.ratings, ['_id', ratingInfo.user._id]);
    
    if (rated) {
        
        throw "This user already rated this event";
    }
    
    this.ratings.addToSet(ratingInfo);
    
    return this.save()
        .then(result => {

            //reload document
            //TODO: WARNING!! UGLY CODE!! rewrite & optimize it!
            var _model = require("./event").Event;
            
            return _model.getModel(result._id);
        });
};

eventSchema.methods.removeRating = function (ratingId) {
    this.ratings.pull(ratingId);
    return this.save();
};


/**
 *@param iterableObj tags
 */
eventSchema.methods.addTag = function (tags) {

    this.tags.addToSet(...tags);
    
    return this.save();
};


eventSchema.methods.removeTag = function (tag) {
    this.tags.pull(tag);
    return this.save();
};


eventSchema.methods.addComment = function (commentInfo) {
    
    this.comments.addToSet(commentInfo);
    
    return this.save()
        .then(result => {

            //reload document
            //TODO: WARNING!! UGLY CODE!! rewrite & optimize it!
            var _model = require("./event").Event;
            
            return _model.getModel(result._id);
        });
};

eventSchema.methods.removeComment = function (commentId) {
    this.comments.pull(commentId);
    return this.save();
};


eventSchema.methods.addPhoto = function (photoInfo) {
    this.photos.addToSet(...photoInfo);
    return this.save();
};

eventSchema.methods.removePhoto = function (photoId) {
    this.photos.pull(photoId);
    return this.save();
};


eventSchema.methods.addCategory = function (categoryId) {
    this.categories.addToSet(categoryId);
    return this.save();
};

eventSchema.methods.removeCategory = function (categoryId) {
    this.categories.pull(categoryId);
    return this.save();
};

module.exports = {
    eventSchema: eventSchema,
    Event: mongoose.model("Event", eventSchema)
};