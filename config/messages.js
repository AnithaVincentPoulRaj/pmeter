/*Common Error Code */
exports.TIMEOUT_DB_ERROR ='Database Connecion Timeout';
exports.INTERNAL_ERROR  = 'Internal Server Error';
exports.BADREQUEST_ERROR = 'Bad request';
exports.VALIDATION_ERROR ='Validation error';
exports.PAYLOAD_CONTENT_ERROR = 'Invalid JSON payload';

/* User Registeration */
exports.NAME_ERROR = 'Username cannot exceed 30 characters and allowed only characters';
exports.MOBILENUMBER_ERROR = 'Mobile Number must be numeric and length should be 10-12 digits';
exports.PASSWORD_ERROR = 'Password must be hashed';
exports.DEVICETYPE_ERROR = 'Device type cannot be empty and should be 1,2 or 3';
exports.MACADDRESS_ERROR = 'Mac Address cannot be empty and should have alphanumeric characters';
exports.MOB_USER_ALRDY_REG = 'This mobile number is already registered';
exports.USER_REG_SUCCESSFUL = 'User registration successful';
exports.SIGNIN_ERROR = 'Mobile number is not registered';
exports.PASSWORD_SIGNIN_ERROR = 'Password does not match';
exports.USER_SIGNIN_SUCCESSFUL = 'User signin successful';

/* Mobile App to MQTT Broker API -> Subscribed And Publish Topic For User Registeration and their Response*/
//exports.USER_CREATION = 'api/v1/user/register'; // Not Need
//exports.USER_CREATION_STATUS = 'userstatus';

/* Controller to MQTT Broker API -> Subscribed And Publish Topic For Controller Registeration and their Response*/

//exports.CONTROLLER_CREATION = 'api/v1/controller/register'; 
//exports.CONTROLLER_CREATION_STATUS = 'controllerstatus';

exports.APP_DATA_STATUS = 'Fetch Data Successfully';
