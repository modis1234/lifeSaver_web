const express = require('express');
const router = express.Router();

const queryconfig = require('./query/lamp_query');
const gasQueryconfig = require('./query/gas_query');

const pool = require('./config/connection');
const lampConfig = require('./config/lampData');

const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

router.get('/lamps', (req, res, next) => {
    let _query = queryconfig.findByAll();
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            res.status(404).end();
            throw err;
        } else {
            //커넥션 사용
            connection.query(_query, (err, results) => {
                if (err) {
                    throw err;
                } else {
                    for (let i in results) {
                        let safetyColor = lampConfig.color[results[i]['el_s_color']];
                        let safetyLamp = lampConfig.lampType[results[i]['el_s_lamp']];
                        let safetySound = lampConfig.soundGroup[results[i]['el_s_sound']];
                        let safetySoundCh = lampConfig.soundChannel[results[i]['el_s_sound_ch']];

                        let safetyMode = '색상: ' + safetyColor + '</br></br>'
                            + '점등: ' + safetyLamp + '</br></br>'
                            + '음원그룹: ' + safetySound + '</br></br>'
                            + '음원: ' + safetySoundCh;
                        results[i]['safety_mode'] = safetyMode;

                        let warningColor = lampConfig.color[results[i]['el_w_color']];
                        let warningLamp = lampConfig.lampType[results[i]['el_w_lamp']];
                        let warningSound = lampConfig.soundGroup[results[i]['el_w_sound']];
                        let warningSoundCh = lampConfig.soundChannel[results[i]['el_w_sound_ch']];
                        let warningMode = '색상: ' + warningColor + '</br></br>'
                            + '점등: ' + warningLamp + '</br></br>'
                            + '음원그룹: ' + warningSound + '</br></br>'
                            + '음원: ' + warningSoundCh;
                        results[i]['warning_mode'] = warningMode;

                        let dangerColor = lampConfig.color[results[i]['el_d_color']];
                        let dangerLamp = lampConfig.lampType[results[i]['el_d_lamp']];
                        let dangerSound = lampConfig.soundGroup[results[i]['el_d_sound']];
                        let dangerSoundCh = lampConfig.soundChannel[results[i]['el_d_sound_ch']];
                        let dangerMode = '색상: ' + dangerColor + '</br></br>'
                            + '점등: ' + dangerLamp + '</br></br>'
                            + '음원그룹: ' + dangerSound + '</br></br>'
                            + '음원: ' + dangerSoundCh;
                        results[i]['danger_mode'] = dangerMode;

                        let networkColor = lampConfig.color[results[i]['el_n_color']];
                        let networkLamp = lampConfig.lampType[results[i]['el_n_lamp']];
                        let networkSound = lampConfig.soundGroup[results[i]['el_n_sound']];
                        let networkSoundCh = lampConfig.soundChannel[results[i]['el_n_sound_ch']];
                        let networkMode = '색상: ' + networkColor + '</br></br>'
                            + '점등: ' + networkLamp + '</br></br>'
                            + '음원그룹: ' + networkSound + '</br></br>'
                            + '음원: ' + networkSoundCh;
                        results[i]['network_mode'] = networkMode;
                    }
                    res.json(results).end();
                }
            });
            //커넥션 반환( 커넥션 종료 메소드가 커넥션과 다르다 )
            connection.release();
        }
    });
});

router.post('/lamps', (req, res, next) => {
    let reqBody = req.body;
    let _query = queryconfig.insert(reqBody);
    console.log(_query);

    pool.getConnection((err, connection) => {
        if (err) {
            res.status(404).end();
            throw err;
        } else {
            //커넥션 사용
            connection.query(_query, (err, results) => {
                if (err) {
                    res.status(404).end();
                    throw err;
                } else {
                    console.log(results);
                    let insertId = results['insertId'];
                    reqBody['id'] = insertId;
                    let safetyColor = lampConfig.color[reqBody['el_s_color']];
                    let safetyLamp = lampConfig.lampType[reqBody['el_s_lamp']];
                    let safetySound = lampConfig.soundGroup[reqBody['el_s_sound']];
                    let safetySoundCh = lampConfig.soundChannel[reqBody['el_s_sound_ch']];

                    let safetyMode = '색상: ' + safetyColor + '</br></br>'
                        + '점등: ' + safetyLamp + '</br></br>'
                        + '음원그룹: ' + safetySound + '</br></br>'
                        + '음원: ' + safetySoundCh;
                    reqBody['safety_mode'] = safetyMode;

                    let warningColor = lampConfig.color[reqBody['el_w_color']];
                    let warningLamp = lampConfig.lampType[reqBody['el_w_lamp']];
                    let warningSound = lampConfig.soundGroup[reqBody['el_w_sound']];
                    let warningSoundCh = lampConfig.soundChannel[reqBody['el_w_sound_ch']];
                    let warningMode = '색상: ' + warningColor + '</br></br>'
                        + '점등: ' + warningLamp + '</br></br>'
                        + '음원그룹: ' + warningSound + '</br></br>'
                        + '음원: ' + warningSoundCh;
                    reqBody['warning_mode'] = warningMode;

                    let dangerColor = lampConfig.color[reqBody['el_d_color']];
                    let dangerLamp = lampConfig.lampType[reqBody['el_d_lamp']];
                    let dangerSound = lampConfig.soundGroup[reqBody['el_d_sound']];
                    let dangerSoundCh = lampConfig.soundChannel[reqBody['el_d_sound_ch']];
                    let dangerMode = '색상: ' + dangerColor + '</br></br>'
                        + '점등: ' + dangerLamp + '</br></br>'
                        + '음원그룹: ' + dangerSound + '</br></br>'
                        + '음원: ' + dangerSoundCh;
                    reqBody['danger_mode'] = dangerMode;

                    let networkColor = lampConfig.color[reqBody['el_n_color']];
                    let networkLamp = lampConfig.lampType[reqBody['el_n_lamp']];
                    let networkSound = lampConfig.soundGroup[reqBody['el_n_sound']];
                    let networkSoundCh = lampConfig.soundChannel[reqBody['el_n_sound_ch']];
                    let networkMode = '색상: ' + networkColor + '</br></br>'
                        + '점등: ' + networkLamp + '</br></br>'
                        + '음원그룹: ' + networkSound + '</br></br>'
                        + '음원: ' + networkSoundCh;
                    reqBody['network_mode'] = networkMode;


                    res.json(reqBody);
                }
            });
            //커넥션 반환( 커넥션 종료 메소드가 커넥션과 다르다 )
            connection.release();
        }
    });
});

