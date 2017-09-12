var json = require('JSON');
var reqValidator = require('validator');
var payloadValidator = require('payload-validator');

var modelCommon = require('../model/common');
var commonTopic = require('../route/protocol');
var constantCode = require('../config/constant');
var commonMessage = require('../config/messages');
var responseMessage = require('../utils/response');
var payloadChecker = require('../lib/payloadchecker');
var modelLogin = require('../model/loginstatusmodel');

var sendDatas = "";
var userType = "signin";
var signPayLoadCount = 4;
var dTopic = "";
exports.userLogin = function(message, client) {
	try {
		var req = json.parse(message);
		console.log(req);
        dTopic = commonTopic.USER_LOGIN_STATUS+req.macAddress;
	} catch (exception) {
		console.log('error');
		sendDatas = responseMessage.getFailureResponse(constantCode.BADREQUEST_CODE,commonMessage.PAYLOAD_CONTENT_ERROR); 
		exports.publishClientLogin(dTopic, json.stringify(sendDatas),client);       
        return false; 
	}

  	var chkPayLoadCount  = Object.keys(req).length;
  	console.log(chkPayLoadCount);
  	if (signPayLoadCount != chkPayLoadCount || typeof req.mobileNumber == 'undefined' ||  typeof req.password == 'undefined' || typeof req.deviceType == 'undefined' || typeof req.macAddress == 'undefined') {
    	console.log('Invalid Payload');
      	sendDatas = responseMessage.getFailureResponse(constantCode.ERROR_CODE,commonMessage.PAYLOAD_CONTENT_ERROR);
      	exports.publishClientLogin(dTopic, json.stringify(sendDatas),client);
      	return false;
  	}
	var payloadStatus = payloadValidator.validator(req, payloadChecker.userSignInPayload, payloadChecker.userSigninPayloadMand,true);
	if (payloadStatus.success) {
		console.log('correct');
		if (!reqValidator.isNumeric(req.mobileNumber) || !reqValidator.isLength(req.mobileNumber,{min : 10, max : 12})) {
			  console.log('Invalid MobileNumber');
		      sendDatas = responseMessage.getFailureResponse(constantCode.VAL_ERROR_CODE,commonMessage.MOBILENUMBER_ERROR);
		      exports.publishClientLogin(dTopic, json.stringify(sendDatas),client);
		      return false;
		} else if (!reqValidator.isMD5(req.password)) {
			  console.log('Invalid Password');
        	  sendDatas = responseMessage.getFailureResponse(constantCode.VAL_ERROR_CODE,commonMessage.PASSWORD_ERROR);
              exports.publishClientLogin(dTopic, json.stringify(sendDatas),client);
        	  return false;
		} else if (req.deviceType == '' || !reqValidator.isNumeric(req.deviceType) || parseInt(req.deviceType) <=0 || parseInt(req.deviceType) > 3) {
			  console.log('Invalid Device Type');
        	  sendDatas = responseMessage.getFailureResponse(constantCode.VAL_ERROR_CODE,commonMessage.DEVICETYPE_ERROR);
        	  exports.publishClientLogin(dTopic, json.stringify(sendDatas),client);
              return false;
		} else if (req.macAddress == '' || !reqValidator.isAlphanumeric(req.macAddress)) {
			  console.log('Invalid Mac Address');
        	  sendDatas = responseMessage.getFailureResponse(constantCode.VAL_ERROR_CODE,commonMessage.MACADDRESS_ERROR);
        	  exports.publishClientLogin(dTopic, json.stringify(sendDatas),client);
        	  return false;
		}
		console.log('All Basic validations are success');
		exports.checkMobilePswdAvailable(req, client,dTopic);
	} else {
		  console.log('wrong');
 	      sendDatas = responseMessage.getFailureResponse(constantCode.ERROR_CODE,payloadStatus.response.errorMessage);
     	  exports.publishClientLogin(dTopic, json.stringify(sendDatas),client);
	}
};


exports.checkMobilePswdAvailable = function(req, client,dTopic) {
	var usrMobileSql = {sql:modelLogin.CHECK_MOBPSWD_AVAIL_SQL, timeout : 5000};
    connection.query(usrMobileSql, [req.mobileNumber,req.mobileNumber,req.password], function (err, rescheckUserID) {
    console.log(rescheckUserID);
    if (!err) {
    	if (rescheckUserID[0].resMobAvailCount > 0) {
    		if (rescheckUserID[0].resUserID > 0) {
    			console.log('valis user');
    			exports.checkUserAvailCount(req, client, rescheckUserID[0].resUserID,dTopic);
    		} else {
    			console.log('invalid password');
    			sendDatas = responseMessage.getFailureResponse(constantCode.ERROR_CODE,commonMessage.PASSWORD_SIGNIN_ERROR);
                exports.publishClientLogin(dTopic, json.stringify(sendDatas),client);
    		}
    	} else {
    		console.log('Invalid mobile number');
    		sendDatas = responseMessage.getFailureResponse(constantCode.ERROR_CODE,commonMessage.SIGNIN_ERROR);
            exports.publishClientLogin(dTopic, json.stringify(sendDatas),client);
    	}
    } else {
        console.log('error pswd function');
        // need to check timeout condition
        if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
            sendDatas = responseMessage.getFailureResponse(constantCode.INTERNAL_ERROR_CODE,commonMessage.TIMEOUT_DB_ERROR);
            exports.publishClientLogin(dTopic, json.stringify(sendDatas),client);
        } else {
            sendDatas = responseMessage.getFailureResponse(constantCode.INTERNAL_ERROR_CODE,err.toString());
            exports.publishClientLogin(dTopic, json.stringify(sendDatas),client);
        }
    }
    });
};


