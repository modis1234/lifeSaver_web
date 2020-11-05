const express = require('express');
const router = express.Router();

const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");


const queryconfig = require('./query/gas_query');
const pool = require('./config/connection');

var receive = require('./config/getData');

receive.getGasInfo();
setInterval(() => {
    receive.getGasInfo();
},30000);


// 가스 등록(자동등록)
router.post('/gases', (req, res, next) => {
    console.log(req.cookies)
    let _sensorIndex = req.cookies['sensorIndex'];
    console.log(_sensorIndex)
    let _query = queryconfig.findBySensorIndex(_sensorIndex);
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
                    res.json(results).end();

                }
            })
            connection.release();
        }
    });
});

  //가스 조회
router.get('/gases', (req, res, next) => {
    
    let _query = queryconfig.findByAll();
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


//가스 조회
router.get('/gases/:sensorIndex', (req, res, next) => {
    let _sensorIndex = req.params.sensorIndex;
    

    let _query = queryconfig.findBySensorIndex(_sensorIndex);
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

//가스 범위 수정
router.put('/gases/:sensorIndex/:id', (req, res, next) => {
    let reqBody = req.body;
    let _id = req.params.id;
    reqBody['id'] = _id;
    console.log('-->>>>>>',reqBody);
    let _query = queryconfig.update(reqBody);
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
            });
            connection.release();

        }
    });
});

//cctv 삭제
router.delete('/gases/:sensorIndex', (req, res, next) => {
    let _sensorIndex = req.params.sensorIndex;
    let _query = queryconfig.delete(_sensorIndex);
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
