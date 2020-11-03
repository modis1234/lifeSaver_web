const _query = {
    findByAll(data) {
        var _sensorIndex = data;
        var query = `SELECT * FROM receiver WHERE sensor_index="${_sensorIndex}";`;
        return query;
    },
    insert(data) {
        let _data = data;
        let _createdDate = _data.createdDate ? `"${_data.createdDate}"` : null;
        let _name = _data.name ? `"${_data.name}"` : null;
        let _tel = _data.tel ? `"${_data.tel}"` : null;
        let _smsYN = _data.sms_yn ? `"${_data.sms_yn}"` : null;
        let _sensorIndex = _data.sensor_index ? `"${_data.sensor_index}"` :null;
        let _sensorName = _data.sensor_name ? `"${_data.sensor_name}"` :null;


        let query = `INSERT INTO receiver 
                    (created_date, name, tel, sms_yn, sensor_index, sensor_name)
                    VALUE (${_createdDate}, ${_name}, ${_tel}, ${_smsYN}, ${_sensorIndex}, ${_sensorName});`
        return query;
    },
    update(data) {
        let _data = data;
        let _id = _data.id;
        let _modifiedDate = _data.modifiedDate ? `"${_data.modifiedDate}"` : null;
        let _name = _data.name ? `"${_data.name}"` : null;
        let _tel = _data.tel ? `"${_data.tel}"` : null;
        let _smsYN = _data.sms_yn ? `'${_data.sms_yn}'` : null;
        let _sensorIndex = _data.sensor_index ? `"${_data.sensor_index}"` :null;
        let _sensorName = _data.sensor_name ? `"${_data.sensor_name}"` :null;


        let query = `UPDATE receiver SET 
                     modified_date=${_modifiedDate}, 
                     name=${_name}, 
                     tel=${_tel}, 
                     sms_yn=${_smsYN}, 
                     sensor_name=${_sensorName}
                     WHERE id=${_id  } AND sensor_index=${_sensorIndex}`;
        return query;
    },
    delete(id) {
        let query = `DELETE FROM receiver WHERE id=${id}`;
        return query;
    }
}

module.exports = _query;
