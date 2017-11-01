exports.userRegPayload = {
  "userName" : "",
  "mobileNumber" : "",
  "password":"",
  "deviceType":"",
  "deviceToken":"",
  "deviceID":""            
};

exports.userRegPayloadMand = ['userName','mobileNumber','password','deviceType','deviceToken','deviceID']; 

exports.userSignInPayload = {
  "mobileNumber" : "",
  "password":"",
  "deviceType":"",
  "deviceToken":"",
  "deviceID":""            
}; 

exports.userSingInPayloadMand = ['mobileNumber','password','deviceType','deviceToken','deviceID']; 

exports.userLogoutPayload = {
  "userId" : "",
  "deviceType" : "",
  "deviceToken" : "",
  "deviceID" : ""
};

exports.userLogoutPayloadMand = ['userId','deviceType','deviceToken','deviceID'];