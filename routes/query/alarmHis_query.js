const _query = {
    searchByDate(data) {
        let _data = data;
        let _fromDate = _data.fromDate;
        let _toDate = _data.toDate;
        let _sensorIndex = `"${_data.sensor_index}"`;


        var query = `SELECT * FROM alarm_his 
                     WHERE (DATE_FORMAT(record_time, "%Y-%m-%d %H:%i:%S") 
                     BETWEEN DATE_FORMAT("${_fromDate}", "%Y-%m-%d %H:%i:%S") 
                     AND DATE_FORMAT("${_toDate}", "%Y-%m-%d %H:%i:%S")) 
                     AND state_code = 2
                     AND sensor_index=${_sensorIndex}
                     ORDER BY record_time ASC;`;
        
        return query;
    },
    searchByDateNgasType(data) {
        let _data = data;
        let _fromDate = _data.fromDate;
        let _toDate = _data.toDate;
        let _gasType = _data.gas_type;
        let _sensorIndex = `"${_data.sensor_index}"`;


        var query = `SELECT * FROM alarm_his 
                     WHERE (DATE_FORMAT(record_time, "%Y-%m-%d %H:%i:%S") 
                     BETWEEN DATE_FORMAT("${_fromDate}", "%Y-%m-%d %H:%i:%S") 
                     AND DATE_FORMAT("${_toDate}", "%Y-%m-%d %H:%i:%S")) 
                     AND gas_type LIKE '%${_gasType}%'
                     AND state_code = 2
                     AND sensor_index=${_sensorIndex}
                     ORDER BY record_time ASC;`;
        
        return query;
    }
}

module.exports = _query;
