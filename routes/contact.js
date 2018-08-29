const models = require("../models");
const router = require("express").Router();
const auth = require("../util/auth/index");
const passport = require("passport");

router.get("/", passport.authenticate("jwt", { session: false }),
    auth.can("Get Contacts"), (req, res, next) => {
    res.locals.promise = models.Contact.getContacts();
    return next();
});

router.post("/", (req, res, next) => {
    res.locals.promise = models.Contact.createContact(req.body);
    return next();
});

router.put("/:contactId", passport.authenticate("jwt", { session: false }),
    auth.can("Update Contact"), (req, res, next) => {

    res.locals.promise = req.params.contact.updateContact(req.body);
    return next();
});

router.delete("/:contactId", passport.authenticate("jwt", { session: false }),
    auth.can("Remove Contact"), (req, res, next) => {
    res.locals.promise = req.params.contact.removeContact();
    return next();
});


router.get("/:contactId", passport.authenticate("jwt", { session: false }),
    auth.can("get Contact"), (req, res, next) => res.send(req.params.contact) );

router.put("/:contactId/reply", passport.authenticate("jwt", { session: false }),
    auth.can("Reply Contact"), (req, res, next) => {
        req.body.user = req.user;
        res.locals.promise = req.params.contact.reply(req.body);
        return next();
    });

router.param("contactId", (req, res, next, contactId) => {
    models.Contact.findById(contactId).populate('replies.user')
        .then(contact => {
            if(!contact) {
                return next(new Error("Contact Does Not Exist"))
            } else {
                req.params.contact = contact;
                return next();
            }
        }, err => next(err) );
});



module.exports = router;
