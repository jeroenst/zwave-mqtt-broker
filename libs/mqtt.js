var mqtt = require('mqtt');
var foreach = require('foreach');
var split = require('string-split');

const lowerCase = require('lower-case');
const constants = require('./constants');


var q = require('q');
var rejectEvents = {
    'reconnect': 'info',
    'close': 'warn',
    'offline': 'warn',
    'error': 'error'
};
var zwave;
var client;
module.exports = {
    init: function mqttInit(config, _zwave) {
    var dfr = q.defer();
    zwave = _zwave;
    _mqttLog('initializing broker', 'info');
    client = mqtt.connect(config.mqtt.uri, config.mqtt.options);

    client.on('connect', function () {
        client.subscribe('home/zwave/send/#');
        _mqttLog('connect', 'info');
        dfr.resolve(client);
    });

    //    client.on('message', _mqttLog.bind(null, 'message', 'log'));
    client.on('message', function (topic, message) {
        // message is Buffer
        _mqttLog(message.toString(), 'info')
        var mqttsplit = split("/", topic.toString());
        
        // console.log(mqttsplit);
        console.log("MQTT RECEIVED: "+topic+"="+message);

        var commandclass = 0;
        if (isNaN(mqttsplit[5]))
        {
        foreach(constants.commandClass, function (value, key, array) {
            if (lowerCase(value) == mqttsplit[5]) {
                commandclass = key;
            }
         // console.log (lowerCase(value) + "==" +  mqttsplit[5]);
        });
        }
        else commandclass = parseInt(mqttsplit[5]);

        if (commandclass == 0)
        {
            console.log("Commandclass not found, ignoring...");
            return;
        }
        
        console.log("SENDING TO ZWAVE: NODEID:"+mqttsplit[3]+" INSTANCEID:"+mqttsplit[4]+" COMMANDCLASS="+commandclass+" INDEX="+mqttsplit[6]+" VALUE="+message);


        try
        {        
            if (isNaN(message)) zwave.setValue(parseInt(mqttsplit[3]), commandclass, parseInt(mqttsplit[4]), parseInt(mqttsplit[6]), message);
            else zwave.setValue(parseInt(mqttsplit[3]), commandclass, parseInt(mqttsplit[4]), parseInt(mqttsplit[6]), parseInt(message));
        }
        catch(err) 
        {
            console.log("ERROR SENDING ZWAVE:"+err);
        }
    })    
    
    
    for (var r in rejectEvents) {
        if (rejectEvents.hasOwnProperty(r)) {
            var lg = r;
            var logEvent = rejectEvents[r];
            client.on(r, function (arguments) {
                _mqttLog(lg, logEvent, arguments);
                dfr.reject(client);
            });
        }
    }
    return dfr.promise;
    },

    setzwave: function setzwave(_zwave) {
        zwave = _zwave;
    },
    
    publish: function (topic, message, options)
    {
        console.log ("MQTT PUBLISHING: "+topic+"="+message);
        client.publish(topic, message, options);
    }
} 



function _mqttLog(event, logLevel) {
    var args = Array.prototype.slice.call(arguments, 2, arguments.length);

    console[logLevel](Date.now() + ' mqtt: ' + event);
    if (args.length > 0) {
        console[logLevel](args.join(', '));
    }
}