var query = require('../config/config');
var crypto = require('crypto');
var common = {
    /**
     * md5加密
     * @param pwd
     * @returns {PromiseLike<ArrayBuffer>}
     */
    pwdMd5: function (pwd) {
        var md5 = crypto.createHash('md5');
        //var result =
        var pwd = md5.update(pwd).digest('hex')
        return pwd;
        //return callback(result)
    },

    hasNewTip: function (userId, callback) {
        var sql = 'SELECT COUNT(id) AS num FROM t_tip WHERE user_id=? AND state=0';
        query(sql, [userId], function (result) {
            return callback(result)
        })
    },
    hasDownLoadDay: function (obj, callback) {
        var sql = "SELECT * FROM t_all_activity_log WHERE start_time>=? AND end_time<=? AND type=1 AND sys=?";
        query(sql, [obj.start, obj.end, obj.sys], function (result) {
            return callback(result);
        })
    },
    getDownLoadDay: function (obj, callback) {
        var sql = "INSERT INTO t_all_activity_log (`start_time`,`end_time`,`type`,`sys`,`num`) VALUES (?,?,?,?,?)";
        query(sql, [obj.start, obj.end, obj.type, obj.sys, obj.num], function (result) {
            return callback(result);
        })
    },
    getDownLoadDayUp: function (obj, callback) {
        var sql = "UPDATE t_all_activity_log SET num=? WHERE id=?";
        query(sql, [obj.num, obj.id], function (result) {
            return callback(result);
        })
    },
    getUserLogAdd: function (userId, start, end, nowTime, callback) {
        var sql = "SELECT * FROM t_all_activity_log " +
            "WHERE user_id=? AND type=2 AND start_time BETWEEN " + start + " AND " + end
        query(sql, [userId], function (userInfo) {
            if (userInfo.length) {
                return callback(userInfo);
            } else {
                var addSql = "INSERT INTO t_all_activity_log (`user_id`,`start_time`,`type`,`sys`) VALUES (?,?,2,0)";
                query(addSql, [userId, nowTime], function (result) {
                    return callback(result);
                })

            }
        })
    },
    getChangeFace: function (obj) {
        var face = [
            {src: "a_what.png", id: "<好奇怪>"},
            {src: "alas.png", id: "<哎呀>"},
            {src: "angry.png", id: "<怒>"},
            {src: "ass.png", id: "<屎>"},
            {src: "bad_smile.png", id: "<坏笑>"},
            {src: "beer_brown.png", id: "<棕啤>"},
            {src: "beer_yellow.png", id: "<黄啤>"},
            {src: "black.png", id: "<黑头>"},
            {src: "but.png", id: "<无奈>"},
            {src: "butcry.png", id: "<无奈哭>"},
            {src: "bye.png", id: "<再见>"},
            {src: "cool.png", id: "<酷>"},
            {src: "cry.png", id: "<哭>"},
            {src: "cry_hand.png", id: "<手扶脸>"},
            {src: "cry_smile.png", id: "<哭笑>"},
            {src: "cut.png", id: "<可爱>"},
            {src: "dog.png", id: "<狗>"},
            {src: "doughnut.png", id: "<甜甜圈>"},
            {src: "duck.png", id: "<鸭子>"},
            {src: "eat_wat.png", id: "<吃西瓜>"},
            {src: "eee.png", id: "<额>"},
            {src: "halo.png", id: "<晕>"},
            {src: "heart.png", id: "<心>"},
            {src: "heart_break.png", id: "<心碎>"},
            {src: "impatine.png", id: "<不耐烦>"},
            {src: "kiss.png", id: "<亲亲>"},
            {src: "laugl.png", id: "<偷笑>"},
            {src: "leaf.png", id: "<树叶>"},
            {src: "lemon.png", id: "<柠檬>"},
            {src: "notsobad.png", id: "<好无奈>"},
            {src: "ooo.png", id: "<噢噢>"},
            {src: "pig.png", id: "<猪>"},
            {src: "punch_face.png", id: "<打脸>"},
            {src: "rigid.png", id: "<僵硬>"},
            {src: "see_smile.png", id: "<看坏笑>"},
            {src: "she.png", id: "<喜欢>"},
            {src: "shine.png", id: "<闪耀>"},
            {src: "shock.png", id: "<惊呆>"},
            {src: "shutup.png", id: "<闭嘴>"},
            {src: "shy.png", id: "<害羞>"},
            {src: "sleep.png", id: "<睡觉>"},
            {src: "slience.png", id: "<沉默>"},
            {src: "split.png", id: "<吐>"},
            {src: "strange.png", id: "<奇怪>"},
            {src: "smile_big.png", id: "<大笑>"},
            {src: "smile_little.png", id: "<害羞无奈>"},
            {src: "soangry.png", id: "<超生气>"},
            {src: "surprised.png", id: "<惊讶>"},
            {src: "unhappy.png", id: "<不高兴>"},
            {src: "wa.png", id: "<青蛙>"},
            {src: "watermelon.png", id: "<西瓜>"},
            {src: "what.png", id: "<啥>"},
            {src: "wired.png", id: "<奇怪咯>"},
            {src: "yes.png", id: "<好的>"}
        ];
        var str = "";
        var content = obj;
        for (var i in face) {
            if (content.match(eval('/([' + face[i].id + '])/'))) {
                str = face[i].id.substr(1);
                str = str.substring(0, str.length - 1);
                var img = '<img src="../../Public/image/face/' + face[i].src + '" />'
                content = content.replace(eval('/<' + str + '>/g'), img)
            }

        }
        return content
    }
};
module.exports = common;