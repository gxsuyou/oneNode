var router = require('express').Router();
var game = require("../DAO/game");
var bodyParser = require('body-parser');
var socketio = require('./socketio');
// 获取游戏详情
router.get('/getGameById', function (req, res, next) {
    var data = req.query;
    if (data.gameId) {
        game.getDetailById(data.gameId, function (result) {
            if (result[0].game_detail != null) {
                var str = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + result[0].game_detail;
                var mstr = str.replace(/\t/g, "&nbsp;");
                var nstr = mstr.replace(/\r\n/g, "<br/>" + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
                result[0].game_detail = nstr;
            }

            result.length ? res.json({state: 1, gameDetail: result[0]}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});

router.get('/updateGameBow')

router.get('/getGameImgListById', function (req, res) {
    var data = req.query;
    if (data.gameId) {
        game.getGameImgListById(data.gameId, function (result) {
            result.length ? res.json({state: 1, gameList: result}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/edit', function (req, res, next) {
    game.editGameById(1, req.query.text, function (result) {
        res.json({result: result})
    });
});
router.get("/carousel", function (req, res, next) {
    game.getCarousel(function (result) {
        result.length ? res.json({state: 1, carousel: result}) : res.json({state: 0})
    })
});
router.get("/active", function (req, res, next) {
    game.getActive(function (result) {
        result.length ? res.json({state: 1, active: result}) : res.json({state: 0})
    })
});
router.get("/clsActive", function (req, res, next) {
    game.getClsActive(function (result) {
        result.length ? res.json({state: 1, clsActive: result}) : res.json({state: 0})
    })
});
router.get("/getGameByMsg", function (req, res, next) {
    req = req.query;
    // console.log(req);
    game.getGameByMsg(req.sys, req.type, req.sort, req.page, function (result) {
        // console.log(result);
        res.json({state: 1, game: result})
    })
});
router.get("/hotGame", function (req, res, next) {
    game.getHotGame(function (result) {
        result.length ? res.json({state: 1, game: result[0]}) : res.json({state: 0})
    })
});
router.get("/clsIconActive", function (req, res, next) {
    game.getClsIconActive(function (result) {
        result.length ? res.json({state: 1, game: result}) : res.json({state: 0})
    })
});
router.get("/getGameCommentById", function (req, res, next) {
    if (req.query.gameId) {
        game.getGameCommentById(req.query.gameId, req.query.page, function (result) {
            res.json({state: 1, comment: result})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/getGameHotComment', function (req, res) {
    var data = req.query;
    if (data.gameId) {
        game.getGameHotComment(data.gameId, function (result) {
            res.json({state: 1, comment: result})
        })
    } else {
        res.json({state: 0})
    }
});
// 根据ID获取游戏一级评论
router.get('/getOneCommentByCommentId', function (req, res) {
    var data = req.query;
    if (data.commentId) {
        game.getOneCommentByCommentId(data.commentId, function (result) {
            if(!result[0].game_icon){
                result[0].game_icon=0;
            }
            res.json({state: 1, comment: result[0]})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/getGameTowComment', function (req, res) {
    var data = req.query;
    if (data.page && data.parentId) {
        game.getGameTowComment(data.parentId, data.page, function (result) {
            res.json({state: 1, comment: result})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/likeComment', function (req, res) {
    var data = req.query;
    if (data.commentId && data.userId) {
        game.likeComment(data.commentId, data.userId, function (result) {
            if (result.insertId) {
                game.addCommmentLikeNum(data.commentId, function () {

                })
            }
            res.json({state: 1})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/unLikeComment', function (req, res) {
    var data = req.query;
    if (data.commentId && data.userId) {
        game.unLikeComment(data.commentId, data.userId, function (result) {
            if (result.affectedRows) {
                game.minusCommmentLikeNum(data.commentId, function () {

                })
            }
            res.json({state: 1})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/getGameLikeTag', function (req, res) {
    var data = req.query;
    if (data.gameId) {
        game.getGameLikeTag(data.gameId, function (result) {
            res.json({state: 1, gameList: result})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/getNewsByGameId', function (req, res) {
    var data = req.query;
    if (data.gameId) {
        game.getNewsByGameId(data.gameId, function (result) {
            if (result.length) {
                for (var i = 0, l = result.length; i < l; i++) {
                    result[i].add_time = result[i].add_time.substring(0, 10)
                }
            }
            res.json({state: 1, newsList: result})
        })
    } else {
        res.json({state: 0})
    }
});
// 获取游戏评分数据
router.get('/getGameCommentScore', function (req, res) {
    var data = req.query;
    if (data.gameId) {
        game.getGameCommentScore(data.gameId, function (result) {
            console.log(result);
            res.json({state: 1, scoreList: result})
        })
    } else {
        console.log(result);
        res.json({state: 0})
    }
});
// 评论游戏接口
router.get('/comment',function (req,res,next) {
    var data=req.query;
    if(data.userId && data.gameId && data.content){
        var date=new Date();
        game.gameComment(data.userId,data.gameId,data.score,data.content,date.Format('yyyy-MM-dd'),data.parentId,data.series,data.targetUserId || null,data.game_name,data.game_icon,function (result) {
            if(result.insertId){
                function addNum(){
                    game.addCommentNum(data.parentId,function(resultss){
                        data.targetUserId && game.addUserTip(result.insertId,data.targetUserId);
                        data.targetUserId && socketio.senMsg(data.targetUserId);
                        game.getGameCommentScoreById(data.gameId,function (result) {
                            if(result.length>0){
                                var len=result.length;
                                var allScore=0;
                                for(var i=0;i<len;i++){
                                    allScore+=result[i].score;
                                }
                                game.updateGameScore(data.gameId,(allScore / len).toFixed(1),function (result) {
                                    result.affectedRows?res.json({state:1}):res.json({state:0})
                                })
                            }
                        })
                    })
                }
                addNum();        
            }
        })
    } else {
        res.json({state: 0})
    }

});
router.get('/getGameCls', function (req, res) {
    game.getGameCls(function (result) {
        res.json({state: 1, cls: result})
    })
});
router.get('/getAppCls', function (req, res) {
    game.getAppCls(function (result) {
        res.json({state: 1, cls: result})
    })
});
// 根据分类获取游戏
router.get('/getGameByCls', function (req, res) {
    var data = req.query;
    var arr = new Array();
    if (data.clsId && data.page) {
        game.getGameByCls(data.clsId, data.page, function (result) {
            new Promise(function (reslove, reject) {
                result.forEach(function (v, k, array) {
                    game.getGameByTags(v, data.page, function (tag_resulr) {
                        //arr.push()
                        //console.log(tag_resulr[0]);
                        arr.push({
                            id: tag_resulr[0].id,
                            icon: tag_resulr[0].icon,
                            game_name: tag_resulr[0].game_name,
                            grade: tag_resulr[0].grade,
                            cls_ids: tag_resulr[0].cls_ids,
                            tag_ids: tag_resulr[0].tag_ids,
                            tagNameList: tag_resulr[0].tag_name,
                        })
                        if (k == 19) {
                            reslove(arr);
                        }
                    })
                });
            }).then(function (arr) {
                    console.log(arr);
                    res.json({state: 1, gameList: arr})
                })
            //res.json({state: 1, gameList: result})
        })
    } else {
        res.json({state: 0})
    }
});
// 根据关键词搜索游戏
router.get("/searchGameByMsg", function (req, res, next) {
    if (req.query.msg && req.query.sys) {
        var data = req.query;
        game.searchGameByMsg(data.sys, data.msg, data.sort, data.page, function (result) {
            result.length ? res.json({state: 1, game: result}) : res.json({state: 0})
        })
    }
});
router.get("/likeGameComment", function (req, res, next) {
    console.log(req.query);
    // game.like(req.query.)
});
router.get("/addDownloadNum", function (req, res, next) {
    if (req.query.id) {
        game.addDownloadNum(req.query.id, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    }
});
// 获取专题
router.get('/getSubject', function (req, res) {
    var data = req.query;
    if (data.sys) {
        game.getSubject(data.sys, function (result) {
            result.length ? res.json({state: 1, subject: result}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/getSubjectById', function (req, res) {
    var data = req.query;
    if (data.subjectId) {
        game.getSubjectById(data.subjectId, function (result) {
            result.length ? res.json({state: 1, subject: result[0]}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
// 获取活动标签
router.get('/getActiveTag', function (req, res) {
    var data = req.query;
    if (data.sys) {
        game.getActiveTag(data.sys, function (result) {
            res.json({state: 1, activeTagGame: result})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/getGameBySubject', function (req, res) {
    var data = req.query;
    if (data.subjectId && data.sys && data.page) {
        game.getGameBySubject(data.subjectId, data.sys, data.page, function (result) {
            res.json({state: 1, game: result})
        })
    } else {
        res.json({state: 0})
    }
});
// 根据标签获取游戏
router.get('/getGameByTag', function (req, res) {
    var data = req.query;
    if (data.tagId && data.sys && data.page) {
        game.getGameByTag(data.tagId, data.sys, data.page, function (result) {
            res.json({state: 1, game: result})
        })
    } else {
        res.json({state: 0})
    }
});
// 添加我的游戏
router.get('/addMyGame', function (req, res) {
    var data = req.query;
    if (data.userId && data.gameId && data.sys) {
        game.addMyGame(data.gameId, data.userId, data.sys, function (result) {
            res.json({state: 1})
        })
    } else {
        res.json({state: 0})
    }
});
// 获取推荐位(2个)
router.get('/getActiveLenOfTow', function (req, res) {
    game.getActiveLenOfTow(function (result) {

        res.json({state: 1, game: result})
    })
});
// 获取推荐位(10个)
router.get('/getActiveLenOfTen', function (req, res) {
    game.getActiveLenOfTen(function (result) {
        res.json({state: 1, game: result})
    })
});
// 根据游戏名字获取相关攻略
router.get('/getStrategyByGameName', function (req, res) {
    var data = req.query;
    if (data.gameName && data.page) {
        game.getStrategyByGameName(data.gameName, data.page, function (result) {
            res.json({state: 1, strategy: result})
        });
    } else {
        res.json({state: 0})
    }
});
module.exports = router;
