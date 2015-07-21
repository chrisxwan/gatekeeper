$(function() {
	var hashtags = [];
	var keywords = [];
	$(document).ready(function() {
		$(".text-input").keydown(function(event) {
			if (event.keyCode == 13) {
				//this.form.submit();
				submit($(this));
				return false;
			}
		});
		$("button").click(function() {
			console.log($(this).text());
			$(this).blur();
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
		'displayInput': false,
		'release': function(v) {}
	});

	var colors = {
		0: "#FFC30F",
		1: "#FF794D",
		2: "#794DFF",
		3: "#2BDDE4"
	};

	var submit = function(elem) {
		var val = $(elem).val();
		keywords.push(val);
		$(elem).val("");
		$(elem).blur();
	};

});