/* User Registration payload */
exports.userRegPayload = {
  "mobileNumber" : "",
  "userName" : "",
  "password":"",
  "deviceType":"",
  "macAddress":""            
}; 

exports.userRegPayloadMand = ['mobileNumber','userName','password','deviceType','macAddress']; 

/* User SignIn Payload */
exports.userSignInPayload = {
  "mobileNumber" : "",
  "password" : "",
  "deviceType" : "",
  "macAddress" : ""
};

exports.userSigninPayloadMand = ['mobileNumber','password','deviceType','macAddress'];

/* Create New Bin Payload */
exports.updateBinPayload = {
  "binName" : "",
  "pin" : "",
  "userId" : ""
};

exports.updateBinPayloadMand = ['binName','pin','userId'];

exports.userLogoutPayload = {
  "userId" : "",
  "deviceType" : "",
  "deviceToken" : "",
  "macAddress" : ""
};

exports.userLogoutPayloadMand = ['userId','deviceType','deviceToken','macAddress'];