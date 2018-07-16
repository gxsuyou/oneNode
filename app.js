var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var timeout = require('connect-timeout');


var index = require('./routes/index');
var users = require('./routes/users');
var game = require('./routes/game');
var store = require('./routes/store');
var news = require('./routes/news');
var h5 = require('./routes/h5');
var strategy = require('./routes/strategy');
var app = express();
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
// view engine setup
// app.set('views', path.join(__dirname, 'botSup/html/'));
// app.set('view engine', 'html');
// app.engine('.html', require('ejs').__express);
// app.set('view engine', 'html');
// app.engine('.html',require('html').__express);

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false, limit: 100 * 1024 * 1024}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'resource')));
// app.use(express.bodyParser());

app.use('/', index);
app.use("/game", game);
app.use('/users', users);

app.use('/store', store);
app.use("/news", news);
app.use("/h5", h5);
app.use('/strategy', strategy)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    // res.render('error');
});
// global.PUBLIC_PATH = __dirname + '/public/';
// console.log(PUBLIC_PATH);
app.use(timeout('5s'));
//....一些中间件
app.use(haltOnTimedout);

function haltOnTimedout(req, res, next) {
    if (!req.timedout) next()
}
module.exports = app;
