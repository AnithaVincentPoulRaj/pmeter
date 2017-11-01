var json = require('JSON');
var Promise = require('bluebird');
var reqValidator = require('validator');
var payloadValidator = require('payload-validator');

var commonTopic = require('../route/protocol');
var constantCode = require('../config/constant');
var commonMessage = require('../config/message');
var responseMessage = require('../utils/response');
var modelUser = require('../model/user');
var modelController = require('../model/controller');

var sendDatas = "";
var dynTopic = "";



exports.createController = function (message, client) {
	var req = '';
	try {
		req = json.parse(message);
		console.log(req);
	} catch (exception) {
		console.log('Not need to handle this error');      
        return false; 
	}
	console.log('proceed to further valdiaitons');
	var chkPayLoadCount  = Object.keys(req).length;
    console.log(chkPayLoadCount);
    var payLoadChkStatus = "";
    console.log('Topic is'+dynTopic);
    if (typeof req.mA == 'undefined' || typeof req.uID == 'undefined') {
        console.log('Invalid Controller Reg Payload');
        return false; 
    }
    console.log('Basic validation are success for controller reg');
    dynTopic = commonTopic.CONTROLLER_CREATION_STATUS+req.mA;
    exports.checkUserRegAndActive(req, client,dynTopic).then(function (resActiveCount){
    	console.log(resActiveCount);
        if (resActiveCount.length > 0) {
            console.log('user is registered');
            if (resActiveCount[0].USERID > 0) {
                console.log('user is active');
                exports.setController(req, client, dynTopic);
            } else {
                console.log('user is inactive');
                sendDatas = responseMessage.setControllerResponse(constantCode.API_REC_NOT_FOUND_CODE);
                exports.publishClientController(dynTopic, json.stringify(sendDatas),client);
            }
        } else {
              console.log('invalid user');
              sendDatas = responseMessage.setControllerResponse(constantCode.API_REC_NOT_FOUND_CODE);
              exports.publishClientController(dynTopic, json.stringify(sendDatas),client);
        } 
    }).error(function (error){
            console.log('createUserRegistration : ' + error);
            sendDatas = responseMessage.setControllerResponse(constantCode.API_INTERNAL_ERROR);        
            exports.publishClientController(dynTopic, json.stringify(sendDatas),client);
    }).catch(function (error) {
            console.log('createUserRegistration : ' + error);
            sendDatas = responseMessage.setControllerResponse(constantCode.API_INTERNAL_ERROR);        
            exports.publishClientController(dynTopic, json.stringify(sendDatas),client);
    });
};

exports.checkUserRegAndActive = function (req, client, dynTopic) {
return new Promise(function (resolve, reject){
    var userAccAuth = {sql:modelUser.GET_USER_DETAILS, timeout : 5000};
    connection.query(userAccAuth, [req.uID], function (err, resData) {
        if (!err) {
            return resolve(resData);
        } else {
             console.log('error');
             // need to check timeout condition
             if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
                sendDatas = responseMessage.setControllerResponse(constantCode.API_INTERNAL_ERROR);
                exports.publishClientController(dynTopic, json.stringify(sendDatas),client); 
             } else {
                sendDatas = responseMessage.setControllerResponse(constantCode.API_INTERNAL_ERROR);
                exports.publishClientController(dynTopic, json.stringify(sendDatas),client);
             }       
        }
    });
});
};
exports.setController = function (req, client, dynTopic) {
	var controllerReg = {sql:modelController.CHECK_MOBPSWD_AVAIL_SQL, timeout : 5000};
    connection.query(controllerReg, [req.mA], function (err, resData) {
        if (!err) {
            console.log(resData);
            var cData = {
        		"lpm" :'0',
        		"macAddress" :req.mA,
        		"cfm" : '0',
        		"warning" : 'NO'
      		 };
      		cData = json.stringify(cData);
      		console.log(cData);
            if (resData.length == 0) {
            	var pData = {
            		USERID : req.uID,
            		CONTROLLERNAME : 'MACHINE',
            		MACADDRESS : req.mA,
            		CONTROLLERDATA : cData
            	};
            var sqlConn = {sql:modelController.SET_CONTROLLER_SQL, timeout : 5000};
   			connection.query(sqlConn, pData, function (err, resControllerRegStatus) {
    		if (!err) {
        	  console.log('inserted controller success');
        	  console.log('Inseterd Id is '+ resControllerRegStatus.insertId);
        	  if (resControllerRegStatus.affectedRows > 0) {
        	  	sendDatas = responseMessage.setControllerResponse(constantCode.API_SUCCESS_CODE);
              	exports.publishClientController(dynTopic, json.stringify(sendDatas),client);
        	  } else {
        	  	sendDatas = responseMessage.setControllerResponse(constantCode.API_INTERNAL_ERROR);
                exports.publishClientController(dynTopic, json.stringify(sendDatas),client);
        	  }
              
            } else {
              console.log(err);
              if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
                sendDatas = responseMessage.setControllerResponse(constantCode.API_INTERNAL_ERROR);
                exports.publishClientController(dynTopic, json.stringify(sendDatas),client);
              } else {
                sendDatas = responseMessage.setControllerResponse(constantCode.API_INTERNAL_ERROR);
                exports.publishClientController(dynTopic, json.stringify(sendDatas),client);
              } 
           }
           }); 
          } else {
            	console.log('controller already registered');
            	sendDatas = responseMessage.setControllerResponse(constantCode.API_BADREQUEST);
                exports.publishClientController(dynTopic, json.stringify(sendDatas),client); 
          }
        } else {
             console.log('error in chk controller reg');
             // need to check timeout condition
             if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
                sendDatas = responseMessage.setControllerResponse(constantCode.API_INTERNAL_ERROR);
                exports.publishClientController(dynTopic, json.stringify(sendDatas),client); 
             } else {
                sendDatas = responseMessage.setControllerResponse(constantCode.API_INTERNAL_ERROR);
                exports.publishClientController(dynTopic, json.stringify(sendDatas),client);
             }       
        }
    });
};
exports.getAllController = function(req,res) {
	var userId = req.params.userId;
    if (reqValidator.isNumeric(userId)) {
    	console.log('User Id ' + userId);
    	var sqlConn = {sql:modelUser.GET_USER_DETAILS, timeout : 5000};
    	connection.query(sqlConn, [userId], function (err, resultData) {
     	if (!err) {
       	 	console.log(resultData);
       	 	if (resultData.length > 0) {
       	 		exports.getControllerList(req,res,resultData[0].USERID);
       	 	} else {
       	 		console.log('Invalid User');
          		sendDatas = responseMessage.getFailureResponse(constantCode.API_ERROR_CODE,commonMessage.RECORD_NOT_FOUND_ERROR,commonMessage.INVALID_USER);
          		res.send(sendDatas);
       	 	}
     	} else {
        	if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
            	sendDatas = responseMessage.getFailureResponse(constantCode.API_INTERNAL_ERROR,commonMessage.INTERNAL_ERROR,commonMessage.TIMEOUT_DB_ERROR);
            	res.send(sendDatas);  
       	 	} else {
           		sendDatas = responseMessage.getFailureResponse(constantCode.API_INTERNAL_ERROR,commonMessage.INTERNAL_ERROR,err.toString());
                res.send(sendDatas); 
        	}  
     	}
  		});
    } else {
    	console.log('Invalid UserID');
        sendDatas = responseMessage.getFailureResponse(constantCode.API_VAL_ERROR,commonMessage.VALIDATION_ERROR,commonMessage.INVALID_USERID);        
        res.send(sendDatas);
        return false;  
    }
};

