const mongoose = require("mongoose");
const imageSchema = require("./image");
const User = require("./user").User;
const socialMediaSchema = require("./socialMedia");
const branchSchema = require("./branch");
const reviewSchema = require("./review");
const ratingSchema = require("./rating");
const Category = require("./businessCategory").BusinessCategory;
const Option = require("./businessOption").BusinessOption;
const Collection = require("./collection").Collection;
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

const businessSchema = new mongoose.Schema({
    owner: {
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
    name: {
        arabic: {
            type: String,
            required: true
        },
        english: {
            type: String,
            required: true
        }
    },
    logo: imageSchema,
    cover: imageSchema,
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
    website: {
        type: String
        //,
        /*validate: {
            validator: website => {
                return validator.isURL(website);
            },
            message: "Must Be a Valid URL"
        }*/
    },
    socialMedias: [ socialMediaSchema ],
    photos: [ imageSchema ],
    ownershipDocument: [ imageSchema ],
    tags: [{
        type: String,
        required: false
    }],
    editorPick: {
        type:Boolean,
        default: false
    },
    isSponsored: {
        type:Boolean,
        default: false
    },
    branches: [ branchSchema ],
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "BusinessCategory",
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
        ref: "BusinessOption",
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
    reviews: [ reviewSchema ],
    status: {
        type: String,
        enum: [ STATUS.PUBLISHED, STATUS.APPROVED, STATUS.PROVOKED, STATUS.PENDING, STATUS.ONHOLD , STATUS.SUSPENDED ],
        default: STATUS.PENDING
    },
    ratings: [ ratingSchema ],
    collections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collection",
        validate: {
            validator: (collectionId, done) => {
                Collection.count({ _id: collectionId })
                    .then( count => done(count) , err => done(false, err) );
            },
            message: "Collection Does Not Exist"
        }
    }]
}, { timestamps: true });


businessSchema.statics.createBusiness = function (businessInfo) {
    return this.create(businessInfo);
};


businessSchema.statics.getAll = function () {
    
    return this.find()
        .populate('reviews.user')
        .populate('reviews.language')
        .populate({
            path: 'reviews.user',
            populate: {
                path: 'language'
            }
        })
        .populate({
            path: 'owner',
            //select: 'subscription username',
            populate: {
                path: 'language'
            }
        })
        .populate({
            path: 'categories',
            populate: {
                path: 'parent',
                populate: {
                    path: 'parent'
                }
            }
        })
        .populate('options')
        .populate('comments.language')
        .populate('comments.user');
};

businessSchema.statics.getBusinesses = function () { //TODO: there is different populate() set with getFilteredBusinesses(). Is it a bug?

    return this.getAll();
};

businessSchema.statics.getFilteredBusinesses = function (status) {
    return this.find({ status: status })
        .populate('reviews.user')
        .populate('reviews.language')
        .populate({
            path: 'reviews.user',
            populate: {
                path: 'language'
            }
        })
        .populate('reviews')
        .populate({
            path: 'categories',
            populate: {
                path: 'parent',
                populate: {
                    path: 'parent'
                }
            }
        })
        .populate('options')
        .populate('comments.language')
        .populate('comments.user');
};

/** Get businesses having branch in given city
 * @param string cityName
 * @returns promise
 */
businessSchema.statics.getBusinessesByCity = function (cityName) {

    return this.getAll()
        .where({'branches.location.city': cityName })
        ;
    
};

businessSchema.statics.getBusinessesByCategory = function (category) {
    return this.find({ categories: category })
        .populate('reviews.user')
        .populate({
            path: 'owner',
            populate: {
                path: 'language'
            }
        })
        .populate('reviews')
        .populate({
            path: 'categories',
            populate: {
                path: 'parent',
                populate: {
                    path: 'parent'
                }
            }
        })
        .populate('language')
        .populate('options')
        .populate('comments.language')
        .populate('comments.user');
};

businessSchema.statics.getFeatured = function () {
    
    return this.getBusinesses()
        .or([{ editorPick: true }, { isSponsored: true }])
        ;
};

//get top 10 bushiness based high rating
businessSchema.statics.getTopratedBusinesses = function (limit) {

        return this
        .aggregate(
            [
                { "$match": { "ratings": {$ne: [] } } },
                { "$project":
                    {
                        "avgrating": {$avg: "$ratings.rating" },
                        owner: 1,
                        name: 1,
                        logo: 1,
                        cover: 1,
                        description: 1,
                        website: 1,
                        socialMedias:  1,
                        photos:  1,
                        ownershipDocument:  1,
                        tags: 1,
                        editorPick: 1,
                        isSponsored: 1,
                        branches:  1,
                        categories: 1,
                        options: 1,
                        reviews:  1,
                        status: 1,
                        ratings:  1,
                        comments:  1,
                        collections: 1
                    }
                },
                { "$sort": { "avgrating": -1 } }, //1 is asc, -1 is desc
                { "$limit": limit }
            ]
        )
        .then(result =>  {
            return mongoose.model("_Business", businessSchema)
            .populate('reviews.user')
            .populate({
                path: 'owner',
                populate: {
                    path: 'language'
                }
            })
            .populate('reviews')
            .populate({
                path: 'categories',
                populate: {
                    path: 'parent',
                    populate: {
                        path: 'parent'
                    }
                }
            })
            .populate('language')
            .populate('options')
            .populate('comments.language')
            .populate('comments.user')
            ;
        })
        ;

};

