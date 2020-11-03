const express = require('express');
const router = express.Router();
const queryconfig = require('./query/alarmHis_query');
const pool = require('./config/connection');

const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

var xl = require('excel4node');
var receive = require('./config/getData');



//사용 이력 검색
let searchObj = {};

router.post('/alarms/:sensorIndex/search', (req, res, next) => {
    let reqBody = req.body;
    var _fromDate = reqBody.fromDate;
    var _toDate = reqBody.toDate;
    var _gasType = reqBody.gas_type ? reqBody.gas_type : undefined;

    let _sensorIndex = req.params['sensorIndex'];
    reqBody['sensor_index'] = _sensorIndex;

    var isIndexProp = searchObj.hasOwnProperty(_sensorIndex);
    if(!isIndexProp){
        searchObj[_sensorIndex] = {}
        searchObj[_sensorIndex]['search'] = undefined;
        searchObj[_sensorIndex]['body'] = undefined;
    }

    let _query;
    if( _gasType !== undefined ){
        _query = queryconfig.searchByDateNgasType(reqBody);
    } 
    else {
        _query = queryconfig.searchByDate(reqBody);
    }

    pool.getConnection((err, connection) => {
        if (err) {
            res.status(400).end();
            throw err;
        } else {
            connection.query(_query, (err, results) => {
                if (err) {
                    res.status(404).end();
                    throw err;
                } else {
                    for (i in results) {
                        results[i]['record_time'] = results[i]['record_time'] ? moment(results[i]['record_time']).format() : null;
                        results[i]['restore_time'] = results[i]['restore_time'] ? moment(results[i]['restore_time']).format() : null;
                        results[i]['maxRecord_time'] = results[i]['maxRecord_time'] ? moment(results[i]['maxRecord_time']).format() : null;

                    }
                    res.json(results);
                    searchObj[_sensorIndex]['search'] = reqBody;
                    searchObj[_sensorIndex]['body'] = results;

                    connection.release();

                }
            })
        }
    });
    




});

// 엑셀 다운로드
// let searchList;
// let searchBody;
router.get('/alarms/:sensorIndex/excelDown', (req, res, next) => {
    let _sensorIndex = req.params['sensorIndex'];
    var searchBody = searchObj[_sensorIndex]['search']
    var searchList =  searchObj[_sensorIndex]['body']
    let _tempEndDate = searchBody["toDate"];

    let toDate = new Date(_tempEndDate);
    toDate.setDate(toDate.getDate() - 1);
    let toYear = toDate.getFullYear();
    let toMonth = toDate.getMonth() + 1 >= 10 ? toDate.getMonth() + 1 : '0' + (toDate.getMonth() + 1);
    let toDay = toDate.getDate() >= 10 ? toDate.getDate() : '0' + toDate.getDate();
    let _endDate = toYear + '-' + toMonth + '-' + toDay;

    if (searchBody.length != 0) {
        var wb = excelDownHandler(searchList);
        wb.write('이동식 가스센서 모니터링 시스템_알람 이력 조회(' + searchBody["fromDate"] + '_' + _endDate + ').xlsx', res);
    }

});


