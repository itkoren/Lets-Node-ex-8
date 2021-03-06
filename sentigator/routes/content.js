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
var Parser = require("../lib/parser");

// Initialize a new express router
var router = express.Router();

router.get("/", function(req, res, next) {
    // Handle HTTP Request
    var qs = req.query;

    // Validating existence of query param
    if (qs.term) {
        async.auto({
            twitxy: function (callback) {
                var parser = new Parser();
                request("http://twitxy.itkoren.com/?lang=en&count=5&term=" + encodeURIComponent(qs.term))
                    .pipe(jsonStream.parse("statuses.*"))
                    .pipe(eventStream.mapSync(function (data) {
                        parser.parse({
                            src: "Twitter",
                            text: data.text,
                            score: 0
                        });
                    })).on("error", function (e) {
                        // Deal with errors
                        console.error("Got \"twitxy\" error: " + e.message);
                    }).on("end", function () {
                        console.log("End Of Twitter Search Stream");
                        callback(null, { items: parser.getItems() });
                    });
            },
            google: function (callback) {
                var parser = new Parser();
                var hasUTube = false;
                request("http://ajax.googleapis.com/ajax/services/search/web?v=1.0&language=en&resultSize=5&q=" + encodeURIComponent(qs.term))
                    .pipe(jsonStream.parse("responseData.results.*"))
                    .pipe(eventStream.mapSync(function (data) {
                        parser.parse({
                            src: "Google",
                            text: data.title,
                            score: 0
                        });

                        // Check if in utube
                        if (!hasUTube && -1 !== data.unescapedUrl.indexOf("youtube.com")) {
                            hasUTube = true;
                        }
                    })).on("error", function (e) {
                        // Deal with errors
                        console.error("Got \"Google\" error: " + e.message);
                    }).on("end", function () {
                        console.log("End Of Google Search Stream");
                        callback(null, { items: parser.getItems(), hasUTube: hasUTube });
                    });
            },
            utube: ["google", function (callback, results) {
                var parser = new Parser();

                if (results.google.hasUTube) {
                    callback(null, parser.getItems());
                }
                else {
                    request("https://gdata.youtube.com/feeds/api/videos?max-results=5&alt=json&orderby=published&v=2&q=" + encodeURIComponent(qs.term))
                        .pipe(jsonStream.parse("feed.entry.*"))
                        .pipe(eventStream.mapSync(function (data) {
                            parser.parse({
                                src: "UTube",
                                text: data.title.$t,
                                score: 0
                            });
                        })).on("error", function (e) {
                            // Deal with errors
                            console.error("Got \"UTube\" error: " + e.message);
                        }).on("end", function () {
                            console.log("End Of Utube Search Stream");
                            callback(null, { items: parser.getItems() });
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
                console.log("Got error: " + err.message);
                res.send(500, "** Only Bear Here :) **");
            }
            else {
                var items = results.twitxy.items.concat(results.google.items, results.utube.items);
                res.set({ "Content-Type": "application/json" });
                res.send(200, items);
            }
        });
    }
    else {
        // No search term supplied, just return
        console.log("Search failed!");
        console.log("Query parameters are missing");
        res.send(500, "** Only Bear Here :) **");
    }
});

module.exports = router;