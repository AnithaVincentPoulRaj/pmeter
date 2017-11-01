var Promise = require('bluebird');
var reqValidator = require('validator');
var payloadValidator = require('payload-validator');

var regexName = /^[a-zA-Z ]*$/;

var modelUser = require('../model/user');
var code = require('../config/constant');
var message = require('../config/message');
var respJSON = require('../utils/response');
var payLoadChecker = require('../lib/payloadchecker');

var sendDatas = '';
var regPayLoadCount = 6;
var signPayLoadCount = 5;
/*
 Function Name : createUser
 Description  : User Registeration From Mobile Apps
 Params : {"userName" :"xxxx","mobileNumber" : "numericonly","password" :"md5","deviceToken" :"","deviceType":"1/2/3","deviceID":"macaddress"}
 Author : iExemplar
 Created on : 20/10/2017
 Updated on :
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.createUser = function (req, res) {
	var payLoadChkStatus = "";
  	console.log(req.body);
  	if (req.body == '') {
      console.log('payload not correct');
      sendDatas = respJSON.getFailureResponse(code.API_BADREQUEST,message.BADREQUEST_ERROR,message.PAYLOAD_CONTENT_ERROR);        
      res.send(sendDatas);
      return false; 
  }
  var chkPayLoadCount  = Object.keys(req.body).length;
  console.log('PayLoad Count is ' + chkPayLoadCount);
  if (regPayLoadCount != chkPayLoadCount || typeof req.body.userName == 'undefined' || typeof req.body.mobileNumber == 'undefined' || typeof req.body.password == 'undefined' || typeof req.body.deviceToken == 'undefined' || typeof req.body.deviceType == 'undefined' || typeof req.body.deviceID == 'undefined') {
    console.log('Invalid Payload');
    sendDatas = respJSON.getFailureResponse(code.API_ERROR_CODE,message.PAYLOAD_ERROR,message.PAYLOAD_CONTENT_ERROR);       
    res.send(sendDatas);
    return false; 
  }
  payLoadChkStatus = payloadValidator.validator(req.body,payLoadChecker.userRegPayload,payLoadChecker.userRegPayloadMand,true);
  if (payLoadChkStatus.success) {
  	 if (!reqValidator.isLength(req.body.userName,{min : 1, max : 30}) || !regexName.test(req.body.userName)) { 
        console.log('Invalid name');
        sendDatas = respJSON.getFailureResponse(code.API_VAL_ERROR,message.VALIDATION_ERROR,message.NAME_ERROR);        
        res.send(sendDatas);
        return false;       
    } else if (!reqValidator.isNumeric(req.body.mobileNumber) || !reqValidator.isLength(req.body.mobileNumber, {min : 10, max : 12})){
        console.log('Invalid MobileNumber');
        sendDatas = respJSON.getFailureResponse(code.API_VAL_ERROR,message.VALIDATION_ERROR,message.MOBILENUMBER_ERROR);        
        res.send(sendDatas);
        return false;
    } else if (!reqValidator.isMD5(req.body.password)){
        console.log('Invalid Password');
        sendDatas = respJSON.getFailureResponse(code.API_VAL_ERROR,message.VALIDATION_ERROR,message.PASSWORD_ERROR);        
        res.send(sendDatas);
        return false;
    } else if (req.body.deviceType == ''){
        console.log('Invalid Device Type');
        sendDatas = respJSON.getFailureResponse(code.API_VAL_ERROR,message.VALIDATION_ERROR,message.DEVICETYPE_ERROR);        
        res.send(sendDatas);
        return false;
    } else if (req.body.deviceID == '') {
          console.log('Invalid Mac Address');
          sendDatas = respJSON.getFailureResponse(code.API_VAL_ERROR,message.VALIDATION_ERROR,message.MACADDRESS_ERROR);        
          res.send(sendDatas);
          return false;
    } else if(req.body.deviceToken == '') {
        console.log('Invalid Device Token');
          sendDatas = respJSON.getFailureResponse(code.API_VAL_ERROR,message.VALIDATION_ERROR,message.DEVICE_TOKEN_ERROR);        
          res.send(sendDatas);
          return false;
    } 
    console.log('Reg All Basic Validation Success');
    var userMobileCheck = exports.checkUserRegMobileNum(req, res, req.body.mobileNumber).then(function (userCountData){
        if (userCountData > 0) {
            console.log('mobile number already reg');
            sendDatas = respJSON.getFailureResponse(code.API_ERROR_CODE,message.DUPLICATE_ERROR,message.MOB_USER_ALRDY_REG);        
            res.send(sendDatas);
       	} else {
            console.log('we can register');
            exports.inserUserDetails(req.body,res);
        }
     }).error(function (error){
          console.log('createUserRegistration : ' + error);
          sendDatas = respJSON.getFailureResponse(code.API_INTERNAL_ERROR,message.INTERNAL_ERROR,error.toString());        
          res.send(sendDatas);
     }).catch(function (error) {
          console.log('createUserRegistration : ' + error);
          sendDatas = respJSON.getFailureResponse(code.API_INTERNAL_ERROR,message.INTERNAL_ERROR,error.toString());        
          res.send(sendDatas);
     }); 
  } else {
	 console.log('PayLoad wrong');
     sendDatas = respJSON.getFailureResponse(code.API_VAL_ERROR,message.PAYLOAD_ERROR,payLoadChkStatus.response.errorMessage);        
     res.send(sendDatas);
     return false;
	}
};

/*
 Function Name : createUser
 Description  : User Registeration From Mobile Apps
 Params : {"userName" :"xxxx","mobileNumber" : "numericonly","password" :"md5","deviceToken" :"","deviceType":"1/2/3","deviceID":"macaddress"}
 Author : iExemplar
 Created on : 20/10/2017
 Updated on : 21/10/2017
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.checkUserRegMobileNum = function (req, res, mobileNumber) {
return new Promise(function (resolve, reject){
    var usrMobileSql = {sql:modelUser.GET_MOBILE_LIST_SQL, timeout : 5000};
    connection.query(usrMobileSql, [req.body.mobileNumber], function (err, resCount) {
        if (!err) {
            var userCount = resCount[0].recCount;
            console.log('Reg mobile number already exisit Db result is '+userCount);
           // var respFlag = { "count" : userCount};
            return resolve(userCount);
          } else {
             console.log('error');
             // need to check timeout condition
             if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
                sendDatas = respJSON.getFailureResponse(code.API_INTERNAL_ERROR,message.INTERNAL_ERROR,message.TIMEOUT_DB_ERROR);
                res.send(sendDatas);  
             } else {
                sendDatas = respJSON.getFailureResponse(code.API_INTERNAL_ERROR,message.INTERNAL_ERROR,err.toString());
                res.send(sendDatas); 
             }      
          }
    });
});
};

/*
 Function Name : inserUserDetails
 Description  : After checking all validation insert details
 Params : 
 Author : iExemplar
 Created on : 21/10/2017
 Updated on :
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.inserUserDetails = function (req,res) {
    var userInsertedData = {
            USERNAME : req.userName,
            MOBILENUMBER : req.mobileNumber,
            PASSWORD : req.password,
            DEVICETYPE : req.deviceType,
            DEVICEID : req.deviceID,
            DEVICETOKEN : req.deviceToken
    }; 
    console.log(userInsertedData);
    var sqlConn = {sql:modelUser.SET_USER_DETAILS_SQL, timeout : 5000};
    connection.query(sqlConn, userInsertedData, function (err, resultUserAccInsertion) {
     if (!err) {
        console.log('inserted success status');
        console.log(resultUserAccInsertion);
        if (resultUserAccInsertion.affectedRows > 0) {
          var userAccID = resultUserAccInsertion.insertId;
          console.log('user id is'+ userAccID);
          exports.userLoginStatus(req,res,userAccID);
        } else {
          sendDatas = respJSON.getFailureResponse(code.API_INTERNAL_ERROR,message.INTERNAL_ERROR,message.TIMEOUT_DB_ERROR);
          res.send(sendDatas);  
        }
     } else {
        if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
            sendDatas = respJSON.getFailureResponse(code.API_INTERNAL_ERROR,message.INTERNAL_ERROR,message.TIMEOUT_DB_ERROR);
            res.send(sendDatas);  
        } else {
            sendDatas = respJSON.getFailureResponse(code.API_INTERNAL_ERROR,message.INTERNAL_ERROR,err.toString());
            res.send(sendDatas); 
        }  
     }
  });
};

/*
 Function Name : userLoginStatus
 Description   : After user details insertion need to be maintain
                those details into session table also
 Params : last inserted userid and payload data   
 Author : iExemplar
 Created on : 21/10/2017
 Updated on :
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.userLoginStatus = function(req,res,usrID) {
    var userLoginData = {
        USERID : usrID,
        DEVICETYPE : req.deviceType,
        DEVICETOKEN : req.deviceToken,
        DEVICEID : req.deviceID 
    };
    console.log(userLoginData);
    var sqlConn = {sql:modelUser.SET_USER_SESSION_SQL, timeout : 5000};
    connection.query(sqlConn, userLoginData, function (err, resultLoginStatus) {
    if (!err) {
        console.log('inserted login status success');
        console.log(resultLoginStatus);
        if (resultLoginStatus.affectedRows > 0) {
          exports.fetchUserDetails(req, res, usrID, "Register");
        } else {
          sendDatas = respJSON.getFailureResponse(code.API_INTERNAL_ERROR,message.INTERNAL_ERROR,message.TIMEOUT_DB_ERROR);
            res.send(sendDatas);  
        }
        
     } else {
        if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
            sendDatas = respJSON.getFailureResponse(code.API_INTERNAL_ERROR,message.INTERNAL_ERROR,message.TIMEOUT_DB_ERROR);
            res.send(sendDatas);  
        } else {
            sendDatas = respJSON.getFailureResponse(code.API_INTERNAL_ERROR,message.INTERNAL_ERROR,err.toString());
            res.send(sendDatas); 
        }  
     }
  }); 
};

/*
 Function Name : fetchUserDetails
 Description   : Fetch user basic details
 Params :   
 Author : iExemplar
 Created on : 21/10/2017
 Updated on :
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.fetchUserDetails = function(req, res, userId, userType) {
  console.log('enter fetch user details')
  var sqlConn = {sql:modelUser.GET_USER_DETAILS_SQL, timeout : 5000};
  connection.query(sqlConn, userId, function (err, userData) {
  if (!err) {
      if (userData.length > 0) {
          if (userType == 'Register') {
              sendDatas = respJSON.getSuccessResponse(code.API_SUCCESS_CODE,message.USER_REG_SUCCESSFUL,userData);  
          } else {
              sendDatas = respJSON.getSuccessResponse(code.API_SUCCESS_CODE,message.USER_SIGNIN_SUCCESSFUL,userData);  
          }
          res.send(sendDatas);      
      } else {
          sendDatas = respJSON.getFailureResponse(code.API_ERROR_CODE,message.RECORD_NOT_FOUND_ERROR,message.USER_DETAIL_ERROR);        
          res.send(sendDatas);
      }    
  } else {
      if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
          sendDatas = respJSON.getFailureResponse(code.API_INTERNAL_ERROR,message.INTERNAL_ERROR,message.TIMEOUT_DB_ERROR);
          res.send(sendDatas);  
      } else {
          sendDatas = respJSON.getFailureResponse(code.API_INTERNAL_ERROR,message.INTERNAL_ERROR,err.toString());
          res.send(sendDatas); 
      }  
  }
  });
};

/*
 Function Name : userLogin
 Description   : User Login From Mobile Apps
 Params :  {"mobileNumber" : "numericonly","password" :"md5","deviceToken" :"","deviceType":"1/2/3","deviceID":"macaddress"} 
 Author : iExemplar
 Created on : 21/10/2017
 Updated on :
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.userLogin = function(req, res) {
  console.log('user logged');
  if (req.body == '') {
      console.log('payload not correct');
      sendDatas = respJSON.getFailureResponse(code.API_BADREQUEST,message.BADREQUEST_ERROR,message.PAYLOAD_CONTENT_ERROR);
      res.send(sendDatas);
      return false;
  }

  var chkPayLoadCount  = Object.keys(req.body).length;
  console.log(chkPayLoadCount);
  if (signPayLoadCount != chkPayLoadCount || typeof req.body.mobileNumber == 'undefined' ||  typeof req.body.password == 'undefined' || typeof req.body.deviceToken == 'undefined' || typeof req.body.deviceType == 'undefined' || typeof req.body.deviceID == 'undefined') {
      console.log('Invalid Payload');
      sendDatas = respJSON.getFailureResponse(code.API_ERROR_CODE,message.PAYLOAD_ERROR,message.PAYLOAD_CONTENT_ERROR);
      res.send(sendDatas);
      return false;
  }
  var payloadStatus = payloadValidator.validator(req.body, payLoadChecker.userSignInPayload, payLoadChecker.userSingInPayloadMand,true);
  if (payloadStatus.success) {
    console.log('correct');
    if (!reqValidator.isNumeric(req.body.mobileNumber) || !reqValidator.isLength(req.body.mobileNumber,{min : 10, max : 12})) {
        console.log('Invalid MobileNumber');
        sendDatas = respJSON.getFailureResponse(code.API_VAL_ERROR,message.VALIDATION_ERROR,message.MOBILENUMBER_ERROR);
        res.send(sendDatas);
        return false;
    } else if (!reqValidator.isMD5(req.body.password)) {
        console.log('Invalid Password');
        sendDatas = respJSON.getFailureResponse(code.API_VAL_ERROR,message.VALIDATION_ERROR,message.PASSWORD_ERROR);
        res.send(sendDatas);
        return false;
    } else if (req.body.deviceType == '') {
        console.log('Invalid Device Type');
        sendDatas = respJSON.getFailureResponse(code.API_VAL_ERROR,message.VALIDATION_ERROR,message.DEVICETYPE_ERROR);
        res.send(sendDatas);
        return false;
    } else if (req.body.deviceID == '') {
        console.log('Invalid Mac Address');
        sendDatas = respJSON.getFailureResponse(code.API_VAL_ERROR,message.VALIDATION_ERROR,message.MACADDRESS_ERROR);        
        res.send(sendDatas);
        return false;
    } else if(req.body.deviceToken == '') {
        console.log('Invalid Device Token');
        sendDatas = respJSON.getFailureResponse(code.API_VAL_ERROR,message.VALIDATION_ERROR,message.DEVICE_TOKEN_ERROR);        
        res.send(sendDatas);
        return false;
    } 
    console.log('All Basic validations are success');
    exports.checkMobilePswdAvailable(req, res);
  } else {
      console.log('wrong');
      sendDatas = respJSON.getFailureResponse(code.API_ERROR_CODE,message.PAYLOAD_ERROR,payloadStatus.response.errorMessage);
      res.send(sendDatas);
  }
};

/*
 Function Name : checkMobilePswdAvailable
 Description   : 
 Params :  
 Author : iExemplar
 Created on : 21/10/2017
 Updated on :
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.checkMobilePswdAvailable = function(req, res) {
  var usrMobileSql = {sql:modelUser.CHECK_MOBPSWD_AVAIL_SQL, timeout : 5000};
    connection.query(usrMobileSql, [req.body.mobileNumber,req.body.password], function (err, resUserDetails) {
    console.log(resUserDetails);
    if (!err) {
      if (resUserDetails.length > 0) {
        console.log(resUserDetails[0].USERID);
        if (resUserDetails[0].DEVICETYPE == req.body.deviceType && resUserDetails[0].DEVICEID == req.body.deviceID) {
          console.log('Already login it into same device');
          sendDatas = respJSON.getFailureResponse(code.API_ERROR_CODE,message.DUPLICATE_ERROR,message.USER_ALREADY_LOGIN_ERROR);
          res.send(sendDatas);
        } else {
          console.log('we can insert another session');
          exports.insertLoginStatus(req,res,resUserDetails[0].USERID);
        }
      } else {
          console.log('Invalid Credi');
          sendDatas = respJSON.getFailureResponse(code.API_ERROR_CODE,message.RECORD_NOT_FOUND_ERROR,message.SIGNIN_ERROR);
          res.send(sendDatas);
      } 
    } else {
        console.log('error pswd function');
        // need to check timeout condition
        if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
            sendDatas = responseMessage.getFailureResponse(constantCode.API_INTERNAL_ERROR,commonMessage.INTERNAL_ERROR,commonMessage.TIMEOUT_DB_ERROR);
            res.send(sendDatas);
        } else {
            sendDatas = responseMessage.getFailureResponse(constantCode.API_INTERNAL_ERROR,commonMessage.INTERNAL_ERROR,err.toString());
            res.send(sendDatas);
        }
    }
    });
};

/*
 Function Name : insertLoginStatus
 Description   : 
 Params :  
 Author : iExemplar
 Created on : 21/10/2017
 Updated on :
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.insertLoginStatus = function(req, res, loginUserId) {
  var userLoginData = {
        USERID : loginUserId,
        DEVICETYPE : req.body.deviceType,
        DEVICETOKEN : req.body.deviceToken,
        DEVICEID : req.body.deviceID,
        ACTIVE : '1'
    };
    var sqlConn = {sql:modelUser.SET_USER_SESSION_SQL, timeout : 5000};
    connection.query(sqlConn, userLoginData, function (err, resultLoginStatus) {
    if (!err) {
        console.log('inserted login status success');
        console.log(resultLoginStatus);
        if (resultLoginStatus.affectedRows > 0) {
          exports.fetchUserDetails(req, res, loginUserId, "SignIn");
        } else {
          sendDatas = respJSON.getFailureResponse(code.API_INTERNAL_ERROR,message.INTERNAL_ERROR,message.TIMEOUT_DB_ERROR);
          res.send(sendDatas);
        }
        //var userDetails = modelCommon.fetchUserDetails(req, res, loginUserId, userType);
    } else {
        if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
              sendDatas = respJSON.getFailureResponse(code.API_INTERNAL_ERROR,message.INTERNAL_ERROR,message.TIMEOUT_DB_ERROR);
              res.send(sendDatas);
        } else {
              sendDatas = respJSON.getFailureResponse(code.API_INTERNAL_ERROR,message.INTERNAL_ERROR,err.toString());
              res.send(sendDatas);
        }
    }
  });
};

/*
 Function Name : userLogout
 Description   : User Logut From Anydevice like ios/android/web 
 Params :  {"userId" : "1211","deviceToken" :"","deviceType":"1/2/3","deviceID":"macaddress"} 
 Author : iExemplar
 Created on : 23/10/2017
 Updated on :
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.userLogout = function(req,res) {
  console.log('user enter logout');
  if (req.body == '') {
      console.log('payload not correct');
      sendDatas = respJSON.getFailureResponse(code.API_BADREQUEST,message.BADREQUEST_ERROR,message.PAYLOAD_CONTENT_ERROR);
      res.send(sendDatas);
      return false;
  }
  payloadStatus = payloadValidator.validator(req.body, payLoadChecker.userLogoutPayload, payLoadChecker.userLogoutPayloadMand,true);
  if (payloadStatus.success) {
    console.log('correct');
    if (!reqValidator.isNumeric(req.body.userId) || !reqValidator.isLength(req.body.userId,{min : 1, max : 5})) {
        console.log('Invalid MobileNumber');
        sendDatas = respJSON.getFailureResponse(code.API_VAL_ERROR,message.VALIDATION_ERROR,message.INVALID_USER);
        res.send(sendDatas);
        return false;
    } else if (req.body.deviceType == '') {
        console.log('Invalid Device Type');
        sendDatas = respJSON.getFailureResponse(code.API_VAL_ERROR,message.VALIDATION_ERROR,message.DEVICETYPE_ERROR);
        res.send(sendDatas);
        return false;
    } else if (req.body.deviceToken == '') {
        console.log('Invalid Device Token');
        sendDatas = respJSON.getFailureResponse(code.API_VAL_ERROR,message.VALIDATION_ERROR,message.DEVICETOKEN_ERROR);
        res.send(sendDatas);
        return false;
    } else if (req.body.deviceID == '') {
        console.log('Invalid Mac Address');
        sendDatas = respJSON.getFailureResponse(code.API_VAL_ERROR,message.VALIDATION_ERROR,message.MACADDRESS_ERROR);
        res.send(sendDatas);
        return false;
    } 
    console.log('All Basic validations are success');
    exports.check_UserRegLoginActiveCount(req, res);
  } else {
      console.log('wrong');
      sendDatas = respJSON.getFailureResponse(code.API_ERROR_CODE,message.PAYLOAD_ERROR,payloadStatus.response.errorMessage);
      res.send(sendDatas);
  }
};

/*
 Function Name : check_UserRegLoginActiveCount
 Description   : weather the user can already reg as well as acitve  
 Params :  
 Author : iExemplar
 Created on : 23/10/2017
 Updated on :
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.check_UserRegLoginActiveCount = function(req, res) {
  var usrCountSql = {sql:modelUser.GET_USERREG_ACTIVE_LOGOUTSQL, timeout : 5000};
    connection.query(usrCountSql, [req.body.userId, req.body.deviceType, req.body.deviceID], function (err, resLogout) {
        if (!err) {
          console.log(resLogout);
            if (resLogout.affectedRows > 0) {
              console.log('user logged out successfully');
              sendDatas = respJSON.getSuccessResponse(code.API_SUCCESS_CODE,message.USER_LOGOUT_SUCC);
              res.send(sendDatas);
            } else {
              console.log('invalid data');
              sendDatas = respJSON.getFailureResponse(code.API_ERROR_CODE,message.RECORD_NOT_FOUND_ERROR,message.RECORD_NOT_FOUND_ERROR);
              res.send(sendDatas);
            }
        } else {
             console.log('Error');
             if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
              sendDatas = respJSON.getFailureResponse(code.API_INTERNAL_ERROR,message.INTERNAL_ERROR,message.TIMEOUT_DB_ERROR);
              res.send(sendDatas);
            } else {
              sendDatas = respJSON.getFailureResponse(code.API_INTERNAL_ERROR,message.INTERNAL_ERROR,err.toString());
              res.send(sendDatas);
            }
        }
    });
};

