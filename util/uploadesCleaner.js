const fs = require("fs");
const path = require("path");
const imageDeletedEmitter = new require("events")();

imageDeletedEmitter.on("imageRemoved", (path) => {
    fs.unlink(path.join("..", this.path), (err) => {
        //TODO: log
    });
});