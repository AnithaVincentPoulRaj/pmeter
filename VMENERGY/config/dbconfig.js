require('dotenv').load();
var mysql = require('mysql');

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
        console.log('VMENERGY database Database Error :' + err.stack);
        return;
    }
   console.log('VMENERGY Database Connected');
});