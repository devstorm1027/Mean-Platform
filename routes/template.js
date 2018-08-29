const models = require("../models");
const router = require("express").Router();
const auth = require("../util/auth/index");
const passport = require("passport");
const upload = require("../config/multer");

router.get("/", passport.authenticate("jwt", { session: false }), (req, res, next) => {
    res.locals.promise = models.EmailTemplate.getTemplates();
    return next();
});

router.post("/", passport.authenticate("jwt", { session: false }),
    auth.can("Create Template"), (req, res, next) => {
    res.locals.promise = models.EmailTemplate.createTemplate(req.body);
    return next();
});

router.put("/:templateId", passport.authenticate("jwt", { session: false }),
    auth.can("Update Template"), (req, res, next) => {

    res.locals.promise = req.params.template.updateTemplate(req.body);
    return next();
});

router.delete("/:templateId", passport.authenticate("jwt", { session: false }),
    auth.can("Remove Template"), (req, res, next) => {
    res.locals.promise = req.params.template.removeTemplate();
    return next();
});

router.delete("/", passport.authenticate("jwt", { session: false }),
    auth.can("Create Template"), (req, res, next) => {
        res.locals.promise = models.EmailTemplate.resetAll();
        return next();
    });

router.get("/:templateId", (req, res, next) => res.send(req.params.template) );

router.put("/:templateId/reset", passport.authenticate("jwt", { session: false }),
    auth.can("Reset Template"), (req, res, next) => {
    res.locals.promise = req.params.template.reset();
    return next();
});

router.param("templateId", (req, res, next, templateId) => {
    models.EmailTemplate.findById(templateId)
        .then(template => {
            if(!template) {
                return next(new Error("Template Does Not Exist"))
            } else {
                req.params.template = template;
                return next();
            }
        }, err => next(err) );
});



module.exports = router;
