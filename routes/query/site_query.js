const _query = {
    findByAll() {
        var query = 'SELECT * FROM info_site;';
        return query;
    },
    findeBySensorIndex(param) {
        var query = `SELECT * FROM info_site WHERE sensor_index=${param};`;
        return query;
    },
    insert(data) {
        let _data = data;
        console.log(data)
        let _id = _data.id ? `${_data.id}` : 0;
        let _siteIndex = _data.site_index ? `"${_data.site_index}"` : null;
        let _name = _data.name ? `"${_data.name}"` : null;
        let query = `INSERT INTO info_site 
                    (id, name, site_index)
                    VALUE (${_id}, ${_name}, ${_siteIndex});`;
        return query;
    },
    update(data) {
        let _data = data;
        let _id = _data.id;
        let _siteIndex = _data.site_index ? `"${_data.site_index}"` : null;
        let _name = _data.name ? `"${_data.name}"` : null;

        let query = `UPDATE info_site SET 
                     name=${_name}, 
                     site_index=${_siteIndex}
                     WHERE id=${_id}`;
        return query;
    },
    delete(id) {
        let query = `DELETE FROM info_site WHERE id=${id}`;
        return query;
    }
}

module.exports = _query;
