const ConnPool = require('./conn_pool')

const pool = ConnPool.getPool();

const queryAllSql = 'select * from product;'

function queryAll() {
    return new Promise((resolve, reject) => {
        ConnPool.query(queryAllSql, [], (err, res, fields) => {
            if (err) {
                console.log(err)
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}

const addNewSql = 'insert into product(name) values(?);'

/**
 * 
 * @param {string} name 
 * @returns 
 */
function add(name) {
    return new Promise((resolve, reject) => {
        ConnPool.query(addNewSql, [name], (err, res, fields) => {
            if (err) {
                console.log(err); reject(err)
            } else {
                console.log(res)
                resolve(res)
            }
        })
    })
}

module.exports = {
    queryAll: queryAll,
    add: add
}