var json = require('JSON');
var Promise = require('bluebird');
var reqValidator = require('validator');
var payloadValidator = require('payload-validator');

var modelCommon = require('../model/common');
var commonTopic = require('../route/protocol');
var constantCode = require('../config/constant');
var commonMessage = require('../config/messages');
var responseMessage = require('../utils/response');
var payloadChecker = require('../lib/payloadchecker');
var modelUser = require('../model/userregisteration');
var modelLoginStatus = require('../model/loginstatusmodel');

var sendDatas = "";
var regPayLoadCount = 5;
var userType = "register";
var regexName = /^[a-zA-Z ]*$/;
var dTopic = "";

exports.parseUserAccount = function (message, client) {
	try {
		var req = json.parse(message);
		console.log(req);
    dTopic = commonTopic.USER_CREATION_STATUS+req.macAddress;
	} catch (exception) {
		console.log('error');
		sendDatas = responseMessage.getFailureResponse(constantCode.BADREQUEST_CODE,commonMessage.PAYLOAD_CONTENT_ERROR); 
		exports.publishClient(dTopic, json.stringify(sendDatas),client);       
        return false; 
	}
	console.log('excute');
	var chkPayLoadCount  = Object.keys(req).length;
    console.log(chkPayLoadCount);
    var payLoadChkStatus = "";
    if (regPayLoadCount != chkPayLoadCount || typeof req.userName == 'undefined' || typeof req.mobileNumber == 'undefined' || typeof req.password == 'undefined' ||  typeof req.deviceType == 'undefined' || typeof req.macAddress == 'undefined') {
        console.log('Invalid Payload');
        sendDatas = responseMessage.getFailureResponse(constantCode.ERROR_CODE,commonMessage.PAYLOAD_CONTENT_ERROR);       
        exports.publishClient(dTopic, json.stringify(sendDatas),client);
        return false; 
    }

    payLoadChkStatus = payloadValidator.validator(req,payloadChecker.userRegPayload,payloadChecker.userRegPayloadMand,true);
    if (payLoadChkStatus.success) {
        console.log('PayLoad rite');
        if (!reqValidator.isLength(req.userName,{min : 1, max : 30}) || !regexName.test(req.userName)) { 
            console.log('Invalid name');
            sendDatas = responseMessage.getFailureResponse(constantCode.VAL_ERROR_CODE,commonMessage.NAME_ERROR);        
            exports.publishClient(dTopic, json.stringify(sendDatas),client);
            return false;       
        } else if (!reqValidator.isNumeric(req.mobileNumber) || !reqValidator.isLength(req.mobileNumber, {min : 10, max : 12})){
            console.log('Invalid MobileNumber');
            sendDatas = responseMessage.getFailureResponse(constantCode.VAL_ERROR_CODE,commonMessage.MOBILENUMBER_ERROR);        
            exports.publishClient(dTopic, json.stringify(sendDatas),client);
            return false;
        } else if (!reqValidator.isMD5(req.password)){
            console.log('Invalid Password');
            sendDatas = responseMessage.getFailureResponse(constantCode.VAL_ERROR_CODE,commonMessage.PASSWORD_ERROR);        
            exports.publishClient(dTopic, json.stringify(sendDatas),client);
            return false;
        } else if (req.deviceType == '' || !reqValidator.isNumeric(req.deviceType) || parseInt(req.deviceType) <=0 || parseInt(req.deviceType) > 3){
            console.log('Invalid Device Type');
            sendDatas = responseMessage.getFailureResponse(constantCode.VAL_ERROR_CODE,commonMessage.DEVICETYPE_ERROR);        
            exports.publishClient(dTopic, json.stringify(sendDatas),client);
            return false;
        } else if (req.macAddress == '' || !reqValidator.isAlphanumeric(req.macAddress)){
            console.log('Invalid Mac Address');
            sendDatas = responseMessage.getFailureResponse(constantCode.VAL_ERROR_CODE,commonMessage.MACADDRESS_ERROR);        
            exports.publishClient(dTopic, json.stringify(sendDatas),client);
            return false;
        } 
        console.log('All Basic Validation are success');
        exports.checkUserRegMobileNum(req, client,dTopic).then(function (userCountData){
            if (userCountData.userRegCnt > 0) {
                console.log('already reg');
                sendDatas = responseMessage.getFailureResponse(constantCode.ERROR_CODE,commonMessage.MOB_USER_ALRDY_REG);        
                exports.publishClient(dTopic, json.stringify(sendDatas),client);
            } else {
                console.log('we can register');
                exports.createUserAccount(req,client,dTopic);
            }
            }).error(function (error){
                console.log('createUserRegistration : ' + error);
                sendDatas = responseMessage.getFailureResponse(constantCode.INTERNAL_ERROR_CODE,error.toString());        
                exports.publishClient(dTopic, json.stringify(sendDatas),client);
            }).catch(function (error) {
                console.log('createUserRegistration : ' + error);
                sendDatas = responseMessage.getFailureResponse(constantCode.INTERNAL_ERROR_CODE,error.toString());        
                exports.publishClient(dTopic, json.stringify(sendDatas),client);
            });
    } else {
    	console.log('PayLoad wrong');
        sendDatas = responseMessage.getFailureResponse(constantCode.ERROR_CODE,payLoadChkStatus.response.errorMessage);        
        exports.publishClient(dTopic, json.stringify(sendDatas),client);
        return false;
    }
};


