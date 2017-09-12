var insertLoginStatusSql  = "INSERT INTO loginstatus SET ? ";
exports.SET_USER_LOGINSTATUS_SQL = insertLoginStatusSql;

var checkMobPswdAvailSql = "SELECT (SELECT COUNT(USER_ID) FROM useraccount WHERE USER_MOBILE_NUMBER = ?) as resMobAvailCount, ";
    checkMobPswdAvailSql += "(SELECT USER_ID from useraccount WHERE USER_MOBILE_NUMBER = ? AND USER_PASSWORD = ?) as resUserID";
exports.CHECK_MOBPSWD_AVAIL_SQL = checkMobPswdAvailSql;  

var checkUserCountSql = "SELECT (SELECT COUNT(USER_ID) FROM loginstatus WHERE USER_ID = ? AND ACTIVE = '1') as resUsrActiveCount, ";
    checkUserCountSql += "(SELECT LOGIN_STATUS_ID FROM loginstatus WHERE USER_ID = ? AND USER_DEVICE_TYPE = ? AND USER_MAC_ADDRESS = ?) as resLoginStatusID";
exports.CHECK_USER_COUNT_SQL = checkUserCountSql;

exports.UPDATE_USER_LOGIN_STATUS = "UPDATE loginstatus SET ? WHERE USER_ID = ? AND LOGIN_STATUS_ID = ?";

exports.SET_USER_LOGINSTATUS_SQL = "INSERT INTO loginstatus SET ?";

exports.GET_USER_REG_ACTIVE_SQL = "SELECT (SELECT COUNT(USER_ID) FROM loginstatus WHERE USER_ID = ? AND ACTIVE = '1') as resLoginCount, (SELECT COUNT(USER_ID) FROM useraccount WHERE USER_ID = ? AND ACTIVE = '1') as resRegCount";

