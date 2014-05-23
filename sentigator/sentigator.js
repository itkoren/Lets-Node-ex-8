// Include The 'sys' Module
var sys = require("sys");

// Include The 'domain' Module
var domain = require("domain");

// Create a new domain execution context
var dmn = domain.create();

// Create a listener/handler for the domains errors
dmn.on("error", function(err) {
    console.error(err);
});

// Execute our logic inside the created domain
dmn.run(function() {

    // Include The 'http' Module
    var http = require("http");

    // Include The 'path' Module
    var path = require("path");

    // Include The 'express' Module
    var express = require("express");

    // Include The 'errorhandler' Module
    var errorhandler = require("errorhandler");

    // Include The 'morgan' Module
    var morgan = require("morgan");

    // Include The 'response-time' Module
    var responseTime = require("response-time");

    // Include The 'routes' Module
    var routes = require("./routes");

    // Include The 'content' Module
    var content = require("./routes/content");

    var app = express();

    if ("development" === app.get("env")) {
        // Gets called in the absence of NODE_ENV too!
        app.use(function (req, res, next) {
            // you always log
            console.error(" %s %s ", req.method, req.url);
            next();
        });
        app.use(morgan({ format: "dev", immediate: true }));
        app.use(errorhandler({ dumpExceptions: true, showStack: true }));
    }
    else if ("production" === app.get("env")) {
        app.use(errorhandler());
    }

    // Set All Environments Application Settings
    app.set("port", process.env.PORT || 8000);
    app.set("ip", process.env.IP || "0.0.0.0");

    app.set("views", path.join(__dirname, "views"));
    app.set("view engine", "jade");
    app.use(express.static(path.join(__dirname, "public")));

    // Add the responseTime middleware
    app.use(responseTime());

    app.use("/", routes);
    app.use("/content", content);

    app.use(function(err, req, res, next){
        console.error(err.stack);
        sys.puts("Caught exception: " + err);

        if (404 === err.status) {
            res.send(404, "** Only Bear Here :) **");
        }
        else {
            res.send(500, "Something broke!");
        }
    });

    // Create the HTTP Server
    var server = http.createServer(app).listen(app.get("port"), app.get("ip"), function () {
        console.log("Express Server Started. Listening on " + server.address().address + " : Port " + server.address().port);
    });
});

process.on("uncaughtException", function (err) {
    console.error((new Date()).toUTCString() + " uncaughtException:", err.message);
    console.error(err.stack);

    sys.puts("Caught exception: " + err);
    process.exit(1);
});