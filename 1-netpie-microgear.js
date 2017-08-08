module.exports = function(RED) {
	var Microgear = require("microgear");

    function NetpieMicrogearNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        if (!config.key || !config.secret || !config.appid) {
            node.error("appid, key and secret are required.");
            return;
        }

        node.mg = Microgear.create({
        	key    : config.key,
        	secret : config.secret,
        	alias  : config.alias || null
        });

        var path = RED.settings.get('userDir') || require('os').homedir()+'/.node-red' ;
        node.cachePath = path+'/'+'microgear-'+node.id+'.token';
        node.mg.setCachePath(node.cachePath);
        node.log("path = "+node.cachePath);

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

        node.mg.on('error', function(msg) {
             node.error(msg);
        });

        if (config.active) {
            node.mg.connect(config.appid);
        }
        else {
            node.status({fill: 'grey', shape: 'ring', text: 'inactive'});
        }

        node.on('input', function(msg) {
        	var topic = '';
            var retained = false;

            if (config.retainType== 'msg') {
                    if (config.retain && msg[config.retain] && msg[config.retain]=='true') retained = true;
            }
            else retained = (config.retain=='true');

        	if (msg.topic && msg.payload) {
                if (msg.topic.substr(0,1)=='/') {
            		topic = msg.topic;
                }
                else {
                    topic = '/gearname/'+msg.topic;
                }
        		node.mg.publish(topic, msg.payload, retained);
        	}
        });

		node.on('close', function(removed, done) {
            function fanalize() {
                setTimeout(function () {
                    delete node.mg;
                    done();
                }, 500);
            }
            node.mg.disconnect();
            node.status({fill: 'red', shape: 'ring', text: 'disconnected'});
            node.log('microgear disconnected');
            if (typeof(removed)=='function') { // handle node-red below v0.17
                done = remove;
                remove = false;
            }
            if (removed) {
                node.log('revoking access token');
                node.mg.resetToken(function() {
                    require('fs').unlinkSync(node.cachePath);
                    fanalize();
                });
            }
            else {
                fanalize();
            }
	    });

    }
    RED.nodes.registerType("microgear",NetpieMicrogearNode);
}