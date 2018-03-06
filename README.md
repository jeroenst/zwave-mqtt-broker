![DomoGeeek](https://github.com/ltoinel/DomoGeeek/raw/master/static/img/logo.jpg "Domogeek")

This module is a gateway between Z-Wave devices and the MQTT broker and takes part from the DomoGeeek project.

This module is based on node-openzwave and allows you to transform Z-Wave messages into MQTT messages.
Works perfectly on a Raspberry Pi with an Aeon Lab Z-Wave USB dongle.

When installing on UBUNTU x64 the library path to the openwave library is
not set.

Add it by executing:
echo "/usr/local/lib64" >> /etc/ld.so.conf
ldconfig

## Install 

```sh
$ npm install
$ vi config.js 
```

You can enable the debug flag to analyze the messages exchanged on the network.


## Test 

```sh
$ ./start.sh
```

By default, each family of messages are sent into specific MQTT topics (alarm, sensor ...).

## Deploy 

```sh
$ sudo npm install pm2 -g
$ ./pm2.sh
$ pm2 startup
$ pm2 save
```



## Installing open-zwave library
https://github.com/OpenZWave/open-zwave

https://github.com/OpenZWave/open-zwave/releases

### OSX

1. Download the most recent [release](https://github.com/OpenZWave/open-zwave/releases) and unzip.
2. `cd` to the unzipped directory and run `make`
3. If make succeeds, run `sudo make install`