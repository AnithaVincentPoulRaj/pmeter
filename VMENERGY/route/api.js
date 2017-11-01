var express = require('express');
var router = express.Router();

var cntrlUser = require('../controller/userregisterationcontroller');
var cntrlHardware = require('../controller/hardwarecontroller');

router.use(function(req, res, next) {
  res.header('Content-Type', 'application/json');
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Headers","*");
  next();
});

router.post('/api/v1/user',cntrlUser.createUser);
router.post('/api/v1/signin',cntrlUser.userLogin);

router.put('/api/v1/logout',cntrlUser.userLogout);

router.get('/api/v1/user/:userId/controller',cntrlHardware.getAllController);
module.exports = router;