var natural = require('natural');
var secrets = require('./secrets.js');
var async = require('async');
var sentiment = require('sentiment');
var TfIdf = natural.TfIdf;
var tfidf = new TfIdf();


 var error = function (err, response, body) {
    console.log('ERROR [%s]', err);
};
var success = function (data) {
    console.log('Data [%s]', data);
};

var tfidfCounter = 0;
var concatenatedTrends = "";
var twitterTrends = [];
var blacklist = [];
var threshold = 0; 

var filter = function (elt) {
	var pArray = $(elt).find('p');
	var textArray = [];
	for(x=0; x < pArray.length; x++) {
		textArray[x] = $(pArray[x]).text();
	}
	var text = textArray.join(" ");
	var concatenatedBlacklist = blacklist.join(" ");
	console.log(text);
	tfidf.addDocument(text);
	for(j = 0; j < blacklist.length; j++){
		if(tfidf.tfidf(concatenatedBlacklist, tfidfCounter) > .05 || sentiment(text).score < threshold-50) {
			$(elt).remove();
			break;
		}
	}
	tfidfCounter++;
}

chrome.runtime.onMessage.addListener(function(msg, sender) {
    /* First, validate the message's structure */
    if ((msg.from === 'popup') && (msg.subject === 'filter')) {
    	console.log('here');
    	filterFeed();
    }
});

var filterFeed = function() {
	async.series([
		function (callback) {
			chrome.storage.sync.get("userBlacklist", function (result) {
				blacklist = result.userBlacklist;
			});
			callback(null, 'failed to retrieve from db');
			chrome.storage.sync.get("threshold", function (result) {
				threshold = result.threshold;
			});
			console.log(blacklist);
			console.log(threshold);
		},
		function (callback) {
			console.log(blacklist);
			$(document).ready(function() {
				var posts = $("[id*='hyperfeed_story_id']");
				for(i = 0; i < posts.length; i++) {
					var currentElt = $(posts[i]);
					filter(currentElt);
				}
			});
			callback(null, 'failed to filter');
		}
	]);
};

filterFeed();

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
var observer = new MutationObserver(function(mutations, observer) {
    // fired when a mutation occurs
    filterFeed();
    // ...
});
observer.observe(document, {
  subtree: true,
  childList: true
  //...
});

		


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