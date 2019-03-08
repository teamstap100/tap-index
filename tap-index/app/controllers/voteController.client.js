'use strict';

(function () {
    //console.log("Hello, this is the vote controller");

    var API_URL = "/api/votes";
    var USER_VOTES_API_URL = "/api/userVotes";
    var TENANT_API_URL = "/api/tenants";

    var ratings = {};
    var comments = {};

    function checkTenantId() {
        microsoftTeams.getContext(function (context) {
            var tenantId = context["tid"];

            console.log("tenantId is:", tenantId);

            var params = {
                tid: tenantId
                //tid: "asdfasdfasdf"
            }

            ajaxRequest('POST', TENANT_API_URL, params, tenantQueryResult);
        });
    }

    function tenantQueryResult(res) {
        console.log("tenantQueryResult called, res is", res);
        console.log(typeof (res));
        if (res == "null") {
            console.log("res was null");
            console.log("Tenant not whitelisted");
            $('#badTenantModal').modal('show');

            var submitButton = document.getElementById('submit');
            submitButton.disabled = true;
        }
        else {
            return;
        }
    }

    function submitRatings() {
        //console.log(ratings);
        var submitButton = document.getElementById('submit');
        submitButton.disabled = true;

        microsoftTeams.getContext(function (context) {
            var userEmail = context["userPrincipalName"];
            var tenantId = context["tid"];

            console.log(ratings);

            var params = {
                ratings: ratings,
                comments: comments,
                userEmail: userEmail,
                tenantId: tenantId
            };

            ajaxRequest('POST', API_URL, params, function () {
                showBanner();
            });
        });
    }

    function getPreviousRatings() {
        microsoftTeams.getContext(function (context) {
            var userEmail = context["userPrincipalName"];

            var params = {
                userEmail: userEmail
            };

            ajaxRequest('POST', USER_VOTES_API_URL, params, fillPreviousRatings)
        })
    }

    function fillPreviousRatings(votes) {
        votes = JSON.parse(votes);
        console.log("User's previous votes:");
        for (var i = 0; i < votes.length; i++) {
            var areaId = votes[i].areaId;
            var value = votes[i].value;
            if (value == "N/A") {
                continue;
            }

            console.log(areaId + " " + value);

            var radioId = areaId + "-stars-" + value.toString();
            console.log("looking for radio: " + radioId);
            var radio = document.getElementById(radioId);
            //console.log(radio);
            radio.checked = true;

            var comment = votes[i].comment;
            if (comment != null) {
                //console.log("Comment has value: " + comment);
                var commentId = areaId + "-comment-field";
                var commentInput = document.getElementById(commentId);
                commentInput.value = comment;
            }
        }
    }

    function setupBanner() {
    //    $('div.alert.success').hide();
    }

    function showBanner() {
        console.log("showBanner got called");
        $('#success').show();
    }

    function setupRatings() {
        $(':radio').change(function () {
            console.log('New star rating: ' + this.value);

            var areaId;
            if (this.value == "N/A") {
                areaId = this.parentElement.parentElement.id;
            }
            else {
                areaId = this.parentElement.parentElement.parentElement.id;
            }

            //console.log("areaId before replacement: " + areaId);
            areaId = areaId.replace("-stars", "");
            //console.log("areaId is: " + areaId);
            ratings[areaId] = this.value;
        });

        $('.comment').on('input', function () {
            //console.log("New comment: " + this.value);
            var areaId = this.parentElement.id.replace("-comment", "");
            comments[areaId] = this.value;
        });
    }

    function setupButton() {
        var submitButton = document.getElementById('submit');
        submitButton.addEventListener("click", submitRatings);
    }

    function ajaxRequest(method, url, params, callback) {
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                callback(xmlhttp.response);
            }
        };

        xmlhttp.open(method, url, true);
        console.log("Stringified: " + JSON.stringify(params));
        xmlhttp.setRequestHeader('Content-Type', 'application/json');
        xmlhttp.send(JSON.stringify(params));
    }

    document.addEventListener("DOMContentLoaded", function (event) {
        microsoftTeams.initialize();
        checkTenantId();
        setupRatings();
        getPreviousRatings();
        setupButton();
        setupBanner();
    });
})();