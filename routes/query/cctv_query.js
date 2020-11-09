const _query = {
    findByAll(data) {
        let _sensorIndex = data;
        var query = `SELECT * FROM info_cctv WHERE sensor_index="${_sensorIndex}";`;
        return query;
    },
    insert(data) {
        let _data = data;
        let _createdDate = _data.created_date ? `"${_data.created_date}"`: null;
        let _fanAddress = _data.fan_address ? `"${_data.fan_address}"` : null;
        let _port = _data.port ? `"${_data.port}"` : null;
        let _userId = _data.user_id ? `"${_data.user_id}"`:null;
        let _password = _data.password ? `"${_data.password}"` : null;
        let _sensorIndex = _data.sensor_index ? `"${_data.sensor_index}"` : null;

        let query = `INSERT INTO info_cctv 
                    (created_date, fan_address, port, user_id, password, sensor_index)
                    VALUE (${_createdDate}, ${_fanAddress}, ${_port}, ${_userId}, ${_password}, ${_sensorIndex})`
        return query;
    },
    update(data) {
        let _data = data;
        let _id = _data.id;
        let _modifiedDate = _data.modifiedDate? `"${_data.modifiedDate}"` : null;
        let _fanAddress = _data.fan_address ? `"${_data.fan_address}"` : null;
        let _port = _data.port ? `"${_data.port}"` : null;
        let _userId = _data.user_id ? `"${_data.user_id}"`:null;
        let _password = _data.password ? `"${_data.password}"` : null;

        let query = `UPDATE info_cctv SET 
                     modified_date=${_modifiedDate}, 
                     fan_address=${_fanAddress}, 
                     port=${_port}, 
                     user_id=${_userId}, 
                     password=${_password}
                     WHERE id=${_id}`;
        return query;
    },
    requestUpdate(data) {
        let _data = data;
        let _modifiedDate = _data.modifiedDate? `"${_data.modifiedDate}"` : null;
        let _sensorIndex = _data.sensor_index? `"${_data.sensor_index}"` : null;
        let _fanAddress = _data.fan_address ? `"${_data.fan_address}"` : null;
        let _port = _data.port ? `"${_data.port}"` : null;
        let query = `UPDATE info_cctv SET 
                     modified_date=${_modifiedDate}, 
                     fan_address=${_fanAddress}, 
                     port=${_port}
                     WHERE sensor_index=${_sensorIndex};`;
        return query;
    },
    delete(data) {
        var _sensorIndex = data;
        var _query = `DELETE FROM info_cctv WHERE sensor_index = "${_sensorIndex}";`

        return _query

    }
}

module.exports = _query;
