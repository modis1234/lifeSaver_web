const _query = {
    findByAll() {
        var query = 'SELECT id, user_id, name, tel, mail, role, description FROM account WHERE role!=3;';
        return query;
    },
    insert(data) {
        let _data = data;
        console.log(data)
        let _createdDate = _data.createdDate ? `"${_data.createdDate}"` : null;
        let _name = _data.name ? `"${_data.name}"` : null;
        let _userId = _data.user_id ? `"${_data.user_id}"` : null;
        let _password = _data.password ? `"${_data.password}"` : null;
        let _tel = _data.tel ? `"${_data.tel}"` : null;
        let _mail = _data.mail ? `"${_data.mail}"` : null;
        let _role = _data.role;
        let _description = _data.description?`"${_data.description}"` : null;
        let query = `INSERT INTO account 
                    (created_date, user_id, password, name, tel, mail, role, description)
                    VALUE (${_createdDate}, ${_userId}, ${_password}, ${_name}, ${_tel}, ${_mail}, ${_role}, ${_description});`;
        return query;
    },
    update(data) {
        let _data = data;
        let _id = _data.id;
        let _modifiedDate = _data.modifiedDate?  `"${_data.modifiedDate}"`: null;
        let _name = _data.name ? `"${_data.name}"` : null;
        let _userId = _data.user_id ? `"${_data.user_id}"` : null;
        let _tel = _data.tel ? `"${_data.tel}"` : null;
        let _mail = _data.mail ? `"${_data.mail}"` : null;
        let _role = _data.role;
        let _description = _data.description?`"${_data.description}"` : null;

        let query = `UPDATE account SET 
                     modified_date=${_modifiedDate}, 
                     user_id=${_userId}, 
                     name=${_name}, 
                     tel=${_tel}, 
                     mail=${_mail}, 
                     role=${_role}, 
                     description=${_description}
                     WHERE id=${_id}`;
        return query;
    },
    delete(id) {
        let query = `DELETE FROM account WHERE id=${id}`;
        return query;
    },
    login(data) {
        var _data = data;
        var _userId = _data.userId;
        var _password = _data.password;
        var query = `SELECT * FROM account 
                     WHERE user_id = "${_userId}";`;
        return query;
    }
}

module.exports = _query;
