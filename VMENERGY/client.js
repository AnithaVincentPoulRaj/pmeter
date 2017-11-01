var mqtt = require('mqtt');
var express = require('express');
var bodyParser = require('body-parser');

var appServer = express();
var appUtility = require('./utils/util');
var apiRoutes = require('./route/api');
var topicProtocol = require('./route/protocol');
var hardwareController = require('./controller/hardwarecontroller');

var options = {
    port: appUtility.mqttPort,
    host: appUtility.appURLHost,
    // keyPath: KEY,
    // certPath: CERT,
    protocolId: 'MQIsdp',
    clientId: 'mqtt_nodeClientServer',
    secureProtocol: 'TLv1_method',
    protocolVersion: 3,
    protocol: 'mqtt',
    rejectUnauthorized : true,
    //The CA list will be used to determine if server is authorized
   // ca: [TRUSTED_CA_LIST],
    checkServerIdentity: function (host, cert) {
      return undefined;
  }
};

appServer.use(bodyParser.urlencoded({extended: false}));
appServer.use(bodyParser.json());
appServer.use(apiRoutes);

const client = mqtt.connect(options);
var dbconnection = require('./config/dbconfig')
appServer.listen(appUtility.appPort,appUtility.appURLLocalHost,function(){
	console.log('serverlistener');
	console.log(appUtility.appPort);
	console.log(appUtility.appURLLocalHost);
	console.log('VMEnergy App server is running @ http://localhost:9090');
});
module.exports = appServer;

client.on('connect', function(){
    console.log('MQTT Connected');
});

client.on('error in connect mqtt', function(err){
  console.log(err);
});

// Controller Registeration Controller -> Broker
client.subscribe(topicProtocol.CONTROLLER_CREATION, function() {
  console.log('subscribed : ', topicProtocol.CONTROLLER_CREATION);
});

// Controller Live Status Controller -> Broker
client.subscribe(topicProtocol.CONTROLLER_STATUS, function() {
  console.log('subscribed : ', topicProtocol.CONTROLLER_STATUS);
});


client.on('message', function(topic, message, packet) {
      console.log("Received message '" + message + "' on '" + topic + "'");
       if (topic == topicProtocol.CONTROLLER_CREATION) {
        hardwareController.createController(message,client);
      } else if (topic == topicProtocol.CONTROLLER_STATUS) {
        hardwareController.getControllerLiveStatus(message,client);
      } 
});
