const _query = {
    findByAll() {
        var query = 'SELECT * FROM info_gas;';
        return query;
    },
    findBySensorIndex(data) {
        var _sensorIndex = data;
        var query = `SELECT * FROM info_gas WHERE sensor_index="${_sensorIndex}";`;
        return query;
    },
    insert(data, gasList) {
        /**
            let data = {
                sensor_id:_sensorId,
                sensor_index: _sensorIndex
            }
         */
        let query = `INSERT INTO info_gas
        ( sensor_id, sensor_index, code, name, unit, range_min, range_max, normal_low, normal_high, 
        warning1_low, warning1_high, warning2_low, warning2_high,
        danger1_low, danger1_high, danger2_low, danger2_high) VALUE `

        var _sql = "";
        for (i in gasList) {
            let gasObj = gasList[i];
            let _sensorId = `${data.sensor_id}`;
            let _sensorIndex = `"${data.sensor_index}"`;
            let _code = `"${gasObj.code}"`;
            let _name = `"${gasObj.name}"`;
            let _unit = `"${gasObj.unit}"`;
            let _rangeMin = (gasObj.range_min >= 0 && gasObj.range_min != null) ? gasObj.range_min : null;
            let _rangeMax = (gasObj.range_max >= 0 && gasObj.range_max != null) ? gasObj.range_max : null;
            let _normalLow = (gasObj.normal_low >= 0 && gasObj.normal_low != null) ? gasObj.normal_low : null;
            let _normalHigh = (gasObj.normal_high >= 0 && gasObj.normal_high != null) ? gasObj.normal_high : null;
            let _warning1Low = (gasObj.warning1_low >= 0 && gasObj.warning1_low != null) ? gasObj.warning1_low : null;
            let _warning1High = (gasObj.warning1_high >= 0 && gasObj.warning1_high != null) ? gasObj.warning1_high : null;
            let _warning2Low = (gasObj.warning2_low >= 0 && gasObj.warning2_low != null) ? gasObj.warning2_low : null;
            let _warning2High = (gasObj.warning2_high >= 0 && gasObj.warning2_high != null) ? gasObj.warning2_high : null;
            let _danger1Low = (gasObj.danger1_low >= 0 && gasObj.danger1_low != null) ? gasObj.danger1_low : null;
            let _danger1High = (gasObj.danger1_high >= 0 && gasObj.danger1_high != null) ? gasObj.danger1_high : null;
            let _danger2Low = (gasObj.danger2_low >= 0 && gasObj.danger2_low != null) ? gasObj.danger2_low : null;
            let _danger2High = (gasObj.danger2_high >= 0 && gasObj.danger2_high != null) ? gasObj.danger2_high : null;

            _sql += ` ( ${_sensorId}, ${_sensorIndex}, ${_code}, ${_name},${_unit}, ${_rangeMin}, ${_rangeMax}, ${_normalLow}, ${_normalHigh}, 
                        ${_warning1Low}, ${_warning1High}, ${_warning2Low}, ${_warning2High}, 
                        ${_danger1Low}, ${_danger1High}, ${_danger2Low}, ${_danger2High})`
            if (i < gasList.length - 1) {
                _sql += `,`
            }
        }

        query = query + _sql;
        return query;
    },
    update(data) {
        let _data = data;
        let _id = _data.id;

        let _normalLow = _data.normal_low >= 0 ? _data.normal_low : null;
        let _normalHigh = _data.normal_high >= 0 ? _data.normal_high : null;
        let _warning1Low = _data.warning1_low >= 0 ? _data.warning1_low : null;
        let _warning1High = _data.warning1_high >= 0 ? _data.warning1_high : null;
        let _warning2Low = _data.warning2_low >= 0 ? _data.warning2_low : null;
        let _warning2High = _data.warning2_high >= 0 ? _data.warning2_high : null;
        let _danger1Low = _data.danger1_low >= 0 ? _data.danger1_low : null;
        let _danger1High = _data.danger1_high >= 0 ? _data.danger1_high : null;
        let _danger2Low = _data.danger2_low >= 0 ? _data.danger2_low : null;
        let _danger2High = _data.danger2_high >= 0 ? _data.danger2_high : null;
        let query = `UPDATE info_gas SET 
                     normal_low=${_normalLow}, 
                     normal_high=${_normalHigh},
                     warning1_low=${_warning1Low},
                     warning1_high=${_warning1High},
                     warning2_low=${_warning2Low},
                     warning2_high=${_warning2High},
                     danger1_low=${_danger1Low},
                     danger1_high=${_danger1High},
                     danger2_low=${_danger2Low},
                     danger2_high=${_danger2High}
                     WHERE id=${_id}`;
        return query;
    },
    requestUpdate(data) {
        let _data = data;
        console.log(data)
        let _id = data.id;
        let _sensorIndex = data.sensor_index ? `"${data.sensor_index}"` : null;

        let query = `UPDATE info_gas SET 
                     sensor_index=${_sensorIndex}
                     WHERE sensor_id=${_id}`;
        console.log(query)
        return query;
    },
    delete(data) {
        var _sensorIndex = data;
        var _query = `DELETE FROM info_gas WHERE sensor_index = "${_sensorIndex}";`

        return _query

    }
}

module.exports = _query;
