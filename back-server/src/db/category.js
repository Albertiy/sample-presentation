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

const updateAllSql = 'update `category` as t inner join JSON_TABLE(?, "$[*]" COLUMNS('
    + '`id` int PATH "$.id",'
    + '`name` varchar(255) PATH "$.name",'
    + '`order` int PATH "$.order"'
    + ')) as j on t.`id`=j.`id` set t.`order` = j.`order`, t.`name` = j.`name`;';

/**
 * 更新全部
 * @param {Category[]} list 
 */
function updateAll(list) {
    let categorylist = list ? JSON.stringify(list) : '[]';
    console.log("%s", categorylist)
    return new Promise((resolve, reject) => {
        ConnPool.query(updateAllSql, [categorylist], (err, res, fields) => {
            if (err) {
                console.log(err.message)
                reject(err.message)
            } else
                resolve(res)
        })
        resolve('行啊！')
    })
}

module.exports = {
    queryAll: queryAll,
    add: add,
    updateAll: updateAll,
}