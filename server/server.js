var username = 'Vp05pRiMTBaO8cYKI5gLzQ';
var api_url;

Meteor.startup(function() {
	Lights.remove({});
	Groups.remove({});
	api_url = 'http://' + HTTP.get('https://www.meethue.com/api/nupnp').data[0].internalipaddress + '/api/' + username;

	var initialLights = HTTP.get(api_url + '/lights').data;
	for (var i in initialLights) {
		initialLights[i]._id = i;
		Lights.insert(initialLights[i]);
	}

	var initialGroups = HTTP.get(api_url + '/groups').data;
	for (var i in initialGroups) {
		initialGroups[i]._id = i;
		Groups.insert(initialGroups[i]);
	}

	Lights.after.update(function(userId, doc) {
		if (doc.state.on != this.previous.state.on) {
			HTTP.put(api_url + '/lights/' + doc._id + '/state', {data: {on: doc.state.on, transitiontime: 0}});
		}
	});

	Groups.after.update(function(userId, doc) {
		HTTP.put(api_url + '/groups/' + doc._id + '/action', {data: {on: doc.action.on, transitiontime: 0}});
	});

	Meteor.setInterval(function() {
		HTTP.get(api_url + '/lights', function(err, res) {
			if (!err) {
				for (var i in res.data) {
					Lights.direct.update({_id: i}, res.data[i]);
				}
			}
		});
	}, 1000);
});