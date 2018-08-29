const models        = require("../../models");
const router        = require("express").Router();

// GET: Number of all Stories
router.get("/", (req, res, next) => {
    models.Event.find().count({},function(err, count){
	    res.send({count: count});
	});
});

// GET: Number of active events
router.get("/active", (req, res, next) => {
    models.Event.find().count({status:"APPROVED"},function(err, count){
	    res.send({count: count});
	});
});

// GET: Number of published events
router.get("/published", (req, res, next) => {
    models.Event.find().count({status:"PUBLISHED"},function(err, count){
	    res.send({count: count});
	});
});

// GET: Number of pending events
router.get("/pending", (req, res, next) => {
    models.Event.find().count({status:"PENDING"},function(err, count){
	    res.send({count: count});
	});
});

module.exports = router;