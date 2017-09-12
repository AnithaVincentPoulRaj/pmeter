exports.getSuccessResponse = function success(statusCode, message, dataList) {
 if (dataList != "") {
    var responseStr = {
      "responseCode"    : statusCode,
      "responseMessage" : message,
      "data"    : dataList
    };
  } else {
    var responseStr = {
      "responseCode"    : statusCode,
      "responseMessage" : message
    };
  }
  return responseStr; 
};

/*
exports.getFailureResponse = function success(statusCode, message, error) {
    var errorStr = {
      "errorMessage" : error
    }
    var responseStr = {
      "responseCode"    : statusCode,
      "responseMessage" : message,
      "error" : errorStr
    };
  return responseStr;

};
*/
exports.getFailureResponse = function success(statusCode, message) {
    var responseStr = {
      "responseCode"    : statusCode,
      "responseMessage" : message
    };
  return responseStr;

};

exports.setControllerResponse = function status(statusCode) {
    var responseStr = {
      "responseCode" : statusCode
    };
    return responseStr;
};


exports.pushAutoFillResponse = function success(id, level, status) {
  var dataStr = {
      "binID" : id,
      "binLevel" : level,
      "binStatus" : status
    }
    var responseStr = {
      "data" : dataStr,
      "message" : "Bin filled"
    };
  return responseStr;
};


// exports.setMessageBodyForFCMPush = function setFCMPush(deviceToken,title,binID,body)

