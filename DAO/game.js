var query = require('../config/config');
var game = {
    // 获取游戏详情
    getDetailById: function (gameId, callback) {
        // query("call pro_getGameDetailById(?)",[gameId],callback);
        var sql = 'SELECT t_game.game_download_ios,t_game.game_download_ios2,t_game.game_packagename,t_game.game_download_andriod,' +
            't_game.`game_name`,t_game.game_size,t_game.game_download_num,t_game.game_version,FROM_UNIXTIME(t_game.game_update_date,"%Y-%m-%d") as game_update_date,' +
            't_game.game_detail,t_game.`game_title_img`,t_game.`game_company`,t_game.`icon`,t_game.`grade`,' +
            'GROUP_CONCAT(t_tag.name) AS tagList ' +
            'FROM t_game \n' +
            'LEFT JOIN t_tag_relation ON t_tag_relation.`game_id`=t_game.`id`\n' +
            'LEFT JOIN t_tag ON t_tag_relation.`tag_id`=t_tag.`id`\n' +
            'WHERE t_game.`id`=?';
        query(sql, [gameId], function (result) {
            return callback(result)
        })
    },
    getGameImgListById: function (gameId, callback) {
        var sql = 'select img_src from t_game_img where game_id=?';
        query(sql, [gameId], function (result) {
            return callback(result)
        })
    },
    editGameById: function (gameId, text, callback) {
        var sql = "UPDATE t_game SET game_detail=? where id=?";
        query(sql, [text, gameId], function (result) {
            return callback(result)
        })
    },
    getCarousel: function (sys, callback) {
        var sql = "select * from t_activity where type=1 and active=1 AND sys=?";
        query(sql, [sys], function (result) {
            return callback(result)
        })
    },
    getActive: function (obj, callback) {
        var sql = "select * from t_activity where type=4 and active=1 and sys = ? ORDER BY RAND() LIMIT 3";
        query(sql, [obj.sys], function (result) {
            return callback(result)
        })
    },
    // 获取推荐位(2个)
    getActiveLenOfTow: function (obj, callback) {
        var sql = "select t_activity.type as activeType,t_game.id,t_game.game_name,t_game.game_packagename,t_game.game_title_img " +
            "from t_activity " +
            "left join t_game on t_game.id= t_activity.game_id " +
            "where t_activity.type=5 and t_activity.active=1 and t_game.sys = ? ORDER BY RAND() LIMIT 2";
        query(sql, [obj.sys], function (result) {
            return callback(result)
        })
    },
    getActiveLenOfTen: function (obj, callback) {
        var sql = "SELECT GROUP_CONCAT(t_tag.`id`) AS tagIdList,GROUP_CONCAT(t_tag.`name`) AS tagList," +
            "t_activity.type AS activeType,t_game.id,t_game.game_name,t_game.icon,t_game.grade,t_game.game_packagename " +
            "FROM t_activity \n" +
            "LEFT JOIN t_game ON t_game.id= t_activity.game_id \n" +
            "LEFT JOIN t_tag_relation ON t_tag_relation.`game_id`=t_game.`id`\n" +
            "LEFT JOIN t_tag ON t_tag_relation.`tag_id`=t_tag.`id`\n" +
            "WHERE t_activity.type=6 AND t_activity.active=1 AND t_game.sys = ?  GROUP BY t_game.id LIMIT 10";
        query(sql, [obj.sys], function (result) {
            return callback(result)
        })
    },
    getClsActive: function (callback) {
        var sql = "select * from t_activity where type=3 and active=1";
        query(sql, [], function (result) {
            return callback(result)
        })
    },
    // 根据标签获取游戏
    getGameByTag: function (tagId, sys, page, callback) {
        // var sql = "SELECT tag_ids,id FROM t_game WHERE tag_ids LIKE'%," + tagId + ",%' AND sys=? ORDER BY id DESC LIMIT ?,20"
        var sql = 'SELECT a.id,a.icon,a.game_name,a.grade,a.game_title_img,a.game_packagename,' +
            'GROUP_CONCAT(t_tag.`name`) as tagList,' +
            'GROUP_CONCAT(t_tag.`id`) as tagId ' +
            'FROM t_game AS a ' +
            'LEFT JOIN t_tag_relation ON a.id = t_tag_relation.`game_id` ' +
            'LEFT JOIN t_tag ON t_tag.`id`=t_tag_relation.`tag_id`\n' +
            ' WHERE t_tag_relation.tag_id=? AND a.sys=? GROUP BY a.`id` ORDER BY a.id DESC limit ?,20';
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
        if (type !== '') {
            var sql = "SELECT t_game.*,GROUP_CONCAT(t_tag.name) AS tagList,GROUP_CONCAT(t_tag.id) AS tagId " +
                "FROM t_tag_relation \n" +
                "LEFT JOIN t_game ON t_tag_relation.game_id = t_game.id \n" +
                " LEFT JOIN t_tag ON t_tag.`id`=t_tag_relation.`tag_id` where sys=? and type=? GROUP BY t_game.id ORDER BY " + sort + " DESC limit ?,20";
            query(sql, [sys, type, (page - 1) * 20], function (result) {
                return callback(result)
            })
        } else {
            var sql = "SELECT t_game.*,GROUP_CONCAT(t_tag.name) AS tagList,GROUP_CONCAT(t_tag.id) AS tagId " +
                "FROM t_tag_relation " +
                "LEFT JOIN t_game ON t_tag_relation.game_id = t_game.id " +
                "LEFT JOIN t_tag ON t_tag.`id`=t_tag_relation.`tag_id` where sys=? " +
                "GROUP BY t_game.id ORDER BY " + sort + " DESC limit ?,20";
            query(sql, [sys, (page - 1) * 20], function (result) {
                return callback(result)
            })
        }
    },
    // 根据关键词搜索游戏
    searchGameByMsg: function (sys, msg, sort, page, callback) {
        var sql = "select id,game_name,icon,grade " +
            "from t_game where sys=? and game_name like '%" + msg + "%'  ORDER BY " + sort + " DESC limit ?,20";
        query(sql, [sys, (page - 1) * 20], function (result) {
            return callback(result)
        })
    },
    getHotGame: function (callback) {
        var sql = "select * from t_hotgame";
        query(sql, [], function (result) {
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
    getGameCommentById: function (game_id, page, callback) {
        var sql = "SELECT t_game_comment.`id`,t_game_comment.`content`,FROM_UNIXTIME(t_game_comment.add_time,'%Y-%m-%d') as add_time," +
            "t_game_comment.`comment_num`,t_game_comment.`score`,t_game_comment.`agree`,t_user.id as uid,t_user.`nick_name`,t_user.`portrait`,t_game_comment_like.state " +
            "FROM t_game_comment \n" +
            "LEFT JOIN t_game_comment_like on t_game_comment.`user_id`=t_game_comment_like.user_id and t_game_comment.id = t_game_comment_like.comment_id\n" +
            "LEFT JOIN t_user\n" +
            "ON t_game_comment.`user_id`=t_user.id WHERE t_game_comment.`game_id`=? and t_game_comment.series=1 ORDER BY t_game_comment.`id` DESC LIMIT ?,10";
        query(sql, [game_id, (page - 1) * 10], function (result) {
            return callback(result)
        })
    },
    getCommentUserById: function (obj, callback) {
        var sql = "SELECT *,FROM_UNIXTIME(t_game_comment.add_time,'%Y-%m-%d') as add_time " +
            "FROM t_game_comment WHERE user_id=? AND game_id=? ORDER BY id DESC LIMIT 0,1"
        query(sql, [obj.user_id, obj.game_id], function (result) {
            return callback(result)
        })
    },
    getGameHotComment: function (gameId, callback) {
        var sql = "SELECT t_game_comment.`id`,t_game_comment.`content`,FROM_UNIXTIME(t_game_comment.add_time,'%Y-%m-%d') as add_time," +
            "t_game_comment.`comment_num`,t_game_comment.`score`,t_game_comment.`agree`,t_user.id as uid,t_user.`nick_name`," +
            "t_user.`portrait`,t_game_comment_like.state " +
            "FROM t_game_comment \n" +
            "LEFT JOIN t_game_comment_like on t_game_comment.`user_id`=t_game_comment_like.user_id and t_game_comment.id = t_game_comment_like.comment_id\n" +
            "LEFT JOIN t_user\n" +
            "ON t_game_comment.`user_id`=t_user.id WHERE t_game_comment.`game_id`=? and t_game_comment.series=1 ORDER BY t_game_comment.`comment_num` DESC LIMIT 0,3";
        query(sql, [gameId], function (result) {
            return callback(result)
        })
    },
    getGameTowComment: function (parentId, page, callback) {
        var sql = "SELECT t_game_comment.`id`,t_game_comment.`content`,FROM_UNIXTIME(t_game_comment.add_time,'%Y-%m-%d') as add_time," +
            "t_game_comment.`comment_num`,t_game_comment.`score`,t_game_comment.`agree`,a.id as uid," +
            "a.`nick_name` as selfNickName,a.`portrait`,b.nick_name as targetNickName " +
            "FROM t_game_comment \n" +
            "LEFT JOIN t_user as b on t_game_comment.target_user_id = b.id\n" +
            "LEFT JOIN t_user as a\n" +
            "ON t_game_comment.`user_id`=a.id WHERE t_game_comment.`parent_id`=? and t_game_comment.series=2 ORDER BY t_game_comment.`add_time` DESC LIMIT ?,10";
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
    minusCommmentLikeNum: function (commentId, callback) {
        var sql = "update t_game_comment set agree=agree-1 where id=?";
        query(sql, [commentId], function (result) {
            return callback(result)
        })
    },
    getGameLikeTag: function (gameId, sys, callback) {
        var sql = "SELECT t_game.id,t_game.`icon`,t_game.`grade`,t_game.game_name,GROUP_CONCAT(t_tag.`name`) AS tagList, t_game.sys " +
            "FROM t_tag_relation " +
            "LEFT JOIN t_game ON t_tag_relation.`game_id`=t_game.`id` " +
            "LEFT JOIN t_tag ON t_tag.`id`=t_tag_relation.`tag_id` " +
            "WHERE t_tag_relation.`tag_id`=(SELECT t_tag.`id` FROM t_tag_relation LEFT JOIN t_tag ON t_tag.id=t_tag_relation.`tag_id` WHERE t_tag_relation.`game_id`=? ORDER BY RAND() LIMIT 1) " +
            "AND t_game.sys =? GROUP BY t_game.id ORDER BY RAND() LIMIT 5";
        query(sql, [gameId, sys], function (result) {
            return callback(result)
        })
    },
    getNewsByGameId: function (gameId, callback) {
        var sql = "select id,title,img,add_time from t_news where game_id = ? ORDER BY RAND() LIMIT 5";
        query(sql, [gameId], function (result) {
            return callback(result)
        })
    },
    getOneCommentByCommentId: function (commentId, callback) {
        var sql = "SELECT t_game_comment.`id`,t_game_comment.`content`,FROM_UNIXTIME(t_game_comment.add_time,'%Y-%m-%d') as add_time," +
            "t_game_comment.`comment_num`,t_game_comment.`score`,t_game_comment.`agree`,t_user.id as uid," +
            "t_user.`nick_name`,t_user.`portrait`,t_game.id as game_id,t_game.game_name " +
            "FROM t_game_comment \n" +
            "LEFT JOIN t_user  ON t_game_comment.`user_id`=t_user.id " +
            "LEFT JOIN t_game  ON t_game_comment.`game_id`=t_game.id " +
            "WHERE t_game_comment.`id`=?";
        query(sql, [commentId], function (result) {
            return callback(result)
        })
    },
    // 获取游戏评分数据
    getGameCommentScore: function (gameId, callback) {
        var sql = "SELECT score,COUNT(*) AS num FROM t_game_comment " +
            "WHERE game_id=? and score >0 GROUP BY score order by score desc";
        query(sql, [gameId], function (result) {
            return callback(result)
        })
    },
    // 评论游戏接口
    gameComment: function (userId, gameId, score, content, addTime, parentId, series, targetUserId, game_name, game_title_img, callback) {
        parentId = parentId || 0;
        // 如果没有评分 默认为8分
        score = score || 8;
        var sql = "INSERT into t_game_comment (user_id,game_id,score,content,add_time,parent_id,series,target_user_id,game_name,game_icon) values (?,?,?,?,?,?,?,?,?,?)";
        query(sql, [userId, gameId, score, content, addTime, parentId, series, targetUserId, game_name, game_title_img], function (result) {
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
        var sql = 'select id,img,title,detail from t_subject where active = 1 and sys = ? limit 0,2';
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
        var sql = 'SELECT t_game.id,t_game.game_name,t_game.icon,t_game.game_title_img,t_game.grade,t_game.game_recommend,GROUP_CONCAT(t_tag.name) AS tagList,GROUP_CONCAT(t_tag.id) AS tagId \n' +
            '\tFROM ((t_subject_relation \n' +
            '\tLEFT JOIN t_game \n' +
            '\tON t_subject_relation.game_id=t_game.id)\n' +
            '\tLEFT JOIN t_tag_relation ON t_tag_relation.`game_id`=t_game.id) \n' +
            '\tLEFT JOIN t_tag ON t_tag_relation.`tag_id`=t_tag.`id`\n' +
            '\tWHERE t_subject_relation.subject_id = ? AND t_game.sys=? GROUP BY t_game.id limit ?,20';
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
            'GROUP_CONCAT(t_tag.`name`) as tagNameList,' +
            'GROUP_CONCAT(t_tag.`id`) as tagIdList ' +
            'FROM (t_game_cls_relation LEFT JOIN t_game AS a ON a.id = t_game_cls_relation.game_id) ' +
            'LEFT JOIN t_tag_relation ON a.id = t_tag_relation.`game_id` ' +
            'LEFT JOIN t_tag ON t_tag.`id`=t_tag_relation.`tag_id`\n' +
            ' WHERE t_game_cls_relation.cls_id=? AND a.sys=? GROUP BY a.`id` ORDER BY a.id DESC limit ?,20';
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
    addUserTip: function (targetId, userId, callback) {
        var sql = 'insert into t_tip(tip_id,user_id,type) values (?,?,1)';
        query(sql, [targetId, userId], function () {

        })
    },
    // 根据游戏名字获取相关攻略
    getStrategyByGameName: function (gameName, page, callback) {
        var sql = "SELECT a.*,b.nike_name,c.`nick_name`,c.portrait FROM t_strategy as a \n " +
            " LEFT JOIN t_admin AS b ON b.id = a.`user_id`\n " +
            " LEFT JOIN t_user AS c ON c.id=a.`user_id` " +
            " WHERE a.game_name  =? GROUP BY a.id  ORDER BY browse_num  DESC LIMIT ?,6";
        query(sql, [gameName, (page - 1) * 6], function (result) {
            return callback(result)
        })
    }

};
module.exports = game;
