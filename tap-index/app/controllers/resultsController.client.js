'use strict';

(function () {
    function showTable(evt, areaId) {
        var i, tabcontent, tablinks;

        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
            tablinks[i].className = tablinks[i].className.replace(" tab-active", "");
        }

        document.getElementById(areaId).style.display = "block";
        document.getElementById(areaId).className += " active tab-active";
    }

    function showAll() {
        var tablinks = document.getElementsByClassName("tablinks");
        for (var i = 0; i < tablinks.length; i++) {
            var areaId = tablinks[i].id.replace("toggle-", "");
            var tab = document.getElementById(areaId);
            tab.className = "tabcontent";
            tab.style.display = "block";
        }
    }

    function setupTabLinks() {
        var tablinks = document.getElementsByClassName("tablinks");
        for (var i = 0; i < tablinks.length; i++) {
            console.log(tablinks[i]);
            if (tablinks[i].id == "toggle-all") {
                tablinks[i].addEventListener("click", function (event) {
                    showAll();
                })
            } else {
                const areaId = tablinks[i].id.replace("toggle-", "");
                tablinks[i].addEventListener("click", function (event) {

                    showTable(event, areaId);
                })
            }
        }
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
        setupTabLinks();
    });

})();