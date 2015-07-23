
var communicateReady = function() {
	console.log('sending message');
	chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        /* ...and send a request for the DOM info... */
        chrome.tabs.sendMessage(
                tabs[0].id,
                {from: 'popup', subject: 'filter'});
    });
};

$(function() {
	var hashtags = {}; //add trending hashtags from twitter
	var keywords = []; //add user input keywords
	$(document).ready(function() {
		var colors = ['red-orange','orange','green','lime','honey','sherbert','grapefruit','watermelon','blue','purple'];
		// request("http://906a26ef48081c60b08f-58945f604110abde655fc3bf34312b67.r15.cf5.rackcdn.com/trends.json",
		// 	function(error, response, body) {
		// 		var raw = JSON.parse(body)[0]["trends"];
		// 		for(x=0; x<raw.length; x++) {
		// 			var trend = raw[x].name;
		// 			var htmlString = '<div class="col-xs-3"><button type="submit" class="btn btn-xs"' + colors[x] + '>' + trend + '</button></div>';
		// 			$('#hashtags').append(htmlString);
		// 		}
		// });

		var populateUserList = function() {
			chrome.storage.sync.get("userBlacklist", function (result) {
				var userList = result.userBlacklist === undefined ? [] : result.userBlacklist;
				if(userList.length === 0) {
					var htmlString = '<div class="row-fluid blocked-keyword"><div class="col-xs-14 center">No blocked keywords. Add a new one!</div></div>';
					$('#user-blacklist').append(htmlString);
				} else {
					for(i = 0; i < userList.length; i++) {
						var htmlString = '<div class="row-fluid blocked-keyword" id="shift-right"><div class="col-xs-7">' + userList[i] + '</div><div class="col-xs-3"><button class="btn btn-xs gray" id="delete">Delete</button></div></div>';
						$('#user-blacklist').append(htmlString);
					}
				}
			});
		};
		populateUserList();
		$(".text-input").keydown(function(event) {
			if (event.keyCode == 13) {
				//this.form.submit();
				submit($(this));
				return false;
			}
		});

		$("body").on('click', '#delete', function() {
			console.log('clicked');
			del($(this));
		});

		$("button").click(function() {
			var hashtag = $(this).text();
			if (!$(this).hasClass('selected')) hashtags[hashtag] = true;
			else hashtags[hashtag] = false;
			$(this).toggleClass('selected');
			$(this).blur();
		});

		var dialColor = '#00CCCC';
		var threshold;

		async.series([
			function (callback) {
				chrome.storage.sync.get("threshold", function (result) {
					if(result.threshold === undefined) {
						chrome.storage.sync.set({
							threshold: 0
						}, function() {
							console.log(threshold);
						});
						threshold = 0;
					} else {
						threshold = result.threshold;
					}
				});
				callback(null, 'failed to grab threshold');
			}, 
			function (callback) {
				$('.dial').val(threshold).trigger('change');

				$(".dial").knob({
					'min': 0,
					'max': 100,
					'width': 180,
					'height': 180,
					'float': 'left',
					'fgColor': dialColor,
					'dynamicDraw': true,
					'thickness': 0.5,
					'tickColorizeValues': true,
					'displayInput': true,
					'release': function(v) {
						chrome.storage.sync.set({
							threshold: v
						}, function() {
							console.log(threshold);
							communicateReady();
						});
					}
				});
				callback(null, 'failed to trigger knob');
			}
		]);

		var colors = {
			0: "#FFC30F",
			1: "#FF794D",
			2: "#794DFF",
			3: "#2BDDE4"
		};

		var del = function(elem) {
			var blockedString = $(elem).parent().siblings().text();
			console.log(blockedString);
			chrome.storage.sync.get("userBlacklist", function (result) {
				var userList = result.userBlacklist;
				var index = userList.indexOf(blockedString);
				userList.splice(index, 1);
				chrome.storage.sync.set({
					userBlacklist: userList
				}, function() {
					console.log('value deleted');
				});
			});
		};



		chrome.storage.onChanged.addListener(function(changes, namespace) {
			if(changes.userBlacklist) {
				$('.blocked-keyword').remove();
				populateUserList();
			}
		});

		var submit = function(elem) {
			var val = $(elem).val();
			keywords.push(val);
			$(elem).val("");
			$(elem).blur();
			chrome.storage.sync.get("userBlacklist", function (result) {
				var currentBlacklist = result.userBlacklist === undefined ? []: result.userBlacklist;
				if(currentBlacklist.indexOf(val) === -1) {
					console.log(currentBlacklist);
					currentBlacklist.push(val);
					chrome.storage.sync.set({
						userBlacklist: currentBlacklist
					}, function() {
						console.log('value added to blacklist');
						communicateReady();
					});
				}
			});
		};
	});
});