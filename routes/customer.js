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

const STATUS_SUCCESS =  true;
const STATUS_FAILED  =  false;

//todo: add authenticate and authorization

/** Create Customer ***/
router.post("/", (req, res, next) => {
    models.Customer.createCustomer(req.body, (err, customer) => {

        if(err) {
            return next(err);
        } else {
            return res.send({
                status: STATUS_SUCCESS,
                message: 'Customer created',
                data: _.omit(customer.toObject(), "password")
            });
        }
    });
});

/** Create user ***/
router.post("/", (req, res, next) => {

    models.User.createUser(req.body, (err, user) => {
        console.log("here 2");
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


/** Update Customer ***/
router.put("/", passport.authenticate("jwt", { session: false }), (req, res, next) => {
    //password will not be updated using this method
    var customerdata = (_.omit(req.body, "password"));
    console.log('body:', customerdata);
    res.locals.promise = req.customer.updateCustomer(customerdata);
    return next();
});


/** Get All Customers ***/
router.get("/customers/all", (req, res, next) => {
    //, passport.authenticate("jwt", { session: false }
    res.locals.promise = models.Customer.getAll();
    return next();
});


/** Customer Login ***/
router.post("/login", passport.authenticate("local", {session: false}), (req, res, next) => {
    console.log("4");
    jwtGenerator.generateJwt(req.user.id, (err, jwt) => err ? next(err) : res.send(jwt));
});


/** Get Customer by id ***/
router.get("/:customerId", (req, res, next) => res.send(req.params.customer) );


/** Get Current Customer ***/
router.get("/", passport.authenticate("jwt", { session: false }), (req, res, next) => {
    models.Customer.findById(req.user._id)
        .then(user => {
            if (!user) {
                return next(new Error("User Does Not Exist"));
            } else {
                return res.send(user)
            }
        }, err => next(err));
});


/** Delete Customer ***/
router.delete("/:customerId",  (req, res, next) => {
    //passport.authenticate("jwt", { session: false }),
    // auth.can("Remove User"),
        res.locals.promise = req.params.customer.removeCustomer();
        return next();
});

router.param("customerId", (req, res, next, customerId) => {

    models.Customer.getCustomer(customerId)
        .then(customer => {
            if(!customer) {
                return next(new Error("Customer Does Not Exist"));
            } else {
                req.params.customer = customer;
                return next();
            }
        }, err => next(err) );
});

module.exports = router;