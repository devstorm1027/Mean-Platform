const models        = require("../../models");
const router        = require("express").Router();

// GET: Number of all Stories
router.get("/", (req, res, next) => {
    models.Article.find().count({},function(err, count){
	    res.send({count: count});
	});
});

// GET: Number of active stories
router.get("/active", (req, res, next) => {
    models.Article.find().count({status:"APPROVED"},function(err, count){
	    res.send({count: count});
	});
});

// GET: Number of published stories
router.get("/published", (req, res, next) => {
    models.Article.find().count({status:"PUBLISHED"},function(err, count){
	    res.send({count: count});
	});
});

// GET: Number of pending stories
router.get("/pending", (req, res, next) => {
    models.Article.find().count({status:"PENDING"},function(err, count){
	    res.send({count: count});
	});
});

module.exports = router;