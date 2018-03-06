#!/usr/bin/nodejs

'use strict';

var openzwave = require('openzwave-shared');
var config = require('./config');
var mqtt = require('./libs/mqtt');
mqtt.init(config);
var zwaveHandler = require('./libs/zwave')(mqtt);
var zwave = new openzwave(config.zwave);

var zwaveEvents = {
    'event': 'onEvent',
    'driver ready': 'onDriverReady',
    'driver failed': 'onDriverFailed',
    'node added': 'onNodeAdded',
    'value added': 'onValueAdded',
    'value changed': 'onValueChanged',
    'value removed': 'onValueRemoved',
    'node ready': 'onNodeReady',
    'notification': 'onNotification',
    'scan complete': 'onScanComplete',
    'controller command': 'onControllerCommand'
};

for (var z in zwaveEvents) {
    zwave.on(z, zwaveHandler[zwaveEvents[z]]);
}

process.removeAllListeners('SIGINT');

process.on('SIGINT', function () {
    console.log('disconnecting...');
    zwave.disconnect(config.zwaveBus);
    mqtt.end();
    process.exit();
});

mqtt.setzwave(zwave);
zwave.connect(config.zwaveBus);
