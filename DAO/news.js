var query = require('../config/config');
var path = require('path');
var fs = require('fs');

var news = {
    //根据页数获取资讯列表
    getNewsListByPage: function (page, callback) {
        // var sql="SELECT a.*,b.game_name,b.icon FROM t_news AS a\n" +
        //     "LEFT JOIN t_game AS b ON a.`game_id`=b.`id` order by a.add_time desc limit 0,20";
        // query(sql,[(page-1)*20],function (result) {
        //     return callback(result)
        // })
        var sql = "SELECT a.id,a.title,a.img,FROM_UNIXTIME(a.add_time,'%Y-%m-%d %H:%i') as add_time,a.agree,a.game_id,a.browse," +
            "b.game_name,b.icon,b.game_recommend " +
            "FROM t_news AS a\n" +
            "LEFT JOIN t_game AS b ON a.`game_id`=b.`id` order by a.up desc,a.add_time desc limit ?,5";
        query(sql, [(page - 1) * 5], function (result) {
            return callback(result)
        })
    },
    // 根据id获取资讯详情
    getNewsById: function (id, userId, callback) {
        var sql = "SELECT a.id,a.img,a.title,FROM_UNIXTIME(a.add_time,'%Y-%m-%d %H:%i') as add_time,a.add_user,a.agree,a.browse,a.comment,a.detail,a.game_id,a.sys," +
            "b.icon,b.game_name,c.state,d.id AS collect " +
            "FROM t_news AS a\n" +
            " LEFT JOIN t_game AS b ON  (a.`game_id`=b.`id`)\n" +
            " LEFT JOIN t_like AS c ON a.id=c.parent_id AND c.like_type=11 AND c.like_user_id=? \n" +
            " LEFT JOIN t_collect AS d ON a.id=d.`target_id` AND d.`target_type`=1 AND d.`user_id`=?\n" +
            " WHERE a.id=? GROUP BY a.id";
        query(sql, [userId, userId, id], function (result) {
            return callback(result);
        })
    },
    updateNewsBrowse: function (id, browseNum, callback) {
        var sql = "UPDATE t_news SET browse=? WHERE id=?";
        query(sql, [browseNum, id], function (result) {
            return callback(result);
        })
    },
    getNewsBrowseNum: function (id, callback) {
        var sql = "SELECT browse FROM t_news WHERE id=?";
        query(sql, [id], function (result) {
            return callback(result);
        })
    },
    minusNewsAgree: function (parentId, callback) {
        var sql = "update t_news set agree=agree-1 where id =?";
        query(sql, [parentId], function (result) {
            return callback(result)
        })
    },
    minusNewsCommendAgree: function (parentId, callback) {
        var sql = "update t_news_comment set agree=agree-1 where id =?";
        query(sql, [parentId], function (result) {
            return callback(result)
        })
    },
    // 添加资讯浏览量
    addNewsBrowse: function (id, callback) {
        var sql = "update t_news set browse=browse+1 where id =?";
        query(sql, [id], function (result) {
            return callback(result)
        })
    },
    // 添加资讯点赞量
    addNewsAgree: function (id, callback) {
        var sql = "update t_news set agree=agree+1 where id =?";
        query(sql, [id], function (result) {
            return callback(result)
        })
    },// 添加资讯评论量
    addNewsComment: function (id, callback) {
        var sql = "update t_news set comment=comment+1 where id =?";
        query(sql, [id], function (result) {
            return callback(result)
        })
    },
    addNewsCommentAgree: function (id, callback) {
        var sql = "update t_news_comment set agree=agree+1 where id =?";
        query(sql, [id], function (result) {
            return callback(result)
        })
    },
    addNewsCommentComment: function (id, callback) {
        var sql = "update t_news_comment set comment=comment+1 where id =?";
        query(sql, [id], function (result) {
            return callback(result)
        })
    },
    //添加资讯评论
    newsComment: function (targetCommentId, userId, series, content, addTime, targetUserId, news_img, news_title, newsid, callback) {
        var sql = "insert into t_news_comment " +
            "(content,user_id,series,target_comment_id,add_time,target_user_id,news_img,news_title,newsid) " +
            "values (?,?,?,?,?,?,?,?,?)";
        query(sql, [content, userId, series, targetCommentId, addTime, targetUserId, news_img, news_title, newsid], function (result) {
            return callback(result)
        })
    },
    like: function (parentId, userId, type, callback) {
        var sql = "select * from t_like where parent_id=? and like_type=? and like_user_id=?";
        query(sql, [parentId, type, userId], function (result) {
            if (result.length) {
                var updatesql = "update t_like set state=1 where id =" + result[0].id;
                query(updatesql, [], function (result) {
                    return callback(result)
                });
            } else {
                var insertsql = "insert into t_like (parent_id,like_type,like_user_id,state) values (?,?,?,?)";
                query(insertsql, [parentId, type, userId, 1], function (result) {
                    return callback(result)
                })
            }
        })
    },
    unlike: function (parentId, userId, type, callback) {
        var updatesql = "update t_like set state=0 where parent_id=? and like_type=? and like_user_id=?";
        query(updatesql, [parentId, type, userId], function (result) {
            return callback(result)
        });
    },

    getLikeState: function (parentId, userId, type, callback) {
        var sql = "select state from t_like where parent_id=? and like_type=? and like_user_id=?";
        query(sql, [parentId, type, userId], function (result) {
            return callback(result)
        })
    },
    // 获取资讯评论
    getNewsCommentByPage: function (userId, commentParentId, page, type, callback) {
        var typeSort = type == 1 ? "t_news_comment.add_time desc" : "t_news_comment.agree desc"
        // console.log(type);
        // console.log(typeSort);
        var sql = "SELECT t_news_comment.*,FROM_UNIXTIME(t_news_comment.add_time,'%Y-%m-%d %H:%i') as add_time," +
            "t_user.nick_name,t_user.portrait, t_like.state  \n" +
            "FROM t_news_comment  \n" +
            "LEFT JOIN t_user ON t_news_comment.user_id = t_user.id  \n" +
            "LEFT JOIN t_like ON t_news_comment.id=t_like.parent_id and t_like.like_user_id=? AND t_like.`like_type`=12 WHERE t_news_comment.target_comment_id=? AND \n" +
            "t_news_comment.series=1 order by " + typeSort + "  LIMIT ?,5";
        query(sql, [userId, commentParentId, (page - 1) * 5], function (result) {
            return callback(result)
        })
    },
    // 获取热门资讯评论
    getHotNewsCommentByPage: function (userId, commentParentId, page, callback) {
        var sql = "SELECT t_news_comment.*,FROM_UNIXTIME(t_news_comment.add_time,'%Y-%m-%d %H:%i') as add_time,t_user.nick_name,t_user.portrait, t_like.state  \n" +
            "FROM t_news_comment  \n" +
            "LEFT JOIN t_user ON t_news_comment.user_id = t_user.id  \n" +
            "LEFT JOIN t_like ON t_news_comment.id=t_like.parent_id and t_like.like_user_id=? AND t_like.`like_type`=12 WHERE t_news_comment.target_comment_id=? AND \n" +
            "t_news_comment.series=1 order by t_news_comment.comment desc LIMIT ?,5";
        query(sql, [userId, commentParentId, (page - 1) * 5], function (result) {
            return callback(result)
        })
    },
    getCommentById: function (id, callback) {
        var sql = "select t_news_comment.*,FROM_UNIXTIME(t_news_comment.add_time,'%Y-%m-%d %H:%i') as add_time,t_user.nick_name,t_user.portrait " +
            "from t_news_comment " +
            "left join t_user on t_news_comment.user_id = t_user.id where  t_news_comment.id=?";
        query(sql, [id], function (result) {
            return callback(result)
        })
    },
    getNewsCommentTow: function (parentId, callback) {
        var sql = "SELECT t_news_comment.content,FROM_UNIXTIME(t_news_comment.add_time,'%Y-%m-%d %H:%i') as add_time," +
            "a.nick_name AS selfNickName,b.nick_name AS targetUserNickName " +
            "FROM t_news_comment\n" +
            "LEFT  JOIN  t_user AS a ON t_news_comment.user_id=a.id \n" +
            "LEFT  JOIN  t_user AS b ON t_news_comment.target_user_id=b.id WHERE t_news_comment.target_comment_id=? AND t_news_comment.series=2 limit 0,2";
        query(sql, [parentId], function (result) {
            return callback(result)
        })
    },
    // 获取资讯的二级评论
    getNewsCommentTowByPage: function (parentId, page, callback) {
        var sql = "SELECT t_news_comment.id,t_news_comment.user_id,t_news_comment.content,FROM_UNIXTIME(t_news_comment.add_time,'%Y-%m-%d %H:%i') as add_time,a.nick_name AS selfNickName,a.portrait,b.nick_name AS targetUserNickName,a.id AS selfUserId " +
            "FROM t_news_comment\n" +
            "LEFT  JOIN  t_user AS a ON t_news_comment.user_id=a.id \n" +
            "LEFT  JOIN  t_user AS b ON t_news_comment.target_user_id=b.id WHERE t_news_comment.`target_comment_id` =? AND t_news_comment.series=2 limit ?,10";
        query(sql, [parentId, (page - 1) * 10], function (result) {
            return callback(result)
        })
    },
    getNewsHeadGame: function (obj, callbcak) {
        var sql = "SELECT t_news_headgame.img,t_game.id,t_game.icon,t_game.game_name,t_game.grade,t_game.game_recommend " +
            "FROM `t_news_headgame` " +
            "left join t_game on t_news_headgame.game_id=t_game.id WHERE t_game.sys=? ORDER BY RAND() LIMIT 1";
        query(sql, [obj.sys], function (result) {
            return callbcak(result)
        })
    },
    getNewsSlideGame: function (obj, callbcak) {
        var sql = "SELECT t_game.id,t_game.grade,t_game.game_name,t_game.game_title_img " +
            "FROM `t_news_slidegame`  " +
            "left join t_game on t_news_slidegame.game_id=t_game.id WHERE t_game.sys=? ORDER BY RAND() LIMIT 10";
        query(sql, [obj.sys], function (result) {
            return callbcak(result)
        })
    },
    searchNewsByGameName: function (uid, sys, msg, page, callback) {
        var sql = 'SELECT t_news.* ' +
            'FROM t_news\n' +
            'LEFT JOIN t_game ON t_news.`game_id`=t_game.`id`\n' +
            'WHERE (t_game.`game_name` LIKE "%' + msg + '%" AND t_game.sys=?) OR t_news.title LIKE "%' + msg + '%" ' +
            "LIMIT ?,20";
        query(sql, [sys, (page - 1) * 20], function (result) {
            // if (uid > 0) {
            //     var del_log = "DELETE t_search_log WHERE user_id=? AND title=? AND types=1"
            //     query(del_log, [uid, msg], function () {
            //
            //     });
            //
            //     var add_log = "INSERT INTO t_search_log (`user_id`,`title`,`types`) VALUES (?,?,1)";
            //     query(add_log, [uid, msg], function () {
            //
            //     })
            // }

            return callback(result)
        })
    },
    collect: function (targetId, userId, type, sys, callback) {
        var sql = 'insert into t_collect (target_id,user_id,target_type,sys) values (?,?,?,?)';
        query(sql, [targetId, userId, type, sys], function (result) {
            return callback(result)
        })
    },
    unCollect: function (targetId, userId, type, callback) {
        var sql = 'delete from  t_collect where target_id=? and user_id=? and target_type=?';
        query(sql, [targetId, userId, type], function (result) {
            return callback(result)
        })
    },
    addUserTip: function (targetId, userId, callback) {
        var sql = 'insert into t_tip(tip_id,user_id,type) values (?,?,1)';
        query(sql, [targetId, userId], function () {

        })
    },
    // 阅读新通知
    readMessage: function (userId, callback) {
        var sql = 'update t_tip set state=1 where user_id=?';
        query(sql, [userId], function (result) {
            return callback(result)
        })
    },
    getSensitive: function (obj, callback) {
        var content = obj
        if (content) {
            var str = "";
            fs.readFile(path.join(__dirname, '../sensitive.txt'), 'utf8', function (err, data) {
                if (content.match(eval('/(' + data + ')/'))) {
                    var newArr = data.split("|");
                    for (var i in newArr) {
                        str = newArr[i].substr(1);
                        str = str.substring(0, str.length - 1);
                        content = content.replace(eval('/' + str + '/g'), '****');
                    }
                }
                return callback(content);
            });
        } else {
            return callback(content);
        }
    },
    delMyComment: function (obj, callback) {
        var getMySql = "SELECT * FROM t_news_comment WHERE id=? AND user_id=?"
        query(getMySql, [obj.id, obj.uid], function (my_result) {
            if (my_result.length) {
                var newsId = my_result[0].newsid;
                if (my_result[0].series == 1) {
                    var find_series2 = "SELECT * FROM t_news_comment WHERE target_comment_id=? AND series=2"
                    query(find_series2, [obj.id], function (resList) {
                        if (resList.length) {
                            for (var i in resList) {
                                var deltip1 = "DELETE FROM t_tip WHERE tip_id=? AND type=1"
                                query(deltip1, [resList[i].id], function () {

                                })
                            }

                            var delsql1 = "DELETE FROM t_news_comment WHERE target_comment_id=? AND series=2"
                            query(delsql1, [obj.id], function () {

                            })
                        }
                    })


                    var delsql2 = "DELETE FROM  t_news_comment WHERE id=? AND series=1"
                    query(delsql2, [obj.id], function (result) {

                        var count = "SELECT count(*) FROM t_news_comment WHERE newsid=?"
                        query(count, [newsId], function (count) {
                            var set = "UPDATE t_news SET comment=? WHERE id=?"
                            query(set, [count[0].count, newsId], function (newData) {

                            })
                        })

                        return callback(result)
                    })
                } else {
                    var deltip1 = "DELETE FROM  t_tip WHERE tip_id=? AND type=1"
                    query(deltip1, [obj.id], function () {

                    })

                    var delsql = "DELETE FROM  t_news_comment WHERE id=? AND series=2"
                    query(delsql, [obj.id], function (result) {

                        var count = "SELECT count(*) FROM t_news_comment WHERE newsid=?"
                        query(count, [newsId], function (count) {
                            var set = "UPDATE t_news SET comment=? WHERE id=?"
                            query(set, [count[0].count, newsId], function (newData) {

                            })
                        })

                        return callback(result)
                    })
                }
            } else {
                return callback(my_result)
            }
        })
    }

};
module.exports = news;
