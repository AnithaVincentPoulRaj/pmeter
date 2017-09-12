var fs = require('fs');
var mqtt = require('mqtt');
var json = require('JSON');

var commonTopic = require('./route/protocol');
var batchConnection = require('./Batch/batchjob');
//var binController = require('./controller/bincontroller');
var loginController = require('./controller/logincontroller');
var controllerReg = require('./controller/controllerregisteration');
var userController = require('./controller/userregisterationcontroller');

var sendDatas = "";
//var TRUSTED_CA_LIST = fs.readFileSync(__dirname + '/m2mqtt_ca.crt');


var PORT = 1883;
//var HOST = '192.168.2.77';
var HOST = '52.36.175.99';
var options = {
    port: PORT,
    host: HOST,
    // keyPath: KEY,
    // certPath: CERT,
    protocolId: 'MQIsdp',
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

const client = mqtt.connect(options);
var dbconnection = require('./config/dbconfig')
client.on('connect', function(){
    console.log('Connected');
});

client.on('error', function(err){
  console.log(err);
});

// User Registeration App -> Broker
// Resgisteration
client.subscribe(commonTopic.USER_CREATION, function() {
    console.log('subscribed : ', commonTopic.USER_CREATION);
});

// Login
client.subscribe(commonTopic.USER_LOGIN, function() {
  console.log('subscribed : ', commonTopic.USER_LOGIN);
});



// Controller Registeration Controller -> Broker
client.subscribe(commonTopic.CONTROLLER_CREATION, function() {
  console.log('subscribed : ', commonTopic.CONTROLLER_CREATION);
});

//Controller Status -> Broker
client.subscribe(commonTopic.CONTROLLER_STATUS, function() {
  console.log('subscribed : ', commonTopic.CONTROLLER_STATUS);
});

//WEPAPP REPRT 

client.subscribe(commonTopic.CONTROLLER_REPORT, function() {
  console.log('subscribed : ', commonTopic.CONTROLLER_REPORT);
});

client.on('message', function(topic, message, packet) {
      console.log("Received message '" + message + "' on '" + topic + "'");
      if (topic == commonTopic.USER_CREATION) {
        userController.parseUserAccount(message,client);
      } else if (topic == commonTopic.USER_LOGIN) {
        loginController.userLogin(message,client);
      } else if (topic == commonTopic.CONTROLLER_CREATION) {
        controllerReg.createController(message,client);
      } else if (topic == commonTopic.CONTROLLER_STATUS) {
        batchConnection.parseControllerUpdatedDetails(message, client);
      } else if (topic == commonTopic.CONTROLLER_REPORT) {
        batchConnection.getUpdatedControllerReport(message, client);

      }
     // userController.parseUserAccount(message,client);
});
