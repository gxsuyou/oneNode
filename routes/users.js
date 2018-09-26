var express = require('express');
var router = express.Router();
var user = require("../DAO/user");
var https = require('https');
var qs = require('querystring');
// var path = 'F:/node/public/';
var path = require("path");
var crypto = require('crypto');
var md5 = crypto.createHash("md5");
// var qrImage = require('qr-image');
var common = require('../DAO/common')


//qiniu
var Base64 = {

    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode: function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },

    // public method for decoding
    decode: function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode: function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode: function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }
}
var qiniuBucket = {
    img: "oneyouxiimg",
    apk: "oneyouxiapk",
    base64: 'onebase64'
    // img:"oneyouxitestimg",
    //  apk:"oneyouxitestapk"
};
var qiniu = require('qiniu');
var config = new qiniu.conf.Config();
var accessKey = 'Uusbv77fI10iNTVF3n7EZWbksckUrKYwUpAype4i';
var secretKey = 'dEDgtx_QEJxfs2GltCUVgDIqyqiR6tKjStQEnBVq';
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
// 空间对应的机房
config.zone = qiniu.zone.Zone_z2;
var bucketManager = new qiniu.rs.BucketManager(mac, config);

var cdnManager = new qiniu.cdn.CdnManager(mac)//cnd对象；

// var urlsToRefresh = [
//     'http://if-pbl.qiniudn.com/nodejs.png',
//     'http://if-pbl.qiniudn.com/qiniu.jpg'
// ];
//刷新链接，单次请求链接不可以超过100个，如果超过，请分批发送请求
// cdnManager.refreshUrls(urlsToRefresh, function(err, respBody, respInfo) {
//     if (err) {
//         throw err;
//     }
//     console.log(respInfo.statusCode);
//     if (respInfo.statusCode == 200) {
//         var jsonBody = JSON.parse(respBody);
//         console.log(jsonBody.code);
//         console.log(jsonBody.error);
//         console.log(jsonBody.requestId);
//         console.log(jsonBody.invalidUrls);
//         console.log(jsonBody.invalidDirs);
//         console.log(jsonBody.urlQuotaDay);
//         console.log(jsonBody.urlSurplusDay);
//         console.log(jsonBody.dirQuotaDay);
//         console.log(jsonBody.dirSurplusDay);
//     }
// });

function getUpToken(scope, key) {
    var options = {
        scope: scope + ":" + key,
        returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
    };
    var putPolicy = new qiniu.rs.PutPolicy(options);
    return putPolicy.uploadToken(mac);
}

router.get('/getUptokenByMsg', function (req, res, next) {
    if (req.query.scope && req.query.key) {
        if (req.query.scope == 'img') {
            res.json({state: 1, upToken: getUpToken(qiniuBucket.img, req.query.key)})
        } else if (req.query.scope == 'base64') {
            res.json({
                state: 1,
                upToken: getUpToken(qiniuBucket.base64, req.query.key),
                url: "http://upload-z2.qiniup.com/putb64/-1/key/" + Base64.encode(req.query.key) + '/mimeType/' + Base64.encode('octet-stream')
            })
        }
    } else {
        res.json({state: 0})
    }

});

function isReverse(text) {
    return text.split('').reverse().join('');
}

var verify = {};
var date = new Date();
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

router.get('/list', function (req, res, next) {
    user.userList(function (result) {
        res.json(result);
    })
});
router.get('/getChannel', function (req, res, next) {
    // console.log(1);
    user.getChannel(function (result) {
        // console.log(result);
        result.length ? res.json({state: 1, channel: result}) : res.json({state: 0})
    })
});
router.get("/updateChannel", function (req, res, next) {
    user.updateChannel(req.query.channel, req.query.uid, function (result) {
        res.json({user: result})
    })
});


