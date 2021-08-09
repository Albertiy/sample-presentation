const ConnPool = require('./conn_pool')

const pool = ConnPool.getPool();

const queryAllSql = 'select * from product;'

/**
 * 查询所有
 * @returns {Promise<[]>}
 */
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
 * 添加
 * @param {string} name 
 * @returns {Promise<>}
 */
function add(name) {
    return new Promise((resolve, reject) => {
        ConnPool.query(addNewSql, [name], (err, res, fields) => {
            if (err) {
                console.log(err.sqlMessage)
                if (err.code == 'ER_DUP_ENTRY')
                    reject('名称重复')
                else
                    reject(err.sqlMessage)
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