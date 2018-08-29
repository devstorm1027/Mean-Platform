const models = require("../models");
const router = require("express").Router();
const passport = require("passport");
const jwtGenerator = require("../util/jwtGenerator");
//const resultHandler = require("../util/resultHandler");
const upload = require("../config/multer");
const auth = require("../util/auth/index");
const _ = require("lodash");
const crypto = require('crypto');
const async = require('async');

const resultHandler    = require("../util/resultHandler")[0]; //hack - we want to process returned data with resultHandler

//TODO import from resultHandler
const STATUS_SUCCESS =  true;
const STATUS_FAILED  =  false;


/** Get all users ***/
router.get("/all", (req, res, next) => {
    res.locals.promise = models.User.getAll();
    
    return resultHandler(req, res, next);
});


/** Create user ***/
router.post("/", (req, res, next) => {

    models.User.createUser(req.body, (err, user) => {
        
        if(err) {
            return next(err);
        } else {
            
            return res.send({
                status: STATUS_SUCCESS,
                message: 'User created',
                data: _.omit(user.toObject(), "password")
            });
        }
    });
});


/***** Current user operations ************/

router.post("/login", passport.authenticate("local", {session: false}), (req, res, next) => {
    jwtGenerator.generateJwt(req.user.id, (err, jwt) => err ? next(err) : res.send(jwt));
});

router.post("/jwt", (req, res, next) => {
    jwtGenerator.verifyJwt(req.body.jwt, (err, user) => {
        if(err) {
            res.sendStatus(400)
        }
        else {
            res.send(user);
        }
    });
});


//change password for current user
router.post("/changepassword", passport.authenticate("jwt", { session: false }),
    (req, res, next) => {

        models.User.findById(req.user._id)
        .select("+password")
        .then(user => {
        
            if (!user) {
                throw { message: "User Does Not Exist" };
            }
            
            req.user.changeUserPass(user, req.body, (err, success) => {
                    
                if(err) { return next(err); }

                return res.send({
                    status: STATUS_SUCCESS,
                    message: success,
                    data: _.omit(user.toObject(), "password")
                    
                });
            });
            
        })
        .catch(err => {

            next(err);
        });

});


router.get("/", passport.authenticate("jwt", { session: false }), (req, res, next) => {
        models.User.findById(req.user._id).populate('language')
        .populate({
            path: 'bookmarks',
            populate: {
                path: 'language'
            }
        }).populate({
            path: 'bookmarks',
            populate: {
                path: 'user',
                populate: {
                    path: 'language'
                }
            }
        }).populate({
            path: 'bookmarks',
            populate: {
                path: 'comments.language'
            }
        }).populate({
            path: 'bookmarks',
            populate: {
                path: 'comments.user',
                populate: {
                    path: 'language'
                }
            }            
        })
        .populate({
            path: 'favorites',
            populate: {
                path: 'options'
            }
        })
        .populate({
            path: 'favorites',
            populate: {
                path: 'categories',
                populate: {
                    path: 'parent',
                    populate: {
                        path: 'parent'
                    }
                }
            }
        })
        .then(user => {
            if (!user) {
                return next(new Error("User Does Not Exist"));
            } else {
                return res.send(user)
            }
        }, err => next(err));
    
    //;
});

router.get("/businesses", passport.authenticate("jwt", { session: false }), (req, res, next) => {
    models.Business.find({owner: req.user._id}, (err, data) => {
        res.send(data);
    });
});

router.put("/", passport.authenticate("jwt", { session: false }), (req, res, next) => {
    
    
    //password will not be updated using this method
    
    var userdata = (_.omit(req.body, "password"));
    console.log('body:', userdata);
    
    res.locals.promise = req.user.updateUser(userdata);
    
    return next();
    
});

/** Add / update avatar to current user
 * @param JSON tags - tag ids
 */
