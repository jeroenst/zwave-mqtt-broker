var config = {};

//Debug
config.debug = true;

// MQTT Message Broker 
config.mqtt = {
    uri: 'mqtts://127.0.0.1:8883/',
    options: {
        //username: 'AnUser',
        //password: 'APassword',
        keepalive: 20,
        clean: true,
        clientId: 'zwave2mqtt',
        rejectUnauthorized: false
    }
};

// https://github.com/OpenZWave/open-zwave/wiki/Config-Options
config.zwave = {
    Logging: true, //Enable Logging in the Library or not.
    EnableSIS: true, //Automatically become a SUC if there is No SUC on the network
    ConsoleOutput: true, //Enable log output to stdout (or console)
    SaveConfiguration: true, //When Shutting Down, should the library automatically save the Network Configuration in zwcfg_.xml_
}

// for linux/mac
config.zwaveBus = '/dev/cu.usbmodem1411';

// for windows
// config.zwaveBus = '\\\\.\\COM3';

module.exports = config;