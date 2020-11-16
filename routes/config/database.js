var _mysql = {
  develop: {
    host: '192.168.0.39',
    port: '3306',
    user: 'root',
    password: 'work1801!',
    database: 'life_saver_gas',
    multipleStatements: true //다중 퀄리 사용가능
  },
  // operation: {
  //   host: '127.0.0.1',
  //   port: '3306',
  //   user: 'root',
  //   password: 'work1801',
  //   database: 'life_saver_gas',
  //   multipleStatements: true //다중 퀄리 사용가능
  // },
  operation: {
    host: '119.207.78.146',
    port: '3306',
    user: 'admin',
    password: 'work1801',
    database: 'life_saver_gas',
    multipleStatements: true, //다중 퀄리 사용가능
    connectionLimit: 200
  }
}

module.exports = _mysql