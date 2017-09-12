
var createAccSql  = "INSERT INTO useraccount SET ? ";
exports.SET_USER_DETAILS_SQL = createAccSql;

exports.GET_MOBILE_LIST_SQL = "SELECT COUNT(USER_ID) as recCount FROM useraccount WHERE USER_MOBILE_NUMBER = ?"

 var usrRegSql = "SELECT usr.USER_ID as userID, usr.USER_NAME as userName, usr.USER_MOBILE_NUMBER as mobileNumber"; 
      usrRegSql+= " FROM useraccount usr WHERE usr.ACTIVE = '1' AND usr.USER_ID = ?";
  exports.GET_USER_DETAILS_SQL = usrRegSql;

  