const models        = require("../../models");
const router        = require("express").Router();
const moment        = require("moment");

// GET: Number of all Business
router.get("/", (req, res, next) => {
    models.Business.find().count({},function(err, count){
	    res.send({count: count});
	});
});

// GET: Number of active businesses
router.get("/active", (req, res, next) => {
    models.Business.find().count({status:"APPROVED"},function(err, count){
	    res.send({count: count});
	});
});

// GET: Number of published businesses
router.get("/published", (req, res, next) => {
    models.Business.find().count({status:"PUBLISHED"},function(err, count){
	    res.send({count: count});
	});
});

// GET: Number of pending businesses
router.get("/pending", (req, res, next) => {
    models.Business.find().count({status:"PENDING"},function(err, count){
	    res.send({count: count});
	});
});

//  GET: Number of of businesses (today, this week, this month, this year) 
// $gte: moment().startOf('day').toDate()

router.get("/date", (req, res, next) => {
    
    var promise = {};
    
    // today
    models.Business.find(
        {createdAt: {
                $gte: moment().startOf('day').toDate()
            }
        })
        .count(function(err, count){
            promise.today = count;
        });
    
    // week
    models.Business.find(
        {
            createdAt: {
                $gte: moment().weekday(-7).toDate(),
                $lt: moment().endOf('day').toDate()
            }
        }).count(function(err, count){
            promise.week = count;
	    });
    
    // month
    models.Business.find(
        {createdAt: {
                $gte: moment().weekday(-31).toDate(),
                $lt: moment().endOf('day').toDate()
            }
        })
        .count(function(err, count){
	       promise.month = count;
        });
    
    // year
    models.Business.find(
        {createdAt: {
                $gte: moment().weekday(-365).toDate(),
                $lt: moment().endOf('day').toDate()
            }
        })
        .count(function(err, count){
            promise.year = count;
        })
        .then(function () {
            res.send(promise);
        });

});

module.exports = router;