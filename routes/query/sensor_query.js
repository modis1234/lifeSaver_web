const _query = {
    findByAll() {
        var query = `SELECT * FROM info_sensor;`;
        return query;
    },
    findBySensorIndex(data){
        var _sensorIndex = data;
        var query = `SELECT * FROM info_sensor WHERE sensor_index="${_sensorIndex}";`;
        return query;
    },
    insert(data) {
        let _data = data;
        console.log(data)
        let _id = _data.id;
        let _createdDate = _data.createdDate ? `"${_data.createdDate}"` : null;
        let _deviceIndex = _data.device_index ? `"${_data.device_index}"` : null;
        let _sensorIndex = _data.sensor_index ? `"${_data.sensor_index}"` : null;
        let _name = _data.name ? `"${_data.name}"` : null;
        let _warmingUpCount = _data.warmingUpCount ? `${_data.warmingUpCount}` : 120000;
        let _rollingCount = _data.rollingCount ? `${_data.rollingCount}` : 5000;
        let _version = _data.version ? `${_data.version}` : 0;
        let _alarmPath = _data.alarmPath ? `"${_data.alarmPath}"` : null;
        let _siteIndex = _data.site_index ? `"${_data.site_index}"` :null;


        let query = `INSERT INTO info_sensor 
                    (id, created_date, device_index, sensor_index, site_index, warmingup_count, rolling_count, alarm_path, name, version)
                    VALUE (${_id}, ${_createdDate}, ${_deviceIndex}, ${_sensorIndex}, ${_siteIndex}, ${_warmingUpCount}, ${_rollingCount},${_alarmPath},${_name}, ${_version})`
        return query;
    },
    requestUpdate(data) {
        let _data = data;

        let _id = _data.id;
        let _modifiedDate = _data.modifiedDate ? `"${_data.modifiedDate}"` : null;
        let _deviceIndex = _data.device_index ? `"${_data.device_index}"` : null;
        let _sensorIndex = _data.sensor_index ? `"${_data.sensor_index}"` : null;
        let _name = _data.name ? `"${_data.name}"` : null;
        let _version = _data.version ? `${_data.version}` : null;
        let _siteIndex = _data.site_index ? `"${_data.site_index}"` : null;

        let query = `UPDATE info_sensor SET 
                     modified_date=${_modifiedDate}, 
                     device_index=${_deviceIndex}, 
                     sensor_index=${_sensorIndex}, 
                     name=${_name}, 
                     version=${_version}, 
                     site_index=${_siteIndex}
                     WHERE id=${_id};`;

        return query;
    },
    update(data) {
        let _data = data;

        let _id = _data.id;
        let _modifiedDate = _data.modifiedDate ? `"${_data.modifiedDate}"` : null;
        let _sensorIndex = _data.sensor_index ? `"${_data.sensor_index}"` : null;
        let _name = _data.name ? `"${_data.name}"` : null;
        let _warmingUpCount = _data.warmingup_count ? `${_data.warmingup_count}` : 120000;
        let _rollingCount = _data.rolling_count ? `${_data.rolling_count}` : 5000;
        let _alarmPath = _data.alarm_path ? `"${_data.alarm_path}"` : null;

        let query = `UPDATE info_sensor SET 
                     modified_date=${_modifiedDate}, 
                     sensor_index=${_sensorIndex}, 
                     name=${_name}, 
                     warmingup_count=${_warmingUpCount}, 
                     rolling_count=${_rollingCount}, 
                     alarm_path=${_alarmPath}
                     WHERE id=${_id}`;

        return query;
    },
    delete(param) {
        let query = `DELETE FROM info_sensor WHERE sensor_index="${param}";`;
        return query;
    }
}

module.exports = _query;
