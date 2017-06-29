module.exports = function(RED) {
	var Microgear = require("microgear");


    function NetpieMicrogearNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        node.mg = Microgear.create({
        	key    : config.key,
        	secret : config.secret,
        	alias  : config.alias || null
        });

        node.mg.on('connected', function() {
		    node.log('microgear connected');
        	var tarr = config.topics.split(',');
        	for (var i=0; i<tarr.length; i++) {
        		node.log('subscribe to topic: '+tarr[i]);
        		node.mg.subscribe(tarr[i]);
        	}
        	node.status({fill: 'green', shape: 'dot', text: 'connected'});
        });

        node.mg.on('message', function(topic,payload) {
        	var msg = {
        		topic : topic,
        		payload : payload.toString(),
		        raw_payload: payload
        	};
            node.send(msg);
        });

        node.mg.connect(config.appid);

        node.on('input', function(msg) {
        	var topic = '';
        	if (msg.topic && msg.payload) {
        		topic = msg.topic;
        		node.mg.publish(topic, msg.payload);
        	}
        });

		node.on('close', function(done) {
		    node.mg.disconnect();
		    node.log('microgear disconnected');
      		node.status({fill: 'red', shape: 'ring', text: 'disconnected'});

	      	setTimeout(function () {
	      		delete node.mg;
	      		done();
	    	}, 500);
	    });

    }
    RED.nodes.registerType("microgear",NetpieMicrogearNode);
}