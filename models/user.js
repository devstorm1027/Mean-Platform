const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
//const passport = require("passport");
//const LocalStrategy = require("passport-local");
const imageSchema = require("./image");
//const User = require("./user").User;
const EmailTemplate = require("./emailTemplate");
const Language = require("./language").Language;
const emailHandler = require("../util/emailHandler");
const _promise = require('bluebird');

const uploadpath = require("../config/uploadpath");
const path = require("path");
const fs = require('fs');

const compare = _promise.promisify(bcrypt.compare);
const hash = _promise.promisify(bcrypt.hash);

const HASH_SALT_ROUNDS = 10;

//This Module Require In The End
//const Article = require("./article").Article;


const STATUS = {
    ACTIVE: "ACTIVE",
    /*HOLD: "HOLD",*/
    BLOCKED: "BLOCKED"
};

const USER = {
    ADMIN: "Admin",
    BUSINESSUSER: "Business User",
    USER: "User"
};

const userSchema = new mongoose.Schema({

    //validators & field scheme will be added later
    //TODO: why it is needed to describe it after module.export?
    //TODO: when adding a single tag, for example - validator is fired few times. Why?

    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        unique: false,
        select: false
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
        required: true,
    },
    userType: {
        type: String,
        enum: [ USER.ADMIN, USER.SUPERUSER, USER.VALIDATOR ],
        default: USER.VALIDATOR
    },
    status: {
        type: String,
        enum: [ STATUS.ACTIVE, /*STATUS.HOLD,*/ STATUS.BLOCKED ],
        /*default: STATUS.HOLD*/
        default: STATUS.ACTIVE
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    avatar: imageSchema,
    /**
     * What we need is what we have above
     */

/*    tags: [],
    attends: [],

    bookmarks: [],
    favorites: [],
    subscription: {
        type: String,
        required: true
    },

     language: {
     type: mongoose.Schema.Types.ObjectId,
     ref: "language",
     //required: true,
     validate: {
     validator: (languageId, done) => {
     Language.count({ _id: languageId})
     .then(count => {
     return done(count);
     }, err => {
     //TODO: log
     return done(false, err);
     });
     },
     message: "Language Does Not Exist"
     }
     },

    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        validate: {
            validator: (locationId, done) => {
                Location.count({ _id: locationId })
                //TODO: Log
                    .then(count => done(count), err => done(false, err) );
            }
        }
    },
     birthDate: {
     type: Date,
     required: true
     },
    biography: String*/
});
/**
 * Create new user
 * @param Object userInfo
 * @param function callback
 */
userSchema.statics.createUser = function (userInfo, callback)  {
    
    hash(userInfo.password, HASH_SALT_ROUNDS)
        .then(hashedPassword => {
        
            userInfo.password = hashedPassword;
            return this.create(userInfo);
        })
        .then(newUser => {
            
            if(!newUser) { throw ("Error creating user"); }

            return this.findById(newUser._id)
                .populate('language')
                ;
        })
        .then(user => {
            
            emailHandler.sendEmail(user.email, user, EmailTemplate.type.REGISTER, user.language.name);
            
            return callback(null, user);
        })
        .catch(err => {
            return callback(err.message, null);
        })
        ;
};

/**
 * @param object userInfo
 * @returns promise
 */
userSchema.methods.updateUser = function (userInfo) {
    
    return this.update(userInfo);
};


userSchema.methods.addAvatar= function (uploadInfo) {

    //remove old avatar if present
    if (this.avatar && fs.existsSync(path.join(uploadpath, this.avatar.filename)) ) {

        //console.log('remove old avatar:', uploadpath, this.avatar.filename);
        
        fs.unlinkSync(path.join(uploadpath, this.avatar.filename) );
    }
    
    return this.update(uploadInfo, { runValidators: false });
};

/** Change password for given user
 * @param mongoose.model User
 * @param object params - request body {oldpassword, newpassword}
 * @param function callback
 * @returns promise
 */
userSchema.methods.changeUserPass = function (userInfo, params, callback) {

    var message_content = {
        "PASSWORD_CHANGED":  '' //TODO: should we send new password in the mail?
    };

    //check if filled 'old' match with old password
    compare(params.oldpassword, userInfo.password)
        .then(result => {
            
            if (! result ) {
                
                throw { message: 'Incorrect old password.' };
            }
            
            return hash(params.newpassword, HASH_SALT_ROUNDS); //return promise
        })
        .then(hashedPassword => {
            
            return this.update({password: hashedPassword}).exec();
        })
        .then(result => {
            
            
            emailHandler.sendEmail(userInfo.email, message_content,EmailTemplate.type.PASSWORDCHANGED, userInfo.language.name);

            return callback(null, 'password changed:');
        })
        .catch(err => {
            
            return callback(err.message, null);
        })
        ;
    
};



userSchema.statics.resetUserPass = function (userInfo, callback) {
    
    emailHandler.sendEmail(userInfo.email, userInfo,EmailTemplate.type.RESET, userInfo.language.name);
    return callback(null, userInfo);

};

