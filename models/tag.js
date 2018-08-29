const mongoose = require("mongoose");
const User = require("./user").User;

const _promise = require('bluebird');

const tagSchema = new mongoose.Schema({
    tag: {
        arabic: {
            type: String,
            required: true
        },
        english: {
            type: String,
            required: true
        }
    },
    color: {
        type: String,
        required: true
    },
});

tagSchema.statics.createTag = function(tagInfo) {
    return this.create(tagInfo);
};

tagSchema.statics.getTags = function () {
    return this.find();
};

tagSchema.methods.updateTag = function (tagInfo) {
    return this.update(tagInfo, { runValidators: true });
};

tagSchema.methods.removeTag = function () {
    
    
    //remove this from user tags colletion
    return User.find()
        .then(rows => {

            var actions = [];
            
            //remove from tags collection for all users
            _.forEach(rows, function(model){

                actions.push(model.removeTag(this._id));
            });
            
            return _promise.all(actions);
        })
        .then(rows => {
        
            return this.remove();
        })
        ;
};

const Tag = mongoose.model("Tag", tagSchema);


module.exports = {
    tagSchema: tagSchema,
    Tag: Tag
};


