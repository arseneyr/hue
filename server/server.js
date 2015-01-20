var username = 'Vp05pRiMTBaO8cYKI5gLzQ';
var api_url;

Meteor.startup(function() {
	Lights.remove({});
	api_url = 'http://' + HTTP.get('https://www.meethue.com/api/nupnp').data[0].internalipaddress + '/api/' + username;

	var initialLights = HTTP.get(api_url + '/lights').data;
	for (var i in initialLights) {
		initialLights[i]._id = i;
		Lights.insert(initialLights[i]);
	}

	Lights.after.update(function(userId, doc) {
		if (doc.state.on != this.previous.state.on) {
			HTTP.put(api_url + '/lights/' + doc._id + '/state', {data: {on: doc.state.on}});
		}
	})

	Meteor.setInterval(function() {
		HTTP.get(api_url + '/lights', function(err, res) {
			if (!err) {
				for (var i in res.data) {
					Lights.direct.update({_id: i}, res.data[i]);
				}
			}
		});
	}, 1000)
})