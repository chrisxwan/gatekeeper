$(function() {
	var hashtags = {}; //add trending hashtags from twitter
	var keywords = []; //add user input keywords
	$(document).ready(function() {
	var populateUserList = function() {
		chrome.storage.sync.get("userBlacklist", function (result) {
			console.log('hi');
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
		$("button").click(function() {
			var hashtag = $(this).text();
			if (!$(this).hasClass('selected')) hashtags[hashtag] = true;
			else hashtags[hashtag] = false;
			$(this).toggleClass('selected');
			$(this).blur();
		$("body").on('click', '#delete', function() {
			console.log('clicked');
			del($(this));
		});
	});
	var dialColor = '#00CCCC';
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
		'release': function(v) {}
	});

	var colors = {
		0: "#FFC30F",
		1: "#FF794D",
		2: "#794DFF",
		3: "#2BDDE4"
	};

	var communicateReady = function() {
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