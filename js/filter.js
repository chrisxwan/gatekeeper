var natural = require('natural');
var async = require('async');
var sentiment = require('sentiment');
var TfIdf = natural.TfIdf;
var tfidf = new TfIdf();

var tfidfCounter = 0;
var concatenatedTrends = "";
var twitterTrends = [];
var blacklist = [];
var threshold = 0; 


/* Filter the front page posts */
var filterFront = function (elt) {
	var pArray = $(elt).find('p');
	var textArray = [];
	for(x=0; x < pArray.length; x++) {
		textArray[x] = $(pArray[x]).text();
	}
	var text = textArray.join(" ");
	filter(elt, text);
}

/* Given the HTML DOM element and the text to filter,
 * run it through the NLP API and the Sentiment Analysis API 
 * to determine whether it should be hidden */
var filter = function (elt, text){
	var list = blacklist.concat(twitterTrends);
	var concatenatedBlacklist = list.join(" ");
	tfidf.addDocument(text);
	for(j = 0; j < list.length; j++){
		if(tfidf.tfidf(list[j], tfidfCounter) > .05 || sentiment(text).score < threshold-50) {
			$(elt).remove();
			break;
		}
	}
	tfidfCounter++;
}


/* Filter the ticker sidebar */
var filterTicker = function (elt) {
	var text = $(elt).find('.tickerFeedMessage').text();
	filter(elt, text);
}

/* Listen for if the user added something in preferences.
 * If so, filter the feed to account for those changes */
chrome.runtime.onMessage.addListener(function(msg, sender) {
    /* First, validate the message's structure */
    if ((msg.from === 'popup') && (msg.subject === 'filter')) {
    	filterFeed();
    }
});


/* All-purpose function to filter the front page of Facebook */
var filterFeed = function() {
	async.series([
		/* Use this first function to make sure we grab the necessary
		 * items from the database before doing anything else */
		function (callback) {
			chrome.storage.sync.get("userBlacklist", function (result) {
				blacklist = result.userBlacklist;
			});
			callback(null, 'failed to retrieve from db');
			chrome.storage.sync.get("threshold", function (result) {
				threshold = result.threshold;
			});
		},
		function (callback) {
			$(document).ready(function() {
				var posts = $("[id*='hyperfeed_story_id']"); //snipe posts on front page
				for(i = 0; i < posts.length; i++) {
					var currentElt = $(posts[i]);
					filterFront(currentElt);
				}

				var posts = $('.fbFeedTickerBorder'); //snipe posts on ticker
				for(i = 0; i < posts.length; i++) {
					var currentElt = $(posts[i]);
					filterTicker(currentElt);
				}
			});
			callback(null, 'failed to filter');
		}
	]);
};

/* Every single time the DOM changes, filter the feed.
 * This is problematic, though, because it hampers normal
 * Facebook performance since the DOM changes so many times.
 * This hack is mainly used to detect AJAX load and infinite scroll.
 */
MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
var observer = new MutationObserver(function(mutations, observer) {
    // fired when a mutation occurs
    filterFeed();
});


// observer.observe(document, {
//   subtree: true,
//   childList: true
// });

/* On the other hand, here, I can snipe the HTML element of the front page
 * of the Facebook feed and detect for changes here. 
 * I can also snipe the HTML element of the sidebar ticker to detect for changes.
 * Theoretically, this would improve performance, but probably only marginally.
 */


observer.observe(document.getElementById('contentCol'), {
  subtree: true,
  childList: true
});

observer.observe(document.getElementById('pagelet_ticker'), {
	subtree: true,
	childList: true
});





/* Tell background.js to get the Twitter trends */
chrome.runtime.sendMessage({
	message: 'twitter'
}, function(responseText) {
    var raw = JSON.parse(responseText)[0]["trends"];
	for(x=0; x<raw.length; x++) {
		twitterTrends.push(raw[x].name);
		console.log(raw[x].name);
	}
	filterFeed();
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