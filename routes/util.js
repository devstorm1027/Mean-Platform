const models = require("../models");
const router = require("express").Router();
const passport = require("passport");
const auth = require("../util/auth/index");
const jwtGenerator = require("../util/jwtGenerator");


const STATUS_SUCCESS =  true;
const STATUS_FAILED  =  false;

const USER_EXISTS       =  'user exists';
const USER_DOESNTEXIST  =  'user does not exist';

router.get("/users", passport.authenticate("jwt", { session: false }), auth.can("List Users"), (req, res, next) => {
    res.locals.promise = models.User.getUsers();
    return next();
});

router.get("/admins", passport.authenticate("jwt", { session: false }), auth.can("GET Admin"), (req, res, next) => {
    res.locals.promise = models.User.getAdmins();
    return next();
});

router.get("/check/email/:email", (req, res, next) => {
    
    models.User.checkEmail(req.params.email)
        .then(result =>  {

            if (result) {
                
                return res.send({status: STATUS_SUCCESS, message: USER_EXISTS });
                
            }
            else{
                
                return res.send({status: STATUS_FAILED, message: USER_DOESNTEXIST });
            }

        }, err => {
            
            throw(err);
        })
        .catch(err => {
            //TODO: log
            throw(err);
        });
});

router.get("/check/username/:username", (req, res, next) => {
    
    models.User.checkUsername(req.params.username)
        .then(result =>  {

            if (result) {
                
                return res.send({status: STATUS_SUCCESS, message: USER_EXISTS });
                
            }
            else{
                
                return res.send({status: STATUS_FAILED, message: USER_DOESNTEXIST });
            }

        }, err => {
            
            throw(err);
        })
        .catch(err => {
            //TODO: log
            throw(err);
        });
        
});

module.exports = router;

