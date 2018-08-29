const _ = require("lodash");

const STATUS_SUCCESS =  true;
const STATUS_FAILED  =  false;

var ret;

const failureHandler = (err, req, res, next) => {

    //console.log('failureHandler:',  err);

    if (res.headersSent) {
        return next(err);
    }
    

    if( req.method == 'GET') {
        
        //use old failureHandler for GET requests
        if(err.__proto__.constructor.name == "MongooseError") {
            return res.status(400).send(err);
        } else {
            return res.status(400).send(err.message);
        }
    }
    
    if(err.__proto__.constructor.name == "MongooseError") {

        ret = {
            status: STATUS_FAILED,
            message: err.message,
            data: err.errors
        };

    }
    else if( err.name == 'MongoError' ) {
        
        ret = {
            status: STATUS_FAILED,
            message: err.message,
            data: err.toJSON()
        };
        
    }
    else {
        
        ret = {
            status: STATUS_FAILED,
            message: err.toString(),
            data: {} //TODO - what can be here?
        };
        
    }

    return res.status(400).send(ret);
    
};

const processGetRequest = (req, res, next) => {

    //console.log('GET reques..');
    res.locals.promise
        .then(result =>  {
            try {
                return res.send(_.omit(result.toObject(), "password"));
            } catch(err) {
                return res.send(result);
            }
        }, err => failureHandler(err, req, res, next))
        .catch(err => {
            //TODO: log
            throw(err);
        });
    
};

const processRequest = (req, res, next) => {

    //console.log('POST reques..');
    
    res.locals.promise
        .then(result =>  {
            try {

                ret = {
                    status: STATUS_SUCCESS,
                    message: '', //TODO
                    data: result
                };
                
            } catch(err) {
                
                //console.log('processRequest err:', err);
                
                ret = {
                    status: STATUS_FAILED,
                    message: err.toString()
                };
            }
            
            return res.send(ret);
            
        }, err => failureHandler(err, req, res, next))
        .catch(err => {
            //TODO: log
            throw(err);
        });
    
};

/** Determine req method (GET/POST/PUT/DELETE) and call corresponding handler
 */
const resultHandler = (req, res, next) => {


    if(!res.locals.promise) {
        return next();
    }

    if( req.method == 'GET') {
        return processGetRequest(req, res, next);
    }
    
    return processRequest(req, res, next);
};


module.exports = [ resultHandler, failureHandler ];