var signArr =
    [{day: 1, type: 0, value: 100}, {day: 2, type: 1, value: 10}, {day: 3, type: 0, value: 200}, {
        day: 4,
        type: 0,
        value: 100
    }, {day: 5, type: 0, value: 100}, {day: 6, type: 0, value: 300}, {day: 7, type: 1, value: 20}, {
        day: 8,
        type: 0,
        value: 100
    }, {day: 9, type: 0, value: 150}, {day: 10, type: 1, value: 10}, {day: 11, type: 0, value: 100}, {
        day: 12,
        type: 0,
        value: 500
    }, {day: 13, type: 0, value: 100}, {day: 14, type: 0, value: 150}, {day: 15, type: 0, value: 100}, {
        day: 16,
        type: 1,
        value: 10
    }, {day: 17, type: 0, value: 100}, {day: 18, type: 2, value: 2}, {day: 19, type: 0, value: 50}, {
        day: 20,
        type: 1,
        value: 10
    }, {day: 21, type: 0, value: 100}, {day: 22, type: 0, value: 100}, {day: 23, type: 0, value: 100}, {
        day: 24,
        type: 1,
        value: 30
    }, {day: 25, type: 0, value: 200}, {day: 26, type: 0, value: 100}, {day: 27, type: 0, value: 150}, {
        day: 28,
        type: 1,
        value: 10
    }, {day: 29, type: 0, value: 100}, {day: 30, type: 2, value: 5}];
router.get("/sign", function (req, res, next) {
    if (req.query.id) {
        var id = req.query.id;
        user.getSignById(id, function (result) {
            if (result.length) {
                var sign = result[0];
                if (sign.new_sign != date.Format('yyyy-MM-dd')) {
                    user.updateSign(id, sign.sign + 1, date.Format('yyyy-MM-dd'), function (result) {
                        if (result.affectedRows) {
                            var index = signArr[(sign.sign) % 30];
                            switch (index.type) {
                                case 0:
                                    user.selectUserIntegral(id, function (result) {
                                        user.updateUserIntegral(id, result[0].integral + index.value, function (result) {
                                            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
                                        })
                                    });
                                    break;
                                case 1:
                                    // console.log(id);
                                    user.selectUserCoin(id, function (result) {

                                        user.updateUserCoin(id, result[0].coin + index.value, function (result) {
                                            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
                                        })
                                    });
                                    break;
                                case 2:

                                    var startTime = date.Format('yyyy-MM-dd');
                                    var endTime;
                                    var day = new Date(parseInt(startTime.split("-")[0]), parseInt(startTime.split("-")[1]) + 1, 0);
//获取天数：
                                    var daycount = day.getDate();
                                    if (daycount < parseInt(startTime.split("-")[2])) {
                                        endTime = startTime.split("-")[0] + "-" + ((parseInt(startTime.split("-")[1]) + 1) > 9 ? (parseInt(startTime.split("-")[1]) + 1) : "0" + (parseInt(startTime.split("-")[1]) + 1)) + "-" + daycount;
                                    } else {
                                        endTime = startTime.split("-")[0] + "-" + ((parseInt(startTime.split("-")[1]) + 1) > 9 ? (parseInt(startTime.split("-")[1]) + 1) : "0" + (parseInt(startTime.split("-")[1]) + 1)) + "-" + parseInt(startTime.split("-")[2])
                                    }
                                    user.addLottery(id, 4, 1, startTime, endTime, index.value, function (result) {
                                        result.insertId ? res.json({state: 1}) : res.json({state: 0})
                                    });
                                    break;
                            }
                        } else {
                            res.json({state: 0})
                        }
                    })
                } else {
                    res.json({state: 4})
                }
            }

        })
    }
});
router.get("/getLottery", function (req, res, next) {
    if (req.query.id) {
        user.getLotteryByUid(req.query.id, function (result) {
            result.length ? res.json({state: 1, lottery: result}) : res.json({state: 0})
        })
    }
});
router.get("/getSign", function (req, res, next) {
    var data = req.query;
    var date = new Date();
    var nowTime = date.getTime() / 1000;
    nowTime = parseInt(nowTime)
    var toDay = date.setHours(0, 0, 0, 0) / 1000;
    data.start = toDay;
    data.nowTime = nowTime;
    data.signCoin = 0;
    data.signNum = 1;


    if (data.uid) {
        user.getLastSign(data, function (result) {
            if (result.length) {
                var lastDay = result[0].start_time
                if (lastDay == toDay) {//已签到，不能重复签到
                    res.json({state: 2, info: "已签到，不用重复签到"})
                    return false;
                }
                if (Number(lastDay) + 86400 < toDay) {//断签
                    console.log(1)
                    user.getUserSign(data, function (re_sign) {
                        re_sign.insertId ? res.json({state: 1, info: "已签到"}) : res.json({state: 0, info: "签到失败"});
                        return false;
                    })
                } else if (Number(lastDay) + 86400 == toDay) {//连续签到
                    console.log(2)
                    var num = result[0].sign_num;
                    var newNum = Number(num) + 1;
                    if (newNum > 7) newNum = 1;
                    switch (newNum) {
                        case 1:
                            data.signCoin = 5;
                            break;
                        case 2:
                            data.signCoin = 5;
                            break;
                        case 3:
                            data.signCoin = 5;
                            break;
                        case 4:
                            data.signCoin = 5;
                            break;
                        case 5:
                            data.signCoin = 5;
                            break;
                        case 6:
                            data.signCoin = 5;
                            break;
                        case 7:
                            data.signCoin = 5;
                            break;
                        default:
                            data.signCoin = 0
                            break;
                    }
                    data.signNum = newNum;
                    user.getUserSign(data, function (re_sign) {
                        user.getUserMsgById(data.uid, function (userInfo) {
                            re_sign.insertId ? res.json({
                                state: 1,
                                coin: userInfo[0].coin,
                                info: "已签到"
                            }) : res.json({state: 0, info: "签到失败"});
                            return false;
                        })
                    })
                }
            } else {//首次签到
                console.log(3)
                user.getUserSign(data, function (re_sign) {
                    re_sign.insertId ? res.json({state: 1, info: "已签到"}) : res.json({state: 0, info: "签到失败"});
                    return false;
                })
            }
        })
    }
});
// var md5 = crypto.createHash('md5');

