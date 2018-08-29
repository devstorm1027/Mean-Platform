const models            = require("./models");
const emailTemplate     = require('./res/emailTemplate');
const superuser         = require('./res/superuser');

const db_init = function () {
    
    // models.User.find(function (err, users) {
    //     if(!err && users.length == 0){
    //         console.log("=================================");
    //         console.log("DB Init ... ");
    //         console.log("=================================");
    //
    //         models.EmailTemplate.insertMany(emailTemplate.defaultTemplate, function (err) {
    //             if(!err){
    //                 console.log("> Email Templates has been added to db");
    //             }
    //         });
    //
    //         models.Language.find(function (err, languages) {
    //             if(!err && languages.length == 0){
    //                 var language = {
    //                     name: 'English'
    //                 }
    //                 models.Language.create({
    //                     name: 'Arabic'
    //                 });
    //
    //                 console.log("> " + "Arabic" + " Language has been added to db");
    //
    //                 // models.Language.create(language, function (err, language) {
    //                 //     console.log("> " + language.name + " Language has been added to db");
    //                 //
    //                 //     var userInfo = {
    //                 //        "language": language,
    //                 //        "subscription":superuser.subscription,
    //                 //        "userType":superuser.userType,
    //                 //        "status":superuser.status,
    //                 //        "firstName":superuser.firstName,
    //                 //        "username":superuser.username,
    //                 //        "lastName":superuser.lastName,
    //                 //        "password":superuser.password,
    //                 //        "email":superuser.email,
    //                 //        "birthDate":superuser.birthDate
    //                 //     }
    //                 //
    //                 //     // models.User.createUser(userInfo, function (err, user) {
    //                 //     //     if(err){
    //                 //     //         console.log(err);
    //                 //     //     } else {
    //                 //     //         console.log("> Superuser has been created");
    //                 //     //     }
    //                 //     // });
    //                 // });
    //
    //
    //             }
    //         });
    //
    //
    //     }
    // });
    
    
}

module.exports = db_init;
