const express = require('express');
const router = express.Router();

const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

const queryconfig = require('./query/usedhis_query');
const pool = require('./config/connection');

var xl = require('excel4node');



//사용 이력 검색
let searchObj = {};

router.post('/usedes/:sensorIndex/search', (req, res, next) => {
    let reqBody = req.body;
    let _sensorIndex = req.params['sensorIndex'];
    reqBody['sensor_index'] = _sensorIndex;
    let date = moment().format('YYYY-MM-DD HH:mm:ss.SSS');

    var isIndexProp = searchObj.hasOwnProperty(_sensorIndex);
    if(!isIndexProp){
        searchObj[_sensorIndex] = {}
        searchObj[_sensorIndex]['search'] = undefined;
        searchObj[_sensorIndex]['body'] = undefined;
    }

    let _query = queryconfig.search(reqBody);
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
                        results[i]['start_time'] = results[i]['start_time'] ? moment(results[i]['start_time']).format() : null;
                        results[i]['end_time'] = results[i]['end_time'] ? moment(results[i]['end_time']).format() : null;

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
router.get('/usedes/:sensorIndex/excelDown', (req, res, next) => {
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
        console.log(searchList);
        var wb = excelDownHandler(searchList);
        wb.write('이동식 가스센서 모니터링 시스템_장비사용이력 조회(' + searchBody["fromDate"] + '_' + _endDate + ').xlsx', res);
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
    ws.column(2).setWidth(20);
    ws.column(3).setWidth(20);
    ws.column(4).setWidth(15);
    ws.column(5).setWidth(15);
    ws.column(6).setWidth(15);
    ws.column(7).setWidth(15);
    ws.column(8).setWidth(15);
    ws.column(9).setWidth(15);
    ws.column(10).setWidth(15);
    ws.column(11).setWidth(15);


    ws.cell(1, 1, 1, 3, true).string('장비 사용 정보').style(style1);
    ws.cell(1, 4, 1, 8, true).string('최종 검지 수치').style(style1);

    ws.cell(2, 1).string('시작시각').style(style1);
    ws.cell(2, 2).string('종료시각').style(style1);
    ws.cell(2, 3).string('사용시간').style(style1);
    ws.cell(2, 4).string('휘발성유기화합물').style(style1);
    ws.cell(2, 5).string('가연성가스').style(style1);
    ws.cell(2, 6).string('산소').style(style1);
    ws.cell(2, 7).string('황화수소').style(style1);
    ws.cell(2, 8).string('일산화탄소').style(style1);


    for (let i = 0; i < data.length; i++) {
        var index = i + 3;
        for (let j = 1; j < 9; j++) {
            if (j === 1) {
                // 시작시각
                var startTime = data[i]['start_time'];
                startTime = startTime.substr(0,startTime.indexOf(':',14));
                startTime = startTime.replace('T', ' | ');
                ws.cell(index, j).string(startTime).style(style1);
            }
            else if (j === 2) {
                // 종료시각

                var endTime = data[i]['end_time'] ? data[i]['end_time'] : null;
                if(endTime){
                    endTime = endTime.substr(0,endTime.indexOf(':',14));
                    endTime = endTime.replace('T', ' | ');
                } else {
                    endTime = '-'
                }
                ws.cell(index, j).string(endTime).style(style1);
            }
            else if (j === 3) {
                // 사용시간
                var fromDate = data[i]['start_time'];
                var toDate = data[i]['end_time'];
                
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
            else if (j === 4) {
                // 휘발성유기화합물
                var vocValue = data[i]['voc_value']!==null ? data[i]['voc_value'] : null;
                if(vocValue !== null){
                    ws.cell(index, j).number(vocValue).style(style1);
                } else {
                    vocValue = " - "
                    ws.cell(index, j).string(vocValue).style(style1);

                }
            }
            else if (j === 5) {
                // 가연성가스
                var combValue = data[i]['comb_value']!==null ? data[i]['comb_value'] : null;
                if(combValue !== null){
                    ws.cell(index, j).number(combValue).style(style1);
                } else {
                    combValue = " - "
                    ws.cell(index, j).string(combValue).style(style1);
                }

            }
            else if (j === 6) {
                // 산소
                var o2Value = data[i]['o2_value']!==null ? data[i]['o2_value'] : null;
                if(o2Value !== null){
                    ws.cell(index, j).number(o2Value).style(style1);
                } else {
                    o2Value = " - "
                    ws.cell(index, j).string(o2Value).style(style1);
                }
            }
            else if (j === 7) {
                // 황화수소
                var h2sValue = data[i]['h2s_value']!==null ? data[i]['h2s_value'] : null;
                if(h2sValue !== null){
                    ws.cell(index, j).number(h2sValue).style(style1);
                } else {
                    h2sValue = " - "
                    ws.cell(index, j).string(h2sValue).style(style1);
                }

            }
            else if (j === 8) {
                // 일산화탄소
                var coValue = data[i]['co_value']!==null ? data[i]['co_value'] : null;
                if(coValue !== null){
                    ws.cell(index, j).number(coValue).style(style1);
                } else {
                    coValue = " - "
                    ws.cell(index, j).string(coValue).style(style1);
                }

            }
        }
    }
    return wb;
}


module.exports = router;
