var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var CONFIG = require('./config'); // 自定义配置文件
var fs = require('fs');
var FileStreamRotator = require('file-stream-rotator'); // 格式化文件流
var dayjs = require('dayjs');

var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');  // 接口路由

var app = express();

// 视图模板引擎（前后分离用不到）
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/** 自定义日志写入文件 */
// 日志文件位置
const logDirectory = CONFIG.application().logDirectory || 'logs';
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
// create a rotating write stream
var accessLogfile = FileStreamRotator.getStream({
  date_format: 'YYYY-MM-DD',
  filename: path.join(logDirectory, 'access-%DATE%.log'),
  frequency: 'daily',
  verbose: false
})
var errorLogfile = FileStreamRotator.getStream({
  date_format: 'YYYY-MM-DD',
  filename: path.join(logDirectory, 'error-%DATE%.log'),
  frequency: 'daily',
  verbose: false
})

// 自定义token，在 format 中使用 :token，会被自动替换为内容
logger.token('from', function (req, res) {
  return JSON.stringify(req.query) || '-';    // req.query 是 get 方法的?key=value&key2=value2查询参数
});
logger.token('dAta', function (req, res) {
  return JSON.stringify(req.body) || '-nodata-';
});
logger.token('time', function (req, res) {
  return dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss.SSS");
});
logger.token('nextROw', function (req, res) {
  return "\r\n";
});
// 自定义format，其中包含自定义的token
logger.format('customAccessLog', '[:time] :remote-addr :remote-user :method :url :from :dAta :status :referrer :response-time ms :user-agent :nextROw');
//跳过不需要记录的请求
function skip(req) {
  return (req.url).indexOf('stylesheets') != -1 // 跳过样式表请求
}


// 中间件
app.use(logger('dev')); // 默认的access日志输出到控制台
app.use(logger('customAccessLog', { skip: skip, stream: accessLogfile })) // 自定义的写入文件流
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 路由
app.use('/', indexRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// 错误处理
app.use(function (err, req, res, next) {
  /** 自定义错误日志 */
  var now = new Date();
  var time = dayjs(now).format('YYYY-MM-DD HH:mm:ss');
  var meta = '[' + time + '] ' + req.method + ' ' + req.url + '\r\n';
  errorLogfile.write(meta + err.stack + '\r\n\r\n\r\n');  // 写入

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
