const ConnPool = require('./conn_pool')

const pool = ConnPool.getPool();

const queryAllSql = 'select * from category order by `order` IS NULL, `order` asc;' // 添加排序

/**
 * 
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


const addSql = 'insert into category(name) values(?);'

/**
 * 添加
 * @param {string} name 
 * @returns 
 */
function add(name) {
    return new Promise((resolve, reject) => {
        ConnPool.query(addSql, [name], (err, res, fields) => {
            if (err) {
                console.log(err.sqlMessage)
                if (err.code == 'ER_DUP_ENTRY')
                    reject('名称重复')
                else
                    reject(err.sqlMessage)
            } else {
                resolve(res)
            }
        })
    })
}

/**
 * 更新全部
 * @param {Category[]} list 
 */
function updateAll(list) {
    return new Promise((resolve, reject) => {
        // ConnPool.query(updateAllSql, )
        resolve('行啊！')
    })
}

module.exports = {
    queryAll: queryAll,
    add: add,
    updateAll: updateAll,
}