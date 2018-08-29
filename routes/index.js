const router = require("express").Router();

router.use("/", require("./common"));
router.use("/csv", require("./csv"));

router.use("/user", require("./user"));
router.use("/customer", require("./customer"));
router.use("/signup", require("./signup"));

router.use("/analysis", require("./analysis"));

router.use("/article", require("./article"));
router.use("/articles", require("./articles"));

router.use("/business(es)?", require("./business"));
router.use("/locations?", require("./location"));
router.use("/languages?", require("./language"));

router.use("/event", require("./event"));       //single event
router.use("/events", require("./events"));      //multiple events

router.use("/collections?", require("./collection"));
router.use("/businessCategory", require("./businessCategory"));
router.use("/businessOption", require("./businessOption"));
router.use("/eventCategory", require("./eventCategory"));
router.use("/eventOption", require("./eventOption"));
router.use("/contents?", require("./content"));
router.use("/upload", require("./upload"));
router.use("/", require("./util"));
router.use("/tags?", require("./tag"));
router.use("/systemVariables?", require("./systemVariable"));
router.use("/templates?", require("./template"));
router.use("/contacts?", require("./contact"));

module.exports = router;