exports.checkUserRegMobileNum = function (req,client,dTopic) {
return new Promise(function (resolve, reject){
    var usrMobileSql = {sql:modelUser.GET_MOBILE_LIST_SQL, timeout : 5000};
    connection.query(usrMobileSql, [req.mobileNumber], function (err, resCount) {
        if (!err) {
           // var usrcnt = resCount[0];
            var userCount = resCount[0].recCount;
            console.log('Db result is '+userCount);
            var respFlag = { "userRegCnt" : userCount};
            return resolve(respFlag);
          } else {
             console.log('erroe');
             // need to check timeout condition
             if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
                sendDatas = responseMessage.getFailureResponse(constantCode.INTERNAL_ERROR_CODE,commonMessage.TIMEOUT_DB_ERROR);
                exports.publishClient(dTopic, json.stringify(sendDatas),client); 
             } else {
                sendDatas = responseMessage.getFailureResponse(constantCode.INTERNAL_ERROR_CODE,err.toString());
                exports.publishClient(dTopic, json.stringify(sendDatas),client);
             } 
                      
          }
    });
});
};


exports.createUserAccount = function (req,client,dTopic) {
    var userInsertedData = {
            USER_NAME : req.userName,
            USER_MOBILE_NUMBER : req.mobileNumber,
            USER_PASSWORD : req.password,
            USER_DEVICE_TYPE : req.deviceType,
            USER_MAC_ADDRESS : req.macAddress
    }; 
    console.log('instered data'+userInsertedData);
    var sqlConn = {sql:modelUser.SET_USER_DETAILS_SQL, timeout : 5000};
    connection.query(sqlConn, userInsertedData, function (err, resultUserAcc) {
     if (!err) {
          console.log('inserted success status');
          console.log(resultUserAcc);
          var userAccID = resultUserAcc.insertId;
          console.log('user id is'+ userAccID);
          exports.userLoginStatus(req,client,userAccID,dTopic);
     } else {
          if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
              sendDatas = responseMessage.getFailureResponse(constantCode.INTERNAL_ERROR_CODE,commonMessage.TIMEOUT_DB_ERROR);
              exports.publishClient(dTopic, json.stringify(sendDatas),client); 
          } else {
              sendDatas = responseMessage.getFailureResponse(constantCode.INTERNAL_ERROR_CODE,err.toString());
              exports.publishClient(dTopic, json.stringify(sendDatas),client);
          }  
     }
  });
};
exports.userLoginStatus = function(req,client,userID,dTopic) {
    var userLoginData = {
        USER_ID : userID,
        USER_DEVICE_TYPE : req.deviceType,
        USER_MAC_ADDRESS : req.macAddress 
    };
    var sqlConn = {sql:modelLoginStatus.SET_USER_LOGINSTATUS_SQL, timeout : 5000};
    connection.query(sqlConn, userLoginData, function (err, resultLoginStatus) {
    if (!err) {
        console.log('inserted login status success');
        console.log(resultLoginStatus);
        var userDetails = modelCommon.fetchUserDetails(req, client, userID, userType,dTopic);
    } else {
        if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
              sendDatas = responseMessage.getFailureResponse(constantCode.INTERNAL_ERROR_CODE,commonMessage.TIMEOUT_DB_ERROR);
              exports.publishClient(dTopic, json.stringify(sendDatas),client); 
        } else {
              sendDatas = responseMessage.getFailureResponse(constantCode.INTERNAL_ERROR_CODE,err.toString());
              exports.publishClient(dTopic, json.stringify(sendDatas),client); 
        } 
    }
  }); 
};



exports.publishClient = function(topic, succMsg, client) {
    client.publish(topic, succMsg);
};