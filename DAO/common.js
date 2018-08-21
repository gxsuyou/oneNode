var query = require('../config/config');
var common = {
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
    hasUserLog: function (obj, callback) {
        var sql = "SELECT * FROM t_all_activity_log WHERE user_id=? AND start_time BETWEEN" + obj.start + " AND " + obj.end + " AND type=2"
        query(sql, [obj.uid], function (result) {
            return callback(result);
        })
    },
    getUserLogAdd: function (obj, callback) {
        var sql = "INSERT INTO t_all_activity_log (`user_id`,`start_time`,`type`,`sys`) VALUES (?,?,2,0)";
        query(sql, [obj.uid, obj.addTime], function (result) {
            return callback(result);
        })
    },
};
module.exports = common;