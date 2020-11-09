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
 const LOGIN_SERVER = 'http://119.207.78.146:9090';

router.get('/', function (req, res, next) {
  console.log('AGENT--->', req.headers['user-agent'])
  let _loginObj = req.cookies.login;

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

var loginList = {}

router.get('/lifesaver/:sensor_index', function (req, res, next) {
  /* 
   1. 개인 PC에서 최초 로그인
   2. SESSION에 login{ ip: ... } 저장
   3. site_index, USERID, login만 제외하고 쿠키 삭제 
*/
  console.log('0.session--->', req.session)
  let _sensorIndex = req.params['sensor_index'];
  if(_sensorIndex === 'undefined'){
    res.redirect('/logout')
  }
  let isLoginProp = req.session.hasOwnProperty('login');
  if (!isLoginProp) {
    // 로그인 상태
    let _loginObj = req.cookies.login;
    if (_loginObj) {
      req.session['login'] = {}
      let _ip = req.ip;
      let isAccountProp = req.session.hasOwnProperty('login');
      if (!isAccountProp) {
        req.session['login'] = {};
      }
      // 최초 로그인
      let isIPprop = req.session['login'].hasOwnProperty(_ip)
      if (!isIPprop) {
        let _version = req.cookies['version']
        let _sensorName = unescape(req.cookies.sensorName)
        let _siteName = unescape(req.cookies.siteName);

        var hasSensorProp = _loginObj.hasOwnProperty('sensor');
        if (!hasSensorProp) {
          _loginObj['sensor'] = {}
        } // end if !hasSensorProp
        let sensorObj = {}
        _loginObj['site_name'] = _siteName
        _loginObj['connected'] = 1
        sensorObj['sensor_index'] = _sensorIndex
        sensorObj['name'] = _sensorName
        sensorObj['version'] = _version
        _loginObj['sensor'][_sensorIndex] = sensorObj;

        res.cookie('login', _loginObj)
        req.session.login[_ip] = _loginObj;
        console.log('1.param=>', _sensorIndex)
        deleteCookie(res, _sensorIndex)

        console.log('1.session--->', req.session)
      } else {

      }// end if !isIPprop
      console.log('2.session--->', req.session)
      res.render('main')

    } else {
      res.redirect('/logout')
    }// end if _loginObj

  } else {
    // 새로고침
    console.log('3.param--->', _sensorIndex)
    console.log('3.session--->', req.session)
    let _ip = req.ip;
    let isSensorIndexProp = req.session['login'][_ip]['sensor'].hasOwnProperty(_sensorIndex);
    if (!isSensorIndexProp) {
      /*
        sensor: { 
          GAS102: { sensor_index: 'GAS102', name: '이동식가스센서', site_name:'현대건설' },
          GAS103: { sensor_index: 'GAS103', name: '연구소', site_name:'현대건설' },
      },
      */
      console.log('3.cookie--->', req.cookies);
      let _version = req.cookies['version']
      let _sensorName = unescape(req.cookies.sensorName)
      let _siteName = unescape(req.cookies.siteName);
      let sensorObj = {}
      sensorObj['sensor_index'] = _sensorIndex
      sensorObj['name'] = _sensorName
      sensorObj['version'] = _version
      req.session['login'][_ip]['sensor'][_sensorIndex]=sensorObj;
      console.log('4.cookie--->', req.session['login'][_ip]['sensor']);
      res.cookie('login', req.session['login'][_ip])
      deleteCookie(res, _sensorIndex)
      
      req.session['login'][_ip]['connected'] += 1;
    }
    console.log('4.sensorList--->', req.session['login'][_ip]['sensor'])
    console.log('4.session--->', req.session)

    res.render('main')

  } //end if isLoginProp

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
  res.clearCookie('login', { path: '/lifesaver' });
  res.clearCookie('io');
  res.clearCookie("io", { path: '/lifesaver' });
  res.clearCookie('sensorIndex');
  res.clearCookie("sensorIndex", { path: '/lifesaver' });
  res.clearCookie('siteIndex');
  res.clearCookie("siteIndex", { path: '/lifesaver' });
  res.clearCookie('sensorName');
  res.clearCookie("sensorName", { path: '/lifesaver' });
  res.clearCookie('siteName');
  res.clearCookie("siteName", { path: '/lifesaver' });
  res.clearCookie('version');
  res.clearCookie("version", { path: '/lifesaver' });
  res.clearCookie('sensorList');
  res.clearCookie("sensorList", { path: '/lifesaver' });

  delete req.session.login
  req.session.destroy(()=> {
    res.redirect(LOGIN_SERVER + '/logout');
  });

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