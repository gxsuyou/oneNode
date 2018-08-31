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
    }
};
module.exports = common;