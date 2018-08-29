
switch(process.env.NODE_ENV) {
    case "TESTING":
        module.exports = "mongodb://localhost:27017/testing";
        break;
    default:
        module.exports = "mongodb://localhost:27017/test"
}