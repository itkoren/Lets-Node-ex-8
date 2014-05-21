// Include The 'request' Module
var request = require("request");

// Include The 'async' Module
var async = require("async");

// Include The 'JSONStream' Module
var jsonStream = require("JSONStream");

// Include The 'event-stream' Module
var eventStream = require("event-stream");

// Include The 'express' Module
var express = require("express");

// Include The 'parser' Module
var parser = require("../lib/parser");

// Initialize a new express router
var router = express.Router();

router.get("/", function(req, res, next) {
    // Handle HTTP Request
    var qs = req.query;

    // Validating existence of query param
    if (qs.term) {
        async.auto({
            twitxy: function (callback) {
                var tweets = [];
                request("http://twitxy.itkoren.com/?lang=en&count=5&term=" + encodeURIComponent(qs.term))
                    .pipe(jsonStream.parse("statuses.*"))
                    .pipe(eventStream.mapSync(function (data) {
                        parser({
                            src: "Twitter",
                            text: data.text,
                            score: 0
                        }, tweets);
                    })).on("error", function (e) {
                        // Deal with errors
                        console.error("Got \"twitxy\" error: " + e.message);
                    }).on("end", function () {
                        console.log("End Of Twitter Search Stream");
                        callback(null, { items: tweets });
                    });
            },
            google: function (callback) {
                var searches = [];
                var hasUTube = false;
                request("http://ajax.googleapis.com/ajax/services/search/web?v=1.0&language=en&resultSize=5&q=" + encodeURIComponent(qs.term))
                    .pipe(jsonStream.parse("responseData.results.*"))
                    .pipe(eventStream.mapSync(function (data) {
                        parser({
                            src: "Google",
                            text: data.title,
                            score: 0
                        }, searches);

                        // Check if in utube
                        if (!hasUTube && -1 !== data.unescapedUrl.indexOf("utube.com")) {
                            hasUTube = true;
                        }
                    })).on("error", function (e) {
                        // Deal with errors
                        console.error("Got \"Google\" error: " + e.message);
                    }).on("end", function () {
                        console.log("End Of Google Search Stream");
                        callback(null, { items: searches, hasUTube: hasUTube });
                    });
            },
            utube: ["google", function (callback, results) {
                var tubes = [];

                if (results.google.hasUTube) {
                    callback(null, tubes);
                }
                else {
                    request("https://gdata.youtube.com/feeds/api/videos?max-results=5&alt=json&orderby=published&v=2&q=" + encodeURIComponent(qs.term))
                        .pipe(jsonStream.parse("feed.entry.*"))
                        .pipe(eventStream.mapSync(function (data) {
                            parser({
                                src: "UTube",
                                text: data.title.$t,
                                score: 0
                            }, tubes);
                        })).on("error", function (e) {
                            // Deal with errors
                            console.error("Got \"UTube\" error: " + e.message);
                        }).on("end", function () {
                            console.log("End Of Utube Search Stream");
                            callback(null, { items: tubes });
                        });
                }
            }]
        },
        // optional callback
        function (err, results) {
            // the results array will equal ['one','two'] even though
            // the second function had a shorter timeout.
            if (err) {
                // Deal with errors
                console.log("Got error: " + e.message);
                res.writeHead(500);
                res.end("** Only Bear Here :) **");
            }
            else {
                var items = results.twitxy.items.concat(results.google.items, results.utube.items);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(items));
            }
        });
    }
    else {
        // No search term supplied, just return
        console.log("Search failed!");
        console.log("Query parameters are missing");
        res.writeHead(500);
        res.end("** Only Bear Here :) **");
    }
});

module.exports = router;