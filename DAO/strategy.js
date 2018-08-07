var query = require('../config/config');
var path = require('path');
var fs = require('fs');
var strategy = {
    // 添加攻略信息

    addStartegy: function (obj, callback) {
        var sql = 'insert into t_strategy (user_id,title,detail,game_name,top_img_src,add_time) values (?,?,?,?,?,?)';
        query(sql, [obj.userId, obj.title, obj.detail, obj.gameName, obj.top_img_src, obj.addTime], function (result) {
            return callback(result)
        });

    },
    //添加攻略时判断游戏名是否存在
    findGameName: function (gameName, callback) {
        var sql = "select id from t_game where game_name=?";
        query(sql, [gameName], function (result) {
            return callback(result);
        });
    },
    // 添加攻略图片
    addStrategyImg: function (strategyId, img, sort_id, callback) {
        // var val = '';
        // for(var i=0;i<arr.length;i++){
        //     val+='('+strategyId+','+arr[i]+')'
        // }
        // val = val.substring(0,val.length-1);
        // var sql = 'insert into t_strategy (strategy_id,src) values '+val;
        var sql = 'insert into t_strategy_img (strategy_id,src,sort_id) values (?,?,?)';
        query(sql, [strategyId, img, sort_id], function (result) {
            return callback(result)
        })
    },
    // 添加收藏
    collect: function (targetId, userId, sys, type, callback) {
        var sql = 'select id from t_collect where target_id=? and user_id=? and target_type=?';
        query(sql, [targetId, userId, type], function (result) {
            if (!result.length) {
                var sql = 'insert into t_collect (target_id,user_id,sys,target_type) values (?,?,?,?)';
                query(sql, [targetId, userId, sys, type], function (result) {
                    return callback(result)
                })
            } else {
                return callback(result)
            }
        })

    },
    // 取消收藏
    unCollect: function (targetId, userId, type, callback) {
        var sql = 'delete from  t_collect where target_id=? and user_id=? and target_type=?';
        query(sql, [targetId, userId, type], function (result) {
            return callback(result)
        })
    },
    // 获取顶部便捷搜索游戏
    getSearchGame: function (sys, callback) {
        var sql = 'select t_game.icon,t_game.game_name from t_game where strategy_head=1 and sys=? order by id desc limit 0,8';
        query(sql, [sys], function (result) {
            return callback(result)
        })
    },
    // 获取攻略列表                                          

    getStrategyByMsg: function (sort, page, callback) {
        var sql = 'select t_strategy.*,FROM_UNIXTIME(t_strategy.add_time,\'%Y-%m-%d %H:%i\') as add_time,t_user.nick_name,t_admin.nike_name,t_user.portrait \n' +
            ' from t_strategy \n' +
            ' LEFT JOIN t_user ON t_user.id=t_strategy.`user_id`  \n' +
            ' left join t_admin on t_admin.id=t_strategy.user_id ' +
            ' group by t_strategy.id order by ' + sort + ' desc  limit ?,10';
        query(sql, [(page - 1) * 10], function (result) {
            return callback(result)
        })
    },
    // 获取精华攻略
    getStrategyByEssence: function (page, callback) {
        var sql = "select t_strategy.*,FROM_UNIXTIME(t_strategy.add_time,'%Y-%m-%d %H:%i') as add_time,t_strategy_img.src from t_strategy_img  " +
            "left join t_strategy on t_strategy_img.strategy_id= t_strategy.id " +
            "where essence = 1 group by t_strategy.id desc limit ?,10";
        query(sql, [((page - 1) * 10)], function (result) {
            return callback(result)
        })
    },
    // 获取攻略详情
    getStrategyById: function (userId, strategyId, callback) {
        var sql = "SELECT t_strategy.*,FROM_UNIXTIME(t_strategy.add_time,'%Y-%m-%d %H:%i') as add_time," +
            "GROUP_CONCAT(t_strategy_img.src order by t_strategy_img.src desc) as imgList,t_user.`nick_name`,t_user.portrait,d.id as collect,t_strategy_like.`state`,t_admin.nike_name " +
            "FROM t_strategy " +
            "LEFT JOIN t_strategy_img ON t_strategy_img.strategy_id= t_strategy.id " +
            "LEFT JOIN t_user ON t_user.id=t_strategy.`user_id` " +
            "LEFT JOIN t_admin ON t_admin.id=t_strategy.`user_id` " +
            "LEFT JOIN t_strategy_like ON t_strategy_like.`strategy_id`=t_strategy.`id` AND t_strategy_like.`user_id`=? " +
            "LEFT JOIN t_collect AS d ON t_strategy.id=d.`target_id` AND d.`target_type`=2 AND d.`user_id`=?  " +
            "WHERE t_strategy.id =? GROUP BY t_strategy.id";
        query(sql, [userId, userId, strategyId], function (result) {
            return callback(result)
        })
    },
    // 添加攻略（浏览 || 点赞 || 评论）数
    addNum: function (num, strategyId, numType, callback) {
        var sql = 'update t_strategy set ' + numType + '=? where id =?';
        query(sql, [num, strategyId, numType], function (result) {
            return callback(result)
        })
    },
    // 添加评论
    strategyComment: function (content, userId, targetCommentId, targetUserId, series, addTime, target_img, targetid, target_title, callback) {
        var sql = 'insert into t_strategy_comment (content,user_id,target_comment_id,target_user_id,series,add_time,target_img,targetid,target_title) values (?,?,?,?,?,?,?,?,?)';
        query(sql, [content, userId, targetCommentId, targetUserId, series, addTime, target_img, targetid, target_title], function (result) {
            return callback(result);
        });
    },
    // 添加该条攻略的评论条数
    addCommentNum: function (strategyId, callback) {
        var sql = "update t_strategy set comment_num=comment_num+1 where id =?";
        query(sql, [strategyId], function (result) {
            return callback(result)
        })
    },
    // 添加一级评论的评论数
    addFirstCommentNum: function (targetCommentId, callback) {
        var sql = "update t_strategy_comment set comment_num=comment_num+1 where id=?";
        query(sql, [targetCommentId], function (result) {
            return callback(result);

        });
    },
    // 根据一级评论id查询出攻略id
    getStrategyId: function (targetCommentId, callback) {
        var sql = "select target_comment_id as tarId from t_strategy_comment where id=?";
        query(sql, [targetCommentId], function (result) {
            return callback(result);
        })
    },

    //添加攻略评论数AND根据一级评论id查询出攻略id
    addCommentNums: function (targetCommentId, callback) {
        /**一级评论里面的攻略id
         * */
        var sql = "select target_comment_id as tarId from t_strategy_comment where id=?";
        query(sql, [targetCommentId], function (result) {
            var sql = "update t_strategy_comment set comment_num=comment_num+1 where id=?";
            query(sql, [targetCommentId], function (up_result) {//添加一级评论数

            });

            var sql = "update t_strategy set comment_num=comment_num+1 where id =?";
            query(sql, [result[0].tarId], function (up_result2) {//添加攻略评论数

            })

            return callback(result);
        })
    },


    // 添加攻略点赞数
    addAgreeNum: function (commentId, callback) {
        var sql = "update t_strategy_comment set agree_num=agree_num+1 where id =?";
        query(sql, [commentId], function (result) {
            return callback(result)
        })
    },
    // 添加攻略的浏览量
    addBrowseNum: function (strategyId, callback) {
        var sql = "update t_strategy set browse_num=browse_num+1 where id =?";
        query(sql, [strategyId], function (result) {
            return callback(result)
        })
    },
    //点赞接口
    likeComment: function (commentId, userId, state, callback) {
        var sql = 'insert into t_strategy_like (strategy_id,user_id,state) values (?,?,?)';
        query(sql, [commentId, userId, state], function (result) {
            return callback(result)
        })
    },


    updateStrategyCommentImg: function (strategyId, img, callback) {
        var sql = 'update t_strategy_comment set img=? where id =?';
        query(sql, [img, strategyId], function (result) {
            return callback(result)
        })
    },
    // 获取攻略详情页评论接口
    getStrategyCommentByPage: function (userId, strategyId, page, sort, callback) {
        var sql = "SELECT t_strategy_comment.id,t_strategy_comment.content,FROM_UNIXTIME(t_strategy_comment.add_time,'%Y-%m-%d %H:%i') as add_time,t_strategy_comment.img," +
            "t_strategy_comment.agree_num,t_strategy_comment.comment_num,t_user.nick_name,t_user.portrait, " +
            "t_strategy_like.state  \n" +
            "FROM t_strategy_comment \n" +
            "LEFT JOIN t_user ON t_strategy_comment.user_id = t_user.id \n" +
            "LEFT JOIN t_strategy_like ON t_strategy_like.`strategy_id`=t_strategy_comment.`id` AND t_strategy_like.`user_id`=? WHERE t_strategy_comment.target_comment_id=? AND \n" +
            "t_strategy_comment.series=1  ORDER BY t_strategy_comment." + sort + " DESC  LIMIT ?,5";
        query(sql, [userId, strategyId, (page - 1) * 5], function (result) {
            return callback(result)
        })
    },
    // 获取攻略详情页评论接口中使用(获取一级评论的二级评论)
    getStrategyCommentTow: function (parentId, callback) {
        var sql = "SELECT t_strategy_comment.content,FROM_UNIXTIME(t_strategy_comment.add_time,'%Y-%m-%d %H:%i') as add_time," +
            "a.nick_name AS selfNickName, b.nick_name AS targetUserNickName " +
            "FROM t_strategy_comment\n" +
            "LEFT  JOIN  t_user AS a ON t_strategy_comment.user_id=a.id \n" +
            "LEFT  JOIN  t_user AS b ON t_strategy_comment.target_user_id=b.id " +
            "WHERE t_strategy_comment.target_comment_id=? AND t_strategy_comment.series=2 limit 0,2";
        query(sql, [parentId], function (result) {
            return callback(result)
        })
    },
    // 获取二级评论
    getStrategyCommentTowByPage: function (parentId, page, callback) {
        var sql = "SELECT t_strategy_comment.id,t_strategy_comment.content,t_strategy_comment.img,FROM_UNIXTIME(t_strategy_comment.add_time,'%Y-%m-%d %H:%i') as add_time," +
            "a.nick_name AS selfNickName,a.portrait,b.nick_name AS targetUserNickName,a.id AS selfUserId " +
            "FROM t_strategy_comment\n" +
            "LEFT  JOIN  t_user AS a ON t_strategy_comment.user_id=a.id \n" +
            "LEFT  JOIN  t_user AS b ON t_strategy_comment.target_user_id=b.id WHERE t_strategy_comment.`target_comment_id` =? AND t_strategy_comment.series=2 limit ?,10";
        query(sql, [parentId, (page - 1) * 10], function (result) {
            return callback(result)
        })
    },
    // 根据ID获取一级评论
    getCommentById: function (commentId, callback) {
        var sql = "select t_strategy_comment.*,FROM_UNIXTIME(t_strategy_comment.add_time,'%Y-%m-%d %H:%i') as add_time,t_user.nick_name,t_user.portrait " +
            "from t_strategy_comment " +
            "left join t_user on t_strategy_comment.user_id = t_user.id where  t_strategy_comment.id=?";
        query(sql, [commentId], function (result) {
            return callback(result)
        })
    },
    // 阅读新通知
    // readMessage:function (commentId,callback) {
    //     var sql = 'update t_tip set state=1 where tip_id=?';
    //     query(sql,[commentId],function (result) {
    //         return callback(result)
    //     })
    // },
    // 取消点赞接口
    unLikeComment: function (commentId, userId, callback) {
        var sql = "SELECT* FROM t_strategy_comment WHERE id =?";
        query(sql, [commentId], function (result) {
            var agree_num = result[0].agree_num - 1;
            agree_num = agree_num <= 0 ? 0 : agree_num;

            var sql = "update t_strategy_comment set agree_num=? where id =?";
            query(sql, [commentId, agree_num], function (result2) {

            });

            var sql = 'delete from  t_strategy_like where strategy_id=? and user_id=?';
            query(sql, [commentId, userId], function (result3) {
                return callback(result3)
            })
        })
    },
    // 根据关键词获取攻略游戏名字
    getStrategyGameNameByMsg: function (msg, callback) {
        var sql = 'SELECT  t_strategy.id,t_strategy.title,t_strategy.game_name ' +
            'FROM t_strategy ' +
            'WHERE t_strategy.game_name LIKE "%' + msg + '%" OR t_strategy.title LIKE "%' + msg + '%" ' +
            'GROUP BY game_name LIMIT 0,10';
        query(sql, [], function (result) {
            return callback(result)
        })
    },
    // 根据关游戏名字获取攻略
    getStrategyByGameName: function (gameName, sort, page, callback) {
        var sql = "select t_strategy.*,FROM_UNIXTIME(t_strategy.add_time,'%Y-%m-%d %H:%i') as add_time," +
            "GROUP_CONCAT(t_strategy_img.src order by t_strategy_img.src desc) as src,t_user.`nick_name`,t_user.portrait,t_admin.nike_name " +
            "from t_strategy left join t_strategy_img on t_strategy_img.strategy_id= t_strategy.id " +
            "LEFT JOIN t_user ON t_user.id=t_strategy.`user_id` " +
            "LEFT JOIN t_admin ON t_admin.id=t_strategy.`user_id` " +
            "where t_strategy.game_name  =? group by t_strategy.id  order by " + sort + " desc limit ?,10";
        query(sql, [gameName, (page - 1) * 10], function (result) {
            return callback(result)
        })
    },
    getEssenceStrategyByGameName: function (gameName, page, callback) {
        var sql = "select t_strategy.*,FROM_UNIXTIME(t_strategy.add_time,'%Y-%m-%d %H:%i') as add_time,t_strategy_img.src from t_strategy " +
            "left join t_strategy_img on t_strategy_img.strategy_id= t_strategy.id " +
            "where essence = 1 and t_strategy.game_name  =? group by t_strategy.id limit ?,10";
        query(sql, [gameName, (page - 1) * 10], function (result) {
            return callback(result)
        })
    },
    addUserTip: function (targetId, userId, callback) {
        var sql = 'insert into t_tip(tip_id,user_id,type) values (?,?,2)';
        query(sql, [targetId, userId], function () {

        })
    },
    // 添加攻略评论图片
    updateCommentImg: function (commentId, img, callback) {
        var sql = 'update t_strategy_comment set img = ? where id =?';
        query(sql, [img, commentId], function (result) {
            return callback(result)
        })
    },
    // 只看楼主
    getStrategyCommentByPageUser: function (userId, targetId, strategyId, page, callback) {
        var sql = "SELECT t_strategy_comment.id,t_strategy_comment.img,t_strategy_comment.content," +
            "t_strategy_comment.content,FROM_UNIXTIME(t_strategy_comment.add_time,'%Y-%m-%d %H:%i') as add_time," +
            "t_strategy_comment.agree_num,t_strategy_comment.comment_num," +
            "t_user.nick_name,t_user.portrait, t_strategy_like.state  " +
            "FROM t_strategy_comment \n" +
            "LEFT JOIN t_user ON t_strategy_comment.user_id = t_user.id \n" +
            "LEFT JOIN t_strategy_like ON t_strategy_like.`strategy_id`=t_strategy_comment.`id` AND t_strategy_like.`user_id`=? \n" +
            "WHERE t_strategy_comment.user_id=? and t_strategy_comment.target_comment_id=? order by t_strategy_comment.id desc limit ?,5";
        query(sql, [userId, targetId, strategyId, (page - 1) * 5], function (result) {
            return callback(result);
        });
    },
    // 我的作品删除
    strategyDelete: function (strategyId, callback) {
        var hasStrategy = "SELECT * FROM t_strategy WHERE id=?"
        query(hasStrategy, [strategyId], function (strategy) {
            var tip = "delete from t_tip where tip_id=? AND type=2 AND user_id = ?";
            query(tip, [strategyId, strategy[0].user_id], function (result1) {

            });

            var sql_com = "delete from t_strategy_comment where targetid=? ";
            query(sql_com, [strategyId], function (result2) {

            });

            var sql = "delete from t_strategy where id=?";
            query(sql, [strategyId], function (result3) {
                return callback(result3);
            });
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
    }


};
module.exports = strategy;