router.put('/lamps/:id', (req, res, next) => {
    let reqBody = req.body;
    let reqParams = req.params.id;
    let _query = queryconfig.update(reqBody);
    console.log(reqBody);
    pool.getConnection((err, results) => {
        if (err) {
            res.status(404).end();
            throw err;
        } else {
            //커넥션 사용
            connection.query(_query, (err, results) => {
                if (err) {
                    res.status(404).end();
                    throw err;
                } else {
                    let changedRows = results['changedRows'];
                    if (changedRows) {
                        let safetyColor = lampConfig.color[reqBody['el_s_color']];
                        let safetyLamp = lampConfig.lampType[reqBody['el_s_lamp']];
                        let safetySound = lampConfig.soundGroup[reqBody['el_s_sound']];
                        let safetySoundCh = lampConfig.soundChannel[reqBody['el_s_sound_ch']];
        
                        let safetyMode = '색상: ' + safetyColor + '</br></br>'
                                        + '점등: ' + safetyLamp + '</br></br>'
                                        + '음원그룹: ' + safetySound + '</br></br>'
                                        + '음원: ' + safetySoundCh;
                        reqBody['safety_mode'] = safetyMode;
        
                        let warningColor = lampConfig.color[reqBody['el_w_color']];
                        let warningLamp = lampConfig.lampType[reqBody['el_w_lamp']];
                        let warningSound = lampConfig.soundGroup[reqBody['el_w_sound']];
                        let warningSoundCh = lampConfig.soundChannel[reqBody['el_w_sound_ch']];
                        let warningMode = '색상: ' + warningColor + '</br></br>'
                                        + '점등: ' + warningLamp + '</br></br>'
                                        + '음원그룹: ' + warningSound + '</br></br>'
                                        + '음원: ' + warningSoundCh;
                        reqBody['warning_mode'] = warningMode;
        
                        let dangerColor = lampConfig.color[reqBody['el_d_color']];
                        let dangerLamp = lampConfig.lampType[reqBody['el_d_lamp']];
                        let dangerSound = lampConfig.soundGroup[reqBody['el_d_sound']];
                        let dangerSoundCh = lampConfig.soundChannel[reqBody['el_d_sound_ch']];
                        let dangerMode = '색상: ' + dangerColor + '</br></br>'
                                        + '점등: ' + dangerLamp + '</br></br>'
                                        + '음원그룹: ' + dangerSound + '</br></br>'
                                        + '음원: ' + dangerSoundCh;
                        reqBody['danger_mode'] = dangerMode;
        
                        let networkColor = lampConfig.color[reqBody['el_n_color']];
                        let networkLamp = lampConfig.lampType[reqBody['el_n_lamp']];
                        let networkSound = lampConfig.soundGroup[reqBody['el_n_sound']];
                        let networkSoundCh = lampConfig.soundChannel[reqBody['el_n_sound_ch']];
                        let networkMode = '색상: ' + networkColor + '</br></br>'
                                        + '점등: ' + networkLamp + '</br></br>'
                                        + '음원그룹: ' + networkSound + '</br></br>'
                                        + '음원: ' + networkSoundCh;
                        reqBody['network_mode'] = networkMode;
        
                        res.json(reqBody);
                    }
                }
            });
            //커넥션 반환( 커넥션 종료 메소드가 커넥션과 다르다 )
            connection.release();
        }
    });
});

router.delete('/lamps/:id', (req, res, next) => {

    let reqParams = req.params;
    let _query = queryconfig.delete(reqParams);
    console.log(_query);
    pool.getConnection((err, connection) => {
        if (err) {
            res.status(404).end();
            throw err;
        } else {
            //커넥션 사용
            connection.query(_query, (err, results) => {
                if (err) {
                    res.status(404).end();
                    throw err;
                } else {
                    res.json(results);
                }
            });
            //커넥션 반환( 커넥션 종료 메소드가 커넥션과 다르다 )
            connection.release();
        }
    });
});

/* 
    @method post
    @param x
    @body actSound (0:OFF, 1:ON)
    @comment 경광등 사운드 off
*/
router.post('/lamps/sound/off', (req, res, next) => {
    let reqBody = req.body;
    let _query = queryconfig.soundOff(reqBody)
        + gasQueryconfig.soundPause(reqBody);
    console.log(_query);
    pool.getConnection((err, connection) => {
        if (err) {
            res.status(404).end();
            throw err;
        } else {
            //커넥션 사용
            connection.query(_query, (err, results) => {
                if (err) {
                    res.status(404).end();
                    throw err;
                } else {
                    res.json(results);
                }
            });
            //커넥션 반환( 커넥션 종료 메소드가 커넥션과 다르다 )
            connection.release();
        }
    });

});


module.exports = router;
