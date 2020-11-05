const express = require('express');
const router = express.Router();

const request = require('request');


const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

const queryconfig = require('./query/sensor_query');
const gasQueryconfig = require('./query/gas_query');
const pool = require('./config/connection');

var receive = require('./config/getData');


receive.getSensorInfo();
setInterval(() => {
    receive.getSensorInfo();
}, 3000);


//센서 조회
router.get('/sensors/:sensorIndex', (req, res, next) => {
    let _sensorIndex=req.params['sensorIndex'];
    console.log('sensor--->>>',_sensorIndex);

    let _query = queryconfig.findBySensorIndex(_sensorIndex);
    console.log(_query);
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
                        results[i]['record_time'] = results[i]['record_time'] ? moment(results[i]['record_time']).format() : null;

                    }
                    res.json(results).end();
                }
            });
            
        }
        connection.release();
    });
});


//센서 등록
router.post('/sensors', (req, res, next) => {
    let reqBody = req.body;
    let date = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
    reqBody['createdDate'] = date;
    console.log(reqBody)

    let _query = queryconfig.insert(reqBody);

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
                    console.log(results)
                    res.json(results);
                    let _sensorId = reqBody['id'];
                    let _sensorIndex = reqBody['sensor_index'];
                    
                    var data = {}
                    data['sensor_id'] = _sensorId;
                    data['sensor_index'] = _sensorIndex;
                 
                    receive.initGasInsert(data)
                }
            });
            connection.release();

        }
    });
});

router.put('/sensors/:id', (req, res, next) => {
    let reqBody = req.body;
    let _id = req.params.id;
    reqBody['id'] = _id;
    let date = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
    reqBody['modifiedDate'] = date;
    
    console.log('--.',reqBody);
    
    let _query = queryconfig.requestUpdate(reqBody)+gasQueryconfig.requestUpdate(reqBody);
    console.log(_query)
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
                    let _changedRows = results[0]['changedRows'];
                    if (_changedRows) {
                        console.log(results);
                        res.json(reqBody);

                    } else {
                        res.status(404).end();
                    }
                }
            });
            connection.release();

        }
    });
});

//센서 수정
router.put('/sensors/:sensorIndex/:id', (req, res, next) => {
    let reqBody = req.body;
    let _id = req.params.id;
    reqBody['id'] = _id;
    let date = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
    reqBody['modifiedDate'] = date;
    
    console.log(reqBody);
    //let _sensorIndex = req.cookies['sensorIndex'];
   // reqBody['sensor_index'] = _sensorIndex;
    
    let _query = queryconfig.update(reqBody);
    console.log(_query)
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
                    let _changedRows = results['changedRows'];
                    if (_changedRows) {
                        res.json(reqBody);

                    } else {
                        res.status(404).end();
                    }
                }
            });
            connection.release();
        }
    });
});

//센서 삭제
router.delete('/sensors/:sensorIndex', (req, res, next) => {
    // let _id = req.params.id;
    let _sensorIndex = req.params.sensorIndex
    let _query = queryconfig.delete(_sensorIndex)+gasQueryconfig.delete(_sensorIndex);
    console.log(_query)
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
                    res.json(results);
                }
            });
            connection.release();

        }
    });
});

//센서 조회
router.get('/sensorsTotal/totallist', (req, res, next) => {
    let _siteIndex=req.cookies['siteIndex'];
    //console.log("totalSensor-->",req.cookies);

    let getURL = receive.serverAddress+'/sensor/sensors/'+_siteIndex
    request.get({
        url: getURL,
        json: true
    },function(error, _res, _body){
        //console.log(_body);
        res.json(_body);
    });



});
module.exports = router;
