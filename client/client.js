Template.main.helpers({
	lights: function() {
		return Lights.find();
	}
});

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