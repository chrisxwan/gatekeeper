var Twitter = require('twitter-node-client').Twitter;
var natural = require('natural');
var secrets = require('./secrets.js');
var async = require('async');
var TfIdf = natural.TfIdf;
var tfidf = new TfIdf();

var twitter = new Twitter(secrets.twitter);

 var error = function (err, response, body) {
    console.log('ERROR [%s]', err);
};
var success = function (data) {
    console.log('Data [%s]', data);
};

var filter = function (elt) {
	var text = $(elt).find('p').join(" ");
	tfidf.addDocument(text);
	if(tfidf.tfidf(concatenatedTrends, tfidfCounter) > 1) {
		$(elt).remove();
	}
	tfidfCounter++;
}


var twitterTrends = [];
var concatenatedTrends = "";
var tfidfCounter = 0;

async.series([
	function (callback) {
		twitter.getCustomApiCall('/trends/place.json', { id: 23424977, exclude: 'hashtags' }, error, function (data) {
			var parseJSON = JSON.parse(data)[0]["trends"];
			for(i=0; i < parseJSON.length; i++) {
				console.log(parseJSON[i].name);
				twitterTrends.push(parseJSON[i].name);
			}
		});
		var concatenatedTrends = twitterTrends.join(" ");
		callback(null, 'twitter api failed');
	},
	function (callback) {
		for(i=0; i < twitterTrends.length; i++) {
			var appendString = "<li>" + twitterTrends[i] + "</li>";
			$("#blocked-list").append(appendString);
		}
		$(document).ready(function() {
			var posts = $("[id*='hyperfeed_story_id']");
			for(i = 0; i < posts.length; i++) {
				var currentElt = $(post[i]);
				filter(currentElt);
			}
		});
		callback(null, 'parsing the dom failed');
	}]
);
		




		


/* MUST HAVES */
/** Step 1. Grab Twitter trending tweets globally (excluding hashtags)
  * Step 2. Parse the HTML DOM using jQuery. 
  *         Grab elements with ID substring "hyperfeed_story_id" > Grab p tag > Concatenate
  * Step 3. Use Natural to evaluate similarities
  * Step 4. Write background process to detect AJAX load
  */

/* NICE TO HAVES */
/** 1. Degree of conservatism.
  * 2. Permanent storage by manually adding filters.
  * 3. Display trends in popup.html
  */