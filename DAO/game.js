var query = require('../config/config');
var game = {
    // 获取游戏详情
    getDetailById: function (gameId, callback) {
        // query("call pro_getGameDetailById(?)",[gameId],callback);
        var sql = 'SELECT a.game_download_ios, a.game_download_ios2, a.game_packagename, a.game_download_andriod, ' +
            'a.`game_name`, a.game_size, a.game_download_num, a.game_version,FROM_UNIXTIME(a.game_update_date,"%Y-%m-%d") as game_update_date, ' +
            'a.game_detail, a.`game_title_img`, a.`game_company`, a.`icon`,a.`grade`,' +
            'GROUP_CONCAT(c.name) AS tagList, GROUP_CONCAT(c.id) AS tagId ' +
            'FROM t_game a ' +
            'LEFT JOIN t_tag_relation b ON b.`game_id`=a.`id` ' +
            'LEFT JOIN t_tag c ON b.`tag_id`=c.`id` ' +
            'WHERE a.`id`=?';
        query(sql, [gameId], function (result) {
            return callback(result)
        })
    },
    getGameMsgById: function (gameId, callback) {
        var sql = "SELECT * FROM t_game WHERE id = ?"
        query(sql, [gameId], function (result) {
            return callback(result);
        })
    },
    getGameMsgByIdSys: function (gameName, sys, callback) {
        var sql = "SELECT * FROM t_game WHERE game_name = ? AND sys = ?"
        query(sql, [gameName, sys], function (result) {
            return callback(result);
        })
    },
    getGameImgListById: function (gameId, callback) {
        var sql = 'select img_src from t_game_img where game_id=?';
        query(sql, [gameId], function (result) {
            return callback(result)
        })
    },
    getCarousel: function (sys, callback) {
        var sql = "SELECT * FROM t_activity WHERE type=1 AND active=1 AND sys=? ORDER BY sort DESC";
        query(sql, [sys], function (result) {
            return callback(result)
        })
    },
    //三位推荐
    getActive: function (obj, callback) {
        var sql = "select * from t_activity where type=4 and active=1 and sys = ? ORDER BY RAND() LIMIT 3";
        query(sql, [obj.sys], function (result) {
            return callback(result)
        })
    },
    // 两位推荐
    getActiveLenOfTow: function (obj, callback) {
        var sql = "SELECT a.type as activeType, b.id, b.game_name, b.game_packagename, b.game_title_img " +
            "FROM t_activity a " +
            "LEFT JOIN t_game b on b.id= a.game_id " +
            "WHERE a.type=5 AND a.active=1 AND b.sys = ? ORDER BY RAND() LIMIT 2";
        query(sql, [obj.sys], function (result) {
            return callback(result)
        })
    },
    //10位以上的推荐
    getActiveLenOfTen: function (obj, callback) {
        var sql = "SELECT GROUP_CONCAT(c.`id`) AS tagIdList, GROUP_CONCAT(c.`name`) AS tagList, " +
            "t_activity.type AS activeType, a.id, a.game_name, a.icon, a.grade, a.game_packagename, " +
            "a.game_download_andriod, a.game_download_ios, a.game_download_ios2 " +
            "FROM t_activity  " +
            "LEFT JOIN t_game a ON a.id= t_activity.game_id  " +
            "LEFT JOIN t_tag_relation b ON b.game_id=a.id " +
            "LEFT JOIN t_tag c ON b.tag_id=c.id  " +
            "WHERE t_activity.type=6 AND t_activity.active=1 AND a.sys = ? GROUP BY a.id  ORDER BY t_activity.sort DESC ";
        query(sql, [obj.sys], function (result) {
            return callback(result)
        })
    },
    getClsActive: function (callback) {
        var sql = "SELECT * FROM t_activity WHERE type=3 AND active=1";
        query(sql, [], function (result) {
            return callback(result)
        })
    },
    // 根据标签获取游戏
    getGameByTag: function (tagId, sys, page, callback) {
        // var sql = "SELECT tag_ids,id FROM t_game " +
        //     "WHERE tag_ids LIKE'%," + tagId + ",%' AND sys=? " +
        //     "ORDER BY id DESC LIMIT ?,20"
        var sql = 'SELECT a.id,a.icon, a.game_name, a.grade, a.game_title_img, a.game_packagename, ' +
            'a.game_download_andriod, a.game_download_ios, a.game_download_ios2, ' +
            'GROUP_CONCAT(c.`name`) as tagList, ' +
            'GROUP_CONCAT(c.`id`) as tagId ' +
            'FROM t_game a ' +
            'LEFT JOIN t_tag_relation b ON a.id = b.`game_id` ' +
            'LEFT JOIN t_tag c ON c.`id`=b.`tag_id` ' +
            'WHERE a.id IN(SELECT t_tag_relation.`game_id` FROM t_tag_relation WHERE tag_id=?) ' +
            'AND a.sys=? GROUP BY a.`id` ORDER BY a.id DESC limit ?,20';
        query(sql, [tagId, sys, (page - 1) * 20], function (result) {
            return callback(result)
        })
    },
    // 根据标签获取游戏(相关)
    getGameTags: function (obj, sys, page, callback) {
        var sql = "SELECT a.id,a.icon,a.game_name,a.game_title_img,a.game_recommend,grade,a.cls_ids,a.tag_ids,,a.game_packagename," +
            "(SELECT group_concat(`name`) as tagName " +
            "FROM t_tag as b WHERE b.id IN (0" + obj.tag_ids + "0)) AS tagList " +
            "FROM t_game as a WHERE a.tag_ids LIKE '%" + obj.tag_ids + "%' AND a.sys=? AND a.id=?"
        query(sql, [sys, obj.id, (page - 1) * 20], function (result) {
            return callback(result)
        })
    },
    // 获取游戏排行
    getGameByMsg: function (sys, type, sort, page, callback) {
        var whereType = type !== "" ? " AND type = " + type : "";
        var sortWhere = "";
        switch (sort) {
            case "sort":
                sortWhere = "b.sort";
                break;
            case "sort2":
                sortWhere = "b.sort2";
                break;
            case "sort3":
                sortWhere = "b.sort3";
                break;
            default:
                sortWhere = "b.sort";
                break;
        }
        var sql = "SELECT b.*,GROUP_CONCAT(c.name) AS tagList,GROUP_CONCAT(c.id) AS tagI " +
            "FROM t_tag_relation a  " +
            "LEFT JOIN t_game b ON a.game_id = b.id " +
            "LEFT JOIN t_tag c ON c.id=a.tag_id " +
            "WHERE sys=? " + whereType + " GROUP BY b.id ORDER BY " + sortWhere + " DESC limit ?,20";
        query(sql, [sys, (page - 1) * 20], function (result) {
            return callback(result)
        })
    },
    // 根据关键词搜索游戏
    searchGameByMsg: function (uid, sys, msg, sort, page, callback) {
        var sql = 'SELECT GROUP_CONCAT(c.`id`) AS tagIdList, GROUP_CONCAT(c.`name`) AS tagList, ' +
            'a.id, a.game_name, a.icon, a.grade, a.game_packagename ' +
            'FROM t_game a ' +
            'LEFT JOIN t_tag_relation b ON b.`game_id`=a.`id` ' +
            'LEFT JOIN t_tag c ON b.`tag_id`=c.`id` ' +
            'WHERE a.game_name LIKE "%' + msg + '%" AND a.sys = ? GROUP BY a.id ' +
            'ORDER BY a.id DESC LIMIT ?,20';
        query(sql, [sys, (page - 1) * 20], function (result) {
            return callback(result)
        })
    },
    getClsIconActive: function (callback) {
        var sql = "SELECT t_game.*,FROM_UNIXTIME(t_game.add_time,'%Y-%m-%d') as add_time,t_cls_active.sort " +
            "FROM t_cls_active \n" +
            "LEFT JOIN t_game ON t_cls_active.game_id=t_game.id ORDER BY type";
        query(sql, [], function (result) {
            return callback(result)
        })
    },
    getGameCommentById: function (game_id, userId, page, callback) {
        var sql = "SELECT a.`id`, a.`user_id`, a.`content`, FROM_UNIXTIME(a.add_time,'%Y-%m-%d') as add_time, " +
            "a.`comment_num`, a.`score`, a.`agree`, c.id as uid, c.`nick_name`, c.`portrait`, b.state " +
            "FROM t_game_comment a " +
            "LEFT JOIN t_game_comment_like b ON b.user_id = ? and a.id = b.comment_id " +
            "LEFT JOIN t_user c ON a.`user_id`=c.id " +
            "WHERE a.`game_id`=? and a.series=1 " +
            "ORDER BY a.`id` DESC LIMIT ?,10";
        query(sql, [userId, game_id, (page - 1) * 10], function (result) {
            return callback(result)
        })
    },
    getCommentUserById: function (obj, callback) {
        var sql = "SELECT *,FROM_UNIXTIME(t_game_comment.add_time,'%Y-%m-%d') as add_time " +
            "FROM t_game_comment WHERE user_id=? AND game_id=? AND score > 0 ORDER BY id DESC LIMIT 0,1"
        query(sql, [obj.user_id, obj.game_id], function (result) {
            return callback(result)
        })
    },
    getGameHotComment: function (gameId, userId, callback) {
        var sql = "SELECT a.`id`, a.`user_id`, a.`user_id`, a.`content`, FROM_UNIXTIME(a.add_time,'%Y-%m-%d') as add_time, " +
            "a.`comment_num`, a.`score`, a.`agree`, c.id as uid, c.`nick_name`, c.`portrait`, b.state " +
            "FROM t_game_comment a " +
            "LEFT JOIN t_game_comment_like b ON b.user_id=? AND a.id = b.comment_id " +
            "LEFT JOIN t_user c ON a.`user_id`=c.id " +
            "WHERE a.`game_id`=? AND a.series=1 ORDER BY a.`comment_num` DESC LIMIT 0,3";
        query(sql, [userId, gameId], function (result) {
            return callback(result)
        })
    },
    getGameTowComment: function (parentId, page, callback) {
        var sql = "SELECT gc.`id`, gc.`user_id`, gc.`content`, FROM_UNIXTIME(gc.add_time,'%Y-%m-%d') as add_time, " +
            "gc.`comment_num`, gc.`score`, gc.`agree`, a.id as uid, " +
            "a.`nick_name` as selfNickName, a.`portrait`, b.nick_name as targetNickName " +
            "FROM t_game_comment gc " +
            "LEFT JOIN t_user as b ON gc.target_user_id = b.id\n" +
            "LEFT JOIN t_user as a ON gc.`user_id`=a.id " +
            "WHERE gc.`parent_id`=? and gc.series=2 " +
            "ORDER BY gc.`add_time` DESC LIMIT ?,10";
        query(sql, [parentId, (page - 1) * 10], function (result) {
            return callback(result)
        })
    },
    likeComment: function (commentId, userId, callback) {
        var sql = " select id from t_game_comment_like where comment_id=? and user_id=?";
        query(sql, [commentId, userId], function (result) {
            if (result.length) {
                return callback(result)
            } else {
                var sql = "insert into t_game_comment_like (comment_id,user_id,state) values (?,?,1)";
                query(sql, [commentId, userId], function (result) {
                    return callback(result)
                })
            }
        })
    },
    unLikeComment: function (commentId, userId, callback) {
        var sql = "delete from t_game_comment_like  where comment_id=? and user_id=?";
        query(sql, [commentId, userId], function (result) {
            return callback(result)
        })
    },
    addCommmentLikeNum: function (commentId, callback) {
        var sql = "update t_game_comment set agree=agree+1 where id=?";
        query(sql, [commentId], function (result) {
            return callback(result)
        })
    },
    minusCommmentLikeNum: function (commentId, userId, callback) {
        var sql = "SELECT* FROM t_game_comment WHERE id =?";
        query(sql, [commentId], function (result) {
            var agree_num = result[0].agree - 1;
            agree_num = agree_num <= 0 ? 0 : agree_num;

            var sql = "update t_game_comment set agree=? where id =?";
            query(sql, [agree_num, commentId], function (result2) {

            });

            var sql = 'delete from t_game_comment_like  where comment_id=? and user_id=?';
            query(sql, [commentId, userId], function (result3) {
                return callback(result3)
            })
        })
    },
    getGameLikeTag: function (gameId, sys, callback) {
        var sql = "SELECT b.id, b.`icon`, b.`grade`, b.game_name, GROUP_CONCAT(c.`name`) AS tagList, b.sys " +
            "FROM t_tag_relation a " +
            "LEFT JOIN t_game b ON a.`game_id`=b.`id` " +
            "LEFT JOIN t_tag c ON c.`id`=a.`tag_id` " +
            "WHERE a.`tag_id`=(SELECT t_tag.`id` FROM t_tag_relation LEFT JOIN t_tag ON t_tag.id=t_tag_relation.`tag_id` WHERE t_tag_relation.`game_id`=? ORDER BY RAND() LIMIT 1) " +
            "AND b.sys =? GROUP BY b.id ORDER BY RAND() LIMIT 5";
        query(sql, [gameId, sys], function (result) {
            return callback(result)
        })
    },
    getNewsByGameId: function (obj, callback) {
        var sql = "select id,title,img,add_time from t_news where game_name = ? ORDER BY id DESC LIMIT 5";
        query(sql, [obj], function (result) {
            return callback(result)
        })
    },
    getOneCommentByCommentId: function (commentId, callback) {
        var sql = "SELECT t_game_comment.`id`,t_game_comment.`content`,FROM_UNIXTIME(t_game_comment.add_time,'%Y-%m-%d') as add_time," +
            "t_game_comment.`comment_num`,t_game_comment.`score`,t_game_comment.`agree`,t_user.id as uid," +
            "t_user.`nick_name`,t_user.`portrait`,t_game.id as game_id,t_game.game_name " +
            "FROM t_game_comment a " +
            "LEFT JOIN t_user b ON t_game_comment.`user_id`=t_user.id " +
            "LEFT JOIN t_game c ON t_game_comment.`game_id`=t_game.id " +
            "WHERE t_game_comment.`id`=?";
        query(sql, [commentId], function (result) {
            return callback(result)
        })
    },
    // 获取游戏评分数据
    getGameCommentScore: function (gameId, callback) {
        var sql = "SELECT score,COUNT(*) AS num FROM t_game_comment " +
            "WHERE game_id=? and score > 0 GROUP BY score order by score desc";
        query(sql, [gameId], function (result) {
            return callback(result)
        })
    },
    hasGameCommentParent: function (obj, callback) {
        var sql = "SELECT * FROM t_game_comment WHERE id=?";
        query(sql, [obj], function (result) {
            return callback(result)
        })
    },
    // 评论游戏接口
    gameComment: function (obj, callback) {
        var parentId = obj.parentId || 0;
        // 如果没有评分 默认为8分
        var score = obj.score || 8;
        if (obj.series > 1) {
            score = 0;
        }
        var sql = "INSERT INTO t_game_comment (user_id,to_user,game_id,score,content,add_time,parent_id,series,target_user_id,game_name,game_icon) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
        query(sql, [obj.userId, obj.toUser, obj.gameId, score, obj.content, obj.addTime, parentId, obj.series, obj.targetUserId, obj.game_name, obj.game_title_img], function (result) {
            if (parentId > 0) {
                var set_sql = "update t_game_comment set comment_num=comment_num+1 where id =?";
                query(set_sql, [parentId], function (set_result) {

                })
            }
            return callback(result)
        })
    },
    getGameCommentScoreById: function (game_id, callback) {
        var sql = "select score from t_game_comment where game_id=? and score > 0";
        query(sql, [game_id], function (result) {
            return callback(result)
        })
    },
    updateGameScore: function (game_id, score, callback) {
        var sql = "UPDATE t_game SET grade=? where id=?";
        query(sql, [score, game_id], function (result) {
            return callback(result)
        })
    },
    addDownloadNum: function (gameId, callback) {
        var sql = "update t_game set game_download_num=game_download_num+1 where id =?";
        query(sql, [gameId], function (result) {
            return callback(result)
        })
    },
    // 获取专题
    getSubject: function (sys, callback) {
        var sql = 'SELECT id,img,title,detail FROM t_subject WHERE active = 1 AND sys = ? LIMIT 0,2';
        query(sql, [sys], function (result) {
            return callback(result)
        })
    },
    getSubjectById: function (subjectId, sys, callback) {
        var sql = 'select id,img,title,detail from t_subject where id=? AND sys=?';
        query(sql, [subjectId, sys], function (result) {
            return callback(result)
        })
    },
    // 获取活动标签
    getActiveTag: function (sys, callback) {
        var data = {};
        var sql = 'SELECT t_game.id AS gameId,t_game.game_name,t_game.`game_title_img`,t_game.`grade`,t_tag.`id` AS tagId,t_tag.`name` ' +
            'FROM (t_tag_relation LEFT JOIN t_tag ON t_tag_relation.`tag_id`=t_tag.`id`) \n' +
            'LEFT JOIN t_game ON t_tag_relation.`game_id`=t_game.`id`\n' +
            'WHERE t_tag.`id`=(SELECT id FROM t_tag WHERE active=1 LIMIT 0,1) AND t_game.`sys`=? ORDER BY RAND() LIMIT 10';
        query(sql, [sys], function (result) {
            if (result.length) {
                data[result[0].name] = result;
                var sql = 'SELECT t_game.id AS gameId,t_game.game_name,t_game.`game_title_img`,t_game.`grade`,t_tag.`id` AS tagId,t_tag.`name` ' +
                    'FROM (t_tag_relation LEFT JOIN t_tag ON t_tag_relation.`tag_id`=t_tag.`id`)  ' +
                    'LEFT JOIN t_game ON t_tag_relation.`game_id`=t_game.`id` ' +
                    'WHERE t_tag.`id`=(SELECT id FROM t_tag WHERE active=1 LIMIT 1,1) AND t_game.`sys`=? ORDER BY RAND() LIMIT 10';
                query(sql, [sys], function (result) {
                    if (result.length) {
                        data[result[0].name] = result;
                        return callback(data)
                    } else {
                        return callback(data)
                    }
                })
            } else {
                return callback(result)
            }
        })
    },
    getGameBySubject: function (subjectId, sys, page, callback) {
        var sql = 'SELECT t_game.id,t_game.game_name,t_game.icon,t_game.game_title_img,t_game.grade,t_game.game_recommend,GROUP_CONCAT(t_tag.name) AS tagList,GROUP_CONCAT(t_tag.id) AS tagId ' +
            'FROM ((t_subject_relation LEFT JOIN t_game ON t_subject_relation.game_id=t_game.id) ' +
            'LEFT JOIN t_tag_relation ON t_tag_relation.`game_id`=t_game.id) ' +
            'LEFT JOIN t_tag ON t_tag_relation.`tag_id`=t_tag.`id` ' +
            'WHERE t_subject_relation.subject_id = ? AND t_game.sys=? ' +
            'GROUP BY t_game.id ORDER BY t_subject_relation.id ASC  limit ?,20';
        query(sql, [subjectId, sys, (page - 1) * 20], function (result) {
            return callback(result)
        })
    },
    // 获取游戏分类
    getGameCls: function (obj, callback) {
        var sql = 'SELECT t_game_cls.*,t_game.icon as icon FROM t_game_cls_relation  ' +
            'LEFT JOIN t_game ON t_game.id=t_game_cls_relation.`game_id` ' +
            'LEFT JOIN t_game_cls ON t_game_cls.`id`=t_game_cls_relation.`cls_id` ' +
            'WHERE t_game_cls.type =1 AND t_game.sys=? GROUP BY t_game_cls.`id` ';
        query(sql, [obj.sys], function (result) {
            return callback(result)
        })
    },
    getAppCls: function (obj, callback) {
        var sql = 'SELECT t_game_cls.*,t_game.icon FROM t_game_cls_relation  ' +
            'LEFT JOIN t_game ON t_game.id=t_game_cls_relation.`game_id` ' +
            'LEFT JOIN t_game_cls ON t_game_cls.`id`=t_game_cls_relation.`cls_id` ' +
            'WHERE t_game_cls.type =2 AND t_game.sys=? GROUP BY t_game_cls.`id` ';
        query(sql, [obj.sys], function (result) {
            return callback(result)
        })
    },
    // 根据分类获取游戏
    getGameByCls: function (clsId, sys, page, callback) {
        var sql = 'SELECT a.id,a.icon,a.game_name,a.grade,a.game_packagename,' +
            'a.game_download_andriod, a.game_download_ios, a.game_download_ios2, ' +
            'GROUP_CONCAT(t_tag.`name`) as tagNameList,' +
            'GROUP_CONCAT(t_tag.`id`) as tagIdList ' +
            'FROM (t_game_cls_relation LEFT JOIN t_game AS a ON a.id = t_game_cls_relation.game_id) ' +
            'LEFT JOIN t_tag_relation ON a.id = t_tag_relation.`game_id` ' +
            'LEFT JOIN t_tag ON t_tag.`id`=t_tag_relation.`tag_id` ' +
            'WHERE t_game_cls_relation.cls_id=? AND a.sys=? GROUP BY a.`id` ORDER BY a.id DESC limit ?,20';
        //var sql = "SELECT id,icon,game_name,sort,sort2,cls_ids,tag_ids FROM t_game " +
        //    "WHERE cls_ids LIKE '%," + clsId + ",%' ORDER BY game_download_num,sort,sort2 DESC LIMIT ?,20"
        query(sql, [clsId, sys, (page - 1) * 20], function (result) {
            return callback(result)
        })
    },
    // 添加我的游戏
    addMyGame: function (gameId, userId, sys, callback) {
        var sql = 'select id from t_collect where target_id=? and user_id=? and target_type=?';
        query(sql, [gameId, userId, 3], function (result) {
            if (!result.length) {
                var sql = 'insert into t_collect (target_id,user_id,sys,target_type) values (?,?,?,?)';
                query(sql, [gameId, userId, sys, 3], function (result) {
                    return callback(result)
                })
            } else {
                return callback(result)
            }
        })
    },
    addMyGameIos: function (gameId, userId, sys, callback) {
        var sql = "SELECT * FROM t_collect WHERE user_id=? AND sys=? AND target_type=3 ORDER BY id ASC "
        query(sql, [userId, 1], function (all_result) {
            if (all_result.length >= 10) {
                var del_sql = "DELETE FROM t_collect WHERE id=?";
                query(del_sql, [all_result[0].id], function () {

                });
            }
            var sel_sql = 'select id from t_collect where target_id=? and user_id=? and target_type=? AND sys=?';
            query(sel_sql, [gameId, userId, 3, 1], function (result) {
                if (!result.length) {
                    var sql = 'insert into t_collect (target_id,user_id,sys,target_type) values (?,?,?,?)';
                    query(sql, [gameId, userId, sys, 3], function (result) {
                        return callback(result)
                    })
                } else {
                    return callback(result)
                }
            })

        })
    },
    addUserTip: function (targetId, userId, callback) {
        var sql = 'INSET INTO t_tip(tip_id,user_id,type) VALUES (?,?,3)';
        query(sql, [targetId, userId], function () {
        })
    },
    // 根据游戏名字获取相关攻略
    getStrategyByGameName: function (gameName, userId, page, callback) {
        var sql = "SELECT a.*,FROM_UNIXTIME(a.add_time,'%Y-%m-%d %H:%i') as add_time,b.nike_name,c.`nick_name`,c.portrait,t_strategy_like.strategy_id " +
            "FROM t_strategy as a " +
            "LEFT JOIN t_admin AS b ON b.id = a.`user_id` " +
            "LEFT JOIN t_user AS c ON c.id=a.`user_id` " +
            "LEFT JOIN t_strategy_like ON t_strategy_like.`strategy_id`=a.`id` AND t_strategy_like.`user_id`=? " +
            "WHERE a.game_name = ? GROUP BY a.id  ORDER BY a.essence DESC, a.browse_num DESC LIMIT ?,6";
        query(sql, [userId, gameName, (page - 1) * 6], function (result) {
            return callback(result)
        })
    },
    checkGameSys: function (gameName, sys, callback) {
        var sql = "SELECT * FROM t_game WHERE game_name = ? AND sys=?"
        query(sql, [gameName, sys], function (res) {
            return callback(res);
        })
    },

    getActivityGame: function (obj, page, callback) {
        var where = "a.state = 1";
        if (obj.type == "choose") {
            where = "a.id > 0";
        }
        var sql = "SELECT a.*, b.game_packagename, b.game_download_ios, b.game_download_andriod " +
            "FROM t_ticket_game a " +
            "LEFT JOIN t_game b ON a.game_id = b.id " +
            "WHERE " + where + " AND a.sys = ? ORDER BY a.id DESC LIMIT ?,20";
        query(sql, [obj.sys, (page - 1) * 20], function (result) {
            return callback(result);
        })
    },

    delMyComment: function (obj, callback) {
        var getMySql = "SELECT * FROM t_game_comment WHERE id=? AND user_id=?"
        query(getMySql, [obj.id, obj.uid], function (my_result) {
            if (my_result.length) {
                if (my_result[0].series == 1) {
                    var find_series2 = "SELECT * FROM t_game_comment WHERE parent_id=? AND series=2"
                    query(find_series2, [obj.id], function (resList) {
                        if (resList.length) {
                            for (var i in resList) {
                                var deltip1 = "DELETE FROM t_tip WHERE tip_id=? AND type=3"
                                query(deltip1, [resList[i].id], function () {

                                })
                            }
                            var delsql1 = "DELETE FROM   t_game_comment WHERE parent_id=? AND series=2"
                            query(delsql1, [obj.id], function () {

                            })
                        }
                    })

                    var delsql1 = "DELETE FROM t_game_comment_like WHERE comment_id=? "
                    query(delsql1, [obj.id], function (result) {

                    })

                    var delsql2 = "DELETE FROM t_game_comment WHERE id=? AND series=1"
                    query(delsql2, [obj.id], function (result) {
                        return callback(result)
                    })
                } else {
                    var deltip1 = "DELETE FROM t_tip WHERE tip_id=? AND type=3"
                    query(deltip1, [obj.id], function () {

                    })

                    var delsql = "DELETE FROM t_game_comment WHERE id=? AND series=2"
                    query(delsql, [obj.id], function (result) {
                        return callback(result)
                    })
                }
            } else {
                return callback(my_result)
            }
        })
    },

    getTicketInfo: function (obj, uid, callback) {
        var ticketSql = "SELECT a.*, b.uid, b.state AS b_state FROM t_ticket a " +
            "LEFT JOIN t_ticket_user b ON a.id = b.tid AND b.uid = ? AND b.state IN (1,3)" +
            "WHERE a.game_id=? AND a.state = 1 AND a.num>0 ORDER BY a.coin DESC"
        query(ticketSql, [uid, obj.game_id], function (result) {
            return callback(result);
        })
    },
    goTicket: function (obj, callback) {
        var ticketSql = "SELECT * FROM t_ticket WHERE id = ? AND state = 1 OR state = -2"
        query(ticketSql, [obj.id], function (result) {
            if (result.length) {
                if (result[0].num < 1) {
                    return callback({state: 0, info: "抵用券已领完"})
                }

                var t_user = "SELECT * FROM t_ticket_user WHERE uid=? AND tid=? AND state=1"
                query(t_user, [obj.user_id, obj.id], function (ut_result) {
                    if (ut_result.length) {
                        return callback({state: 2, info: "抵用券已领取"})
                    }

                    var newNum = Number(result[0].num) - 1;
                    var setSql = "UPDATE t_ticket SET num = ? WHERE id=?"
                    query(setSql, [newNum, obj.id], function (setMsg) {

                    })

                    var sqlGame = "SELECT * FROM t_ticket WHERE game_id=? AND num>0"
                    query(sqlGame, [result[0].game_id], function (tGame) {
                        if (!tGame.length) {
                            var upTGame = "UPDATE t_ticket_game SET state=0 WHERE game_id=?"
                            query(upTGame, [result[0].game_id], function () {

                            })
                        }
                    })

                    var add_u_ticket = "INSERT INTO t_ticket_user (`uid`,`tid`,`game_id`,`uuid`,`coin`,`a_coin`,`reback`,`add_time`,`end_time`,`state`) VALUES (?,?,?,?,?,?,?,?,?,1)";
                    var game_id = result[0].game_id;
                    var uuid = result[0].uuid;
                    var coin = result[0].coin;
                    var a_coin = result[0].a_coin;
                    var reback = result[0].reback;
                    query(add_u_ticket, [obj.user_id, obj.id, game_id, uuid, coin, a_coin, reback, parseInt(obj.addTime), parseInt(obj.endTime)], function (addMsg) {
                        return callback(addMsg)
                    })
                })
            } else {
                return callback({state: 0, info: "抵用券不存在或已停用"})
            }
        })
    },

    getUseTicket: function (obj, callback) {
        var sql = "SELECT a.*,b.types, b.uuid AS b_uuid, c.game_name " +
            "FROM t_ticket_user a " +
            "LEFT JOIN t_ticket b ON a.tid = b.id " +
            "LEFT JOIN t_game c ON a.game_id = c.id " +
            "WHERE a.id = ? AND a.state=1";
        query(sql, [obj.id], function (result) {
            return callback(result);
        })
    },
    getUseTicketSet: function (obj, callback) {
        var sql = "UPDATE t_ticket_user SET state=3 WHERE id=?";
        query(sql, [obj.id], function (result) {
            return callback(result);
        })
    }
};
module.exports = game;
