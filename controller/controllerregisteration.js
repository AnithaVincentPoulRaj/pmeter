var json = require('JSON');
var Promise = require('bluebird');
var reqValidator = require('validator');
var payloadValidator = require('payload-validator');

var modelCommon = require('../model/common');
var commonTopic = require('../route/protocol');
var constantCode = require('../config/constant');
var commonMessage = require('../config/messages');
var responseMessage = require('../utils/response');
var modelLogin = require('../model/loginstatusmodel');
var modelController = require('../model/controllermodel');


var sendDatas = "";
var dynTopic = "";

//Data received from controller if its any error need to throw it into controller
exports.createController = function (message, client) {
	try {
		var req = json.parse(message);
		console.log(req);
    dynTopic = commonTopic.CONTROLLER_CREATION_STATUS+req.mA;
	} catch (exception) {
		console.log('error');

		sendDatas = responseMessage.setControllerResponse(constantCode.BADREQUEST_CODE); 
		exports.publishClientController(dynTopic, json.stringify(sendDatas),client);       
        return false; 
	}
	console.log('proceed to further valdiaitons');
	var chkPayLoadCount  = Object.keys(req).length;
    console.log(chkPayLoadCount);
    var payLoadChkStatus = "";
    console.log('Topic is'+dynTopic);
    if (typeof req.mA == 'undefined' || typeof req.uID == 'undefined' || typeof req.pT == 'undefined' || typeof req.sC == 'undefined') {
        console.log('Invalid Payload');
        sendDatas = responseMessage.setControllerResponse(constantCode.ERROR_CODE);       
        exports.publishClientController(dynTopic, json.stringify(sendDatas),client);
        return false; 
    }
    console.log('Basic validation are success');
    exports.checkUserRegAndActive(req, client,dynTopic).then(function (resActiveCount){
        if (resActiveCount[0].resRegCount > 0) {
            console.log('user is registered');
            if (resActiveCount[0].resLoginCount > 0) {
                console.log('user is active');
                console.log('we can register the controller along with sensor details');
                exports.setController(req, client, dynTopic);
            } else {
                console.log('user is inactive');
                sendDatas = responseMessage.setControllerResponse(constantCode.ERROR_CODE);
                exports.publishClientController(dynTopic, json.stringify(sendDatas),client);
            }
        } else {
              console.log('invalid user');
              sendDatas = responseMessage.setControllerResponse(constantCode.ERROR_CODE);
              exports.publishClientController(dynTopic, json.stringify(sendDatas),client);
        }
    }).error(function (error){
            console.log('createUserRegistration : ' + error);
            sendDatas = responseMessage.setControllerResponse(constantCode.INTERNAL_ERROR_CODE);        
            exports.publishClientController(dynTopic, json.stringify(sendDatas),client);
    }).catch(function (error) {
            console.log('createUserRegistration : ' + error);
            sendDatas = responseMessage.setControllerResponse(constantCode.INTERNAL_ERROR_CODE);        
            exports.publishClientController(dynTopic, json.stringify(sendDatas),client);
    });
};

exports.checkUserRegAndActive = function (req, client, dynTopic) {
return new Promise(function (resolve, reject){
    var userAccAuth = {sql:modelLogin.GET_USER_REG_ACTIVE_SQL, timeout : 5000};
    connection.query(userAccAuth, [req.uID,req.uID], function (err, resData) {
        if (!err) {
            return resolve(resData);
        } else {
             console.log('erroe');
             // need to check timeout condition
             if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
                sendDatas = responseMessage.setControllerResponse(constantCode.INTERNAL_ERROR_CODE);
                exports.publishClientController(dynTopic, json.stringify(sendDatas),client); 
             } else {
                sendDatas = responseMessage.setControllerResponse(constantCode.INTERNAL_ERROR_CODE);
                exports.publishClientController(dynTopic, json.stringify(sendDatas),client);
             }       
        }
    });
});
};

exports.setController = function(req,client,dynTopic) {
    console.log('inserted controller function');
    var pData = "";
    pData = {
        "productType" : req.pT,
        "status" :"0",
        "macAddress" :req.mA
    };
    pData = json.stringify(pData);
    var typUniqID = req.mA+req.ptID;
    var controllerData = {
        USER_ID : req.uID,
        PRODUCT_TYPE : req.pT,
        PRODUCT_SUB_TYPE : req.sC, 
        MACADDRESS : req.mA,
        PRODUCT_NAME : req.sC,
        PRODUCT_TYPE_ID : typUniqID,
        PRODUCT_DATA : pData 
    };

    var sqlConn = {sql:modelController.SET_CONTROLLER_SQL, timeout : 5000};
    connection.query(sqlConn, controllerData, function (err, resultLoginStatus) {
    if (!err) {
        console.log('inserted controller success');
        console.log('Inseterd Id is '+ resultLoginStatus.insertId);
        sendDatas = responseMessage.setControllerResponse(constantCode.SUCCESS_CODE);
        exports.publishClientController(dynTopic, json.stringify(sendDatas),client);
    } else {
        console.log(err);
        if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
              sendDatas = responseMessage.setControllerResponse(constantCode.INTERNAL_ERROR_CODE);
              exports.publishClientController(dynTopic, json.stringify(sendDatas),client);
        } else {
              sendDatas = responseMessage.setControllerResponse(constantCode.INTERNAL_ERROR_CODE);
              exports.publishClientController(dynTopic, json.stringify(sendDatas),client);
        } 
    }
  }); 
};

exports.publishClientController = function(topic, succMsg, client) {
    client.publish(topic, succMsg);
};

