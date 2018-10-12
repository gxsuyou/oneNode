var router = require('express').Router();
var game = require("../DAO/game");
var bodyParser = require('body-parser');
var socketio = require('./socketio');
var common = require("../DAO/common");


function formatMsgTime(timespan) {

    var dateTime = new Date(timespan * 1000);

    var year = dateTime.getFullYear();
    var month = dateTime.getMonth() + 1;
    var day = dateTime.getDate();
    var hour = dateTime.getHours();
    var minute = dateTime.getMinutes();
    var second = dateTime.getSeconds();
    var now = new Date();
    var now_new = Date.parse(now.toDateString());  //typescript转换写法
    var milliseconds = 0;
    var timeSpanStr;

    milliseconds = now.getTime() - Number(timespan) * 1000;
    if (milliseconds <= 1000 * 60 * 1) {
        timeSpanStr = '刚刚';
    }
    else if (1000 * 60 * 1 < milliseconds && milliseconds <= 1000 * 60 * 60) {
        timeSpanStr = Math.round((milliseconds / (1000 * 60))) + '分钟前';
    }
    else if (1000 * 60 * 60 * 1 < milliseconds && milliseconds <= 1000 * 60 * 60 * 24) {
        timeSpanStr = Math.round(milliseconds / (1000 * 60 * 60)) + '小时前';
    } else {
        return {time: timespan};
    }
    // else if (1000 * 60 * 60 * 24 < milliseconds && milliseconds <= 1000 * 60 * 60 * 24 * 15) {
    //     timeSpanStr = Math.round(milliseconds / (1000 * 60 * 60 * 24)) + '天前';
    // }
    // else if (milliseconds > 1000 * 60 * 60 * 24 * 15 && year == now.getFullYear()) {
    //     timeSpanStr = month + '-' + day + ' ' + hour + ':' + minute;
    // } else {
    //     timeSpanStr = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
    // }
    return timeSpanStr;
}


