'use strict';
const constants = require('./constants');
const config = require('../config.js');
const lowerCase = require('lower-case');
const str_replace = require('str_replace');
var mqttdata;

var mqtt;
//todo: move to mongodb
var nodes = [];

var service = {
    onEvent: onEvent,
    onDriverReady: _zwaveLog.bind(null, 'driver ready', 'info'),
    onDriverFailed: onDriverFailed,
    onNodeAdded: onNodeAdded,
    onValueAdded: onValueAdded,
    onValueChanged: onValueChanged,
    onValueRemoved: onValueRemoved,
    onNodeReady: onNodeReady,
    onNotification: onNotification,
    onScanComplete: _zwaveLog.bind(null, 'scan complete', 'info'),
    onControllerCommand: _zwaveLog.bind(null, 'controller command', 'info')
};

module.exports = function zwaveHandlerInit(_mqtt) {
    _zwaveLog('initializing handlers', 'info');
    mqtt = _mqtt;
    return service;
};

function onDriverFailed() {
    _zwaveLog('driver failed', 'error');
    _disconnect();
}

function onNodeAdded(id) {
    nodes[id] = {
        manufacturer: '',
        manufacturerid: '',
        product: '',
        producttype: '',
        productid: '',
        type: '',
        name: '',
        loc: '',
        classes: {},
        ready: false
    };
}

function onEvent(id, value) {
    _mqttPublish(_returnCommandClassString(32), id, value.instance, _returnCommandClassString(32), value, 'event')
}

function onValueAdded(id, comClass, value) {
    if (!nodes[id].classes[comClass]) {
        nodes[id].classes[comClass] = {};
    }
    nodes[id].classes[comClass][value.index] = value;

    _mqttPublish(_returnCommandClassString(comClass), id, value.instance, value.label, value.value, 'value');
}

function onValueChanged(id, comClass, value) {
    onValueAdded(id, comClass, value);
    _zwaveLog('value changed', 'log', id, comClass, value);
}

function onValueRemoved(id, comClass, value) {
    if (nodes[id].classes[comClass] && nodes[id].classes[comClass][index]) {
        delete nodes[id].classes[comClass][index];
    }
}

function onNodeReady(id, info) {
    nodes[id]['manufacturer'] = info.manufacturer;
    nodes[id]['manufacturerid'] = info.manufacturerid;
    nodes[id]['product'] = info.product;
    nodes[id]['producttype'] = info.producttype;
    nodes[id]['productid'] = info.productid;
    nodes[id]['type'] = info.type;
    nodes[id]['name'] = info.name;
    nodes[id]['loc'] = info.loc;
    nodes[id]['ready'] = true;
    console.log('node%d: %s, %s', id,
        info.manufacturer ? info.manufacturer
            : 'id=' + info.manufacturerid,
        info.product ? info.product
            : 'product=' + info.productid +
        ', type=' + info.producttype);
    console.log('node%d: name="%s", type="%s", location="%s"', id,
        info.name,
        info.type,
        info.loc);
    for (var comclass in nodes[id]['classes']) {
        if (nodes[id]['classes'].hasOwnProperty(comclass)) {
            switch (comclass) {
                case 0x25: // COMMAND_CLASS_SWITCH_BINARY
                case 0x26: // COMMAND_CLASS_SWITCH_MULTILEVEL
                    zwave.enablePoll(id, comclass);
                    break;
            }
            var values = nodes[id]['classes'][comclass];
            console.log('node%d: class %d', id, comclass);
            for (var idx in values) {
                if (values.hasOwnProperty(idx)) {
                    console.log('node%d:   %s=%s', id, values[idx]['label'], values[idx]['value']);
                }
            }
        }
    }
}

function onNotification(nodeid, notif) {
    switch (notif) {
        case 0:
            console.log('node%d: message complete', nodeid);
            break;
        case 1:
            console.log('node%d: timeout', nodeid);
            break;
        case 2:
            console.log('node%d: nop', nodeid);
            break;
        case 3:
            console.log('node%d: node awake', nodeid);
            break;
        case 4:
            console.log('node%d: node sleep', nodeid);
            break;
        case 5:
            console.log('node%d: node dead', nodeid);
            break;
        case 6:
            console.log('node%d: node alive', nodeid);
            break;
    }
}

function _disconnect() {
    // mqtt.then(mqtt.end);
    process.exit();
}

function _mqttPublish(topic, id, instance, label, value, action) {
    var message = JSON.stringify({
        label: label,
        value: value,
        action: action,
        timestamp: Date.now()
    });

//    mqtt.then(function (client) {
        var mqttTopic = config.mqtt.topicPrefix+str_replace(" ", "_", lowerCase(id+"/"+instance+"/"+topic+"/"+label+"/"+action));
        var mqttValue =  ""+ value;
        // Only publish when value has changed...
//        if (mqttdata[mqttTopic] != mqttValue)
//        {
            mqtt.publish(mqttTopic, mqttValue, {retain: 1});
//            mqttdata[mqttTopic] = mqttValue;
//        }
  //  });
}

function _returnCommandClassString(id) {
    return constants.commandClass[id] || 'unknown';
}

function _zwaveLog(event, logLevel) {
    var args = Array.prototype.slice.call(arguments, 2, arguments.length);
    console[logLevel](Date.now() + ' zwave: ' + event);

    if (args.length > 0) {
        console[logLevel](args.join(', '));
    }
}