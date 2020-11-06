const queryconfig = require('../query/sensor_query');
const gasQueryconfig = require('../query/gas_query');
const cctvQueryconfig = require('../query/cctv_query');

const pool = require('./connection');
const request = require('request');
const mysql = require("mysql");

const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

var sensorState = {
    serverAddress:"http://119.207.78.146:9090", // 운영 로그인 서버
    // serverAddress:"http://192.168.0.39:9090", //개발 로그인 서버
    receiveSensor: {},
    receiveLog: {},
    gasInfoList: {},
    initGasData: [
        { code:"O2", name:"산소",unit:"%VOL", range_min:0, range_max:100, normal_low:18, normal_high:23.5, 
            warning1_low:null, warning1_high:null, warning2_low:null, warning2_high:null,
            danger1_low:0, danger1_high:17.9, danger2_low:24.6, danger2_high:100 
        },
        { code:"CO", name:"일산화탄소",unit:"ppm", range_min:0, range_max:500, normal_low:0, normal_high:29, 
            warning1_low:30, warning1_high:49, warning2_low:null, warning2_high:null,
            danger1_low:50, danger1_high:500, danger2_low:null, danger2_high:null 
        },
        { code:"H2S", name:"황화수소",unit:"ppm", range_min:0, range_max:100, normal_low:0, normal_high:9, 
            warning1_low:10, warning1_high:29, warning2_low:null, warning2_high:null,
            danger1_low:30, danger1_high:100, danger2_low:null, danger2_high:null 
        },
        { code:"VOC", name:"휘발성유기화합물",unit:"ppm", range_min:0, range_max:1000, normal_low:0, normal_high:49, 
            warning1_low:50, warning1_high:99, warning2_low:null, warning2_high:null,
            danger1_low:100, danger1_high:1000, danger2_low:null, danger2_high:null 
        },
        { code:"COMB", name:"가연성가스",unit:"%LEL", range_min:0, range_max:100, normal_low:0, normal_high:9, 
            warning1_low:10, warning1_high:29, warning2_low:null, warning2_high:null,
            danger1_low:30, danger1_high:100, danger2_low:null, danger2_high:null 
        }
    ],
    getGasInfo() {
        let _this = this;
        let _query = gasQueryconfig.findByAll();
        pool.getConnection((err, connection) => {
            if (err) {
                throw err;
            } else {
                connection.query(_query, (err, results) => {
                    if (err) {
                        throw err;
                    } else {
                        _this.gasInfoList = results;
                        for (i in results) {
                            var code = results[i]['code'].toUpperCase();
                            _this.gasInfoList[code] = {}
                            _this.gasInfoList[code]['id'] = results[i]['id'];
                            _this.gasInfoList[code]['code'] = results[i]['code'];
                            _this.gasInfoList[code]['name'] = results[i]['name'];
                            _this.gasInfoList[code]['unit'] = results[i]['unit'];
                            _this.gasInfoList[code]['normal_range'] = `${results[i]['normal_low']}-${results[i]['normal_high']}${results[i]['unit']}`;
                        }
                    }
                    connection.release();
                })
            }
        });
    },
    getSensorInfo() {
        let _this = this;
        let _query = queryconfig.findByAll();
        pool.getConnection((err, connection) => {
            if (err) {
                throw "There is no connection to the mysql server..." + err.message;
            } else {
                connection.query(_query, (err, results) => {
                    if (err) {
                        throw err;
                    } else {
                        for (i in results) {
                            results[i]['record_time'] = results[i]['record_time'] ? moment(results[i]['record_time']).format() : null;
                            var _sensorIndex = results[i]['sensor_index'];

                            _this.receiveSensor[_sensorIndex] = results[i];
                            var hasSensorProperty = _this.receiveLog.hasOwnProperty(_sensorIndex);
                            if(!hasSensorProperty){
                                _this.receiveLog[_sensorIndex]={ O2: [], H2S: [], VOC: [], COMB: [], CO: [] };

                            }

                            if(results[i]['record_time']){

                                let result = results[i];
                                var o2Obj = {};
                                o2Obj['date'] = result['record_time'].substr(11, 8);
                                o2Obj['value'] = result['o2_value'];
                                o2Obj['state_code'] = result['o2_state_code'];
                                var _o2Color = _this.stateSetColor(result['o2_state_code']);
                                o2Obj['color'] = _o2Color;
                              
                                _this.receiveLog[_sensorIndex]['O2'].push(o2Obj);
    
                                var h2sObj = {};
                                h2sObj['date'] = result['record_time'].substr(11, 8);
                                h2sObj['value'] = result['h2s_value'];
                                h2sObj['state_code'] = result['h2s_state_code'];
                                var _h2sColor = _this.stateSetColor(result['h2s_state_code']);
                                h2sObj['color'] = _h2sColor;
    
                                _this.receiveLog[_sensorIndex]['H2S'].push(h2sObj);
    
                                var vocObj = {};
                                vocObj['date'] = result['record_time'].substr(11, 8);
                                vocObj['value'] = result['voc_value'];
                                vocObj['state_code'] = result['voc_state_code'];
                                var _vocColor = _this.stateSetColor(result['voc_state_code']);
                                vocObj['color'] = _vocColor;
                                _this.receiveLog[_sensorIndex]['VOC'].push(vocObj);
    
                                var coObj = {};
                                coObj['date'] = result['record_time'].substr(11, 8);
                                coObj['value'] = result['co_value'];
                                coObj['state_code'] = result['co_state_code'];
                                var _coColor = _this.stateSetColor(result['co_state_code']);
                                coObj['color'] = _coColor;
                                _this.receiveLog[_sensorIndex]['CO'].push(coObj);
    
                                var combObj = {};
                                combObj['date'] = result['record_time'].substr(11, 8);
                                combObj['value'] = result['comb_value'];
                                combObj['state_code'] = result['comb_state_code'];
                                var _combColor = _this.stateSetColor(result['comb_state_code']);
                                combObj['color'] = _combColor;
                                _this.receiveLog[_sensorIndex]['COMB'].push(combObj);
    
    
                                var logLeng = _this.receiveLog[_sensorIndex]['O2'].length;
                                if (logLeng > 13) {
                                    _this.receiveLog[_sensorIndex]['O2'].splice(0, 1);
                                    _this.receiveLog[_sensorIndex]['COMB'].splice(0, 1);
                                    _this.receiveLog[_sensorIndex]['VOC'].splice(0, 1);
                                    _this.receiveLog[_sensorIndex]['H2S'].splice(0, 1);
                                    _this.receiveLog[_sensorIndex]['CO'].splice(0, 1);
                                }
                            } // end if record_time true
                        } // end for
                    }
                    connection.release();
                })
            }
        });
    },
    initGasInsert (data){
        let _this =this;
        let sensorIndex = data;
        let _gasList = _this.initGasData;
      
        let _query = gasQueryconfig.insert(data,_gasList);
        console.log(_query)
        pool.getConnection((err, connection) => {
            if (err) {
                throw "There is no connection to the mysql server..." + err.message;
            } else {
                connection.query(_query, (err, results) => {
                    if (err) {
                        throw err;
                    } else {
                        console.log('Init GAS insert success!!!!');
                    }
                })
                connection.release();
            }
        });
        
    },
    initCCTVInsert (data){
        let _this =this;
        console.log(data)
        let initData = {};
        initData['created_date'] = data['createdDate']
        initData['fan_address'] = data['fan_address']
        initData['port'] = data['port']
        initData['user_id'] = 'user'
        initData['password'] = 'a5284400@'
        initData['sensor_index'] = data['sensor_index']


        let _query = cctvQueryconfig.insert(initData);
        console.log(_query)
        pool.getConnection((err, connection) => {
            if (err) {
                throw "There is no connection to the mysql server..." + err.message;
            } else {
                connection.query(_query, (err, results) => {
                    if (err) {
                        throw err;
                    } else {
                        console.log('Init CCTV insert success!!!!');
                    }
                })
                connection.release();
            }
        });
        
    },
    stateSetColor(stateCode) {
        let _stateCode = stateCode;
        let _color;
        if (_stateCode === 0) {
            _color = "#00A651";
        }
        else if (_stateCode === 1) {
            _color = "#F6921E";
        }
        else if (_stateCode === 2) {
            _color = "#FF0000";
        }
        return _color;
    }
}


module.exports = sensorState;