userSchema.statics.changePass = function (userInfo, password, callback)  {
    
    hash(password, HASH_SALT_ROUNDS)
        .then(hashedPassword => {
        
            userInfo.password = hashedPassword;
            userInfo.resetPasswordToken = null;
            userInfo.resetPasswordExpires = null;
            return this.update(userInfo);
        })
        .then(user => {
            
            //emailHandler.sendEmail(user.email, user, EmailTemplate.type.REGISTER, user.language.name);
            
            return callback(null, user);
        });
};

userSchema.methods.removeUser = function () {
    return this.remove();
};

userSchema.statics.getAll = function () {
    
    return this.find()
        .populate('bookmarks')
        .populate('language')
        .populate('favorites')
        ;
};

userSchema.statics.getUsers = function () {
    //return this.find().where("userType").ne("Admin").populate('bookmarks').populate('language');
    //return userSchema.getAll();
};

userSchema.statics.getAdmins = function () {
    return this.find().where("userType").equals("Admin").populate('bookmarks').populate('language');
};

userSchema.statics.getUser = function (userId) {
    return this.findById(userId)
        .populate('bookmarks')
        .populate('language')
        .populate('favorites')
        .populate('tags')
        ;
};

/**
 * Find user by given email
 * @param string email
 * @returns null if not exists or user object
 */
userSchema.statics.checkEmail = function (email) {

    return this.findOne({ email: email });
};

userSchema.statics.checkUsername = function (username) {
    //todo return custom message
    return this.findOne({username:username});

};

userSchema.methods.activate = function () {
    return this.update({ status: STATUS.ACTIVE });
};

userSchema.methods.hold = function () {
    return this.update({ status: STATUS.PENDING });
};

userSchema.methods.block = function () {
    return this.update({ status: STATUS.BLOCKED });
};

/** Add one or few business to favorites collection
 * @param articleId businessIds
 */
userSchema.methods.addBookmark = function (articleId) {
    this.bookmarks.addToSet(...articleId);
    return this.save();
};

userSchema.methods.removeBookmark = function (articleId) {
    this.bookmarks.pull(articleId);
    return this.save();
};

/**
 *@param iterableObj tags
 */
userSchema.methods.addTag = function (tags) {
    //console.log(tags);
    //var myObjectId = mongoose.Types.ObjectId(tags.tag);
    //console.log(myObjectId);
    
    this.tags.addToSet(...tags);
    
    return this.save();
};

userSchema.methods.removeTag = function (tagId) {
    this.tags.pull(tagId);
    return this.save();
};

/** Add one or few business to favorites collection
 * @param iterableObj businessIds
 */
userSchema.methods.addFavorite = function (businessIds) {
    this.favorites.addToSet(...businessIds);
    return this.save();
};

userSchema.methods.removeFavorite = function (businessId) {
    this.favorites.pull(businessId);
    return this.save();
};

/** Add one or few events to attends collection
 * @param iterableObj eventIds
 */
userSchema.methods.addAttend = function (eventIds) {
    this.attends.addToSet(...eventIds);
    return this.save();
};

userSchema.methods.removeAttend = function (eventId) {
    this.attends.pull(eventId);
    return this.save();
};

const hashPassword = (userInfo, callback) => {
    if(!userInfo.password) {
        return callback();
    } else {
        bcrypt.hash(userInfo.password, HASH_SALT_ROUNDS, (err, hashedPassword) => {
            if(err) {
                return callback(err);
            } else {
                userInfo.password = hashedPassword;
                return callback();
            }
        });
    }
};


module.exports = {
    userSchema: userSchema,
    User: mongoose.model("User", userSchema),
    STATUS: STATUS,
    USERTYPE: USER
};


const Article = require("./article").Article;

userSchema.add({
    bookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Article",
        validate: {
            validator: (articleId, done) => {
                Article.count({ _id: articleId })
                //TODO: log
                    .then(count => done(count), err => done(false, err));
            },
            message: "Article Does Not Exist"
        }
    }]
});

const Business = require("./business").Business;
userSchema.add({
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        validate: {
            validator: (businessId, done) => {
                Business.count({ _id: businessId })
                //TODO: log
                    .then(count => done(count), err => done(false, err));
            },
            message: "Business Does Not Exist"
        }
    }]
});

const Tag = require("./tag").Tag;
userSchema.add({
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
        validate: {
            validator: (tagId, done) => {
                Tag.count({ _id: tagId })
                //TODO: log
                    .then(count => done(count), err => done(false, err));
            },
            message: "Tag Does Not Exist"
        }
    }]
});

const Attend = require("./event").Event;
userSchema.add({
    attends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attend",
        validate: {
            validator: (attendId, done) => {
                Attend.count({ _id: attendId })
                //TODO: log
                    .then(count => done(count), err => done(false, err));
            },
            message: "Attend Does Not Exist"
        }
    }]
});

