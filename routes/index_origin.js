var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const queryconfig = require('./query/account_query');
const pool = require('./config/connection');
const request = require('request');
const { cookie } = require('request');
const { version } = require('os');
const { ftruncate } = require('fs');



router.user = {};
const LOGIN_SERVER = 'http://192.168.0.39:3000';

router.get('/', function (req, res, next) {
  console.log('AGENT--->', req.headers['user-agent'])
  let _loginObj = req.cookies.login;
  // console.log("cookie--->", req.cookies.id)

  let isAccountProp = req.session.hasOwnProperty('LOGIN');
  if (!isAccountProp) {
    req.session['login'] = {};
  }
  /*
    _loginObj
      { user_id: 'user1',
      name: '이동훈',
      role: 1,
      site_index: 'LS20090001',
      isLogined: true,
      sensor: { 
          index_1: { sensor_index: 'GAS102', name: '이동식가스센서', site_name:'현대건설' },
          index_2: { sensor_index: 'GAS103', name: '연구소', site_name:'현대건설' },
      },
      site_name: '두산건설' }
  */

  if (_loginObj) {
    var agent = req.headers['user-agent'].toLowerCase();
    if (agent.indexOf("win64") > -1 || agent.indexOf("wow64") > -1) {
      var _sensorIndex = req.cookies.sensorIndex
      if (_sensorIndex !== 'undefined') {
        res.redirect('/lifesaver/' + _sensorIndex)
      } else {
        res.redirect('/logout')
      }

    } else if (agent.indexOf("android") > -1 || agent.indexOf("iphone") > -1) {
      res.redirect('/mobile/gasMonitor')
    }
  } else {
    res.redirect('/logout');

  }
});

router.get('/mobile/gasMonitor', (req, res, next) => {
  console.log('main_mobile')
  console.log(req.sessionID)

  let _loginObj = req.cookies.login;
  console.log('>>>>>>>>>>>>>>>error', _loginObj)
  let _sessionID = req.sessionID;

  if (_loginObj) {
    let _ip = req.ip;
    console.log('0.session=>', req.session)
    if (!req.session.hasOwnProperty('login')) {
      req.session['login'] = {}
    }
    let isIPprop = req.session['login'].hasOwnProperty(_ip)
    if (!isIPprop) {

      _loginObj['sensorList'] = req.cookies.sensorList;
      console.log('loginObj->', _loginObj)
      req.session.login[_ip] = _loginObj;
    } else {
    }// end if isSessionIDprop
    console.log('1.session=>', req.session)
    res.render('main_mobile');
  } else {
    res.redirect('/logout')
  }// end if _loginObj

});


router.get('/lifesaver/:sensor_index', function (req, res, next) {
  /* 
   1. 개인 PC에서 최초 로그인
   2. SESSION에 login{ ip: ... } 저장
   3. site_index, USERID, login만 제외하고 쿠키 삭제 
*/
  console.log('0.param=>', req.params)
  console.log('0.세션--->>', req.session)
  let _loginObj = req.cookies.login;
  let _sensorIndex = req.params['sensor_index'];
  if (_loginObj) {
    let _ip = req.ip;
    let isIPprop = req.session['login'].hasOwnProperty(_ip)
    if (!isIPprop) {
      let _version = req.cookies['version']
      let _sensorName = unescape(req.cookies.sensorName)
      let _siteName = unescape(req.cookies.siteName);

      var hasSensorProp = _loginObj.hasOwnProperty('sensor');
      if (!hasSensorProp) {
        _loginObj['sensor'] = {}
      } // end if hasSensorProp
      let sensorObj = {}
      _loginObj['site_name'] = _siteName
      _loginObj['connected'] = 1
      // _loginObj['logoutTimeout'] = undefined
      sensorObj['sensor_index'] = _sensorIndex
      sensorObj['name'] = _sensorName
      sensorObj['version'] = _version
      console.log('1.param=>', _sensorIndex)

      _loginObj['sensor'][_sensorIndex] = sensorObj;
      console.log('1.sensorObj--->>', sensorObj)

      res.cookie('login', _loginObj)
      req.session.login[_ip] = _loginObj;

      deleteCookie(res, _sensorIndex)

      console.log('1.세션--->>', req.session)
      res.render('main')

    } else {
      // ip property가 존재한다. 이미 로그인한 상태다.
      let _ipLoginObj = req.session.login[_ip];
      let siteName = _ipLoginObj['site_name'];
      let siteIndex = _ipLoginObj['site_index'];
      if (siteName === 'undefined' || siteIndex === 'undefined') {
        res.redirect('/logout')
      } else {

        // cookie[login], session.login[ip] 리터럴에 해당 파라미터의 센서 인덱스가 존재하는지 판단
        let hasIndexProperty = _loginObj['sensor'].hasOwnProperty(_sensorIndex);
        let hasSessionIndexProperty = req.session.login[_ip]['sensor'].hasOwnProperty(_sensorIndex)
        // 존재하지 않는다면
        if (!hasIndexProperty && !hasSessionIndexProperty) {

          let _version = req.cookies['version']
          let _sensorName = unescape(req.cookies.sensorName)
          console.log('before----------->', req.cookies)
          if (!_version || !_sensorName || !_sensorIndex) {
            res.status(404).end();
          } else {
            let sensorObj = {}
            sensorObj['sensor_index'] = _sensorIndex
            sensorObj['name'] = _sensorName
            sensorObj['version'] = _version
            _loginObj['sensor'][_sensorIndex] = sensorObj;

            res.cookie('login', _loginObj)

            req.session.login[_ip]['sensor'][_sensorIndex] = sensorObj;
            req.session.login[_ip]['connected'] += 1
            req.session.save(function (err) {
            });
            deleteCookie(res, _sensorIndex)
            console.log('2.세션--->>', req.session)
            console.log('2.쿠키--->>', req.cookies)
            console.log('2.sensor--->>', req.session.login[_ip]['sensor'])

          }
        } else {
          req.session.login[_ip]['connected'] += 1
          req.session.save(function (err) {
          });
        } // end if hasProperty && hasSessionIndexProperty
        res.render('main')
      } //end if siteName ||siteIndex

    } // end if isIPprop
  } else {
    res.redirect('/logout')
  } // end if _loginObj

});




