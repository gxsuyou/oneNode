/**
 * Created by Administrator on 2016/12/15.
 */
var query = require('../config/config');
var common = require('../DAO/common');

var user = {
    login: function (user_tel, password, callback) {
        // var pwd = common.pwdMd5(password)
        // console.log(pwd);
        var sql = "select id,nick_name,portrait,coin,integral,achievement_point,time_logon,tel,pay from t_user where tel=? and password=?";
        query(sql, [user_tel, password], function (result) {
            if (result.length > 0) {
                return callback(result)
            } else {
                var sql = "select id,nick_name,portrait,coin,integral,achievement_point,time_logon,tel pay from t_user where nick_name=? and password=?";
                query(sql, [user_tel, password], function (res) {
                    return callback(res)
                })
            }
        })
    },
    // uplogin: function (id, time, callback) {
    //     var sql = "UPDATE t_user SET login_time=? WHERE id=?"
    //     query(sql, [time, id], function (result) {
    //         return callback(result)
    //     })
    // },
    gameComment: function (userId, gameId, score, content, agree, addTime, parentId, address, callback) {
        var sql = "INSERT INTO t_game_recommend (user_id,game_id,score,content,agree,add_time,parent_id,address) values (?,?,?,?,?,?,?,?)";
        query(sql, [userId, gameId, score, content, agree, addTime, parentId, address], function (result) {
            return callback(result)
        })
    },
    getGameCommentScoreById: function (game_id, callback) {
        var sql = "select score from t_game_recommend where game_id=?";
        query(sql, [game_id], function (result) {
            return callback(result)
        })
    },
    getUserCommentLen: function (game_id, user_id, callback) {
        var sql = "select count(*) as count from t_game_recommend where game_id=? and user_id=?";
        query(sql, [game_id, user_id], function (result) {
            return callback(result)
        })
    },
    updateGameScore: function (game_id, score, callback) {
        var sql = "UPDATE t_game SET grade=? where id=?";
        query(sql, [score, game_id], function (result) {
            return callback(result)
        })
    },
    // 注册
    reg: function (tel, password, timeLogon, img, callback) {
        var date = new Date();
        var month = date.getMonth() + 1
        var day = date.getDate()
        var H = date.getHours()
        var M = date.getMinutes()

        var sqlUser = "select * from t_user where tel =?";
        var nick_name = "ONE_" + month + day + H + M + "_" + Math.floor(Math.random() * 99999);
        var sql = "INSERT INTO t_user (nick_name,password,portrait,coin,integral,achievement_point,sign,time_unlock,time_logon,tel) values (?,?,?,0,500,0,0,0,?,?)";
        query(sqlUser, [tel], function (result) {
            if (result.length <= 0) {
                // var pwd = common.pwdMd5(password)
                query(sql, [nick_name, password, img, timeLogon, tel], function (res) {
                    console.log(res)
                    return callback(res);
                })
            } else {
                return callback(result)
            }
        })
    },
    updateOnlyidById: function (id, callback) {
        var onlyId = (parseInt(id) + 123456);
        var sql = "UPDATE t_user SET only_id=? where id=?";
        query(sql, [onlyId, id], function (result) {
            return callback(result)
        })
    },
    userList: function (callback) {
        var sql = 'select nick_name,coin,integral,achievement_point,time_logon,tel,new_online,channel,sign,new_sign from t_user';
        query(sql, [], function (result) {
            return callback(result);
        })
    },
    getChannel: function (callback) {
        var sql = "select * from t_channel";
        query(sql, [], function (result) {
            return callback(result)
        })
    },
    updateChannel: function (channel, uid, callback) {
        var sql = "UPDATE t_user SET channel=? where id=?";
        query(sql, [channel, uid], function (result) {
            var sql = "select id,nick_name,portrait,coin,integral,achievement_point,sign,time_unlock,time_logon,tel,pay from t_user where id=?";
            query(sql, [uid], function (res) {
                return callback(res)
            })

        })
    },
    selectUserIntegral: function (id, callback) {
        var sql = "select integral from t_user where id=?";
        query(sql, [id], function (result) {
            return callback(result)
        })
    },
    updateUserIntegral: function (id, integral, callback) {
        var sql = "update t_user set integral=? where id=?";
        query(sql, [integral, id], function (result) {
            return callback(result)
        })
    },
    selectUserCoin: function (id, callback) {
        var sql = "select coin from t_user where id=?";
        query(sql, [id], function (result) {
            return callback(result)
        })
    },
    updateUserCoin: function (id, integral, callback) {
        var sql = "update t_user set Coin=? where id=?";
        query(sql, [integral, id], function (result) {
            return callback(result)
        })
    },
    addLottery: function (uid, gty, num, start, end, value, callback) {
        var sql = "insert into t_lottery (user_id,gift_type,num,start_time,end_time,value) values (?,?,?,?,?,?)";
        query(sql, [uid, gty, num, start, end, value], function (result) {
            return callback(result);
        })
    },
    updateLottery: function (uid, gty, callback) {
        var sql = "select * from t_lottery where user_id =? and gift_type=? LIMIT 1;";
        query(sql, [uid, gty], function (result) {
            if (result.length) {
                console.log(result);
                var num = result[0].num + 1;
                var sql = "update t_lottery set num=? where user_id =? and gift_type=?";
                query(sql, [num, uid, gty], function (result) {
                    return callback(result)
                })
            } else {
                var sql = "insert into t_lottery (user_id,gift_type,num) values (?,?,1)";
                query(sql, [uid, gty], function (result) {
                    return callback(result)
                })
            }
        })
    },
    getLotteryByUid: function (uid, callback) {
        var sql = "select * from t_lottery where user_id=?";
        query(sql, [uid], function (result) {
            return callback(result)
        })
    },

    getServerAddress: function (callback) {
        var sql = "select * from t_server";
        query(sql, [], function (result) {
            return callback(result)
        })
    },
    getCoinById: function (id, callback) {
        var sql = "select coin from t_user where id=?";
        query(sql, [id], function (result) {
            return callback(result)
        })
    },
    getSignById: function (id, callback) {
        var sql = "select sign,new_sign from t_user where id=?";
        query(sql, [id], function (result) {
            return callback(result)
        })
    },
    updateSign: function (id, sign, newSign, callbcak) {
        var sql = "update t_user set sign=?,new_sign=? where id=?";
        query(sql, [sign, newSign, id], function (result) {
            return callbcak(result)
        })
    },
    updateNickName: function (id, nickName, callback) {
        var sql = "update t_user set nick_name=? where id=?";
        query(sql, [nickName, id], function (result) {
            return callback(result)
        })
    },
    updateHead: function (head, id, callback) {
        var sql = "update t_user set portrait=? where id=?";
        query(sql, [head, id], function (result) {
            return callback(result)
        })
    },
    updateSex: function (id, sex, callback) {
        var sql = "update t_user set sex=? where id=?";
        query(sql, [sex, id], function (result) {
            return callback(result)
        })
    },
    updateBirthday: function (id, birthday, callback) {
        var sql = "update t_user set birthday=? where id=?";
        query(sql, [birthday, id], function (result) {
            return callback(result)
        })
    },
    getUserMsgById: function (id, callback) {
        var sql = "select id,nick_name,portrait,coin,integral,tel,sign,new_sign,channel,sex,pay,only_id,birthday,head_add  from t_user where id=?";
        query(sql, [id], function (result) {
            return callback(result)
        })
    },
    getGameCollect: function (id, callback) {
        var sql = "SELECT * FROM t_collect WHERE user_id=? AND target_type=3";
        query(sql, [id], function (result) {
            return callback(result)
        })
    },
    addAddress: function (uid, name, tel, area, detail, callback) {
        var sql = "insert into t_address (user_id,user_name,tel,area,detail_address) values (?,?,?,?,?)";
        query(sql, [uid, name, tel, area, detail], function (result) {
            return callback(result);
        })
    },
    editAddress: function (uid, name, tel, area, detail, callback) {
        var sql = "update t_address set user_name=?,tel=?,area=?,detail_address=? where id=?";
        query(sql, [name, tel, area, detail, uid], function (result) {
            return callback(result)
        })
    },
    getAddress: function (uid, callback) {
        var sql = "select * from t_address where user_id=?";
        query(sql, [uid], function (result) {
            return callback(result)
        })
    },
    getNewsByUserId: function (userId, page, callback) {
        var sql = "SELECT a.id,a.title,a.img,a.add_time,a.agree,a.game_id,a.browse,b.game_name,b.icon,b.game_recommend FROM t_news AS a\n" +
            "LEFT JOIN t_game AS b ON a.`game_id`=b.`id` where a.add_user=? order by a.up desc,a.add_time desc limit ?,10";
        query(sql, [userId, (page - 1) * 10], function (result) {
            return callback(result)
        })
    },
    getStrategyByUserId: function (userId, page, callback) {
        var sql = 'select t_strategy.*,FROM_UNIXTIME(t_strategy.add_time,"%Y-%m-%d %H:%i") as add_time,' +
            't_strategy_img.src,t_user.`nick_name`,t_user.portrait ' +
            'from t_strategy ' +
            'left join t_strategy_img on t_strategy_img.strategy_id= t_strategy.id ' +
            'LEFT JOIN t_user ON t_user.id=t_strategy.`user_id` ' +
            'where t_strategy.`user_id`=? group by t_strategy.id order by add_time desc  limit ?,10';
        query(sql, [userId, (page - 1) * 10], function (result) {
            return callback(result)
        })
    },
    // 获取用户资讯收藏
    getNewsCollect: function (userId, page, callback) {
        var sql = "SELECT a.id,a.title,a.img,FROM_UNIXTIME(a.add_time,'%Y-%m-%d %H:%i') as add_time,a.agree," +
            "a.game_id,a.browse,b.game_name,b.icon,b.game_recommend,c.id as coll_id " +
            "FROM t_collect as c " +
            "left join t_news AS a on a.id= c.target_id and c.user_id=?\n" +
            "LEFT JOIN t_game AS b ON a.`game_id`=b.`id` " +
            "where c.target_type=1  order by a.up desc,c.id desc limit ?,10";
        query(sql, [userId, (page - 1) * 10], function (result) {
            return callback(result)
        })
    },
    // 获取用户攻略收藏
    getStrategyCollect: function (userId, page, callback) {
        var sql = 'select t_strategy.*,FROM_UNIXTIME(t_strategy.add_time,"%Y-%m-%d %H:%i") as add_time,' +
            't_user.`nick_name`,t_user.portrait,t_admin.nike_name,t_collect.id as coll_id ' +
            'from t_collect  ' +
            'left join t_strategy on t_strategy.id=t_collect.target_id ' +
            'LEFT JOIN t_user ON t_user.id=t_strategy.`user_id` ' +
            'LEFT JOIN t_admin ON t_admin.id=t_strategy.`user_id` ' +
            'where t_collect.`user_id`=? and t_collect.target_type=2 group by t_strategy.id order by t_collect.id desc  limit ?,10';
        query(sql, [userId, (page - 1) * 10], function (result) {
            return callback(result)
        })
    },
    getH5ByUser: function (userId, page, callback) {
        var sql = 'select t_h5.*,t_collect.id as coll_id from t_collect ' +
            'left join t_h5 on t_h5.id = t_collect.target_id ' +
            'where t_collect.user_id = ? and t_collect.target_type=4 limit ?,10';
        query(sql, [userId, (page - 1) * 10], function (result) {
            return callback(result)
        })
    },
    // 获取我的游戏
    getGameByUser: function (userId, sys, page, callback) {
        var sql = "SELECT t_game.*,GROUP_CONCAT(t_tag.name) AS tagList,GROUP_CONCAT(t_tag.id) AS tagId " +
            "FROM t_collect \n" +
            "LEFT JOIN t_game ON t_game.`id`=t_collect.`target_id`\n" +
            "LEFT JOIN t_tag_relation ON t_tag_relation.game_id = t_game.id \n" +
            "LEFT JOIN t_tag ON t_tag.`id`=t_tag_relation.`tag_id` " +
            "WHERE t_collect.`user_id`=? AND t_collect.`target_type`=3 AND t_game.sys=? " +
            "GROUP BY t_game.id ";
        query(sql, [userId, sys, (page - 1) * 10], function (result) {
            return callback(result)
        })
    },
    //获取攻略新消息
    strategyMessage: function (userId, sort, page, callback) {
        var sql = "select t_strategy_comment.id,t_strategy_comment.target_img,t_strategy_comment.targetid," +
            "t_strategy_comment.target_title,t_strategy_comment.content as s_content,t_strategy_comment.series," +
            "t_strategy_comment.target_comment_id as parentId,FROM_UNIXTIME(t_strategy_comment.add_time,'%Y-%m-%d %H:%i') as add_time," +
            "t_tip.type,t_tip.state,t_user.nick_name,t_user.portrait " +
            "from  t_strategy_comment \n" +
            "left join t_tip ON t_tip.`tip_id`=t_strategy_comment.`id`\n" +
            "left join t_user ON t_strategy_comment.`user_id`=t_user.id \n" +
            "where  t_strategy_comment.target_user_id=? AND t_tip.type=? " +
            "group by t_strategy_comment.add_time  desc limit ?,10";

        query(sql, [userId, sort, (page - 1) * 10], function (result) {
            return callback(result)
        })

    },
    // 获取资讯新消息
    newsMessage: function (userId, sort, page, callback) {
        var sql = "select t_news_comment.id,t_news_comment.news_img,t_news_comment.newsid,t_news_comment.news_title," +
            "t_news_comment.content,t_news_comment.series,t_news_comment.target_comment_id as parentId," +
            "FROM_UNIXTIME(t_news_comment.add_time,'%Y-%m-%d %H:%i') as add_time,t_tip.type,t_user.nick_name, t_user.portrait " +
            "from t_news_comment \n" +
            "left join t_user on t_news_comment.user_id=t_user.id \n" +
            "left join t_tip on t_news_comment.id=t_tip.tip_id \n" +
            "where t_news_comment.target_user_id=? AND t_tip.type=? " +
            "group by t_news_comment.add_time  desc limit ?,10";
        query(sql, [userId, sort, (page - 1) * 10], function (result) {
            return callback(result)
        })

    },
    // 获取游戏新消息
    gameMessage: function (userId, sort, page, callback) {
        var sql = "select t_game_comment.id,t_game_comment.game_name,t_game_comment.game_id," +
            "t_game_comment.content,t_game_comment.series,t_game_comment.parent_id as parentId," +
            "FROM_UNIXTIME(t_game_comment.add_time,'%Y-%m-%d %H:%i') as add_time,t_tip.type,t_user.nick_name,t_user.portrait " +
            "from t_game_comment \n" +
            "left join t_user on t_game_comment.user_id=t_user.id \n" +
            "left join t_tip on t_game_comment.id=t_tip.tip_id \n" +
            "where t_game_comment.to_user=? AND t_tip.type=? " +
            "group by t_game_comment.add_time  desc limit ?,10 ";

        query(sql, [userId, sort, (page - 1) * 10], function (result) {
            return callback(result)
        })

    },
    // 添加意见反馈信息
    addFeedbackMsg: function (userId, content, callback) {
        var sql = 'insert into t_feedback (detail,user_id) values (?,?)';
        query(sql, [content, userId], function (result) {
            return callback(result)
        })
    },
    addFeedbackImg: function (feedbackId, img, callbcak) {
        var sql = 'insert into t_feedback_img (feedback_id,img) values (?,?)';
        query(sql, [feedbackId, img], function (result) {
            return callbcak(result)
        })
    },
    // 找回密码
    upDatePassword: function (password, tel, callback) {
        var sql = "update t_user set password=? where tel=?";
        query(sql, [password, tel], function (result) {
            return callback(result)
        })
    },
    /**
     * 删除收藏
     */
    getDelCollect: function (obj, callback) {
        var sql = "SELECT * FROM t_collect WHERE id=? "
        query(sql, [obj.id], function (result) {
            if (result.length) {
                var del_sql = "DELETE FROM t_collect WHERE id=?";
                query(del_sql, [obj.id], function (del_result) {
                    return callback(del_result)
                })
            }
        })
    },

    hasNickName: function (obj, callback) {
        var sql = "SELECT * FROM t_user WHERE nick_name=? "
        query(sql, [obj], function (result) {
            var sql = "SELECT * FROM t_admin WHERE nike_name=? "
            query(sql, [obj], function (admin_result) {
                return callback({user: result, admin: admin_result})
            })
        })
    },
    getMsg: function (obj, callback) {
        var sql = "SELECT * FROM t_tip WHERE user_id=? AND type<4 AND state=0"
        query(sql, [obj.uid, obj.type], function (result) {
            return callback(result)
        })
    },
    getReading: function (obj, callback) {
        var sql = "UPDATE t_tip SET state=1 WHERE user_id=? AND type=?"
        query(sql, [obj.uid, obj.type], function (result) {
            return callback(result)
        })
    },

    getNoticeDay: function (obj, uid, addTime, callback) {
        var sql = "SELECT * FROM t_feedback WHERE types=? AND add_time BETWEEN " + obj.start + " AND " + obj.end + " ORDER BY id DESC LIMIT 1"
        query(sql, [obj.types], function (feedbackDay) {
            var id = feedbackDay[0].id;
            var find = "SELECT * FROM t_tip WHERE user_id=? AND tip_id=?";
            query(find, [uid, id], function (tipFind) {
                if (!tipFind.length) {
                    var sql_tip = "INSERT INTO t_tip " +
                        "(`user_id`,`tip_id`,`type`,`state`,`add_time`,`detail`,`m_state`) " +
                        "VALUES (?,?,?,0,?,?,1)";
                    query(sql_tip, [uid, id, obj.types, addTime, feedbackDay[0].detail], function (add_tip) {

                    })
                }
            })

            return callback(feedbackDay)
        })
    },

    // getNotice: function (obj, type, callback) {
    //     var sql = "SELECT a.*,FROM_UNIXTIME(a.add_time,'%m月%d日') as addTime,b.user_id as uid, b.state as b_state " +
    //         "FROM t_feedback a " +
    //         "LEFT JOIN t_tip b ON b.tip_id=a.id AND b.type=a.types AND b.user_id=? " +
    //         "WHERE a.types=? ORDER BY a.id DESC ";
    //     query(sql, [obj.uid, type], function (result) {
    //         return callback(result)
    //     })
    // },
    getNotice: function (obj, type, callback) {
        var sql = "SELECT count(*) as count FROM t_tip WHERE user_id=? AND type=? AND state=0";
        query(sql, [obj.uid, type], function (count) {
            var sql1 = "SELECT *,FROM_UNIXTIME(add_time,'%m月%d日 %H:%i') as addTime " +
                "FROM t_tip WHERE user_id=? AND type=? ORDER BY id DESC LIMIT 1 ";
            query(sql1, [obj.uid, type], function (result) {
                return callback({result: result[0], count: count[0].count})
            })
        })
    },

    getFeedback: function (obj, callback) {
        var sql = "SELECT *,FROM_UNIXTIME(add_time,'%m月%d日 %H:%i') as addTime FROM t_feedback WHERE user_id=? AND types=7 ORDER BY id DESC";
        query(sql, [obj.uid], function (resule) {
            var sql2 = "UPDATE t_tip SET state=1 WHERE user_id=? AND type=7"
            query(sql2, [obj.uid], function () {
            })
            return callback(resule)
        })

    },
    getFeedbackLast: function (obj, callback) {
        var sql = "SELECT *,FROM_UNIXTIME(add_time,'%m月%d日') as addTime FROM t_feedback WHERE user_id=? AND types=7 ORDER BY id DESC LIMIT 1";
        query(sql, [obj.uid], function (resule) {
            var sql2 = "UPDATE t_tip SET state=1 WHERE user_id=? AND type=?"
            query(sql2, [obj.uid, obj.type], function () {
            })

            return callback(resule)
        })

    },

    getNoticeInfoAdd: function (obj, callback) {
        var sql = "SELECT a.*,b.id AS t_id,b.tip_id,b.user_id AS uid,b.state AS b_state " +
            "FROM t_feedback a LEFT JOIN t_tip b ON a.id=b.tip_id AND b.type=a.types AND b.user_id=? " +
            "WHERE a.types=? AND a.n_status=1 ORDER BY a.id DESC "
        query(sql, [obj.uid, obj.type], function (lists) {
            for (var i in lists) {
                if (lists[i].t_id > 0) {
                    if (lists[i].b_state < 1) {
                        var tipDelSql = "UPDATE t_tip SET state=1 WHERE user_id=? AND type=? AND tip_id=?"
                        query(tipDelSql, [obj.uid, obj.type, lists[i].id], function () {

                        })
                    }

                } else {
                    var add_tip = "INSERT INTO t_tip " +
                        "(`tip_id`,`user_id`,`type`,`state`,`add_time`,`detail`,`m_state`) " +
                        "VALUES (?,?,?,?,?,?,?) "
                    query(add_tip, [lists[i].id, obj.uid, obj.type, 1, lists[i].add_time, lists[i].detail, 0], function () {

                    })
                }


            }
            return callback(lists)
        })
    },

    getNoticeInfo: function (obj, callback) {
        var sql = "SELECT *,FROM_UNIXTIME(add_time,'%m月%d日') as addTime FROM t_tip WHERE user_id=? AND type=? ORDER BY id DESC "
        query(sql, [obj.uid, obj.type], function (result) {
            return callback(result)
        })
    },

    searchLogAdd: function (obj, sys, callback) {
        var del_log = "DELETE FROM t_search_log WHERE user_id=? AND title=? AND types=? AND sys=?";
        query(del_log, [obj.uid, obj.keyword, obj.type, sys], function () {

        });

        var add_log = "INSERT INTO t_search_log (`user_id`,`title`,`types`,`sys`) VALUES (?,?,?,?)";
        query(add_log, [obj.uid, obj.keyword, obj.type, sys], function (result) {
            return callback(result)
        })
    },
    searchLog: function (obj, sys, callback) {
        var sql = "SELECT * FROM t_search_log WHERE user_id=? AND types=? AND sys=? ORDER BY id DESC"
        query(sql, [obj.uid, obj.type, sys], function (result) {
            return callback(result)
        })
    },
    clearSearchLog: function (obj, sys, callback) {
        var sql = "DELETE FROM t_search_log WHERE user_id=? AND types=? AND sys=?"
        if (obj.id > 0) {
            sql = "DELETE FROM t_search_log WHERE user_id=? AND types=? AND sys=? AND id=?"
        }
        query(sql, [obj.uid, obj.type, sys, obj.id], function (result) {
            return callback(result)
        })
    }

};
module.exports = user;

