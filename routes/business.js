const models = require("../models");
const router = require("express").Router();
const auth = require("../util/auth/index");
const passport = require("passport");
const upload = require("../config/multer");

const resultHandler    = require("../util/resultHandler")[0]; //hack - we want to process returned data with resultHandler

router.get("/", (req, res, next) => {
    res.locals.promise = models.Business.getBusinesses();
    return next();
});

router.post("/search", (req, res, next) => {
    var se = req.body.name;
    
    models.Business.find({$or: [{"name.arabic": {'$regex' : se}}, {"name.english": {'$regex' : se}}]})
        .populate('reviews.user')
        .populate({
            path: 'owner',
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
        .populate('comments.user')
        .then(business => {
            if(!business) {
                return next(new Error("Business Does Not Exist"));
            } else {
                res.send(business);
            }
        }, err => next(err) );
});
    
router.get("/rate", (req, res, next) => {
    models.Business.aggregate(
        [
            { "$project": { 
                "ratingsAvg": {$avg: "$ratings.rating" }, 
                "owner": '$owner',
                "name": '$name',
                "logo": '$logo',
                "cover": '$cover',
                "description": '$description',
                "website": '$website',
                "socialMedias": '$socialMedias',
                "photos": '$photos',
                "ownershipDocument": '$ownershipDocument',
                "tags": '$tags',
                "editorPick": '$editorPick',
                "isSponsored": '$isSponsored',
                "branches": '$branches',
                "categories": '$categories',
                "options": '$options',
                "reviews": '$reviews',
                "status": '$status',
                "ratings": '$ratings',
                "collections": '$collections',
                
            }}
        ],
        function(err,result) {
            models.Business
                .populate(result, {"path": "categories", populate: {path: 'perent'} },
                /*.populate(result, {"path": 'reviews.language'})
                .populate(result, {"path": 'reviews.user'})
                .populate(result, {"path": 'reviews.user', populate: {path: 'language'}})
                .populate(result, {
                    path: 'categories',
                    populate: {
                        path: 'parent',
                        populate: {
                            path: 'parent'
                        }
                    }
                })
                .populate(result, 'options')
                .populate(result, 'comments.language')
                .populate(result, 'comments.user'),*/
                function(err, result) {
                    res.send(result)
                });
        }
    );
});

//get top 10 bushiness based high rating
router.get("/toprated", (req, res, next) => {

    var limit = 10;
    
    res.locals.promise = models.Business.getTopratedBusinesses(limit);

    return resultHandler(req, res, next);
});

//get businesses all featured bushiness (sponsored or editor choice)
router.get("/featured", (req, res, next) => {

    res.locals.promise = models.Business.getFeatured();

    return resultHandler(req, res, next);
});

router.post("/", passport.authenticate("jwt", { session: false }),
    auth.can("Create Business"),
    upload.single("logo"),
    (req, res, next) => {
        
        req.body.owner = req.user;
        if(req.file) req.body.logo = { filename: req.file.filename };
        //if(req.cover) req.body.cover = { filename: req.cover.filename };

    res.locals.promise = models.Business.createBusiness(req.body);
    return next();
});

router.put("/:businessId", passport.authenticate("jwt", { session: false }),
    auth.can("Update Business"), upload.single("logo"), (req, res, next) => {
    if(req.file) req.body.logo = { filename: req.file.filename };

    res.locals.promise = req.params.business.updateBusiness(req.body);
    return next();
});

router.delete("/:businessId", passport.authenticate("jwt", { session: false }),
    auth.can("Delete Business"), (req, res, next) => {
        res.locals.promise = req.params.business.removeBusiness();
    return next();
});

router.get("/:businessId", (req, res, next) => res.send(req.params.business) );


router.get("/city/:cityName", (req, res, next) => {

    var _ret = models.Business
        .getBusinessesByCity(req.params.cityName)
        .sort({'isSponsored': 'asc'})
        ;

    if (req.query.status) {

        res.locals.promise =  _ret
            .where('status')
            .eq( req.query.status )
            ;
        
    }
    else {
    
        res.locals.promise =  _ret;
    }
    
    return next();
});


router.get("/category/:categoryId", (req, res, next) => {

    var _ret = models.Business
        .getBusinessesByCategory(req.params.categoryId)
        .sort({'isSponsored': 'asc'})
        ;

    if (req.query.status) {

        res.locals.promise =  _ret
            .where('status')
            .eq( req.query.status )
            ;
        
    }
    else {
    
        res.locals.promise =  _ret;
    }
    
    return next();
});

router.get("/:status?", (req, res, next) => {
    if(req.query.status) {
        res.locals.promise = models.Business.getFilteredBusinesses(req.query.status);
        return next();
    } else if(req.query.category) {
        res.locals.promise = models.Business.getBusinessesByCategory(req.query.category);
        return next();
    }else {
        res.locals.promise = models.Business.getBusinesses();
        return next();
    }
});



router.post("/search", (req, res, next) => {
    res.locals.promise = models.Business.searchBusinesses(req.body);
    return next();
});


router.post("/:businessId/socialMedia", passport.authenticate("jwt", { session: false }),
    auth.can("Add Business Social Media"), (req, res, next) => {
        res.locals.promise = req.params.business.addSocialMedia(req.body);
    return next();
});

router.delete("/:businessId/socialMedia/:socialMediaId", passport.authenticate("jwt", { session: false }),
    auth.can("Remove Business Social Media"), (req, res, next) => {
        res.locals.promise = req.params.business.removeSocialMedia(req.params.socialMediaId);
    return next();
});

//TODO: set a limit of the number of uploads
router.post("/:businessId/photo", upload.array("photo"), passport.authenticate("jwt", { session: false }),
    auth.can("Add Business Photo"), (req, res, next) => {
    try {
        res.locals.promise = req.params.business.addPhoto(req.files.map(photo => ({ filename: photo.filename }) ));
        return next();
    } catch(err) {
        return next(new Error("You Should Use Form-Data Encoding Only With This End Point"));
    }
});

router.delete("/:businessId/photo/:photoId", passport.authenticate("jwt", { session: false }),
    auth.can("Delete Business Photo"), (req, res, next) => {
    res.locals.promise = req.params.business.removePhoto(req.params.photoId);
    return next();
});


router.post("/:businessId/tag", passport.authenticate("jwt", { session: false }),
    auth.can("Add Business Tag"), (req, res, next) => {
    res.locals.promise = req.params.business.addTag(req.body);
    return next();
});

router.delete("/:businessId/tag/:tag", passport.authenticate("jwt", { session: false }),
    auth.can("Delete Business Tag"), (req, res, next) => {
    res.locals.promise = req.params.business.removeTag(req.params.tag);
    return next();
});


router.post("/:businessId/branch", passport.authenticate("jwt", { session: false }),
    auth.can("Add Business Branch"), (req, res, next) => {
    res.locals.promise = req.params.business.addBranch(req.body);
    return next();
});

router.delete("/:businessId/branch/:branchId", passport.authenticate("jwt", { session: false }),
    auth.can("Delete Business Branch"), (req, res, next) => {
    res.locals.promise = req.params.business.removeBranch(req.params.branchId);
    return next();
});


router.post("/:businessId/category", passport.authenticate("jwt", { session: false }),
    auth.can("Add Business Category"), (req, res, next) => {
    res.locals.promise = req.params.business.addCategory(req.body.category);
    return next();
});

router.delete("/:businessId/category/:categoryId", passport.authenticate("jwt", { session: false }),
    auth.can("Remove Business Category"), (req, res, next) => {
    res.locals.promise = req.params.business.removeCategory(req.params.categoryId);
    return next();
});


router.post("/:businessId/option", passport.authenticate("jwt", { session: false }),
    auth.can("Add Business Option"), (req, res, next) => {
    res.locals.promise = req.params.business.addOption(req.body);
    return next();
});

router.delete("/:businessId/option/:optionId", passport.authenticate("jwt", { session: false }),
    auth.can("Delete Business Option"), (req, res, next) => {
    res.locals.promise = req.params.business.removeOption(req.params.optionId);
    return next();
});


router.post("/:businessId/review", passport.authenticate("jwt", { session: false }),
    auth.can("Add Business Review"), (req, res, next) => {
    req.body.user = req.user;
    //console.log(req.body);
    res.locals.promise = req.params.business.addReview(req.body);
    return next();
});

router.delete("/:businessId/review/:reviewId", passport.authenticate("jwt", { session: false }),
    auth.can("Remove Business Review"), (req, res, next) => {
    res.locals.promise = req.params.business.removeReview(req.params.reviewId);
    return next();
});

router.post("/:businessId/review/:reviewId/comment", passport.authenticate("jwt", { session: false }),
    auth.can("Comment Business Review"), (req, res, next) => {
    req.body.user = req.user;

    try {
        res.locals.promise = req.params.business.addCommentToReview(req.params.reviewId, req.body);
        return next();
    } catch(err) {
        return next(new Error("Review Does Not Exist"));
    }
});

router.delete("/:businessId/review/:reviewId/comment/:commentId", passport.authenticate("jwt", { session: false }),
    auth.can("Remove Comment On Business Review"), (req, res, next) => {
    try {
        res.locals.promise = req.params.business.removeCommentFromReview(req.params.reviewId, req.params.commentId);
        return next();
    } catch(err) {
        return next(new Error("Review Does Not Exist"));
    }
});


router.post("/:businessId/rating", passport.authenticate("jwt", { session: false }),
    auth.can("Add Business Rating"), (req, res, next) => {
    req.body._id = req.user;

    res.locals.promise = req.params.business.addRating(req.body);
    return next();
});

router.delete("/:businessId/rating", passport.authenticate("jwt", { session: false }),
    auth.can("Remove Business Rating"), (req, res, next) => {
    res.locals.promise = req.params.business.removeRating(req.user);
    return next();
});


router.post("/:businessId/collection", passport.authenticate("jwt", { session: false }),
    auth.can("Add Business Collection"), (req, res, next) => {
    res.locals.promise = req.params.business.addCollection(req.body.collection);
    return next();
});

router.delete("/:businessId/collection/:collectionId", passport.authenticate("jwt", { session: false }),
    auth.can("Remove Business Collection"), (req, res, next) => {
    res.locals.promise = req.params.business.removeCollection(req.params.collectionId);
    return next();
});


router.param("businessId", (req, res, next, bossinessId) => {
    models.Business.findById(bossinessId) //TODO: rewrite it
        .populate('reviews.user')
        .populate({
            path: 'owner',
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
        .populate('comments.user')
        .then(business => {
            if(!business) {
                return next(new Error("Business Does Not Exist"));
            } else {
                req.params.business = business;
                return next();
            }
        }, err => next(err) );
});


module.exports = router;
