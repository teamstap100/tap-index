'use strict';

var ObjectID = require('mongodb').ObjectID;

function voteHandler(dbParent) {

    // "db.collection is not a function"
    var db = dbParent.db("tap-index");
    var areas = db.collection('areas');
    var tenants = db.collection('tenants');
    var votes = db.collection("votes");

    this.getTenant = function (req, res) {
        var tId = req.body.tid;

        tenants.findOne({ _id: tId }, function (err, result) {
            if (err) { throw err; }
            console.log("Tenant query result was:", result);

            res.json(result);
        });
    }

    this.getTenants = function(req, res) {
        tenants.find({ test: { $exists: false } }).toArray(function(err, results) {
            res.json(results);
        })
    }

    this.getAreas = function (req, res) {

        var dateSort = { date: 1 };

        areas.find({}).sort(dateSort).toArray(function (err, results) {
            if (err) {
                throw err;
            }

            if (results) {
                console.log(results);
                res.render('index', {
                    "areas": results
                });
            } else {
                res.send("Validation with that id not found.");
            }
        });
    };

    this.getUserVotes = function (req, res) {
        var userEmail = req.body.userEmail;

        votes.find({ userEmail: userEmail }).toArray(function (err, votesDoc) {
            console.log(votesDoc);
            res.json(votesDoc);
        });
    }

    function getLastWeek() {
        var today = new Date();
        var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        return lastWeek;
    }

    this.getTenantVotes = function (req, res) {
        var tId = req.params.tId;

        votes.find({ tenantId: tId, timestamp: { $gt: getLastWeek() } }).toArray(function (err, votesDoc) {
            console.log(votesDoc);
            areas.find({}).toArray(function (err, areasDoc) {
                var result = "Users in your tenant submitted " + votesDoc.length;
                if (votesDoc.length == 1) {
                    result += " vote this week.";
                } else {
                    result += " votes this week.";
                }
                if (votesDoc.length > 0) {
                    result += "<table><thead><tr><td><strong>User</strong></td><td><strong>Feature</strong></td><td><strong>Rating</strong></td><td><strong>Comment</strong></td></tr></thead><tbody>"
                    votesDoc.forEach(function (vote) {
                        var areaName = "?"
                        areasDoc.forEach(function (area) {
                            if (area._id == vote.areaId) {
                                areaName = area.name;
                            }
                        })
                        if (vote.comment == null) {
                            vote.comment = "";
                        }
                        result += "<tr><td>" + vote.userEmail + "</td><td>" + areaName + "</td><td>" + vote.value + "</td><td>" + vote.comment + "</td></tr>";
                    })
                    result += "</tbody></table>";
                    result = result.replace(/<td>/g, "<td style='border: 1px black solid;'>")
                }

                res.send(result);
            })

        })
    }

    this.getVotes = function (req, res) {
        var alphaSort = { name: 1 };

        var areaVotes = {};
        var areaComments = {};
        var queriesComplete = 0;
        var areasCount = 99;
        var tenantsCount = 99;

        //var areaResults;
        //var tenantResults;

        function checkFinished(areas, tenants, areaVotes, areaComments) {
            if (queriesComplete == areasCount * tenantsCount) {
                finalRender(areas, tenants, areaVotes, areaComments);
            }
            console.log("QueriesComplete is " + queriesComplete);
        }

        function finalRender(areas, tenants, areaVotes, areaComments) {
            console.log(areas);

            var areaVoteTotal = {};
            var areaVoteCount = {};
            areas.forEach(function (area) {
                var totalSum = 0;
                var totalCount = 0;
                Object.keys(areaVotes[area._id]).forEach(function (votes) {
                    if (!isNaN(areaVotes[area._id][votes][0])) {
                        totalSum += areaVotes[area._id][votes][0];
                        totalCount += 1;
                    } else {
                        console.log("It was NaN so skipping it");
                    }

                    console.log("This vote is: " + areaVotes[area._id][votes][0]);
                    console.log("totalSum is " + totalSum);
                    console.log("totalCount is " + totalCount);
                });
                areaVoteTotal[area._id] = totalSum / totalCount;
                areaVoteCount[area._id] = totalCount;
            })

            console.log(areaComments);

            console.log("Calling res.render");
            res.render('results', {
                "areas": areas,
                "customers": tenants,
                "areaVotes": areaVotes,
                "areaComments": areaComments,
                "areaVoteTotal": areaVoteTotal,
                "areaVoteCount": areaVoteCount,
            });
        }

        

        areas.find({}).sort(alphaSort).toArray(function (err, areaResults) {
            if (err) { throw err; }

            if (areaResults) {
                tenants.find({ test: { $ne: "true" }}).sort(alphaSort).toArray(function (err, tenantResults) {
                    if (err) { throw err; }

                    areasCount = areaResults.length;
                    tenantsCount = tenantResults.length;

                    console.log("areasCount: " + areasCount);

                    areaResults.forEach(function (area) {
                        areaVotes[area._id.toString()] = {};
                        areaComments[area._id.toString()] = {};
                        tenantResults.forEach(function (tenant) {
                            console.log("Area: " + area._id);
                            console.log("Tenant: " + tenant._id);


                            var query = { tenantId: tenant._id, areaId: area._id.toString() }

                            if (tenant.test != "true") {
                                areaVotes[area._id.toString()][tenant._id] = [0, 0, 0, 0, 0, 0];
                                areaComments[area._id.toString()][tenant._id] = [];
                            }
                            

                            votes.find(query).toArray(function (err, voteResults) {
                                if (tenant.test == "true") {
                                    queriesComplete += 1;
                                    checkFinished(areaResults, tenantResults, areaVotes);
                                    return;
                                }


                                console.log(voteResults);
                                var sum = 0;
                                var count = 0;
                                var avg = 0;
                                voteResults.forEach(function (vote) {
                                    areaVotes[area._id.toString()][tenant._id][vote.value] += 1;
                                    count += 1;
                                    sum += parseInt(vote.value);

                                    if (vote.comment != null) {
                                        var comment = {
                                            value: vote.comment,
                                            user: vote.userEmail
                                        };
                                        areaComments[area._id.toString()][tenant._id].push(comment);
                                    }
                                })
                                
                                avg = sum / count;
                                console.log(avg, sum, count);
                                areaVotes[area._id.toString()][tenant._id][0] = avg;
                                // Get the average of the votes. areaVotes[area._id][tenant._id] = [average, #1, #2, #3, #4, #5]
                                queriesComplete += 1;
                                checkFinished(areaResults, tenantResults, areaVotes, areaComments);
                            });
                        });
                    })



                })

            }
        })
    }

    this.addVote = function (req, res) {
        console.log(req.body);
        var ratings = req.body.ratings;
        var comments = req.body.comments;
        var userEmail = req.body.userEmail;
        var tenantId = req.body.tenantId;

        var timestamp = new Date();

        Object.keys(ratings).forEach(function (rating) {
            // Skip N/A votes
            if ((ratings[rating] == "N/A") && (comments[rating] == "")) {
                return;
            }
            var queryDoc = {
                areaId: rating,
                userEmail: userEmail,
                tenantId: tenantId
            }
            var newDoc = {
                areaId: rating,
                value: ratings[rating],
                comment: comments[rating],
                userEmail: userEmail,
                tenantId: tenantId,
                timestamp: timestamp
            }
            console.log(newDoc);

            votes.replaceOne(queryDoc, newDoc, { upsert: true }, function (err, opResult) {
                if (err) { throw err; };

                console.log("Result was: " + opResult);
                res.status(200).end();
            });
        });
    }
}

module.exports = voteHandler;