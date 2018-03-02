module.exports = function(RED) {

	function jsonparse(jstr) {
		try {
			var out = JSON.parse(jstr);
			return out;
		}
		catch(e) {
			return "";
		}
	}

    function NetpiePushNode(config) {
    	var rest = require('restler');

        RED.nodes.createNode(this, config);
        var node = this;
	
	    node.on('input', function(msg) {
	    	var auth = config.auth.split(':');
	    	var body = config.bodyType=='str'?config.body:(msg[config.body]||'');

			var restbody = {
				body: body.toString(),
				title: config.titleType=='str'?config.title:(msg[config.title]||''),
				sound: config.sound || 'default'
			}

	    	switch (config.targetType) {
	    		case '1' :
			    	if (body) {
						rest.put("https://api.netpie.io/push/owner", {
							headers: {"Content-Type": "text/plain"},
							username: auth[0],
							password: auth[1],
							data: JSON.stringify(restbody)
						}).on('complete', function(data) {
							var msg = {
				        		payload : data,
				        	};
				            node.send(msg);
						});
					}
					break;

	    		case '2' :
			    	if (body) {
						rest.put("https://api.netpie.io/push/group/"+config.appGroup, {
							headers: {"Content-Type": "text/plain"},
							username: auth[0],
							password: auth[1],
							data: JSON.stringify(restbody)
						}).on('complete', function(data) {
							var msg = {
				        		payload : data,
				        	};
				            node.send(msg);
						});
					}
					break;

	    		case '3' :
			    	if (body) {
						rest.put("https://api.netpie.io/push/mobiletopic/"+config.mobileAppID+'/'+config.mobileAppTopic, {
							headers: {"Content-Type": "text/plain"},
							username: auth[0],
							password: auth[1],
							data: JSON.stringify(restbody)
						}).on('complete', function(data) {
							var msg = {
				        		payload : data,
				        	};
				            node.send(msg);
						});
					}
					break;
			}
        });
    }
    RED.nodes.registerType("push",NetpiePushNode);
}