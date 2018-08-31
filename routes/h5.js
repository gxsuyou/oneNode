var express = require('express');
var router = express.Router();
var PATH = require("../path");
var h5 = require('../DAO/h5');
router.get("/getH5", function (req, res, next) {
    h5.getH5(req.query.page, function (result) {
        res.json({state: 1, h5: result})
    })
});
router.get("/getH5ByMsg", function (req, res, next) {
    if (req.query.msg) {
        h5.getH5ByMsg(req.query.msg, function (result) {
            res.json({state: 1, h5: result})
        })
    }
});
router.get('/addMyH5', function (req, res) {
    var data = req.query;
    if (data.userId && data.gameId) {
        h5.addMyH5(data.userId, data.gameId, function (result) {
            res.json({state: 1})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/searchByGameName', function (req, res) {
    var data = req.query;
    if (data.msg && data.page) {
        data.uid = data.uid > 0 ? data.uid : 0;
        h5.searchByGameName(data.uid, data.msg, data.page, function (result) {
                res.json({state: 1, gameList: result})
            }
        )
    } else {
        res.json({state: 0})
    }
});
// 检测更新接口    mark -> 更新的版本号  Android
router.get("/update", function (req, res, next) {
    res.json({state: 1, mark: '4.1.7'});
});
// 检测更新接口    mark -> 更新的版本号 Ios
router.get("/updateIos", function (req, res, next) {
    res.json({state: 1, mark: '4.1.3'});
});
module.exports = router;