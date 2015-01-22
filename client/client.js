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
	checkbox.checkbox({
		fireOnInit: false,
		onChecked: function () {
			Groups.update(that.data._id, {$set: {'action.on': true}});
		},
		onUnchecked: function () {
			Groups.update(that.data._id, {$set: {'action.on': false}});
		}
	})	
}

Template.group.events({
	'change .ui.accordion > .title > .ui.checkbox': function (event) {
		event.stopPropagation();
	},
	'click .ui.accordion > .title > .ui.checkbox': function (event) {
		event.stopPropagation();
	}
})

Template.light.rendered = function() {
	var that = this;
	var checkbox = this.$('.ui.checkbox');
	checkbox.checkbox({
		fireOnInit: false,
		onChecked: function () {
			that.blockUpdate = true;
			Lights.update(that.data._id, {$set: {'state.on': true}}, null, function() {that.blockUpdate = false;});
		},
		onUnchecked: function () {
			that.blockUpdate = true;
			Lights.update(that.data._id, {$set: {'state.on': false}}, null, function() {that.blockUpdate = false;});
		}
	});

	this.autorun(function() {
		if (that.blockUpdate) {
			return;
		}

		var data = Template.currentData();
		if (data.state.reachable) {
			checkbox.checkbox('enable');
		} else {
			checkbox.checkbox('disable');
		}

		if (data.state.on) {
			checkbox.checkbox('check');
		} else {
			checkbox.checkbox('uncheck');
		}
	})
}