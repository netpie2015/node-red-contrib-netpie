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

    function NetpieWriteFeedNode(config) {
    	var rest = require('restler');
        RED.nodes.createNode(this, config);
        var node = this;
	
	    node.on('input', function(msg) {
	    	var payload = config.dataType=='str'?config.data:(msg[config.data]||'');

console.log('https://api.netpie.io/feed/'+config.feedid+'?apikey='+config.apikey);
console.log("data="+payload.toString());

			rest.put('https://api.netpie.io/feed/'+config.feedid+'?apikey='+config.apikey, {
				headers: {"Content-Type": "text/plain"},
				data: {data: payload.toString()}
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
    RED.nodes.registerType("writefeed",NetpieWriteFeedNode);
}