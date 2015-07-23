var Twitter = require('twitter-node-client').Twitter;
var fs = require('fs');


var error = function (err, response, body) {
    console.log('ERROR [%s]', err);
};
var success = function (data) {
    console.log('Data [%s]', data);
};

var config = {
	"consumerKey": process.env.consumerKey,
	"consumerSecret": process.env.consumerSecret,
	"accessToken": process.env.accessToken,
	"accessTokenSecret": process.env.accessTokenSecret
};

var twitter = new Twitter(config);

twitter.getCustomApiCall('/trends/place.json', { id: 23424977, exclude: 'hashtags' }, error, function (data) {
	var trendsRaw = JSON.parse(data);
	fs.writeFile("../trends.json", data);
	// var twitterTrends = [];

	// for(i = 0; i < trendsRaw.length; i++) {
	// 	var trend = trendsRaw[i].name;
	// 	twitterTrends.push(trend);
	// 	fs.writeFile("trends.json", trend, "a");
	// }
	// var path = "twitterTrends.txt";
	// fs.write(path, "test", "w");
});

