exports.getFailureResponse = function success(statusCode, message, error) {
    var errorStr = {
      "message" : error
    }
    var responseStr = {
      "code"    : statusCode,
      "message" : message,
      "error" : errorStr
    };
  return responseStr;
};

exports.getSuccessResponse = function success(statusCode, message, dataList) {
 if (dataList != "") {
    var responseStr = {
      "code"    : statusCode,
      "message" : message,
      "data"    : dataList
    };
  } else {
    var responseStr = {
      "code"    : statusCode,
      "message" : message
    };
  }
  return responseStr; 
};
exports.setControllerResponse = function status(statusCode) {
    var responseStr = {
      "responseCode" : statusCode
    };
    return responseStr;
};

/*
exports.getSuccessResponseLiveData = function success(dataList) {
 if (dataList != "") {
    var responseStr = {
      "data"    : dataList
    };
  } 
  return responseStr; 
};
*/