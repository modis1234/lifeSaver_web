const _query = {
    search(data) {
        let _data = data;
        let _fromDate = _data.fromDate;
        let _toDate = _data.toDate;
        let _sensorIndex = `"${_data.sensor_index}"`;

        var query = `SELECT * FROM used_his 
                     WHERE (DATE_FORMAT(start_time, "%Y-%m-%d %H:%i:%S") 
                     BETWEEN DATE_FORMAT("${_fromDate}", "%Y-%m-%d %H:%i:%S") 
                     AND DATE_FORMAT("${_toDate}", "%Y-%m-%d %H:%i:%S")) AND sensor_index=${_sensorIndex} ORDER BY start_time ASC;`;
        
        return query;
       
    }
}

module.exports = _query;