router.get('/gasMonitor_v1', (req, res, next) => {
  res.render('ls_v1/ls1_gasMonitor');
});

router.get('/gasMonitor_v2', (req, res, next) => {
  res.render('ls_v2/ls2_gasMonitor');
});
router.get('/gasMonitor', (req, res, next) => {
  res.render('gasMonitor');
});

router.get('/severityPanel', (req, res, next) => {
  res.render('panel/severityPanel');
});

router.get('/cctvPanel', (req, res, next) => {
  res.render('panel/cctvPanel');
});

router.get('/administrator', (req, res, next) => {
  res.render('administrator');
});

// administrator
router.get('/adminHeader', (req, res, next) => {
  res.render('admin/adminHeader');
});

router.get('/alarmList', (req, res, next) => {
  res.render('admin/alarmList');
});

router.get('/usedList', (req, res, next) => {
  res.render('admin/usedList');
});
router.get('/receiver', (req, res, next) => {
  res.render('admin/receiver');
});
router.get('/account', (req, res, next) => {
  res.render('admin/account');
});
router.get('/sensorInfo', (req, res, next) => {
  res.render('admin/sensorInfo');
});
router.get('/gasInfo', (req, res, next) => {
  res.render('admin/gasInfo');
});
router.get('/cctvInfo', (req, res, next) => {
  res.render('admin/cctvInfo');
});
// w2ui form
router.get('/searchForm', (req, res, next) => {
  res.render('admin/searchForm');
});

router.get('/sensorForm', (req, res, next) => {
  res.render('admin/sensorForm');
});

router.get('/gasInfoForm', (req, res, next) => {
  res.render('admin/gasInfoForm');
});

router.get('/accountForm', (req, res, next) => {
  res.render('admin/accountForm');
});

router.get('/cctvInfoForm', (req, res, next) => {
  res.render('admin/cctvInfoForm');
});

// login
router.get('/login', (req, res, next) => {
  res.render('login');
});

// mobile
router.get('/monitor_m', (req, res, next) => {
  res.render('mobile/monitor');
});



//로그아웃
router.get('/logout', (req, res, next) => {
  res.clearCookie('login');
  res.clearCookie('io');
  res.clearCookie('sensorIndex');
  res.clearCookie('siteIndex');
  res.clearCookie('sensorName');
  res.clearCookie('siteName');
  res.clearCookie('version');
  res.clearCookie('sensorList');
  res.clearCookie('login', { path: '/lifesaver' });

  delete req.session.login
  console.log(req.session)

  res.redirect(LOGIN_SERVER + '/logout');
});

function deleteCookie(response, index) {
  console.log('deleteCookie-->', index)
  let _sensorIndex = index;
  var _cookiePath = `/lifesaver/${_sensorIndex}`
  response.clearCookie('sensorName', { path: '/' });
  response.clearCookie('sensorName', { path: _cookiePath });
  response.clearCookie('sensorName', { path: '/lifesaver' });
  response.clearCookie('siteName', { path: '/' });
  response.clearCookie('siteName', { path: _cookiePath });
  response.clearCookie('siteName', { path: '/lifesaver' });
  response.clearCookie("sensorIndex", { path: '/' });
  response.clearCookie("sensorIndex", { path: _cookiePath });
  response.clearCookie("sensorIndex", { path: '/lifesaver' });
  response.clearCookie("version", { path: '/' });
  response.clearCookie("version", { path: _cookiePath });
  response.clearCookie("version", { path: '/lifesaver' });
  response.clearCookie("sensorList", { path: '/' });
  response.clearCookie("sensorList", { path: _cookiePath });
  response.clearCookie("sensorList", { path: '/lifesaver' });

}

module.exports = router;