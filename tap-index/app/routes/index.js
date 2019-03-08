'use strict';
var express = require('express');
var router = express.Router();
var VoteHandler = require(process.cwd() + '/app/controllers/voteHandler.server.js');

module.exports = function (app, db) {
    var voteHandler = new VoteHandler(db);

    app.route('/')
        .get(voteHandler.getAreas);

    app.route('/results')
        .get(voteHandler.getVotes);

    app.route('/config')
        .get(function (req, res) {
            res.render('config');
        });

    app.route('/api/votes')
        //.get(validationHandler.getValidations)
        .post(voteHandler.addVote);

    app.route('/api/userVotes')
        .post(voteHandler.getUserVotes);

    app.route('/api/tenants')
        .get(voteHandler.getTenants)
        .post(voteHandler.getTenant);

    app.route('/results/tenants/:tId')
        .get(voteHandler.getTenantVotes);

};