businessSchema.statics.searchBusinesses = function (searchInfo) {

/*    var filteredQuery = {},
        acceptableFields = ['name.englishName', 'race', /!* etc *!/ ];

    return this.find();



    acceptableFields.forEach(function(field) {
        req.query[field] &&  = req.query[field];
    });

    var query = Character.find()
    if(searchInfo){
        if(searchInfo.search){
            if(searchInfo.search.name){
                filteredQuery["name"] = {$or : [ {'name.englishName':searchInfo.search.name.englishName}
                    ,{'name.arabicName':searchInfo.search.name.arabicName} ]}
            }
        }
    }*/
    return this.find();//.where('tags').in(searchInfo.tags);
};

businessSchema.methods.updateBusiness = function (businessInfo) {
    return this.update(businessInfo, { runValidators: false });
};

businessSchema.methods.removeBusiness = function () {
    
    return User.update({}, {$pull: {favorites: this._id}})
        .then(rows => {
            return this.remove();
        })
    
    //return this
    
    //remove this from user favorites
    /*return User.find()
        .then(rows => {
            rows.model.update({$pull: {favorites: this._id}});
            //var actions = [];
            
            //remove from favorites collection for all users
            _.forEach(rows, function(model){
                //model.removeFavorite(this._id)
                actions.push(model.removeFavorite(this._id));
            });
            
            //return _promise.all(actions);
        })
        .then(rows => {
        
            //return this.remove();
        })
        ;*/
};


businessSchema.methods.addSocialMedia = function (socialMediaInfo) {
    this.socialMedias.addToSet(socialMediaInfo);
    return this.save();
};

businessSchema.methods.removeSocialMedia = function (socialMediaId) {
    this.socialMedias.pull(socialMediaId);
    return this.save();
};


businessSchema.methods.addPhoto = function (photoInfo) {
    this.photos.addToSet(...photoInfo);
    return this.save();
};

businessSchema.methods.removePhoto = function (photoId) {
    this.photos.pull(photoId);
    return this.save();
};


/**
 *@param iterableObj tags
 */
businessSchema.methods.addTag = function (tags) {

    this.tags.addToSet(...tags);
    
    return this.save();
};


businessSchema.methods.removeTag = function (tag) {
    this.tags.pull(tag);
    return this.save();
};


businessSchema.methods.addBranch = function (branchInfo) {
    this.branches.addToSet(branchInfo);
    return this.save();
};

businessSchema.methods.removeBranch = function (branchId) {
    this.branches.pull(branchId);
    return this.save();
};


businessSchema.methods.addCategory = function (categoryId) {
    this.categories.addToSet(categoryId);
    return this.save();
};

businessSchema.methods.removeCategory = function (categoryId) {
    this.categories.pull(categoryId);
    return this.save();
};


businessSchema.methods.addOption = function (optionInfo) {
    this.options.addToSet(optionInfo);
    return this.save();
};

businessSchema.methods.removeOption = function (optionId) {
    this.options.pull(optionId);
    return this.save();
};


businessSchema.methods.addReview = function (reviewInfo) {
    this.reviews.addToSet(reviewInfo);
    return this.save();
};

businessSchema.methods.removeReview = function (reviewId) {
    this.reviews.pull(reviewId);
    return this.save();
};

businessSchema.methods.addCommentToReview = function (reviewId, commentInfo) {
    this.reviews.id(reviewId).addComment(commentInfo);
    return this.save();
};

businessSchema.methods.removeCommentFromReview = function (reviewId, commentId) {
    this.reviews.id(reviewId).removeComment(commentId);
    return this.save();
};


businessSchema.methods.addRating = function (ratingInfo) {
    

    var rated = _.find(this.ratings, ['_id', ratingInfo._id._id]);
    
    if (rated) {
        
        throw "This user already rated this business";
    }
        
    this.ratings.addToSet(ratingInfo);
    return this.save();
};

businessSchema.methods.removeRating = function (ratingId) {
    this.ratings.pull(ratingId);
    return this.save();
};


businessSchema.methods.addCollection = function (collectionInfo) {
    this.collections.addToSet(...collectionInfo);
    return this.save();
};

businessSchema.methods.removeCollection = function (collectionId) {
    this.collections.pull(collectionId);
    return this.save();
};


module.exports = {
    businessSchema: businessSchema,
    Business: mongoose.model("Business", businessSchema)
};
