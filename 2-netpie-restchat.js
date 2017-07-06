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

    function NetpieRESTChatNode(config) {
    	var rest = require('restler');

        RED.nodes.createNode(this, config);
        var node = this;
	
	    node.on('input', function(msg) {
	    	var auth = config.auth.split(':');
	    	var alias = config.aliasType=='str'?config.alias:(msg[config.alias]||'');
	    	var payload = config.payloadType=='str'?config.payload:(msg[config.payload]||'');
			rest.put('https://api.netpie.io/microgear/'+config.appid+'/'+alias, {
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
    RED.nodes.registerType("rest chat",NetpieRESTChatNode);
}