const express = require('express');
const router = express.Router();

const crypto = require('crypto');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

const queryconfig = require('./query/account_query');
const pool = require('./config/connection');


//계정 조회
router.get('/accounts', (req, res, next) => {
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
            });
            connection.release();

        }
    });
});


//계정 등록
router.post('/accounts', (req, res, next) => {
    let reqBody = req.body;
    let date = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
    reqBody['createdDate'] = date;
    let _password = reqBody['password'];
    let securityPW = crypto.createHash('sha512').update(_password).digest('base64');
    reqBody['password'] = securityPW;
   // console.log(reqBody);

    let _query = queryconfig.insert(reqBody);
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
                    var insertId =results.insertId;
                    if(insertId){
                        reqBody["id"] = insertId;
                        res.send(reqBody).end();
                    } else {
                        res.status(500).end();
                    }
                }
            });
            connection.release();

        }
    });
});


//계정 수정
router.put('/accounts/:id', (req, res, next) => {
    let reqBody = req.body;
    let _id = req.params.id;
    reqBody['id'] = _id;

    let date = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
    reqBody['modifiedDate'] = date;

    // let _password = reqBody['password'];
    // let securityPW = crypto.createHash('sha512').update(_password).digest('base64');
    // reqBody['password'] = securityPW;

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

//계정 삭제
router.delete('/accounts/:id', (req, res, next) => {
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
