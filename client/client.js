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
			Lights.update(that.data._id, {$set: {'state.on': true}});
		},
		onUnchecked: function () {
			Lights.update(that.data._id, {$set: {'state.on': false}});
		}
	});

	this.autorun(function() {
		var data = Template.currentData();
		if (data.state.reachable) {
			checkbox.checkbox('enable');
			if (data.state.on) {
				checkbox.checkbox('check');
			} else {
				checkbox.checkbox('uncheck');
			}
		} else {
			checkbox.checkbox('disable');
		}
	})
}