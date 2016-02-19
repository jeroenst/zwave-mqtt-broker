var mqtt = require('mqtt');
var q = require('q');
var rejectEvents = {
  'reconnect':'info',
  'close':'warn',
  'offline':'warn',
  'error':'error'
};

module.exports = function mqttInit(config) {
  var dfr = q.defer();
  _mqttLog('initializing broker','info');
  var client = mqtt.connect(config.mqtt.uri, config.mqtt.options);

  client.on('connect', function(){
    _mqttLog('connect','info');
    dfr.resolve(client);
  });

  client.on('message', _mqttLog.bind(null,'message','log'));

  for (var r in rejectEvents) {
    client.on(r, function(arguments){
      _mqttLog(r, rejectEvents[r], arguments);
      dfr.reject(client);
    });
  }

  return dfr.promise;;
}

function _mqttLog(event, logLevel) {
  var args = Array.prototype.slice.call(arguments, 2, arguments.length);

  console[logLevel](Date.now() + ' mqtt: ' + event);
  if (args.length > 0) {
    console[logLevel](args.join(', '));
  }
}