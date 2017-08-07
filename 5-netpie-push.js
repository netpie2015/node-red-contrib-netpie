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
	    	var title = config.titleType=='str'?config.title:(msg[config.title]||'');
	    	var payload = config.payloadType=='str'?config.payload:(msg[config.payload]||'');
	    	var titlearg = title?'?title='+title:'';

			rest.post('https://api.netpie.io/push/owner/'+config.target+titlearg, {
				headers: {"Content-Type": "text/plain"},
				username: auth[0],
				password: auth[1],
				data: payload.toString()
			}).on('complete', function(data) {
				var msg = {
	        		topic : "&status",
	        		payload : jsonparse(data),
			        raw_payload: data
	        	};
	            node.send(msg);
			});
        });
    }
    RED.nodes.registerType("push",NetpiePushNode);
}