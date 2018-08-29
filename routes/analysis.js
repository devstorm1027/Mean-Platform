const models        = require("../models");
const router        = require("express").Router();

router.use("/businesses", require("./analysiss/businesses"));
router.use("/articles", require("./analysiss/articles"));
router.use("/events", require("./analysiss/events"));
router.use("/users", require("./analysiss/users"));

module.exports = router;