'use strict';

(function () {

    var contentUrl;
    // TESTING
    //contentUrl = "https://08721cbd.ngrok.io";
    // PRODUCTION
    contentUrl = "https://tap-index.azurewebsites.net/";

    function setValid() {
        microsoftTeams.settings.setValidityState(true);
    }

    document.addEventListener("DOMContentLoaded", function (event) {
        microsoftTeams.initialize();
        setValid();
    });

    microsoftTeams.initialize();
    microsoftTeams.settings.registerOnSaveHandler(function (saveEvent) {
        console.log("calling registerOnSaveHandler");
        var settings = {
            entityId: "Teams TAP100 Feature Feedback",
            contentUrl: contentUrl,
            suggestedDisplayName: "Teams TAP100 Feature Feedback",
        }
        console.log(settings);
        microsoftTeams.settings.setSettings(settings);
        saveEvent.notifySuccess();
    });

})();