router.post("/avatar",
    upload.single("avatar"),
    passport.authenticate("jwt", { session: false }),

    (req, res, next) => {
        
        if( ! req.file)  {
            
            return next(new Error("Avatar file is required"));
        }
            
        req.body.avatar = { filename: req.file.filename };
        
        res.locals.promise = req.user.addAvatar(req.body);
        return next();
});


/* --------------------
 * Tags
 */
router.get("/tags", passport.authenticate("jwt", { session: false }), (req, res, next) => {
    return res.send(req.user.tags);
});

/** Add tags to current user
 * @param JSON tags - tag ids
 */
router.post("/tag", passport.authenticate("jwt", { session: false }),
    //auth.can("Add Tag"),  //TODO: do we need permissions check here?
    (req, res, next) => {
        res.locals.promise = req.user.addTag(req.body);
        return next();
});

router.delete("/tag/:tagId", passport.authenticate("jwt", { session: false }),
    
    //auth.can("Remove Tag"),  //TODO: do we need permissions check here?
    (req, res, next) => {
        res.locals.promise = req.user.removeTag(req.params.tagId);
        return next();
    });


/* --------------------
 * Favorites
 */
router.get("/favorites", passport.authenticate("jwt", { session: false }), (req, res, next) => {
    models.User.findById(req.user._id)
        .populate({
            path: 'favorites',
            populate: {
                path: 'language'
            }
        })
        .then(user => {
            return res.send(user.favorites);
        });
});

/*
/** Add favorites to current user
 * @param JSON favorites - business ids
 */
router.post("/favorite", passport.authenticate("jwt", { session: false }),
    //auth.can("Add Favorite"), //TODO: do we need permissions check here?
    (req, res, next) => {
        res.locals.promise = req.user.addFavorite(req.body);
        return next();
});

router.delete("/favorite/:favoriteId", passport.authenticate("jwt", {session: false}),
    //auth.can("Remove Favorite"), //TODO: do we need permissions check here?
    (req, res, next) => {
        res.locals.promise = req.user.removeFavorite(req.params.favoriteId);
        return next();
});
    

/* --------------------
 * Bookmarks
 */
router.get("/bookmarks", passport.authenticate("jwt", { session: false }), (req, res, next) => {
    models.User.findById(req.user._id)
        .populate({
            path: 'bookmarks',
            populate: {
                path: 'language'
            }
        })
        .then(user => {
            return res.send(user.bookmarks);
        });
});

/** Add bookmarks to current user
 * @param JSON favorites - business ids
 */
router.post("/bookmark", passport.authenticate("jwt", { session: false }),
    //auth.can("Add Bookmark"), //TODO: do we need permissions check here?
    (req, res, next) => {
        res.locals.promise = req.user.addBookmark(req.body);
        return next();
});

router.delete("/bookmark/:articleId", passport.authenticate("jwt", {session: false}),
    //auth.can("Remove Bookmark"), //TODO: do we need permissions check here?
    (req, res, next) => {
        res.locals.promise = req.user.removeBookmark(req.params.articleId);
        return next();
});


/* --------------------
 * Events
 */
router.get("/attends", passport.authenticate("jwt", { session: false }), (req, res, next) => {
    return res.send(req.user.attends);
});

/** Add bookmarks to current user
 * @param JSON event ids
 */
router.post("/attend", passport.authenticate("jwt", { session: false }),
    //auth.can("Attend Event"), //TODO: do we need permissions check here?
    (req, res, next) => {
    
        models.User.findById(req.user._id)
        .populate('language')
        .then(user => {
            res.locals.promise = user.addAttend(req.body);
            return next(); 
        });
});

router.delete("/attend/:eventId", passport.authenticate("jwt", {session: false}),
    //auth.can("Remove Attend"), //TODO: do we need permissions check here?
    (req, res, next) => {
    
        models.User.findById(req.user._id)
        .populate('language')
        .then(user => {
            res.locals.promise = req.user.removeAttend(req.params.eventId);
            return next();
        });
});


