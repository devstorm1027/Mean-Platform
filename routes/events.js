const models    = require("../models");
const router    = require("express").Router();

const auth      = require("../util/auth/index");
const passport  = require("passport");
const upload    = require("../config/multer");
const ObjectID  = require('mongodb').ObjectID;

const moment    = require("moment");

const resultHandler    = require("../util/resultHandler")[0]; //hack - we want to process returned data with resultHandler

router.get("/", (req, res, next) => {

    res.locals.promise = models.Event.getEvents();
    return next();
});


//Get N upcoming events
router.get("/upcoming", (req, res, next) => {

    var limit = 30;
    
    //if (req.query.limit) {limit = req.query.limit; }
    
    var now = moment();
    
    res.locals.promise = models.Event.getUpcomingEvents(limit, now);
    
    return resultHandler(req, res, next);
});

//Get all upcoming events from today for 7 next days
router.get("/week", (req, res, next) => {
    
    var limit = 0;
    
    //if (req.query.limit) {limit = req.query.limit; }

    var now = moment(),
        next_seven_days = moment().add(7, 'days')
        ;

    res.locals.promise = models.Event.getUpcomingEvents(limit, now, next_seven_days );

    return resultHandler(req, res, next);
});


router.get("/:status?", (req, res, next) => {

console.log('status');    

    if(req.query.status) {
        res.locals.promise = models.Event.getFilteredEvents(req.query.status);
        return next();
    } else {
        res.locals.promise = models.Event.getEvents();
        return next();
    }
});


router.get("/category/:categoryId", (req, res, next) => {

console.log('categoryId');    

    res.locals.promise = models.Event.getEvents()
        .where('categories')
        .eq( req.params.categoryId)
        ;
    return next();
});

module.exports = router;
