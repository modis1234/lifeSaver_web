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

var sessionStore = new MySQLStore(dbconfig.operation);
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
var logoutObj= {};

app.io = require('socket.io')();
var ios = require("express-socket.io-session"); // 소켓 내에서 세션데이터 접근 가능하도록하는 모듈
app.io.use(ios(session, { autoSave: true }));  // 모듈과 세션 연결




let setIntervalList={}

app.io.on('connection', (socket) => {
  console.log('0-1.>>>setInterval!!!!!!!->',setIntervalList)

  let _handshake = socket.handshake;
  let _ip = _handshake.address;
  var isIPproperty = logoutObj.hasOwnProperty(_ip);
  if(!isIPproperty){
    logoutObj[_ip] = undefined
  }

  if(_handshake.session['login'][_ip]){

    if(logoutObj[_ip]){
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>clearTimeout!!!!!')
      clearTimeout(logoutObj[_ip])
      logoutObj[_ip]=undefined
    }
    console.log('1.logoutTimout--->>>',logoutObj[_ip]);
    console.log('0.유저가 들어왔다.->', _handshake.session.login);


  } else {
     return false
  }

  
  var _isConnectedCnt = _handshake.session['login'][_ip].hasOwnProperty('connected');
  if (!_isConnectedCnt) {
    _handshake.session['login'][_ip]['connected'] = 1;
  }

  socket.on('disconnect', (data) => {
    console.log('유저 나갔다.=>', data);
    var _ip = _handshake.address;
    let _referer = _handshake.headers['referer'].split('/').reverse()[0];
    console.log('유저 나갔다.=>', _referer);

    // setTimeout-sensorIndex 적용 만약 5초후 들어오지 않는다면 sensor 리터럴 삭제
    // 5초후 들어온다면 clearTimeOut
    let isSensorIdxProp =  _handshake.session.login[_ip]['sensor'].hasOwnProperty(_referer);
    if(isSensorIdxProp){
        // delete _handshake.session.login[_ip]['sensor'][_referer];
        let _connectedCnt = _handshake.session.login[_ip]['connected']
        _handshake.session.login[_ip]['connected'] = _connectedCnt - 1
        _handshake.session.save(function (err) {
          console.log('0.....data->', _handshake.session.login[_ip])
        });
    }
    ////////////////////////////////////////////////////
    console.log('1-->', _handshake.session.login[_ip]['connected']);

    // var _sessionLogin = _handshake.session.login[_ip]
    var _connectedCnt = _handshake.session.login[_ip]['connected']
    // // if (_connectedCnt > 0 || _connectedCnt !== 0) {
    // //   _connectedCnt = _connectedCnt - 1
    // //   _handshake.session.login[_ip]['connected'] = _connectedCnt
    // //   _handshake.session.save(function (err) {
    // //     console.log('0.....data->', _handshake.session.login[_ip])
    // //   });

    // // }
    if (_connectedCnt <= 0) {
      _handshake.session.login[_ip]['connected'] = 0;
      var _logoutTimeout = logoutObj[_ip];
      if(!_logoutTimeout){
        logoutObj[_ip] = setTimeout(function () {
          console.log(_ip,'>>>>>>>>>>>>>>>>>>>>>>>>>>>setTimeout!!!!!')
          delete _handshake.session.login[_ip]
          _handshake.session.save(function (err) {
            console.log(_ip, '해당 로그인 정보 삭제!!!!')
            delete logoutObj[_ip]
            console.log('sessionDestroy!!!!!!->')

            socket.handshake.session;
          });
        }, 5000)

       console.log('2.logoutT>imout--->>>',logoutObj);
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
    } else {
      // let _intervalID = room[sensorIdx]['intervalId']
      // if(_intervalID){
      //   clearInterval(room[sensorIdx]['intervalId'])
      //   room[sensorIdx]['intervalId'] = undefined
      //  }
    }
    _setData['receiveSensor'] = _getData.receiveSensor[sensorIdx];
    _setData['receiveLog'] = _getData.receiveLog[sensorIdx];
    socket.emit('getData', _setData);

  });


  //test
  socket.on('clearInterval', (data) => {
      

  })

  socket.on('joinRoom', (data) => {
    let sensorIdx = data;
    console.log('0.Room--->',room[sensorIdx])
    let hasIndex = room.hasOwnProperty(sensorIdx);
    if (!hasIndex) {
      console.log(1111111111111)
      room[sensorIdx] = {};
      room[sensorIdx]['index'] = sensorIdx;
      room[sensorIdx]['intervalId'] = undefined;
    }
    console.log('JoinRoom--->',room)
    console.log('join->',room[sensorIdx]['index']);
    socket.join(room[sensorIdx]['index'], () => {
      console.log(' join a ' + room[sensorIdx]['index']);
      let _isIntervalId = room[sensorIdx]['intervalId'];
      console.log(room[sensorIdx])
      if (!_isIntervalId) {
        room[sensorIdx]['intervalId'] = setInterval(() => {
          console.log(1232132131232)
          var _receiveSensor = _getData.receiveSensor[sensorIdx];
          app.io.to(room[sensorIdx]['index']).emit('joinRoom', _receiveSensor);
          
        }, 3000);
      }
    });
  });

   //모바일웹 join/leave
   socket.on('leaveRoom', (data) => {
    let sensorIdx = data;
    console.log('leaveRoom ====>>>> ',data)
    console.log('Room ====>>>> ',room)
    socket.leave(room[sensorIdx]['index'], () => {
    //  clearInterval(room[sensorIdx]['intervalId'])
     // room[sensorIdx]['intervalId'] = undefined
      console.log(sensorIdx + ' leave a ' + room[sensorIdx]['index']);

    });
  });

}); // end socket connection



module.exports = app;


