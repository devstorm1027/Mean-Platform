const models = require("../models");
const router = require("express").Router();
const resultHandler    = require("../util/resultHandler")[0]; //hack - we want to process returned data with resultHandler

router.get("/", (req, res, next) => {
    //, passport.authenticate("jwt", { session: false }
    res.locals.promise = models.Article.getArticles();
    return next();
});

//get businesses all featured bushiness (sponsored or editor choice)
router.get("/featured", (req, res, next) => {

    res.locals.promise = models.Article.getFeatured();
    return resultHandler(req, res, next);
});

router.get("/:status?", (req, res, next) => {

    console.log('status');

    if(req.query.status) {
        res.locals.promise = models.Article.getFilteredArticles(req.query.status);
        return next();
    } else {
        res.locals.promise = models.Article.getArticles();
        return next();
    }
});


module.exports = router;
