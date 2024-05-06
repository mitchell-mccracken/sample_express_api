const express = require("express");
const router = express.Router();


// specific routes below
router.use( '/user', require('./userController') );




module.exports = router;