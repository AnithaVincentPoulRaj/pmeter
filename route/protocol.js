/**************************** Mobile App to MQTT Broker API *************************************************/

// Subscribed And Publish Topic For User Registeration and their Response
exports.USER_CREATION = 'user/register';  
exports.USER_CREATION_STATUS = 'user/register/status/';

// Subscribed And Publish Topic For User Login 
exports.USER_LOGIN = 'user/login';
exports.USER_LOGIN_STATUS = 'user/login/status/';

//Subscriber Mobile App Controller Recent Datas
exports.APP_CONTROLLER_RECENT_STATUS = 'user/controller/updated/status/'


//Subscriber Topic WIFI SWITCH
//exports.GET_WIFI_SWITCH = 'user/controller/switch'

/**************************** Controller to MQTT Broker API ************************************************/
// Subscribed And Publish Topic For Controller Registeration 
exports.CONTROLLER_CREATION = 'controller/register'; 
exports.CONTROLLER_CREATION_STATUS = 'controller/register/status/';   //All kind of error use this topic
 
// Subscribed And Publish Topic For Controller Status for every 1 min
exports.CONTROLLER_CURRENT_STATUS = 'controller/current/status';    // Not need
exports.CONTROLLER_STATUS = 'controller/status';

//For WEP APP Controller Update Report
exports.CONTROLLER_REPORT = 'user/controller/report';
exports.CONTROLLER_REPORT_STATUS ='user/controller/report/18';



