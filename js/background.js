
/* Get that dank Twitter */
chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    if (request.message == "twitter") {
        var xhttp = new XMLHttpRequest();
        var method = 'GET';
        var url = "http://906a26ef48081c60b08f-58945f604110abde655fc3bf34312b67.r15.cf5.rackcdn.com/trends.json";
        xhttp.onload = function() {
            callback(xhttp.responseText);
        };
        xhttp.open(method, url, true);
        xhttp.send();
        return true; // prevents the callback from being called too early on return
    }
});
