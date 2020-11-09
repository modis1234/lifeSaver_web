var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
var logger = require('morgan');
const cors = require("cors");
const cookie = require('cookie');

var session = require('express-session');
var MySQLStore = require('express-mysql-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var accountRouter = require('./routes/accountRouter');
var receiverRouter = require('./routes/receiverRouter');
var sensorRouter = require('./routes/sensorRouter');
var cctvRouter = require('./routes/cctvRouter');
var gasRouter = require('./routes/gasRouter');
var usedRouter = require('./routes/usedHisRouter');
var alarmRouter = require('./routes/alarmHisRouter');
var siteRouter = require('./routes/siteRouter');

var fileUploadRouter = require('./routes/uploadRouter');

var app = express();
var dbconfig = require('./routes/config/database');

var sessionStore = new MySQLStore(dbconfig.develop);
var session = session({
  secret: "asdfasdfdas",
  resave: false,
  saveUninitialized: false,
  store: sessionStore
})
app.use(session);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/upload', express.static('uploads'));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/account', accountRouter);
app.use('/receiver', receiverRouter);
app.use('/sensor', sensorRouter);
app.use('/cctv', cctvRouter);
app.use('/gas', gasRouter);
app.use('/used', usedRouter);
app.use('/alarm', alarmRouter);
app.use('/site', siteRouter);

app.use('/upload', fileUploadRouter);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


var _getData = require('./routes/config/getData');


let room = {}; // room= { sensorIndex: { index: "gas101", intervalId: undefined }} 
let setIntervalList = {}

app.io = require('socket.io')();
var ios = require("express-socket.io-session"); // 소켓 내에서 세션데이터 접근 가능하도록하는 모듈
app.io.use(ios(session, { autoSave: true }));  // 모듈과 세션 연결


var user = {}; //{sessionID: { sensorIndex { index: }}}

app.io.on('connection', (socket) => {

  let _handshake = socket.handshake;
  let _ip = _handshake.address;

  let intervalId = undefined;
  let timeoutId = undefined;

  socket.emit('start', 'start!!');

  socket.on('disconnect', (data) => {
    console.log('유저 나갔다.=>', data);
    clearInterval(intervalId)
    intervalId = undefined;
    var _ip = _handshake.address;
    let _referer = _handshake.headers['referer'].split('/').reverse()[0];

  });

  // 초기 데이터
  let _initData = {};
  socket.on('initData', (sensorIdx) => {
    _initData['receiveSensor'] = _getData.receiveSensor[sensorIdx];
    _initData['receiveLog'] = _getData.receiveLog[sensorIdx];
    socket.emit('initData', _initData);

    var _sessionId = _handshake.sessionID
    let isUserSession = user.hasOwnProperty(_sessionId);


  });


  socket.on('getData', (data) => {
    console.log('data-->>>', data)
    let sensorIdx = data;
    if (!intervalId) {
      intervalId = setInterval(function () {
        let _setData = {};
        _setData = _getData.receiveSensor[sensorIdx];
        socket.emit('getData', _setData);

      }, 3000);
    }

  });
}); // end socket connection



module.exports = app;