//登录
router.post('/login', function (req, res, next) {
//    var date = new Date();
//    var nowTime = date.getTime() / 1000;//当前登陆时间
    var data = req.body
    var password = data.password;
    var md5 = crypto.createHash('md5');
    md5.update(password);
    var sign = md5.digest('hex');
    sign = isReverse(sign);

    user.login(data.tel, sign, function (result) {
        if (result.length) {
            var token = common.userToken(result[0].id);
            user.upLoginToken(result[0].id, token, function (newToken) {
                result[0].token = token;
                newToken.affectedRows ? res.json({state: 1, user: result[0]}) : res.json({state: 0, user: result[0]})
            })
        } else {
            res.json({state: result.length == 0 ? 0 : 1, user: result[0]})
        }

    })
});
router.get('/game/comment', function (req, res, next) {
    var data = req.query;
    user.getUserCommentLen(data.gameId, data.userId, function (count) {
        if (count[0].count < 3) {
            user.gameComment(data.userId, data.gameId, data.score, data.content, data.agree, parseInt(date.getTime() / 1000), data.parentId, data.address, function (result) {
                if (result.insertId) {
                    user.getGameCommentScoreById(data.gameId, function (result) {

                        if (result.length > 0) {
                            var len = result.length;
                            var allScore = 0;
                            for (var i = 0; i < len; i++) {
                                allScore += result[i].score;
                            }
                            // console.log((allScore / len).toFixed(1));
                            user.updateGameScore(data.gameId, (allScore / len).toFixed(1), function (result) {
                                result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
                            })
                        }
                    })
                }
            })
        } else {
            res.json({state: 4})
        }
    });

});
// 注册
router.post('/reg', function (req, res, next) {
    var ver = req.body.verify;
    var tel = req.body.tel;
    var recUser = req.body.recUser || null;

    var password = req.body.password;
    var md5 = crypto.createHash('md5');
    md5.update(password);
    var sign = md5.digest('hex');
    sign = isReverse(sign);
    if (ver && tel && password) {
        if (ver == verify[tel]) {
            var date = new Date();
            var img = "../../Public/image/morentouxiang.png"
            user.reg(tel, sign, parseInt(date.getTime() / 1000), img, recUser, function (result) {
                result.insertId ? user.updateOnlyidById(result.insertId, function () {
                }) : "";

                result.insertId ? res.json({state: 1, id: result.insertId}) : res.json({state: 0, id: ""})
            })
        } else {
            res.json({state: 3});
        }
    } else {
        res.json({state: 99});
    }
});
router.get('/verify', function (req, result, next) {
    var val = Math.floor(Math.random() * 900000) + 100000;
    var apikey = 'f589b7ce8a38a90b9d8e2ce20e26c020';
// 手机号码，多个号码用逗号隔开
    var mobile = req.query.tel;
// 要发送的短信内容
    var text = '【one游戏平台】您的验证码是' + val;
// 查询账户信息https地址
    var get_user_info_uri = '/v2/user/get.json';
// 智能匹配模板发送https地址
    var sms_host = 'sms.yunpian.com';
    send_sms_uri = '/v2/sms/single_send.json';
// 指定模板发送接口https地址
//     query_user_info(get_user_info_uri,apikey);
    send_sms(send_sms_uri, apikey, mobile, text);
    // function query_user_info(uri,apikey){
    //     var post_data = {
    //         'apikey': apikey,
    //     };//这是需要提交的数据
    //     var content = qs.stringify(post_data);
    //     post(uri,content,sms_host);
    // }
    function send_sms(uri, apikey, mobile, text) {
        var post_data = {
            'apikey': apikey,
            'mobile': mobile,
            'text': text,
        };//这是需要提交的数据
        var content = qs.stringify(post_data);
        post(uri, content, sms_host);
    }

    function post(uri, content, host, next) {

        var options = {
            hostname: host,
            port: 443,
            path: uri,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        };
        var req = https.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                chunk = JSON.parse(chunk);
                var state;
                switch (chunk.code) {
                    case 0:
                        verify[mobile] = val;
                        state = 1;
                        var x = mobile;
                        setTimeout(function () {
                            verify[x] = null;
                            // console.log(verify);
                        }, 600000);
                        break;
                    case 33:
                        state = 0;
                        console.log('请求过于频繁');
                        break;
                    default :
                        state = 0;
                        console.log(chunk);
                        break;
                }
                result.json({state: state, code: val});
            });
        });
        req.write(content);
        return req.end();
        // return next()
    }
});
// router.post('/updatePassword',function (req,res) {
//     if(req.body.tel && req.body.password && req.body.verify){
//         var ver=req.body.verify;
//         var tel=req.body.tel;
//         var password=req.body.password;
//         var md5 = crypto.createHash('md5');
//         md5.update(password);
//         var sign = md5.digest('hex');
//         sign=isReverse(sign);
//         user.updatePassword()
//         if(verify[tel]==ver){
//             user.updatePassword(tel,sign,function (result) {
//                 result.affectedRows ? res.json({state:1}) : res.json({state:0})
//             })
//         }else {
//             res.json({state:3});
//         }
//     }else {
//         res.json({state:99})
//     }
// });

