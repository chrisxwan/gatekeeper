/* Tell filter.js to do its job */
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
		/* Get the Twitter trends */
		setTimeout(function() {
			chrome.runtime.sendMessage({
				message: 'twitter'
			}, function(responseText) {
			    var raw = JSON.parse(responseText)[0]["trends"];
			    chrome.storage.sync.get("getTwitter", function (result) {
			    	var colors = ['gray', 'gray', 'gray', 'gray', 'gray', 'gray', 'gray', 'gray', 'gray', 'gray'];
			    	if(result.getTwitter === undefined) {
			    		chrome.storage.sync.set({
			    			getTwitter: false
			    		}, function() {
			    			console.log('twitter initialized to false');
			    		});
			    	} else if(result.getTwitter === true) {
			    		colors = ['palette-1', 'palette-2', 'palette-3', 'palette-4', 'palette-5', 'palette-6', 'palette-7', 'palette-8', 'palette-9', 'palette-10'];	
			    	}
			    	for(x=0; x<raw.length; x++) {
						var trend = raw[x].name;
						var c = "btn btn-xs " + colors[x];
						console.log(c);
						var htmlString = '<div class="col-xs-6"><button type="submit" class="btn btn-xs trend ' + colors[x] + '">' + trend + '</button></div>';
						$('#hashtags').append(htmlString);
						console.log(htmlString);
					}
			    });
			});
		}, 140);

		$('.cmn-toggle-round').click(function() {
			console.log('clicked');
		});

		/* Populate the user blacklists in the UI */
		var populateUserList = function() {
			chrome.storage.sync.get("userBlacklist", function (result) {
				var userList = result.userBlacklist === undefined ? [] : result.userBlacklist;
				if(userList.length === 0) {
					var htmlString = '<div class="row-fluid blocked-keyword"><div class="col-xs-14 center">No blocked keywords. Add a new one!</div></div>';
					$('#user-blacklist').append(htmlString);
				} else {
					for(i = 0; i < userList.length; i++) {
						var htmlString = '<div class="row-fluid blocked-keyword" id="shift-right"><div class="col-xs-7">' + userList[i] + '</div><div class="col-xs-3"><button class="btn btn-xs delete-color" id="delete">Delete</button></div></div>';
						$('#user-blacklist').append(htmlString);
					}
				}
			});
		};
		populateUserList();

		/* Submit new blacklist */
		$(".text-input").keydown(function(event) {
			if (event.keyCode == 13) {
				//this.form.submit();
				submit($(this));
				return false;
			}
		});

		/* Delete blacklist in UI */
		$("body").on('click', '#delete', function() {
			console.log('clicked');
			del($(this));
		});

		/* TODO */ 
		$("button").click(function() {
			var hashtag = $(this).text();
			if (!$(this).hasClass('selected')) hashtags[hashtag] = true;
			else hashtags[hashtag] = false;
			$(this).toggleClass('selected');
			$(this).blur();
		});


		/* Settings for dial bar */
		var dialColor = '#00CCCC';
		var threshold;

		chrome.storage.sync.get("threshold", function (result) {
			if(result.threshold === undefined) {
				chrome.storage.sync.set({
					threshold: 0
				}, function() {
					console.log(threshold);
				});
				threshold = 0;
				$('.dial').val(threshold).trigger('change');
			} else {
				threshold = result.threshold;
				$('.dial').val(threshold).trigger('change');
			}
		});
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


		/* Delete from the user blacklist */
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


		/* If the user blacklist was updated, then we need to update the UI as wel */
		chrome.storage.onChanged.addListener(function(changes, namespace) {
			if(changes.userBlacklist) {
				$('.blocked-keyword').remove();
				populateUserList();
			}
		});

		/* Add to user blacklist, then tell filter.js to filter again */
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