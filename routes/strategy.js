var express = require('express');
var router = express.Router();
var strategy = require('../DAO/strategy');
var socketio = require('./socketio');

var path = require('path');
var fs = require('fs');

Date.prototype.Format = function (formatStr) {
    var str = formatStr;
    var Week = ['日', '一', '二', '三', '四', '五', '六'];

    str = str.replace(/yyyy|YYYY/, this.getFullYear());
    str = str.replace(/yy|YY/, (this.getYear() % 100) > 9 ? (this.getYear() % 100).toString() : '0' + (this.getYear() % 100));

    str = str.replace(/MM/, this.getMonth() > 9 ? (this.getMonth() + 1).toString() : '0' + (this.getMonth() + 1));
    str = str.replace(/M/g, this.getMonth());

    str = str.replace(/w|W/g, Week[this.getDay()]);

    str = str.replace(/dd|DD/, this.getDate() > 9 ? this.getDate().toString() : '0' + this.getDate());
    str = str.replace(/d|D/g, this.getDate());

    str = str.replace(/hh|HH/, this.getHours() > 9 ? this.getHours().toString() : '0' + this.getHours());
    str = str.replace(/h|H/g, this.getHours());
    str = str.replace(/mm/, this.getMinutes() > 9 ? this.getMinutes().toString() : '0' + this.getMinutes());
    str = str.replace(/m/g, this.getMinutes());

    str = str.replace(/ss|SS/, this.getSeconds() > 9 ? this.getSeconds().toString() : '0' + this.getSeconds());
    str = str.replace(/s|S/g, this.getSeconds());

    return str;
};
// 添加攻略信息
router.post('/addStrategyMsg', function (req, res) {
    var data = req.body;
    if (data.userId && data.title && data.detail && data.gameName) {
        var date = new Date();

        function find() {
            strategy.findGameName(data.gameName, function (result) {
                //if (result[0]) {
                // data.addTime = date.Format('yyyy-MM-dd hh:mm:ss')
                data.addTime = parseInt(date.getTime() / 1000)
                strategy.addStartegy(data, function (result) {
                    result.insertId ? res.json({state: 1, strategyId: result.insertId}) : res.json({state: 0})
                })
                //} else {
                //    res.json({state: 2, msg: '游戏名不存在'});
                //}
            });
        }

        find();
    } else {
        res.json({state: 0})
    }
});
// 添加攻略图片
// router.get('/addStrategyImg', function (req, res) {
//     var data = req.query;
//     // 获取字符串的长度  截取到字符串最后一个元素
//     var len = data.img.length;
//     var lastNum = data.img.substring(len - 1, len);
//     // 拼接排序id  sort_id
//     var sort_id = data.strategyId + lastNum;
//     if (data.strategyId && data.img && sort_id) {
//         strategy.addStartegyImg(data.strategyId, data.img, sort_id, function (result) {
//             result.insertId ? res.json({state: 1}) : res.json({state: 0})
//         })
//     } else {
//         res.json({state: 0})
//     }
// });
// 添加收藏
router.get('/collect', function (req, res) {
    var data = req.query;
    if (data.targetId && data.userId && data.sys && data.type) {
        strategy.collect(data.targetId, data.userId, data.sys, data.type, function (result) {
            //console.log(result);
            res.json({state: 1})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/unCollect', function (req, res) {
    var data = req.query;
    if (data.targetId && data.userId && data.type) {
        strategy.unCollect(data.targetId, data.userId, data.type, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/getSearchGame', function (req, res) {
    var data = req.query;
    data.sys = data.sys > 0 ? data.sys : 2;
    strategy.getSearchGame(data.sys, function (result) {
        result.length ? res.json({state: 1, gameList: result}) : res.json({state: 0})
    })
});
// 获取攻略列表
router.get('/getStrategyByMsg', function (req, res) {
    var data = req.query;
    if (data.sort && data.page) {
        if (data.sort == 'essence') {
            strategy.getStrategyByEssence(data.page, function (result) {
                // console.log(result);
                for (var i = 0; i < result.length; i++) {
                    if (result[i].user_id == null) {
                        result[i].nick_name = 'haode';
                    }
                }
                res.json({state: 1, strategy: result})
            })
        } else {
            strategy.getStrategyByMsg(data.sort, data.page, function (result) {
                for (var i = 0; i < result.length; i++) {
                    if (result[i].nick_name == null) {
                        result[i].nick_name = result[i].nike_name;
                    }
                }
                res.json({state: 1, strategy: result})
            })
        }
    } else {
        res.json({state: 0})
    }
});
router.get('/getStrategyByEssence', function (req, res) {
    var data = req.query;
    if (data.page) {
        strategy.getStrategyByEssence(data.page, function (result) {
            res.json({state: 1, strategy: result})
        })
    } else {
        res.json({state: 0})
    }
});
// 获取攻略详情
router.get('/getStrategyById', function (req, res) {
    var data = req.query;
    if (data.strategyId && data.userId) {
        function add() {
            strategy.addBrowseNum(data.strategyId, function (result) {
                strategy.getStrategyById(data.userId, data.strategyId, function (result) {
                    // var newtime = result[0].add_time.substring(0, 16);
                    // result[0].add_time = newtime;
                    res.json({state: 1, strategy: result[0]})
                });
            });
        }

        add();
    } else {
        res.json({state: 0})
    }
});
// 添加攻略（浏览 || 点赞 || 评论）数
router.get('/addNum', function (req, res) {
    var data = req.query;
    if (data.num && data.strategyId && data.numType) {
        // 添加评论数
        if (data.numType == "comment_num") {
            function num() {
                strategy.countComment(data.strategyId, function (result) {
                    var num = result[0].num;
                    // console.log(num);
                    strategy.addNum(num, data.strategyId, data.numType, function (result) {
                        res.json({state: 1})
                    });
                });
            }

            num();
        } else if (data.numType == "agree_num") {// 添加点赞数
            function anum() {
                strategy.getCountLikeComment(data.strategyId, function (result) {
                    var anum = result[0].lnum + 1;
                    //console.log(anum);
                    strategy.addNum(anum, data.strategyId, data.numType, function (result) {
                        res.json({state: 3})
                    });
                });
            }

            anum();
        } else {
            res.json({state: 0})
        }

    }

});
// 更换攻略评论图片
router.get('/updateStrategyCommentImg', function (req, res) {
    var data = req.query;
    if (data.strategyId && data.img) {
        strategy.updateStrategyCommentImg(data.strategyId, data.img, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
// 获取攻略点赞数
router.get('/getCountLikeComment', function (req, res) {
    var data = req.query;
    if (data.strategyId) {
        strategy.getCountLikeComment(data.strategyId, function (result) {
            res.json({state: 1, lnum: result});
        });
    } else {
        res.json({state: 0})
    }
});

// 添加评论
router.get('/strategyComment', function (req, res) {
    var data = req.query;
    var date = new Date();
    if (data.content && data.targetCommentId && data.targetUserId && data.userId && data.series) {

        if (data.series == 1) {
            function addComment() {
                strategy.addCommentNum(data.targetCommentId, function (result) {
                    // var content = test(data.content);
                    if (data.targetUserId == null) {
                        data.targetUserId = data.aid;
                    }
                    strategy.getSensitive(data.content, function (contents) {
                        strategy.strategyComment(contents, data.userId, data.targetCommentId, data.targetUserId, data.series, parseInt(date.getTime() / 1000), data.target_img, data.targetid, data.target_title, function (result) {
                            //console.log(result);
                            result.insertId && strategy.addUserTip(result.insertId, data.targetUserId);
                            socketio.senMsg(data.targetUserId);
                            result.insertId ? res.json({state: 1, commentId: result.insertId}) : res.json({state: 0})
                        });
                    });
                });
            }

            addComment();
        }
        ;
        if (data.series == 2) {
            function addFirstComment() {
                strategy.addFirstCommentNum(data.targetCommentId, function (result) {
                    function getstrategyid() {
                        strategy.getStrategyId(data.targetCommentId, function (result) {
                            // console.log(result[0].tarId);
                            function addComment() {
                                strategy.addCommentNum(result[0].tarId, function (result) {
                                    strategy.getSensitive(data.content, function (contents) {
                                        strategy.strategyComment(contents, data.userId, data.targetCommentId, data.targetUserId, data.series, parseInt(date.getTime() / 1000), data.target_img, data.targetid, data.target_title, function (result) {
                                            result.insertId && strategy.addUserTip(result.insertId, data.targetUserId);
                                            socketio.senMsg(data.targetUserId);
                                            result.insertId ? res.json({
                                                state: 1,
                                                commentId: result.insertId
                                            }) : res.json({state: 0})
                                        });
                                    })
                                });
                            }

                            addComment();
                        });
                    }

                    getstrategyid();

                })
            }

            addFirstComment();
        }

    } else {
        res.json({state: 0})
    }
});

// 获取攻略详情页评论接口
router.get('/getStrategyCommentByPage', function (req, res) {
    var data = req.query;
    if (data.strategyId && data.page && data.userId && data.sort) {
        strategy.getStrategyCommentByPage(data.userId, data.strategyId, data.page, data.sort, function (result) {
            if (result.length) {
                var data = result;
                var len = result.length;
                var index = 0;

                function selectTow() {
                    strategy.getStrategyCommentTow(result[index].id, function (result) {
                        result.forEach(function (t) {
                            // t.add_time = subdate(t.add_time);
                        });
                        data[index].towCommentList = result;
                        if (index < (len - 1)) {
                            index++;
                            selectTow()
                        } else {
                            res.json({state: 1, comment: data})
                        }
                    });
                }

                selectTow();
            } else {
                res.json({state: 4, comment: []})
            }
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/getStrategyCommentTowByPage', function (req, res) {
    var data = req.query;
    if (data.commentId && data.page) {
        strategy.getStrategyCommentTowByPage(data.commentId, data.page, function (result) {
            if (result.length) {
                result.forEach(function (t) {
                    // t.add_time = subdate(t.add_time);
                });
                res.json({state: 1, comment: result})
            } else {
                res.json({state: 1, comment: result})
            }
            ;
        })
    } else {
        res.json({state: 0})
    }
});
// 根据ID获取一级评论
router.get('/getCommentById', function (req, res) {
    var data = req.query;
    if (data.commentId) {
        // function ready(){
        // strategy.readMessage(data.commentId,function(result){
        strategy.getCommentById(req.query.commentId, function (result) {
            result.length && (result[0].add_time = subdate(result[0].add_time));
            result.length ? res.json({state: 1, comment: result[0]}) : res.json({state: 0});
        })
        // });
        // }
        // ready();
    } else {
        res.json({state: 0})
    }
});
// 点赞接口
router.get('/likeComment', function (req, res) {
    var data = req.query;
    if (data.commentId && data.userId && data.state) {
        function addAgree() {
            strategy.addAgreeNum(data.commentId, function (result) {
                strategy.likeComment(data.commentId, data.userId, data.state, function (result) {
                    result.insertId ? res.json({state: 1}) : res.json({state: 0})
                })
            });
        }

        addAgree();
    } else {
        res.json({state: 0})
    }
});
// 取消点赞接口
router.get('/unLikeComment', function (req, res) {
    var data = req.query;
    if (data.commentId && data.userId) {
        strategy.unLikeComment(data.commentId, data.userId, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
// 根据关游戏名字获取攻略
router.get('/getStrategyByGameName', function (req, res) {
    var data = req.query;
    if (data.msg && data.page && data.sort) {
        if (data.sort == 'essence') {
            strategy.getEssenceStrategyByGameName(data.msg, data.page, function (result) {
                for (var i = 0; i < result.length; i++) {
                    var newtime = result[i].add_time.substring(0, 16);
                    result[i].add_time = newtime;
                    var arr = [];
                    if (result[i].src != null) {
                        arr = result[i].src.split(',');
                        result[i].src = arr[arr.length - 1];
                    }
                }
                res.json({state: 1, strategy: result})
            })
        } else {
            strategy.getStrategyByGameName(data.msg, data.sort, data.page, function (result) {
                for (var i = 0; i < result.length; i++) {
                    var arr = [];
                    if (result[i].src != null) {
                        arr = result[i].src.split(',');
                        result[i].src = arr[arr.length - 1];
                    }
                }
                res.json({state: 1, strategy: result})
            })
        }

    } else {
        res.json({state: 0})
    }
});
router.get('/getStrategyGameNameByMsg', function (req, res) {
    var data = req.query;
    if (data.msg) {
        strategy.getStrategyGameNameByMsg(data.msg, function (result) {
            res.json({state: 1, gameName: result})
        })
    } else {
        res.json({state: 0})
    }
});
// 添加攻略评论图片
router.get('/updateCommentImg', function (req, res) {
    var data = req.query;
    if (data.commentId && data.img) {
        strategy.updateCommentImg(data.commentId, data.img, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
// 只看楼主
router.get('/getStrategyCommentByPageUser', function (req, res) {
    var targetId = req.query.targetId;
    var page = req.query.page;
    var userId = req.query.userId;
    var strategyId = req.query.strategyId;
    if (userId && targetId && page && strategyId) {
        strategy.getStrategyCommentByPageUser(userId, targetId, strategyId, page, function (result) {
            if (result.length) {
                var data = result;
                data.forEach(function (t) {
                    t.add_time = subdate(t.add_time);
                });
                var len = result.length;
                var index = 0;

                function selectTow() {
                    strategy.getStrategyCommentTow(result[index].id, function (result) {
                        result.forEach(function (t) {
                            t.add_time = subdate(t.add_time);
                        });
                        data[index].towCommentList = result;
                        if (index < (len - 1)) {
                            index++;
                            selectTow();
                        } else {
                            res.json({state: 1, comment: data})
                        }
                    });
                }

                selectTow();
            } else {
                res.json({state: 4, comment: []})
            }
        });
    } else {
        res.json({state: 0})
    }
});
//我的作品删除
router.get('/strategyDelete', function (req, res) {
    var strategyId = req.query.strategyId;
    if (strategyId) {
        strategy.strategyDelete(strategyId, function (result) {

            if (result.affectedRows > 0) {
                res.json({state: 1});
            } else {
                res.json({state: 0});
            }
        });

    } else {
        res.json({state: 0});
    }
});
// 限制不文明词语
// router.get('/test',function(req,res){
//     var con = req.query.content;
//     console.log(test(con));
// });
function test(content) {
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
            return content;
        });
    } else {
        return content;
    }
}

function subdate(str) {
    return str.substring(0, 10);
}

module.exports = router;