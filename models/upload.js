const mongoose = require("mongoose");
const imageSchema = require("./image");

const uploadSchema = new mongoose.Schema({
    photo: imageSchema
});

uploadSchema.statics.upload = function(uploadInfo) {
    return this.create(uploadInfo);
};

uploadSchema.statics.getUploads = function () {
    return this.find()
};


module.exports = {
    uploadSchema: uploadSchema,
    Upload: mongoose.model("Upload", uploadSchema)
};


