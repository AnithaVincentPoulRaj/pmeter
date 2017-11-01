exports.GET_MOBILE_LIST_SQL = "SELECT COUNT(USERID) as recCount FROM USER_ACCOUNT WHERE MOBILENUMBER = ?";

exports.SET_USER_DETAILS_SQL  = "INSERT INTO USER_ACCOUNT SET ? ";
exports.SET_USER_SESSION_SQL  = "INSERT INTO LOGIN_SESSION SET ? ";
var usrRegSql = "SELECT usr.USERID as userId, usr.USERNAME as userName, usr.MOBILENUMBER as mobileNumber";
      usrRegSql+= " FROM USER_ACCOUNT usr";
      usrRegSql+= " WHERE usr.ACTIVE = '1' AND usr.USERID = ?";
exports.GET_USER_DETAILS_SQL = usrRegSql;

var checkMobPswdAvailSql = "SELECT * FROM USER_ACCOUNT UA WHERE MOBILENUMBER = ? AND PASSWORD = ?"
exports.CHECK_MOBPSWD_AVAIL_SQL = checkMobPswdAvailSql;

exports.GET_USERREG_ACTIVE_LOGOUTSQL = "DELETE FROM LOGIN_SESSION WHERE USERID = ? AND DEVICETYPE = ? AND DEVICEID = ?";

exports.GET_USER_DETAILS = "SELECT * FROM USER_ACCOUNT WHERE USERID = ? AND ACTIVE = '1'";

							