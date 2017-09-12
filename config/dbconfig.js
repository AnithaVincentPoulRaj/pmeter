require('dotenv').load();
var mysql = require('mysql');

/*
//Create mysql connection pool for live server
connection = mysql.createPool({
  host     : process.env.OPENSHIFT_MYSQL_DB_HOST,
  user     : process.env.OPENSHIFT_MYSQL_DB_USERNAME,
  password : process.env.OPENSHIFT_MYSQL_DB_PASSWORD,
  database : process.env.OPENSHIFT_APP_NAME,
  port : process.env.OPENSHIFT_MYSQL_DB_PORT
  //console.log('dbport');
 // console.log(port);
}); 

*/

//Create mysql connection pool for local host

connection = mysql.createPool({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  database : process.env.DB_DATABASE
});



//
connection.getConnection(function(err) {
    if (err) {
        console.log('Demo database Database Error :' + err.stack);
        return;
    }
   console.log('Demo Database Connected :');
    console.log(process.env.OPENSHIFT_MYSQL_DB_PORT);
});