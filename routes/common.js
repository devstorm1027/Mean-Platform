const models = require("../models");
const router = require("express").Router();
const _ = require("lodash");

function getModel(modelname) {
    
    //search for requested model
    var model = _.find(models, function(el, idx){

        if (idx.toLowerCase() == modelname) {
            //console.log('found:', idx );
            return el;
        }
    });
    
    return model;
}

/**
 * get items with given IDs
 * model _populate function must be present
 * @param string model
 */
router.post("/:model/list", (req, res, next) => {


    var modelname = req.params.model.toLowerCase();
    
    if ( ! _.includes(['business', 'event', 'article', 'businesscategory', 'eventcategory'], modelname) ) {
        
        throw "Requested model does not exist";
    }

    var model = getModel(modelname);
    
    res.locals.promise = model.getAll()
        .where('_id').in(req.body)
        ;
    
    return next();
});

/**
 * get items with given tags
 * @param string model
 * @param array req.body
 * @return Promise
 */
router.post("/:model/tags", (req, res, next) => {


    var modelname = req.params.model.toLowerCase();
    
    if ( ! _.includes(['business', 'event', 'article'], modelname) ) {
        
        throw "Requested model does not exist";
    }

    //find corresponding models
    var model = getModel(modelname);
        
    res.locals.promise = model.getAll()
        .where({ tags: { $elemMatch: {$in: req.body } } });
            
    return next();

});


module.exports = router;
