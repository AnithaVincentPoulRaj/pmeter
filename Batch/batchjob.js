var json = require('JSON');
var Promise = require('bluebird');
var reqValidator = require('validator');
var payloadValidator = require('payload-validator');

var commonTopic = require('../route/protocol');
var constantCode = require('../config/constant');
var commonMessage = require('../config/messages');
var responseMessage = require('../utils/response');
var modelLogin = require('../model/loginstatusmodel'); // not need
var modelController = require('../model/controllermodel');

var sendDatas = "";
var dynTopic = "";

// Date : 22/05/2017
// Contoller throw data to Broker client
exports.parseControllerUpdatedDetails = function(message, client) {
	console.log('Going to insert bin latest datas');
	try {
		var req = json.parse(message);
		console.log(req);
    dynTopic = commonTopic.CONTROLLER_CREATION_STATUS+req.mA;
	} catch (exception) {
		console.log('error'); // convey error back to Broker client to Controller
		sendDatas = responseMessage.setControllerResponse(constantCode.BADREQUEST_CODE); 
		exports.publishClientBinUpdated(dynTopic, json.stringify(sendDatas),client);       
    return false; 
	}
	var chkPayLoadCount  = Object.keys(req).length;
    console.log(chkPayLoadCount);
    var payLoadChkStatus = "";
    if (typeof req.mA == 'undefined') {
        console.log('Invalid Payload'); // convey error back to Broker client to Controller
        sendDatas = responseMessage.setControllerResponse(constantCode.ERROR_CODE);       
        exports.publishClientBinUpdated(dynTopic, json.stringify(sendDatas),client);
        return false; 
    }
    console.log('Basic validation are success');
    exports.updateControllerDetialsIntoServer(req,client,dynTopic);
};

// Date : 22/05/2017
exports.updateControllerDetialsIntoServer = function(req,client,dynTopic) {
    console.log('inserted controller function');
    pData = {
        "productType" : req.pT,
        "status" :req.status,
        "macAddress" :req.mA
      }
    pData = json.stringify(pData);
    var pTypeID = req.mA+req.ptID;
    console.log('pro Typeid' + pTypeID);
    console.log(pData);
    var sqlConn = {sql:modelController.UPDATE_USER_CONTROLLER_DETAILS, timeout : 5000};
    connection.query(sqlConn, [pData,req.mA,pTypeID], function (err, resultUpdateStatus) {
    if (!err) {
        console.log('update bin details success');
        console.log(resultUpdateStatus);
        console.log(resultUpdateStatus.insertId);
        console.log(resultUpdateStatus.affectedRows);
        //Check if the type is auto then send filled status to user
        var sqlConn = {sql:modelController.GET_PRODUCT_OWNER_ID, timeout : 5000};
             connection.query(sqlConn, [req.mA,pTypeID], function (err, resultUpdateStatus) {
            if (!err) {
                console.log('Get User ID');
                console.log(resultUpdateStatus.length);
                console.log(resultUpdateStatus[0].userID);
               // console.log(resultUpdateStatus[0].userID);
                if (resultUpdateStatus.length > 0) {
                  var dTOP = "";    // Publish latest data to App users
                  dTOP = commonTopic.APP_CONTROLLER_RECENT_STATUS+resultUpdateStatus[0].userID;
                  sendDatas = responseMessage.getSuccessResponse(constantCode.SUCCESS_CODE,commonMessage.APP_DATA_STATUS,pData);
                  exports.publishClientBinUpdated(dTOP,json.stringify(sendDatas),client);
                  exports.updateEMDetails(pTypeID,req.status);
                  //SET_CONTROLLER_SQL_DETAILS
                } else {
                  console.log("no owner");
                }
                
            } else {
              console.log(err);
             if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') { // convey error back to Broker client to Controller
               sendDatas = responseMessage.setControllerResponse(constantCode.INTERNAL_ERROR_CODE);
               exports.publishClientBinUpdated(dynTopic, json.stringify(sendDatas),client);
             } else {
               sendDatas = responseMessage.setControllerResponse(constantCode.INTERNAL_ERROR_CODE);
               exports.publishClientBinUpdated(dynTopic, json.stringify(sendDatas),client);
             }   
            }
          }); 

    } else {
        console.log(err);
        if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') { // convey error back to Broker client to Controller
              sendDatas = responseMessage.setControllerResponse(constantCode.INTERNAL_ERROR_CODE);
              exports.publishClientBinUpdated(dynTopic, json.stringify(sendDatas),client);
        } else {
              sendDatas = responseMessage.setControllerResponse(constantCode.INTERNAL_ERROR_CODE);
              exports.publishClientBinUpdated(dynTopic, json.stringify(sendDatas),client);
        } 
    }
  }); 
};
exports.getUpdatedControllerReport = function(message,client) {
  console.log("************************************************");
   try {
    console.log(message.toString());
    var req = message.toString();
    console.log(req);
   var sqlConn = {sql:modelController.GET_USER_CON_REPORT_SQL, timeout : 5000};
  //Get state list by country id
  connection.query(sqlConn, function (err, userData) {
    if (!err) {
      console.log(userData.length);
      if (userData.length > 0) {
        

        sendDatas = responseMessage.getSuccessResponse(constantCode.SUCCESS_CODE,commonMessage.USER_REG_SUCCESSFUL,userData);  
        var  mqttTopic =  "Report"//commonTopic.CONTROLLER_REPORT_STATUS;    
        console.log(mqttTopic);
        console.log(sendDatas);
      //  exports.publishClientBinUpdated(mqttTopic, json.stringify(sendDatas),client);  
      // var res = json.stringify(sendDatas);
     //  console.log(res);
       exports.publishClientBinUpdated("Report", JSON.stringify(sendDatas),client);  
      } 
    } else {
        console.log('no data');
    }
  });

  } catch (exception) {
    console.log('error'); // convey error back to Broker client to Controller
  }
};
exports.updateEMDetails = function(pTypeID,status) {
   var controllerDataUpdate = {
        PRODUCT_ID : pTypeID,
        STATUS : status 
    };

    var sqlConn = {sql:modelController.SET_CONTROLLER_SQL_DETAILS, timeout : 5000};
    connection.query(sqlConn, controllerDataUpdate, function (err, resultLoginStatus) {
    if (!err) {
        console.log('inserted controller update data success');
        console.log('Inseterd Id is '+ resultLoginStatus.insertId);
    } else {
        console.log(err);
    }
  }); 
};
exports.publishClientBinUpdated = function(topic, succMsg, client) {
    client.publish(topic, succMsg);
};