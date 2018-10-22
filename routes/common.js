var express = require('express');
var router = express.Router();
var path = require("path");
var fs = require("fs");
var common = require('../DAO/common');
//时间
var date = new Date();
var getTime = date.getTime() / 1000;
var getStart = date.setHours(0, 0, 0, 0) / 1000;//今天0时
var getEnd = getStart + 86400 - 1;//明天的0时减1秒

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
    var date = new Date();
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
    // common.hasDownLoadDay(msg, function (has) {//查询今天的记录是否已经生成
    //     if (has.length) {
    //         var upData = {
    //             id: has[0].id,
    //             num: Number(has[0].num) + 1
    //         };
    //         common.getDownLoadDayUp(upData, function (result) {
    //             result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
    //         })
    //     } else {//如果没有则添加
    common.getDownLoadDay(msg, function (result) {
        result.insertId ? res.json({state: 1}) : res.json({state: 0})
    })
    //     }
    // })
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

function face(obj, callback) {
    var face = [
        {src: "a_what.png", id: "[奇怪]"},
        {src: "alas.png", id: "[哎呀]"},
        {src: "angry.png", id: "[怒]"},
        {src: "ass.png", id: "[屎]"},
        {src: "bad_smile.png", id: "[坏笑]"},
        {src: "beer_brown.png", id: "[棕啤]"},
        {src: "beer_yellow.png", id: "[黄啤]"},
        {src: "black.png", id: "[黑头]"},
        {src: "but.png", id: "[无奈]"},
        {src: "butcry.png", id: "[无奈哭]"},
        {src: "bye.png", id: "[再见]"},
        {src: "cool.png", id: "[酷]"},
        {src: "cry.png", id: "[哭]"},
        {src: "cry_hand.png", id: "[手扶脸]"},
        {src: "cry_smile.png", id: "[哭笑]"},
        {src: "cut.png", id: "[可爱]"},
        {src: "dog.png", id: "[狗]"},
        {src: "doughnut.png", id: "[甜甜圈]"},
        {src: "duck.png", id: "[鸭子]"},
        {src: "eat_wat.png", id: "[吃西瓜]"},
        {src: "eee.png", id: "[额]"},
        {src: "halo.png", id: "[晕]"},
        {src: "heart.png", id: "[心]"},
        {src: "heart_break.png", id: "[心碎]"},
        {src: "impatine.png", id: "[不耐烦]"},
        {src: "kiss.png", id: "[亲亲]"},
        {src: "laugl.png", id: "[偷笑]"},
        {src: "leaf.png", id: "[树叶]"},
        {src: "lemon.png", id: "[柠檬]"},
        {src: "notsobad.png", id: "[好无奈]"},
        {src: "ooo.png", id: "[噢噢]"},
        {src: "pig.png", id: "[猪]"},
        {src: "punch_face.png", id: "[打脸]"},
        {src: "rigid.png", id: "[僵硬]"},
        {src: "see_smile.png", id: "[看坏笑]"},
        {src: "she.png", id: "[喜欢]"},
        {src: "shine.png", id: "[闪耀]"},
        {src: "shock.png", id: "[惊呆]"},
        {src: "shutup.png", id: "[闭嘴]"},
        {src: "shy.png", id: "[害羞]"},
        {src: "sleep.png", id: "[睡觉]"},
        {src: "slience.png", id: "[沉默]"},
        {src: "split.png", id: "[吐]"},
        {src: "strange.png", id: "[奇怪]"},
        {src: "smile_big.png", id: "[大笑]"},
        {src: "smile_little.png", id: "[害羞无奈]"},
        {src: "soangry.png", id: "[超生气]"},
        {src: "surprised.png", id: "[惊讶]"},
        {src: "unhappy.png", id: "[不高兴]"},
        {src: "wa.png", id: "[青蛙]"},
        {src: "watermelon.png", id: "[西瓜]"},
        {src: "what.png", id: "[啥]"},
        {src: "wired.png", id: "[奇怪咯]"},
        {src: "yes.png", id: "[好的]"}
    ];
    var str = "";
    var content = obj;
    for (var i in face) {
        if (content.match(eval('/(' + face[i].id + ')/'))) {
            str = face[i].id.substr(1);
            str = str.substring(0, str.length - 1);
            var img = '<img src="../../Public/image/face/' + face[i].src + '" />'
            content = content.replace(eval('/' + str + '/g'), img)
        }
    }
    return callback(content)
}

module.exports = router;