function excelDownHandler(data) {
    var _data = data;
    var wb = new xl.Workbook();
    var ws = wb.addWorksheet('sheet1');
    var style1 = wb.createStyle({
        alignment: {
            vertical: ['center'],
            horizontal: ['center']
            // justifyLastLine: true
        },
        font: {
            size: 11,
            bold: false
        },
        border: {
            left: {
                style: 'thin',
                color: '#000000'
            },
            right: {
                style: 'thin',
                color: '#000000'
            },
            top: {
                style: 'thin',
                color: '#000000'
            },
            bottom: {
                style: 'thin',
                color: '#000000'
            }
        }
    });


    ws.column(1).setWidth(20);
    ws.column(2).setWidth(12);
    ws.column(3).setWidth(20);
    ws.column(4).setWidth(20);
    ws.column(5).setWidth(15);
    ws.column(6).setWidth(12);
    ws.column(7).setWidth(20);
    ws.column(8).setWidth(15);



    ws.cell(1, 1, 1, 3, true).string('알람 발생 정보').style(style1);
    ws.cell(1, 4, 1, 8, true).string('검지 수치').style(style1);

    ws.cell(2, 1).string('가스타입').style(style1);
    ws.cell(2, 2).string('상태').style(style1);
    ws.cell(2, 3).string('발생시각').style(style1);
    ws.cell(2, 4).string('해제시각').style(style1);
    ws.cell(2, 5).string('총 경보시간').style(style1);
    ws.cell(2, 6).string('초기검지수치').style(style1);
    ws.cell(2, 7).string('최대 검지 수치(일시)').style(style1);
    ws.cell(2, 8).string('정상 수치').style(style1);

    var gasInfo = receive.gasInfoList;

    for (let i = 0; i < data.length; i++) {
        var index = i + 3;
        for (let j = 1; j < 9; j++) {
            if (j === 1) {
                // 가스타입
               var _gasType = data[i]['gas_type'];
               var _name = gasInfo[_gasType]['name'];

                ws.cell(index, j).string(_name).style(style1);
            }
            else if (j === 2) {
                // 상태
                var _state = '위험';

                ws.cell(index, j).string(_state).style(style1);
            }
            else if (j === 3) {
                // 발생시각
                var recordTime = data[i]['record_time'];
                recordTime = recordTime.substr(0,recordTime.indexOf(':',14));
                recordTime = recordTime.replace('T', ' | ');
                ws.cell(index, j).string(recordTime).style(style1);

            }
            else if (j === 4) {
                // 해제시각
                var restoreTime = data[i]['restore_time'] || null;
                if(restoreTime){
                    restoreTime = restoreTime.substr(0,restoreTime.indexOf(':',14));
                    restoreTime = restoreTime.replace('T', ' | ');
                } 
                else {
                    restoreTime = '--:--:--'
                }
            
                ws.cell(index, j).string(restoreTime).style(style1);

            }
            else if (j === 5) {
                // 총 경보시간
                var fromDate = data[i]['record_time'];
                var toDate = data[i]['restore_time'];
                
                fromDate = new Date(fromDate);
                toDate =toDate ? new Date(toDate):new Date();
            
                periodTime = toDate.getTime()-fromDate.getTime();
                pDay = periodTime / (60*60*24*1000); 
                strDay = Math.floor(pDay); // 일
                pHour = (periodTime-(strDay * (60*60*24*1000))) / (60*60*1000);
                strHour = Math.floor(pHour);
                strMinute = Math.floor((periodTime - (strDay * (60*60*24*1000)) - (strHour * (60*60*1000))) / (60*1000));
                sec = Math.floor((periodTime % (1000 * 60)) / 1000);
            
                var periodDate = '';
                if( periodTime >= 86400000 ){
                    periodDate = strDay + " 일 " + strHour + " 시간 " + strMinute +'분';
                }
                else if( periodTime >= 3600000 && periodTime < 86400000){
                    periodDate = strHour + " 시간 " + strMinute +'분';
                }
                else if( periodTime >= 60000 && periodTime < 3600000 ){
                    periodDate = strMinute +'분';
            
                }
                else if( periodTime < 60000 ){
            
                    periodDate = '1분미만';
                }
                ws.cell(index, j).string(periodDate).style(style1);

            }
            else if (j === 6) {
                // 초기 검지수치
                var initValue = data[i]['init_value'];

                ws.cell(index, j).number(initValue).style(style1);
            }
            else if (j === 7) {
                // 최대 검지 수치(일시)
                var maxValue = data[i]['max_value'];
                var maxRecord = data[i]['maxRecord_time'];
                var stateCode = data[i]['state_code'];
                var state = "";
                var maxText;
                if(stateCode !== 3){

                    if(maxRecord != null){
                        maxRecord = maxRecord.substr(0,maxRecord.indexOf(':',14));
                        maxRecord = maxRecord.replace('T', ' | ');
                    } else {
                        maxRecord=" - "
                    }
                    maxValue = maxValue === null ? '-':maxValue
                    maxText = maxValue+' ('+maxRecord+')';
                } 
                else if(stateCode === 3){
                    maxText = ' - '
                }
                ws.cell(index, j).string(maxText).style(style1);

            }
            else if (j === 8) {
                // 정상수치
                var _gasType = data[i]['gas_type'];
                var normalRange = gasInfo[_gasType]['normal_range'];
     
                ws.cell(index, j).string(normalRange).style(style1);

            }
        }
    }
    return wb;
}


module.exports = router;