router.get("/lottery", function (req, res) {
    var uid = req.query.id;
    user.selectUserIntegral(uid, function (result) {
        // console.log(result);
        if (result.length) {
            if (result[0].integral >= 500) {
                user.updateUserIntegral(uid, (parseInt(result[0].integral) - 500), function (result) {
                    // console.log(result);
                    if (result.affectedRows) {
                        var arr = [1, 2, 3, 4, 5, 6, 7, 8];
                        var num = Math.random();
                        if (num >= 0.3) {
                            user.selectUserIntegral(uid, function (result) {
                                if (result.length) {
                                    user.updateUserIntegral(uid, (result[0].integral + 50), function (result) {
                                        result.affectedRows ? res.json({state: 1, num: 6}) : res.json({state: 0})//50积分
                                    })
                                }
                            })
                        } else if (num >= 0.1 && num < 0.3) {
                            user.selectUserIntegral(uid, function (result) {
                                if (result.length) {
                                    user.updateUserIntegral(uid, (result[0].integral + 100), function (result) {
                                        result.affectedRows ? res.json({state: 1, num: 8}) : res.json({state: 0})//100积分
                                    })
                                }
                            })
                        } else if (num >= 0.0403 && num < 0.1) {
                            user.selectUserIntegral(uid, function (result) {
                                if (result.length) {
                                    user.updateUserIntegral(uid, (result[0].integral + 500), function (result) {
                                        result.affectedRows ? res.json({state: 1, num: 7}) : res.json({state: 0})//再抽一次
                                    })
                                }
                            })
                        } else if (num >= 0.0103 && num < 0.0403) {
                            user.selectUserIntegral(uid, function (result) {
                                if (result.length) {
                                    user.updateUserIntegral(uid, (result[0].integral + 500), function (result) {
                                        result.affectedRows ? res.json({state: 1, num: 4}) : res.json({state: 0})//500积分
                                    })
                                }
                            })
                        } else if (num >= 0.0000 && num < 0.0103) {
                            user.selectUserCoin(uid, function (result) {
                                if (result.length) {
                                    user.updateUserCoin(uid, (result[0].coin + 5), function (result) {
                                        result.affectedRows ? res.json({state: 1, num: 4}) : res.json({state: 0})//5币
                                    })
                                }
                            })
                        } else if (num >= 0.0002 && num < 0.0000) {
                            user.updateLottery(uid, 1, function (result) {
                                result.affectedRows ? res.json({state: 1, num: 2}) : res.json({state: 0})
                            })
                        } else if (num >= 0.0001 && num < 0.0000) {
                            user.updateLottery(uid, 2, function (result) {
                                result.affectedRows ? res.json({state: 1, num: 5}) : res.json({state: 0})//腾讯会员
                            })
                        } else if (num >= 0 && num < 0.0000) {
                            user.updateLottery(uid, 3, function (result) {
                                result.affectedRows ? res.json({state: 1, num: 1}) : res.json({state: 0})//爱奇艺会员
                            })
                        }
                    } else {
                        res.json({state: 0});
                        return;
                    }
                });
            } else {
                res.json({state: 0})
            }
        }
    })
});
router.get("/getIntegral", function (req, res, next) {
    if (req.query.id) {
        user.selectUserIntegral(req.query.id, function (result) {
            result.length ? res.json({state: 1, integral: result[0]}) : res.json({state: 0})
        })
    }
});
router.get("/serverAddress", function (req, res, next) {
    user.getServerAddress(function (result) {
        result.length ? res.json({state: 1, address: result}) : res.json({state: 0})

    })
});
router.get("/getCoin", function (req, res, next) {
    if (req.query.id) {
        user.getCoinById(req.query.id, function (result) {
            result.length ? res.json({state: 1, coin: result[0]}) : res.json({state: 0})
        })
    }
});
router.get("/updateNickName", function (req, res, next) {
    if (req.query.id && req.query.nickName) {
        user.hasNickName(req.query.nickName, function (users) {
            if (!users.user.length && !users.admin.length) {
                user.updateNickName(req.query.id, req.query.nickName, function (result) {
                    result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
                })
            } else if (users.user.length) {
                if (users.user[0].id == req.query.id && !users.admin.length) {
                    user.updateNickName(req.query.id, req.query.nickName, function (result) {
                        result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
                    })
                }
            } else if (!users.user.length && users.admin.length) {
                res.json({state: 0, info: "该昵称已注册，请输入其他昵称"})
            } else {
                res.json({state: 0, info: "该昵称已注册，请输入其他昵称"})
            }
        })
    } else {
        res.json({state: 0})
    }
});
router.get("/updateSex", function (req, res, next) {
    if (req.query.id && req.query.sex) {
        user.updateSex(req.query.id, req.query.sex, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    }
});
router.get('/updateBirthday', function (req, res) {
    if (req.query.id && req.query.birthday) {
        user.updateBirthday(req.query.id, req.query.birthday, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    }
});
router.post("/updateHead", function (req, res, next) {
    // console.log(req.body);
    if (req.body.id && req.body.head) {
        user.updateHead(req.body.head, req.body.id, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
        // cdnManager.refreshUrls(['http://base64.oneyouxi.com.cn/'+req.query.head], function(err, respBody, respInfo) {
        //     if (err) {
        //         throw err;
        //     }
        //     // console.log(respInfo.statusCode);
        //     if (respInfo.statusCode == 200) {
        //         var jsonBody = JSON.parse(respBody);
        //
        //         // console.log(jsonBody.code);
        //         // console.log(jsonBody.error);
        //         // console.log(jsonBody.requestId);
        //         // console.log(jsonBody.invalidUrls);
        //         // console.log(jsonBody.invalidDirs);
        //         // console.log(jsonBody.urlQuotaDay);
        //         // console.log(jsonBody.urlSurplusDay);
        //         // console.log(jsonBody.dirQuotaDay);
        //         // console.log(jsonBody.dirSurplusDay);
        //     }
        // });
    }
});
/**
 * 我的信息
 */
router.get("/getUserMsgById", function (req, res, next) {
    if (req.query.id) {
        user.getUserMsgById(req.query.id, function (result) {
            user.getGameCollect(req.query.id, function (coll) {
                result.length ? res.json({state: 1, user: result[0], gameColl: coll}) : res.json({state: 0})
            })
        })
    }
});
router.get("/addAddress", function (req, res, next) {
    if (req.query.id) {
        var data = req.query;
        user.addAddress(data.id, data.name, data.tel, data.area, data.detail, function (result) {
            result.insertId ? res.json({state: 1}) : res.json({state: 0})
        })
    }
});
router.get("/editAddress", function (req, res, next) {
    if (req.query.id) {
        var data = req.query;
        user.editAddress(data.id, data.name, data.tel, data.area, data.detail, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    }
});
router.get("/getAddress", function (req, res, next) {
    if (req.query.id) {
        user.getAddress(req.query.id, function (result) {
            res.json({state: 1, address: result})
        })
    }
});
router.get('/getNewsByUserId', function (req, res) {
    var data = req.query;
    if (data.page && data.userId) {
        user.getNewsByUserId(data.userId, data.page, function (result) {
            res.json({state: 1, newsList: result})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/getStrategyByUserId', function (req, res) {
    var data = req.query;
    if (data.page && data.userId) {
        user.getStrategyByUserId(data.userId, data.page, function (result) {
            if (result.length) {
                result.forEach(function (t) {
                    t.add_time = subdate(t.add_time);
                });
            }
            res.json({state: 1, strategyList: result})
        })
    } else {
        res.json({state: 0})
    }
});
// 获取用户收藏
router.get('/getCollectByUserId', function (req, res) {
    var data = req.query;
    console.log(data)
    if (data.userId && data.type && data.page) {
        if (data.type == 1) {
            user.getNewsCollect(data.userId, data.page, function (result) {
                if (result.length) {

                    for (var i = 0; i < result.length; i++) {
                        if (!result[i].game_name) {
                            result[i].game_name = "";
                        }
                        if (result[i].id == null) {

                            result.splice(i, result.length);
                        }
                    }
                    result.forEach(function (t) {
                        t.add_time = subdate(t.add_time)
                    })
                }
                res.json({state: 1, newsList: result})
            })
        } else if (data.type == 2) {
            user.getStrategyCollect(data.userId, data.page, function (result) {
                if (result.length) {
                    for (var i = 0; i < result.length; i++) {
                        if (!result[i].nick_name) {
                            result[i].nick_name = result[i].nike_name;
                        }
                        if (result[i].id == null) {

                            result.splice(i, result.length);
                        }
                    }
                    result.forEach(function (t) {
                        t.add_time = subdate(t.add_time)
                    })
                }
                res.json({state: 1, strategyList: result})
            })
        } else {
            // console.log(3)
            res.json({state: 0})
        }
    } else {
        // console.log(4)
        res.json({state: 0})
    }
});
// 获取我的游戏
router.get('/getGameByUserId', function (req, res) {
    var data = req.query;
    if (data.userId && data.type) {
        if (data.type == 3) {
            var data = req.query;
            data.sys = data.sys > 0 ? data.sys : 2;

            user.getGameByUser(data.userId, data.sys, data.page, function (result) {
                res.json({state: 1, gameList: result})
            })
        } else if (data.type == 4) {
            user.getH5ByUser(data.userId, data.page, function (result) {
                res.json({state: 1, h5List: result})
            })
        } else {
            res.json({state: 0})
        }
    } else {
        res.json({state: 0})
    }
});

function subdate(str) {
    if (Object.prototype.toString.call(str) === "[object String]") {
        return str.substring(0, 10);
    } else {
        return str
    }
}

router.get('/newMessage', function (req, res) {
    var data = req.query;
    if (data.userId > 0) {
        if (data.sort == 1) {
            user.newsMessage(data.userId, data.sort, data.page, function (result) {
                res.json({state: 1, tip: result})
            });
        } else if (data.sort == 2) {
            user.strategyMessage(data.userId, data.sort, data.page, function (result) {
                res.json({state: 1, tip: result})
            });
        } else if (data.sort == 3) {
            user.gameMessage(data.userId, data.sort, data.page, function (results) {
                res.json({state: 1, tip: results})
            });
        }

    } else {
        res.json({state: 0})
    }
});
router.get('/addFeedbackMsg', function (req, res) {
    var data = req.query;
    var date = new Date();
    var nowTime = date.getTime() / 1000;
    if (data.userId && data.content) {
        user.addFeedbackMsg(data.userId, data.content, nowTime, function (result) {
            var autoDetail = "尊敬的用户，谢谢您的宝贵意见！小one程序猿已经快马加鞭地解决中~"
            user.addAutoFeed(result.insertId, data.userId, parseInt(nowTime), autoDetail, function () {

            })

            result.insertId ? res.json({state: 1, feedbackId: result.insertId}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/addFeedbackImg', function (req, res) {
    var data = req.query;
    if (data.feedbackId && data.img) {
        user.addFeedbackImg(data.feedbackId, data.img, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});

// 修改密码
router.post('/upDatePassword', function (req, res, next) {
    var ver = req.body.verify;
    var tel = req.body.tel;
    var password = req.body.password;

    var md5 = crypto.createHash('md5');
    md5.update(password);
    var sign = md5.digest('hex');
    sign = isReverse(sign);
    if (ver && tel && sign) {
        if (ver == verify[tel]) {
            user.upDatePassword(sign, tel, function (result) {
                result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
            })
        } else {
            res.json({state: 3});
        }
    } else {
        res.json({state: 99});
    }
});

router.get("/getDelCollect", function (req, res, next) {
    var data = req.query;
    if (data.id) {
        user.getDelCollect(data, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0});
        })
    } else {
        res.json({state: 0});
    }
});

router.get("/getMassage", function (req, res, next) {
    var data = req.query;
    if (data.uid) {
        user.getMsg(data, function (result) {
            var arr = {};
            var num1 = 0;
            var num2 = 0;
            var num3 = 0;
            for (var i in result) {

                if (result[i].type == 1) {
                    num1++
                } else if (result[i].type == 2) {
                    num2++
                } else {
                    num3++
                }
            }
            arr = {
                num1: num1,
                num2: num2,
                num3: num3,
            }
            res.json(arr);
        })
    }
})

router.get("/getReading", function (req, res, next) {
    var data = req.query;
    if (data.uid) {
        data.type = data.type > 0 ? data.type : 1;
        user.getReading(data, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0});
        })
    }
})


router.get("/noticeAdd", function (req, res, next) {
    var data = req.query;
    var date = new Date();
    var start = date.setHours(0, 0, 0, 0) / 1000;
    var end = Number(start) + 86400 - 1;
    var getTime = date.getTime() / 1000;
    if (data.uid) {
        var arr = {
            uid: data.uid,
            start: start,
            end: end,
            types: data.type
        };
        user.getNoticeDay(arr, data.uid, getTime, function (result) {

        });

        res.json({state: 1});
    }
});

router.get("/notice", function (req, res, next) {
    var data = req.query;
    if (data.uid) {
        var date = new Date();
        var start = date.setHours(0, 0, 0, 0) / 1000;
        var end = Number(start) + 86400 - 1;
        var arr = {
            uid: data.uid,
            start: start,
            end: end,
            type: data.type
        };
        var newArr = []
        var last = {
            id: 0,
            tip_id: 0,
            user_id: 0,
            type: 0,
            state: 0,
            add_time: 0,
            detail: "",
            addTime: ""
        }
        noticeType(arr, 4, function (result4) {
            noticeType(arr, 5, function (result5) {
                noticeType(arr, 6, function (result6) {
                    noticeType(arr, 7, function (result7) {
                        newArr = [
                            {
                                num: result4.count > 0 ? result4.count : 0,
                                img: "../../Public/image/center_info_fuli.png",
                                type: 4,
                                name: "ONE福利",
                                last: result4.result ? result4.result : last
                            },
                            {
                                num: result5.count > 0 ? result5.count : 0,
                                img: "../../Public/image/center_info_advise.png",
                                type: 5,
                                name: "系统公告小助手",
                                last: result5.result ? result5.result : last
                            },
                            {
                                num: result6.count > 0 ? result6.count : 0,
                                img: "../../Public/image/center_info_shenhe.png",
                                type: 6,
                                name: "审核君",
                                last: result6.result ? result6.result : last
                            },
                            {
                                num: result7.count > 0 ? result7.count : 0,
                                img: "../../Public/image/center_info_sys.png",
                                type: 7,
                                name: "意见反馈",
                                last: result7.result ? result7.result : last
                            },
                        ];

                        res.json(newArr);
                    })
                })
            })
        })
    }
});

router.get("/getFeedBack", function (req, res, next) {
    var data = req.query;
    if (data.uid && data.type == 7) {
        user.getFeedbackLast(data, function (reslut) {
            res.json(reslut);
        })
    }
});
router.get("/autoFeedBack", function (req, res, next) {

})

router.get("/getNoticeInfo", function (req, res, next) {
    var data = req.query;
    if (data.uid && data.type) {
        if (data.type == 7) {
            user.getFeedback(data, function (result) {
                for (var i in result) {
                    result[i].img = "../../Public/image/center_info_sys.png";
                }
                res.json(result);
                return false
            })
        } else if (data.type > 3 && data.type < 7) {
            // user.getNoticeInfoAdd(data, function () {
            //
            // })

            user.getNoticeInfo(data, function (result) {
                for (var i in result) {
                    if (data.type == 4) {
                        result[i].img = "../../Public/image/center_info_fuli.png";
                    } else if (data.type == 5) {
                        result[i].img = "../../Public/image/center_info_advise.png";
                    } else if (data.type == 6) {
                        result[i].img = "../../Public/image/center_info_shenhe.png";
                    }
                }
                res.json(result);
                return false
            })
        }
    } else {
        res.json([]);
    }
});


router.get("/searchLogAdd", function (req, res, next) {
    var data = req.query
    var sys = data.sys > 0 ? data.sys : 2;
    if (data.uid && data.keyword && data.type) {
        user.searchLogAdd(data, sys, function (result) {
            result.insertId ? res.json({state: 1}) : res.json({state: 0})
        })
    }
});

router.get("/searchLog", function (req, res, next) {
    var data = req.query;
    var sys = data.sys > 0 ? data.sys : 2;
    if (data.uid && data.type) {
        user.searchLog(data, sys, function (result) {
            res.json(result);
        })
    }
});
router.get("/clearSearchLog", function (req, res, next) {
    var data = req.query;
    var sys = data.sys > 0 ? data.sys : 2;
    if (data.uid && data.type) {
        user.clearSearchLog(data, sys, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    }
});

// router.get("/getQrCode", function (req, res, next) {
//     var data = req.query;
//     var temp_qrcode = qrImage.image('https://www.oneyouxi.com.cn');
//     if (data.uid) {
//         temp_qrcode = qrImage.image('https://www.oneyouxi.com.cn?uid=/' + data.uid);
//     }
//     temp_qrcode.pipe(res)
//     res.type('png');
//     // res.json({s: 1})
// });

router.get("/getMyTicket", function (req, res, next) {
    var data = req.query;
    if (data.uid) {
        user.getMyTicket(data, function (result) {
            if (result.length) {
                if (result[0].id != null) {
                    for (var i in result) {
                        var num = 0;
                        var mytickey = []
                        if (result[i].tids == null) {
                            result[i].num = 0
                            result[i].mytickets = []
                            continue;
                        }
                        if (result[i].tids.indexOf(",") > -1) {
                            var tidArr = result[i].tids.split(",");
                            var uuidArr = result[i].uuids.split(",");
                            var coinArr = result[i].coins.split(",");
                            var a_coinArr = result[i].a_coins.split(",");
                            var uidArr = result[i].uids.split(",");
                            var stateArr = result[i].c_states.split(",");

                            for (var ii in tidArr) {
                                mytickey.push({
                                    tid: tidArr[ii],
                                    uid: uidArr[ii],
                                    uuid: uuidArr[ii],
                                    coin: coinArr[ii],
                                    a_coin: a_coinArr[ii],
                                    state: stateArr[ii]
                                })
                            }
                        } else {
                            mytickey.push({
                                tid: result[i].tids,
                                uid: result[i].uids == null ? 0 : result[i].uids,
                                uuid: result[i].uuids,
                                coin: result[i].coins,
                                a_coin: result[i].a_coins
                            })
                        }
                        // result[i].num = mytickey.length > 0 ? mytickey.length : num
                        result[i].mytickets = mytickey.length > 0 ? mytickey : []
                    }
                } else {
                    for (var i in result) {
                        result[i].num = 0
                        result[i].mytickets = []
                    }
                }
            }
            res.json(result);
        })
    }
})


function noticeType(obj, type, callback) {
    // user.getNotice
    new Promise(function (reslove, reject) {
        user.getNotice(obj, type, function (result) {
            reslove(result);
        })
    }).then(function (arr) {
        return callback(arr)
    })

};

// router.get("/edit");
module.exports = router;





