var natural = require('natural');
var secrets = require('./secrets.js');
var async = require('async');
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

var filter = function (elt) {
	var text = $(elt).find('p').toArray().join(" ");
	tfidf.addDocument(text);
	if(tfidf.tfidf(concatenatedTrends, tfidfCounter) > 1) {
		$(elt).remove();
	}
	tfidfCounter++;
}

chrome.runtime.onMessage.addListener(function(msg, sender, response) {
    /* First, validate the message's structure */
    if ((msg.from === 'popup') && (msg.subject === 'ready')) {
    	async.series([
    		function (callback) {
    			chrome.storage.sync.get("concatenatedTrends", function (result) {
    				concatenatedTrends = result.concatenatedTrends;
    			});
    			callback(null, 'failed to retrieve from db');
    		},
    		function (callback) {
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
    }
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