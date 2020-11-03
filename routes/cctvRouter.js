const express = require('express');
const router = express.Router();

const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

const queryconfig = require('./query/cctv_query');
const pool = require('./config/connection');


//cctv 조회
router.get('/cctvs/:sensorIndex', (req, res, next) => {
    let _sensorIndex = req.params['sensorIndex'];
    console.log(_sensorIndex);
    let _query = queryconfig.findByAll(_sensorIndex);
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
                    res.json(results);
                }
            })
        }
    });
});


//cctv 등록
router.post('/cctvs/:sensorIndex', (req, res, next) => {
    var _sensorIndex = req.params['sensorIndex']

    let reqBody = req.body;
    let date = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
    reqBody['createdDate'] = date;
    reqBody['sensor_index']= _sensorIndex;
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
                    res.json(results);
                }
            });
            connection.release();

        }
    });
});

//cctv 수정
router.put('/cctvs/:sensorIndex/:id', (req, res, next) => {
    let reqBody = req.body;
    let _id = req.params.id;
    reqBody['id'] = _id;

    let date = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
    reqBody['modifiedDate'] = date;
    let _query = queryconfig.update(reqBody);
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
                    console.log(results);
                    var changedRows = results['changedRows'];
                    if(changedRows){
                      res.json(reqBody);
                    }
                }
            })
            connection.release();

        }
    });
});

//cctv 삭제
router.delete('/cctvs/:sensorIndex/:id', (req, res, next) => {
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
            })
            connection.release();

        }
    });
});


module.exports = router;
