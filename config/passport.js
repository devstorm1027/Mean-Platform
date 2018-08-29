const models = require("../models/");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require("bcryptjs");

passport.use(new LocalStrategy({ usernameField: "email", passwordField: "password" }, (email, password, done) => {
    models.User.findOne({ email: email }).select("+password")
        .then( (user) => {
            if (!user) {
                return done(null, false);
            } else {
                bcrypt.compare(password, user.password, (err, res) => {
                    if (err) { return done(err); }
                    if(res) {
                        return done(null, user);
                    } else {
                        return done(null, false);
                    }
                });
            }
        }, (err) => {
            return done(err);
        });
}));

passport.use(new JwtStrategy({
        secretOrKey: process.env.SERVER_KEY,
        jwtFromRequest: ExtractJwt.fromAuthHeader()
    },
    (credentials, done) => {
        models.User.findById(credentials.userId)
            .then( user => {
                if(!user) {
                    return done(null, false);
                } else {
                    return done(null, user);
                }
            }, err => {
                return done(err);
            })
    }));

passport.use('customer',new LocalStrategy({ usernameField: "email", passwordField: "password" }, (email, password, done) => {
    models.Customer.findOne({ email: email }).select("+password")
        .then( (customer) => {
            if (!customer) {
                return done(null, false);
            } else {
                bcrypt.compare(password, customer.password, (err, res) => {
                    if (err) { console.log("1"); return done(err); }
                    if(res) {
                        return done(null, user);
                    } else {
                        return done(null, false);
                    }
                });
            }
        }, (err) => {
            console.log("2");
            return done(err);
        });
}));

passport.use('customer',new JwtStrategy({
        secretOrKey: process.env.SERVER_KEY,
        jwtFromRequest: ExtractJwt.fromAuthHeader()
    },
    (credentials, done) => {
        models.Customer.findById(credentials.customerId)
            .then( user => {
                if(!user) {
                    return done(null, false);
                } else {
                    return done(null, user);
                }
            }, err => {
                console.log("3");
                return done(err);
            })
    }));

module.exports = passport;