// 获取游戏详情
router.get('/getGameById', function (req, res, next) {
    var data = req.query;
    if (data.gameId) {
        if (data.sys > 0) {
            data.sys = data.sys > 0 ? data.sys : 2;
            game.getGameMsgById(data.gameId, function (gameInfo) {
                game.getGameMsgByIdSys(gameInfo[0].game_name, data.sys, function (gameInfoSys) {
                    if (gameInfoSys.length) {
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
                })
            })
        } else {
            game.getDetailById(data.gameId, function (result) {
                if (result[0].game_detail != null) {
                    var str = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + result[0].game_detail;
                    var mstr = str.replace(/\t/g, "&nbsp;");
                    var nstr = mstr.replace(/\r\n/g, "<br/>" + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
                    result[0].game_detail = nstr;
                }
                result.length ? res.json({state: 1, gameDetail: result[0]}) : res.json({state: 0})
            })
        }
    } else {
        res.json({state: 0})
    }
});

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
    var data = req.query;
    data.sys = data.sys > 0 ? data.sys : 2;
    game.getCarousel(data.sys, function (result) {
        result.length ? res.json({state: 1, carousel: result}) : res.json({state: 0})
    })
});
router.get("/active", function (req, res, next) {
    var data = req.query;

    game.getActive(data, function (result) {
        result.length ? res.json({state: 1, active: result}) : res.json({state: 0})
    })
});
router.get("/clsActive", function (req, res, next) {
    game.getClsActive(function (result) {
        result.length ? res.json({state: 1, clsActive: result}) : res.json({state: 0})
    })
});
// 根据标签获取游戏
router.get('/getGameByTag', function (req, res) {
    var data = req.query;
    data.sys = data.sys > 0 ? data.sys : 2;
    if (data.tagId && data.page) {
        game.getGameByTag(data.tagId, data.sys, data.page, function (result) {
            res.json({state: 1, gameList: result})
        })
    } else {
        res.json({state: 0})
    }
});
// 游戏排行
router.get("/getGameByMsg", function (req, res, next) {
    var data = req.query;
    game.getGameByMsg(data.sys, data.type, data.sort, data.page, function (result) {
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
        game.getGameCommentById(req.query.gameId, req.query.userId, req.query.page, function (result) {
            res.json({state: 1, comment: result})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/getGameHotComment', function (req, res) {
    var data = req.query;
    if (data.gameId) {
        game.getGameHotComment(data.gameId, data.userId, function (result) {
            res.json({state: 1, comment: result})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/getOneCommentByCommentId', function (req, res) {
    var data = req.query;
    if (data.commentId) {
        game.getOneCommentByCommentId(data.commentId, function (result) {
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
/*游戏评论点赞*/
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
/*游戏评论点赞取消*/
router.get('/unLikeComment', function (req, res) {
    var data = req.query;
    if (data.commentId && data.userId) {
        game.minusCommmentLikeNum(data.commentId, data.userId, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/getGameLikeTag', function (req, res) {
    var data = req.query;
    data.sys = data.sys > 0 ? data.sys : 2;
    if (data.gameId) {
        game.getGameLikeTag(data.gameId, data.sys, function (result) {
            for (var i in result) {
                if (result[i].tagList.indexOf(",") != -1) {
                    result[i].tagList = result[i].tagList.substr(0, result[i].tagList.indexOf(","))
                }
            }

            res.json({state: 1, gameList: result})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/getNewsByGameId', function (req, res) {
    var data = req.query;
    if (data.gameId) {
        game.getGameMsgById(data.gameId, function (game_result) {
            if (game_result.length) {
                game.getNewsByGameId(game_result[0].game_name, function (result) {
                    // var newTime = formatMsgTime(result[0].add_time);
                    for (var i in result) {
                        var newTime = formatMsgTime(result[i].add_time);
                        result[i].add_time = newTime;
                        if (newTime.time) {
                            var dateTime = new Date(newTime.time * 1000);
                            result[i].add_time = dateTime.Format('yyyy-MM-dd HH:mm');
                        }
                    }

                    res.json({state: 1, newsList: result})
                })
            } else {
                res.json({state: 0})
            }
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
            res.json({state: 1, scoreList: result})
        })
    } else {
        res.json({state: 0})
    }
});

router.get("/getCommentUserById", function (req, res, next) {
    var data = req.query;
    if (data.user_id && data.game_id) {
        game.getCommentUserById(data, function (result) {
            result.length < 1 ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }

});
// 评论游戏接口
router.get('/comment', function (req, res, next) {
    var data = req.query;
    if (data.userId && data.gameId && data.content) {
        var date = new Date();
        var objArr = {
            userId: data.userId,
            gameId: data.gameId,
            score: data.score,
            content: common.getChangeFace(data.content),
            addTime: parseInt(date.getTime() / 1000),
            parentId: data.parentId,
            series: data.series,
            targetUserId: data.targetUserId || null,
            game_name: data.game_name,
            game_title_img: data.game_title_img,
        }
        game.hasGameCommentParent(data.parentId, function (p_result) {
            if (p_result.length) {
                objArr.toUser = p_result[0].user_id;
            } else {
                objArr.toUser = 0;
            }

            game.gameComment(objArr, function (result) {
                if (result.insertId) {
                    if (objArr.toUser > 0) game.addUserTip(result.insertId, objArr.toUser);
                    if (objArr.toUser > 0) socketio.senMsg(objArr.toUser);
                    game.getGameCommentScoreById(data.gameId, function (result) {
                        if (result.length > 0) {
                            var len = result.length;
                            var allScore = 0;
                            for (var i = 0; i < len; i++) {
                                allScore += result[i].score;
                            }
                            var newSorce = (allScore / len).toFixed(1);
                            game.updateGameScore(data.gameId, newSorce, function (result) {
                                result.affectedRows ? res.json({state: 1, score: newSorce}) : res.json({state: 0})
                            })
                        }
                    })
                }
            })

        })
    } else {
        res.json({state: 0})
    }
});
router.get('/getGameCls', function (req, res) {
    var data = req.query;
    data.sys = data.sys > 0 ? data.sys : 2;
    game.getGameCls(data, function (result) {
        res.json({state: 1, cls: result})
    })
});
router.get('/getAppCls', function (req, res) {
    var data = req.query;
    data.sys = data.sys > 0 ? data.sys : 2;
    game.getAppCls(data, function (result) {
        res.json({state: 1, cls: result})
    })
});
// 根据分类获取游戏
router.get('/getGameByCls', function (req, res) {
    var data = req.query;
    var arr = new Array();
    data.sys = data.sys > 0 ? data.sys : 2;
    if (data.clsId && data.page) {
        game.getGameByCls(data.clsId, data.sys, data.page, function (result) {
            res.json({state: 1, gameList: result})
        })
    } else {
        res.json({state: 0})
    }
});
// 根据关键词搜索游戏
router.get("/searchGameByMsg", function (req, res, next) {
    if (req.query.msg && req.query.sys) {
        var data = req.query;
        data.uid = data.uid > 0 ? data.uid : 0;
        game.searchGameByMsg(data.uid, data.sys, data.msg, data.sort, data.page, function (result) {
            result.length ? res.json({state: 1, game: result}) : res.json({state: 0})
        })
    }
});
router.get("/likeGameComment", function (req, res, next) {
    // console.log(req.query);
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
    data.sys = data.sys > 0 ? data.sys : 2;
    if (data.subjectId) {
        game.getSubjectById(data.subjectId, data.sys, function (result) {
            result.length ? res.json({state: 1, subject: result[0]}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
// 获取活动标签
router.get('/getActiveTag', function (req, res) {
    var data = req.query;
    data.sys = data.sys > 0 ? data.sys : 2;
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

router.get('/addMyGameIos', function (req, res) {
    var data = req.query;
    if (data.userId && data.gameId && data.sys) {
        game.addMyGameIos(data.gameId, data.userId, data.sys, function (result) {
            res.json({state: 1})
        })
    } else {
        res.json({state: 0})
    }
});

// 获取推荐位(2个)
router.get('/getActiveLenOfTow', function (req, res) {
    var data = req.query;
    game.getActiveLenOfTow(data, function (result) {

        res.json({state: 1, game: result})
    })
});
// 获取推荐位(10个)
router.get('/getActiveLenOfTen', function (req, res) {
    var data = req.query
    game.getActiveLenOfTen(data, function (result) {
        res.json({state: 1, game: result})
    })
});
// 根据游戏名字获取相关攻略
router.get('/getStrategyByGameName', function (req, res) {
    var data = req.query;
    var uid = data.user_id > 0 ? data.user_id : 0;
    if (data.gameName && data.page) {
        game.getStrategyByGameName(data.gameName, uid, data.page, function (result) {
            for (var i = 0; i < result.length; i++) {
                if (!result[i].nick_name) {
                    result[i].nick_name = result[i].nike_name;
                }
            }
            res.json({state: 1, strategy: result})
        });
    } else {
        res.json({state: 0})
    }
});

router.get("/checkGameSys", function (req, res) {
    var data = req.query;
    if (req.query.gameName && req.query.sys) {
        game.checkGameSys(data.gameName, data.sys, function (result) {
            if (result.length > 0) {
                res.json({state: 1, id: result[0].id})
            } else {
                res.json({state: 0})
            }
        });
    } else {
        res.json({state: 0})
    }
})

router.get("/delMyComment", function (req, res, next) {
    var data = req.query;
    if (data.uid && data.id) {
        game.delMyComment(data, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    }
})


router.get("/getActivityGame", function (req, res, next) {
    var data = req.query;
    var page = data.page > 0 ? data.page : 1;
    data.sys = data.sys > 0 ? data.sys : 2;
    data.type = data.type == "choose" ? data.type : "one";
    game.getActivityGame(data, page, function (result) {
        res.json(result)
    })
})

router.get('/getGameTickets', function (req, res, next) {
    var data = req.query;
    if (data.game_id) {
        var uid = data.user_id > 0 ? data.user_id : 0
        game.getTicketInfo(data, uid, function (result) {
            res.json(result)
        })
    }
});
router.get('/goGameTicket', function (req, res, next) {
    var data = req.query;
    var date = new Date();
    if (data.id && data.user_id > 0) {
        data.addTime = date.getTime() / 1000;
        data.endTime = data.addTime + (86400 * 7);
        game.goTicket(data, function (result) {
            result.insertId ? res.json({state: 1}) : res.json({state: 0, info: result.info})
        })
    } else {
        res.json({state: 0})
    }
});

router.post("/getUseTicket", function (req, res, next) {
    var data = req.body;
    data.id = data.tu_id;
    if (data.uid && data.id && data.tel) {
        game.getUseTicket(data, function (ticketInfo) {
            if (ticketInfo.length) {
                if (ticketInfo[0].uuid != ticketInfo[0].b_uuid) {
                    res.json({state: 3, info: "签名比对不正确，请与管理员联系"})
                    return false
                }
                if (ticketInfo[0].state != 1) {
                    res.json({state: 0, info: "通用券/抵用券已失效或审核中"})
                    return false
                }
                var sysMemo = "使用的抵用券id为：[" + data.id + "]，抵用券签名标识符为：[" + ticketInfo[0].uuid + "]";
                var from = "游戏充值使用抵用券" + ticketInfo[0].coin + "元";
                if (ticketInfo[0].types == 1) {
                    from = "游戏充值使用通用券" + ticketInfo[0].coin + "元";
                    sysMemo = "使用的通用券id为：[" + data.id + "]，通用券签名标识符为：[" + ticketInfo[0].uuid + "]";
                }
                var arr = {
                    from: from,
                    user_id: data.uid,
                    coin: ticketInfo[0].coin,
                    game_id: ticketInfo[0].game_id,
                    game_name: ticketInfo[0].game_name,
                    game_user: data.game_user || "",
                    game_area: data.game_area || "",
                    tel: data.tel,
                    types: 1,
                    memo: "充值返还" + ticketInfo[0].reback + "金币",
                    sys_memo: sysMemo
                };

                game.getUseTicketSet(data, function (setInfo) {
                    common.getAddOrder(arr, function () {

                    });
                    setInfo.affectedRows ? res.json({state: 1}) : res.json({state: 0})
                })
            } else {
                res.json({state: 0, info: "通用券/抵用券已失效或审核中"})
                return false
            }
        })
    }
});


module.exports = router;
