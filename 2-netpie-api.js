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

    function NetpieAPINode(config) {
    	var rest = require('restler');

        RED.nodes.createNode(this, config);
        var node = this;
	
	    node.on('input', function(msg) {
	    	node.log(JSON.stringify(config));
	    	var auth = config.auth.split(':');

	    	switch (config.resource) {
	    		case 'microgear' :
						rest.put('https://api.netpie.io/microgear/'+config.appid+'/'+msg.topic, {
						  headers: {"Content-Type": "text/plain"},
						  username: auth[0],
						  password: auth[1],
						  data: msg.payload.toString() || '',
						}).on('complete', function(data) {
							var msg = {
				        		topic : "&status",
				        		payload : jsonparse(data),
						        raw_payload: data
				        	};
				            node.send(msg);
						});
	    				break;
	    	}

        });


    }
    RED.nodes.registerType("api",NetpieAPINode);
}