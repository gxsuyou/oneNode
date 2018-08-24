var express = require('express');
var router = express.Router();
var path = require("path");
var fs = require("fs");
var common = require('../DAO/common');
//时间
var date = new Date();
var getStart = date.setHours(0, 0, 0, 0) / 1000;//今天0时
var getEnd = getStart + 86400 - 1;//明天的0时减1秒
var getTime = date.getTime() / 1000;

/**
 * 每日0点自动执行添加下载日志
 */
router.get("/getDownLoadDay", function (req, res, next) {
    /**
     * 请求url：http://域名/common/getDownLoadDay?type=1&sys=*(1或2)
     */
    var data = req.query;
    if (!data.sys || !data.type) {
        res.json({state: 1});
        return false;
    }
    var msg = {
        start: getStart,
        end: getEnd,
        type: data.type || 1,
        sys: data.sys || 2,
        num: data.num || 0,
    }
    common.hasDownLoadDay(msg, function (has) {
        if (has.length) {
            res.json({state: 1});
            return false;
        }
        common.getDownLoadDay(msg, function (result) {
            result.insertId ? res.json({state: 1}) : res.json({state: 0})
        })
    })

});

/**
 * 今天在下载日志统计添加
 */
router.get("/getDownLoadUp", function (req, res, next) {
    /**
     * 请求url：http://域名/common/getDownLoadUp?type=1&sys=*(1或2)
     */
    var data = req.query;
    console.log(data);
    if (!data.sys || !data.type) {
        res.json({state: 1});
        return false;
    }

    var msg = {
        start: getStart,
        end: getEnd,
        type: data.type || 1,
        sys: data.sys || 2,
        num: data.num || 1,
    }
    common.hasDownLoadDay(msg, function (has) {//查询今天的记录是否已经生成
        if (has.length) {
            var upData = {
                id: has[0].id,
                num: Number(has[0].num) + 1
            };
            common.getDownLoadDayUp(upData, function (result) {
                result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
            })
        } else {//如果没有则添加
            common.getDownLoadDay(msg, function (result) {
                result.insertId ? res.json({state: 1}) : res.json({state: 0})
            })
        }
    })
})

/**
 * 用户登录日志
 */
// router.get("/getUserLog", function (req, res, next) {
//     /**
//      * 请求url：http://域名/common/getUserLog?uid=*type=2
//      */
//     var data = req.query;
//     if (!data.uid || !data.type) {
//         res.json({state: 1});
//         return false;
//     }
//     var msg = {
//         uid: data.uid,
//         start: getStart,
//         end: getEnd
//     }
//     common.hasUserLog(msg, function (result_user) {
//         if (!result_user.length) {
//             var userMsg = {
//                 uid: data.uid,
//                 addTime: getTime
//             }
//             common.getUserLogAdd(userMsg, function (result) {
//                 result.insertId ? res.json({state: 1}) : res.json({state: 0})
//             })
//         } else {
//             res.json({state: 1})
//         }
//     })
// });

module.exports = router;