exports.checkUserAvailCount = function(req, client, loginUserId,dTopic) {
	console.log(loginUserId);
	var usrSql = {sql:modelLogin.CHECK_USER_COUNT_SQL, timeout : 5000};
    connection.query(usrSql, [loginUserId,loginUserId,req.deviceType,req.macAddress], function (err, rescheckUserCount) {
    console.log(rescheckUserCount);
    if (!err) {
    	if (rescheckUserCount[0].resLoginStatusID > 0) {
    		console.log('update login status');
    		exports.updateLoginStatus(req, client, loginUserId, rescheckUserCount[0].resLoginStatusID,dTopic);
    	} else if (rescheckUserCount[0].resUsrActiveCount >= 5) {
    		console.log('user already logged in 5 devices');
    		sendDatas = responseMessage.getFailureResponse(constantCode.ERROR_CODE,commonMessage.ALREADY_LOGIN_ERROR);
            exports.publishClientLogin(dTopic, json.stringify(sendDatas),client);
    	} else {
    		console.log('insert new user in the login status table');
    		exports.insertLoginStatus(req, client, loginUserId,dTopic);
    	}
    } else {
        console.log('error user login function');
        // need to check timeout condition
        if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
            sendDatas = responseMessage.getFailureResponse(constantCode.INTERNAL_ERROR_CODE,commonMessage.TIMEOUT_DB_ERROR);
            exports.publishClientLogin(dTopic, json.stringify(sendDatas),client);
        } else {
            sendDatas = responseMessage.getFailureResponse(constantCode._INTERNAL_ERROR_CODE,err.toString());
            exports.publishClientLogin(dTopic, json.stringify(sendDatas),client);
        }
    }
    });

};

exports.updateLoginStatus = function(req,client,log_User_ID,loginStatusId,dTopic) {
	var userUpateStatusData = {
            USER_ID : log_User_ID,
            USER_DEVICE_TYPE : req.deviceType,
            USER_MAC_ADDRESS : req.macAddress,
            ACTIVE : '1'
    };
    var sqlConn = {sql:modelLogin.UPDATE_USER_LOGIN_STATUS, timeout : 5000};
    connection.query(sqlConn,[userUpateStatusData,log_User_ID,loginStatusId], function (err, resultUserAcc) {
        if (!err) {
            console.log('update success status');
            var userDetails = modelCommon.fetchUserDetails(req, client, log_User_ID, userType,dTopic);
        } else {
        	console.log('erroe update login');
            if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
                sendDatas = responseMessage.getFailureResponse(constantCode.INTERNAL_ERROR_CODE,commonMessage.TIMEOUT_DB_ERROR);
                exports.publishClientLogin(dTopic, json.stringify(sendDatas),client);
            } else {
                sendDatas = responseMessage.getFailureResponse(constantCode.INTERNAL_ERROR_CODE,err.toString());
                exports.publishClientLogin(dTopic, json.stringify(sendDatas),client);
            }
        }
  });
};


exports.insertLoginStatus = function(req, client, loginUserId,dTopic) {
  var userLoginData = {
        USER_ID : loginUserId,
        USER_DEVICE_TYPE : req.deviceType,
        USER_MAC_ADDRESS : req.macAddress
    };
    var sqlConn = {sql:modelLogin.SET_USER_LOGINSTATUS_SQL, timeout : 5000};
    connection.query(sqlConn, userLoginData, function (err, resultLoginStatus) {
    if (!err) {
        console.log('inserted login status success');
        console.log(resultLoginStatus);
        var userDetails = modelCommon.fetchUserDetails(req, client, loginUserId, userType,dTopic);
    } else {
    	console.log('error insert login status');
        if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
              sendDatas = responseMessage.getFailureResponse(constantCode.INTERNAL_ERROR_CODE,commonMessage.TIMEOUT_DB_ERROR);
              exports.publishClientLogin(dTopic, json.stringify(sendDatas),client);
        } else {
              sendDatas = responseMessage.getFailureResponse(constantCode.INTERNAL_ERROR_CODE,err.toString());
              exports.publishClientLogin(dTopic, json.stringify(sendDatas),client);
        }
    }
  });
};


exports.publishClientLogin = function(topic, succMsg, client) {
    client.publish(topic, succMsg);
};