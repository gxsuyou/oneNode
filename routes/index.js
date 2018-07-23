var express = require('express');
var router = express.Router();
var index = require("../DAO/index");
var path = require('path');
var fs = require('fs');
/* GET home page. */
router.get('/', function (req, res, next) {
    console.log(1);
    // index.carousel(1,function (result) {
    res.json({s: 1})

});

module.exports = router;
