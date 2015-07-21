var cb = new Codebird;
cb.setConsumerKey("mGzSwh0fSbPx0lGLlo7i48gjf", "8zxb9uOKdfiKihxJTPJpQ0IRTLCo5Pb90u54gszXlruaJbC1BM");
cb.__call(
    "oauth2_token",
    {},
    function (reply) {
        var bearer_token = reply.access_token;
        console.log(bearer_token);
    }
);
cb.setToken("2837808563-l0ExUN9ZVm6yxTHiNSUO3YeBsxgWyY2v4FZeUoE", "DIr7CyN8JeKYtEFmKlQzU2mTqNBCWKdrSRbVaZBJBCREm");


console.log('im here');

var newTimestamp = false;
var twitterTrends = [];
var concatenatedTrends = "";

var communicateReady = function() {
	chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        /* ...and send a request for the DOM info... */
        chrome.tabs.sendMessage(
                tabs[0].id,
                {from: 'popup', subject: 'ready'});
    });
}

var getTrends = function() {
	cb.__call(
	    "trends_place",
	    {
	    	id: "23424977",
	    	exclude: "hashtags"
	    },
	    function (reply) {
			var getTrends  = reply[0]["trends"];
			for(i = 0; i < getTrends.length; i++) {
				twitterTrends.push(getTrends[i].name);
			}
	    },
	    true // this parameter required
	);
}

chrome.storage.sync.get("timestamp", function (result) {
	var now = new Date();
	var thirtyMinutesAgo = new Date(now.getTime() - 30*60000);
	if(result.timestamp === undefined ||
		result.timestamp <  thirtyMinutesAgo) {
		newTimestamp = true;
		async.series([
			function (callback) {
				getTrends();
				callback(null, 'twitter trends failed');
			},
			function (callback) {
				concatenatedTrends = twitterTrends.join(" ");
				chrome.storage.sync.set({
					timestamp: now,
					twitterTrends: twitterTrends,
					concatenatedTrends: concatenatedTrends
				}, communicateReady());
				callback(null, 'storage failed');
			},
			function (callback) {
				$(document).ready(function() {
					for(var i=0; i < twitterTrends.length; i++) {
						var appendString = "<li>" + twitterTrends[i] + "</li>";
						$('ul').append(appendString);
					}
					callback(null, 'failed to append to list');
				})
			}
		]);
	} else {
		communicateReady();
	}
});

$('form').submit(function (event) {
	event.preventDefault();
	var newBlacklist = $('#blacklist').val();
	$('#blacklist').val("");
	var currentBlacklist = [];
	chrome.storage.sync.get("userBlacklist", function (result) {
		currentBlacklist = result.userBlacklist;
		if(currentBlacklist.indexOf(newBlacklist) !== -1) {
			chrome.storage.sync.set({
				userBlacklist: currentBlacklist.append(newBlacklist);
			}, function() {
				console.log('value added to blacklist');
			});
		}
	});
})
