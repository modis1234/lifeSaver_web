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

var util = require('util'); 
var EventEmitter = require('events').EventEmitter;


var app = express();
var dbconfig = require('./routes/config/database');

var sessionStore = new MySQLStore(dbconfig.develop);
var session = session({
  secret: "keyboard cat",
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
var logoutObj = {};

app.io = require('socket.io')();
var ios = require("express-socket.io-session"); // 소켓 내에서 세션데이터 접근 가능하도록하는 모듈
const { clearInterval } = require('timers');
app.io.use(ios(session, { autoSave: true }));  // 모듈과 세션 연결

app.io.on('connection', (socket) => {
  let _handShake = socket.handshake;
  let _sessionId = _handShake.sessionID;
  var isIPproperty = logoutObj.hasOwnProperty(_sessionId);
  if (!isIPproperty) {
    logoutObj[_sessionId] = undefined
  }

  console.log('0.-->',_handShake.session)

  if (_handShake.session['login'][_sessionId]) {

    if (logoutObj[_sessionId]) {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>clearTimeout!!!!!')
      clearTimeout(logoutObj[_sessionId])
      logoutObj[_sessionId] = undefined
    }
    console.log('1.logoutTimout--->>>', logoutObj[_sessionId]);
    console.log('0.유저가 들어왔다.->', _handShake.session.login);


  } else {
    console.log('afdasf')
  }


  var _isConnectedCnt = _handShake.session['login'][_sessionId].hasOwnProperty('connected');
  if (!_isConnectedCnt) {
    _handShake.session['login'][_sessionId]['connected'] = 1;
  }

  socket.on('disconnect', (data) => {
    console.log('유저 나갔다.=>', data);
    // var _ip = _handShake.address;
    let _sessionId = _handShake.session.id;

    console.log('1-->', _handShake.session.login[_sessionId]['connected']);

    var _sessionLogin = _handShake.session.login[_sessionId]
    var _connectedCnt = _handShake.session.login[_sessionId]['connected']
    if (_connectedCnt > 0 || _connectedCnt !== 0) {
      _connectedCnt = _connectedCnt - 1
      _handShake.session.login[_sessionId]['connected'] = _connectedCnt
      _handShake.session.save(function (err) {
        console.log('0.....data->', _handShake.session.login[_sessionId])
      });
    }

    if (_connectedCnt === 0) {
      _handShake.session.login[_sessionId]['connected'] = 0;
      var _logoutTimeout = logoutObj[_sessionId];
      if (!_logoutTimeout) {
        logoutObj[_sessionId] = setTimeout(function () {
          console.log(_sessionId, '>>>>>>>>>>>>>>>>>>>>>>>>>>>setTimeout!!!!!')
          delete _handShake.session.login[_sessionId]
          _handShake.session.save(function (err) {
            console.log(_sessionId, '해당 로그인 정보 삭제!!!!')
            _handShake.session.destroy(function () {
              console.log('destroy!!!')
              delete logoutObj[_sessionId]
              _handShake.session;
            });
          });
        }, 5000)
      }

    }

  });


  let _setData = {};
  socket.on('sendIndex', (data) => {
    console.log('data-->>>', data)
    let sensorIdx = data;
    let hasIndex = room.hasOwnProperty(sensorIdx);
    if (!hasIndex) {
      room[sensorIdx] = {};
      room[sensorIdx]['index'] = sensorIdx;
      room[sensorIdx]['intervalId'] = undefined;
      room[sensorIdx]['ccu'] = 1; //동시접속자 CCU: Concurrent Connected User
    }
    _setData['receiveSensor'] = _getData.receiveSensor[sensorIdx];
    _setData['receiveLog'] = _getData.receiveLog[sensorIdx];
    socket.emit('getData', _setData);

  });

  socket.on('joinRoom', (data) => {
    var _ip = _handShake.address;
    console.log(_ip)
    let sensorIdx = data;
    socket.join(room[sensorIdx]['index'], () => {
      console.log(' join a ' + room[sensorIdx]['index']);

      let _isRoom = room.hasOwnProperty(sensorIdx);
      if(!_isRoom){
        room[sensorIdx] = {};
        room[sensorIdx]['index'] = sensorIdx;
        room[sensorIdx]['intervalId'] = undefined;
        room[sensorIdx]['ccu'] = 1; //동시접속자 CCU: Concurrent Connected User
      } else {
        room[sensorIdx]['ccu'] += 1;
      }

      console.log('11.join Room=>',room[sensorIdx])

      let _isIntervalId = room[sensorIdx]['intervalId'];
      if (!_isIntervalId) {
        room[sensorIdx]['intervalId'] = setInterval(() => {
          var _receiveSensor = _getData.receiveSensor[sensorIdx];
          console.log('-->',sensorIdx)
          app.io.to(room[sensorIdx]['index']).emit('joinRoom', _receiveSensor);
        }, 5000);
      }
    });
  });

  //모바일웹 join/leave
  socket.on('leaveRoom', (data) => {
    let sensorIdx = data;
    console.log(sensorIdx)
    console.log(room)
    socket.leave(room[sensorIdx]['index'], () => {
      clearInterval(room[sensorIdx]['intervalId'])
      room[sensorIdx]['intervalId'] = undefined
      console.log(sensorIdx + ' leave a ' + room[sensorIdx]['index']);
      if(room[sensorIdx]['ccu'] > 0){
        room[sensorIdx]['ccu'] -= 1;
      }
      // if(room[sensorIdx]['ccu'] === 0){
      //   delte
      // }
      // app.io.to(room[sensorIdx]['index']).emit('leaveRoom', '_receiveSensor');

    });
  });
  
}); // end socket connection



module.exports = app;