/*** Operations with selected user ******/
router.put("/:userId", passport.authenticate("jwt", { session: false }),
    auth.can("Update User"), (req, res, next) => {
    req.params.user.updateUser(req.body, (err, user) => {
        if(err) {
            return next(err);
        } else {
            res.locals.promise = user;
            return next();
        }
    });
});

router.post("/:userId/changepassword", passport.authenticate("jwt", { session: false }),
    auth.can("Password Change"),
    (req, res, next) => {

        models.User.findById(req.params.userId)
        .select("+password")
        .then(user => {
        
            if (!user) {
                throw { message: "User Does Not Exist" };
            }
            
            req.params.user.changeUserPass(user, req.body, (err, success) => {
                    
                if(err) { return next(err); }

                return res.send({
                    status: STATUS_SUCCESS,
                    message: success,
                    data: _.omit(user.toObject(), "password")
                    
                });
            });
            
        })
        .catch(err => {

            next(err);
        });

});

router.put("/:userId/reset", passport.authenticate("jwt", { session: false }),
    auth.can("Password Reset"), (req, res, next) => {

    req.params.user.resetUserPass(models.User.getUser(req.params.userId), (err, user) => {
        if(err) {
            return next(err);
        } else {
            res.locals.promise = user;
            return next();
        }
    });
});



router.post("/reset", (req, res, next) => {
      
    models.User.findOne({email: req.body.email})
        .populate('language')
        .then(user => {
            if (!user) {
                return next(new Error("User Does Not Exist"));
            } else {
                async.waterfall([
                    function(done) {
                        crypto.randomBytes(20, function(err, buf) {
                            var token = buf.toString('hex');
                            done(err, token);
                        })
                    },
                    function (token) {
                        user.resetPasswordToken = token;
                        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                        user.save();

                        
                        models.User.resetUserPass(user, (err, user) => {
                            if(err) {
                                return next(err);
                            } else {
                                return res.send({
                                    status: STATUS_SUCCESS,
                                    message: 'Email Sent',
                                });
                            }
                        });
                    }
                ]);
                
            }
        }, err => next(err))
    
    // Eamail
    
    
    /*req.params.user.resetUserPass(models.User.findOne({email: req.body.email}), (err, user) => {
        if(err) {
            return next(err);
        } else {
            res.locals.promise = user;
            return next();
        }
    });*/
});

router.post('/reset/:token', function(req, res, next) {
  models.User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      
    if (!user) {
      res.send('error Password reset token is invalid or has expired.');
    }
      
    models.User.changePass(user, req.body.password, (err, user) => {
        
        if(err) {
            return next(err);
        } else {
            
            return res.send({
                status: STATUS_SUCCESS,
                message: 'Password Changed',
            });
        }
    });
  });
});

router.delete("/:userId", passport.authenticate("jwt", { session: false }),
    auth.can("Remove User"), (req, res, next) => {
	res.locals.promise = req.params.user.removeUser();
    return next();
});

router.get("/:userId", passport.authenticate("jwt", { session: false }),
    auth.can("List Users"), (req, res, next) => {

	res.locals.promise = models.User.getUser(req.params.userId);

    return next();
});


router.patch("/:userId/activate", passport.authenticate("jwt", {session: false}), auth.can("Activate User"), (req, res, next) => {
    res.locals.promise = req.params.user.activate();
    return next();
});

router.patch("/:userId/hold", passport.authenticate("jwt", {session: false}), auth.can("Hold User"), (req, res, next) => {
    res.locals.promise = req.params.user.hold();
    return next();
});

router.patch("/:userId/block", passport.authenticate("jwt", {session: false}), auth.can("Block User"), (req, res, next) => {
    res.locals.promise = req.params.user.block();
    return next();
});


router.param("userId", (req, res, next, userId) => {
    models.User.findById(userId).populate('language')
        .then(user => {
            if (!user) {
                return next(new Error("User Does Not Exist"));
            } else {
                req.params.user = user;
                return next();
            }
        }, err => next(err));
});


    
module.exports = router;