exports.getControllerList = function(req,res,lUserID) {
	console.log('Selected User Id is'+lUserID);
	var userControllerList = {sql:modelController.GET_CONTROLLER_LIST, timeout : 5000};
    connection.query(userControllerList, [lUserID], function (err, resData) {
    	console.log(resData);
        if (!err) {
            if (resData.length >0){
            	console.log(resData);
            	sendDatas = responseMessage.getSuccessResponse(constantCode.API_SUCCESS_CODE,commonMessage.CONTROLLER_LIST,resData);
            	res.send(sendDatas); 
            } else {
            	sendDatas = responseMessage.getFailureResponse(constantCode.API_BADREQUEST,commonMessage.RECORD_NOT_FOUND_ERROR,commonMessage.RECORD_NOT_FOUND_ERROR);        
        		res.send(sendDatas);
            }
        } else {
             console.log('error during controller list');
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
exports.getControllerLiveStatus = function(message,client) {
	var req = '';
	try {
		req = json.parse(message);
		console.log(req);
	} catch (exception) {
		console.log('Not need to handle this error');      
        return false; 
	}
	console.log('Current Controller Belongs To' +req.uID);
 	var pData = {
        "lpm" :req.lpm,
        "macAddress" :req.mA,
        "cfm" : req.cfm,
        "warning" : 'NO'
      };
    pData = json.stringify(pData);
    var pTopic = commonTopic.CONTROLLER_LIVER_PREFIX+req.uID+commonTopic.CONTROLLER_LIVER_SUFFIX;
    console.log(pTopic);
    var gTopic = commonTopic.CONTROLLER_DATA_GRAPH_PREFIX+req.uID+commonTopic.CONTROLLER_DATA_GRAPH_SUFFIX+req.mA;
   console.log(gTopic);
    exports.publishClientController(pTopic, pData,client);
    exports.publishClientController(gTopic, pData,client);
    var sqlConn = {sql:modelController.UPDATE_CONTROLLER_LIVE_DATA, timeout : 5000};
    connection.query(sqlConn, [pData,req.mA,req.uID], function (err, resultUpdateStatus) {
            if (!err) {
                console.log(resultUpdateStatus);
                console.log(resultUpdateStatus.length);
                console.log('error nope');
                if (resultUpdateStatus.affectedRows > 0) {
                   console.log('Going to update live data into sep table before get controller id');
                   exports.getControllerDetailsFromUser(req,client);
                } else {
                   console.log('Error in update controller live data');
                }

            } else {
                console.log('Error in update controller live data');
            }
    }); 
};

exports.getControllerDetailsFromUser = function(req,client) {
    var sqlConn = {sql:modelController.GET_PRODUCT_ID, timeout : 5000};
    connection.query(sqlConn, [req.mA,req.uID], function (err, resultProductData) {
            if (!err) {
                console.log(resultProductData);
                console.log(resultProductData.length);
                if (resultProductData.length>0) {
                  console.log('Controller ID is'+resultProductData[0].cID);
                  exports.updateEMDetails(resultProductData[0].cID,req);
                } else {
                  console.log('Controller Not Found');
                }

            } else {
                console.log('Error in update controller live data');
            }
    }); 
}

exports.updateEMDetails = function(cID,req) {
   var controllerDataUpdate = {
        CONTROLLERID : cID,
        CFM : req.cfm,
        LPM : req.lpm 
    };
    var sqlConn = {sql:modelController.SET_CONTROLLER_LIVE_DETAILS, timeout : 5000};
    connection.query(sqlConn, controllerDataUpdate, function (err, resultLiveStatus) {
    if (!err) {
        console.log('controller update live data success');
        console.log('Inseterd Id is '+ resultLiveStatus.insertId);
    } else {
        console.log('err controller update live data success');
    }
  }); 
};
exports.publishClientController = function(topic, succMsg, client) {
    client.publish(topic, succMsg);
};