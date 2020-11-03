const express = require('express');
const router = express.Router();

const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

const queryconfig = require('./query/receiver_query');
const pool = require('./config/connection');


//수신자 조회
router.get('/receivers/:sensorIndex', (req, res, next) => {
    let _sensorIndex=req.params['sensorIndex'];
    console.log(_sensorIndex);

    let _query = queryconfig.findByAll(_sensorIndex);
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


//수신자 등록
router.post('/receivers/:sensorIndex', (req, res, next) => {
    let reqBody = req.body;
    
    let _sensorIndex=req.params['sensorIndex'];
    reqBody['sensor_index'] = _sensorIndex;
    
    let date = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
    reqBody['createdDate'] = date;

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
                    console.log(results);
                    var insertId =results.insertId;
                    if(insertId){
                        reqBody["id"] = insertId;
                        res.send(reqBody).end();
                    } else {
                        res.status(500).end();
                    }
                    //res.json(results);
                }
            });
            connection.release();

        }
    });
});


//수신자 수정
router.put('/receivers/:sensorIndex/:id', (req, res, next) => {
    let reqBody = req.body;
    let _id = req.params.id;
    reqBody['id'] = _id;

    let date = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
    reqBody['modifiedDate'] = date;
    let _sensorIndex=req.params['sensorIndex'];
    reqBody['sensor_index'] = _sensorIndex;


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
                    console.log(results);
                    res.json(results);
                }
            });
            connection.release();

        }
    });
});

//수신자 삭제
router.delete('/receivers/:sensorIndex/:id', (req, res, next) => {
    let _id = req.params.id;
    let _query = queryconfig.delete(_id);
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

module.exports = router;
