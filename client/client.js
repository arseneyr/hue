var blockUpdate = 0;

Template.main.helpers({
	groups: function() {
		return Groups.find({});
	}
});

Template.main.rendered = function () {
	this.$('.ui.accordion').accordion({exclusive: false});
}

Template.group.helpers({
	lights: function() {
		return Lights.find({_id: {$in: this.lights}});
	}
})

Template.group.rendered = function() {
	var that = this;
	var checkbox = this.$('.title > .ui.checkbox');
	var updateGroup = function(id, action) {
		Groups.update(id, {$set: {'action.on': action}});
		Groups.findOne(id).lights.forEach(function (light) {
			Lights.update(light, {$set: {'state.on': action}});
		})
	};

	checkbox.checkbox({
		fireOnInit: false,
		onChecked: updateGroup.bind(null, that.data._id, true),
		onUnchecked: updateGroup.bind(null, that.data._id, false)
	})	
};

Template.group.events({
	'change .title > .ui.checkbox, click .title > .ui.checkbox': function (event) {
		event.stopPropagation();
	}
})

Template.light.rendered = function() {
	var that = this;
	var checkbox = this.$('.ui.checkbox');
	checkbox.checkbox({
		fireOnInit: false,
		onChecked: function () {
			if (Tracker.currentComputation && Tracker.currentComputation.firstRun) return;
			Lights.update(that.data._id, {$set: {'state.on': true}});
		},
		onUnchecked: function () {
			if (Tracker.currentComputation && Tracker.currentComputation.firstRun) return;
			Lights.update(that.data._id, {$set: {'state.on': false}});
		}
	});

	this.$('.colorPicker')
		.attr('value', hsv2rgb(that.data.state.hue, that.data.state.sat, that.data.state.bri).toString())
		.minicolors({
			control: 'brightness', 
			change: function(hex) {
				var parsedHsl = rgb2hsl(parseInt(hex.substr(1, 2), 16), parseInt(hex.substr(3,2), 16), parseInt(hex.substr(5,2), 16));
				if (!that.holdUp) {
					that.holdUp = true;
					var update = function(hsl) {
						Lights.update(that.data._id, {$set: {'state.hue': hsl.h, 'state.sat': hsl.s, 'state.bri': hsl.l}}, null, function() {
							if (that.pendingHsl) {
								update(that.pendingHsl);
								delete that.pendingHsl;
							} else {
								that.holdUp = false;
							}
						});
					};
					update(parsedHsl);
				} else {
					that.pendingHsl = parsedHsl;
				}
		}});

	this.autorun(function() {
		var data = Template.currentData();
		if (data.state.reachable && checkbox.hasClass('disabled')) {
			checkbox.checkbox('enable');
		} else if (!data.state.reachable && !checkbox.hasClass('disabled')) {
			checkbox.checkbox('disable');
		}

		if (data.state.on && !checkbox.hasClass('checked')) {
			checkbox.checkbox('check');
		} else if (!data.state.on && checkbox.hasClass('checked')){
			checkbox.checkbox('uncheck');
		}
	})
}

function mod(a,b) {
	return ((a % b) + b) % b;
}

function hsv2rgb(h,s,v) {
	function RGB(r,g,b) {
		this.r = Math.min(Math.round(r * 255), 255);
		this.g = Math.min(Math.round(g * 255), 255);
		this.b = Math.min(Math.round(b * 255), 255);
	}

	RGB.prototype.toString = function() {
		return '#' + ('0' + this.r.toString(16)).substr(-2) + ('0' + this.g.toString(16)).substr(-2) + ('0' + this.b.toString(16)).substr(-2);
	}

	v = (v - 1) / 253;
	s = s / 255;
	h /= 10922.5;
	var c = v * s;
	var x = c * (1 - Math.abs(mod(h,2) - 1));
	var m = v - c;
	if (h >= 0 && h < 1) {
		return new RGB(c + m, x + m, m);
	}
	if (h >= 1 && h < 2) {
		return new RGB(x + m, c + m, m);
	}
	if (h >= 2 && h < 3) {
		return new RGB(m, c+m, x+m);
	}
	if (h >= 3 && h < 4) {
		return new RGB(m, x+m, c+m);
	}
	if (h >= 4 && h < 5) {
		return new RGB(x+m, m, c+m);
	}

	return new RGB(c+m, m, x+m);
}

function rgb2hsl(r,g,b) {
	r /= 255;
	g /= 255;
	b /= 255;
	var hsl = {};
	var M = Math.max(r,g,b);
	var m = Math.min(r,g,b);
	var c = M - m;
	if (c == 0) {
		hsl.h = 0;
	} else if (M == r) {
		hsl.h = mod(((g - b) / c), 6);
	} else if (M == g) {
		hsl.h = ((b - r) / c) + 2;
	} else if (M == b) {
		hsl.h = ((r - g) / c) + 4;
	}

	hsl.h = Math.min(Math.round(hsl.h * 10922.5), 65335);
	hsl.l = Math.min(Math.round(M * 253) + 1, 254);
	if (M == 0) {
		hsl.s = 0;
	} else {
		hsl.s = c / M;
	}

	hsl.s = Math.min(Math.round(hsl.s * 255), 255);
	return hsl;
}