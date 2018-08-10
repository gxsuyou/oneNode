var query = require('../config/config');
var common = {
    hasNewTip: function (userId, callback) {
        var sql = 'SELECT COUNT(id) AS num FROM t_tip WHERE user_id=? AND state=0';
        query(sql, [userId], function (result) {
            return callback(result)
        })
    }
};
module.exports = common;