const ConnPool = require('./conn_pool')
const Category = require('../model/category')

const pool = ConnPool.getPool();

const queryAllSql = 'select * from category order by `order` IS NULL, `order` asc;' // 添加排序
const queryByProductSql = 'select * from `category` where `product_id`=? ';  // `product_id` is null || 
const addSql = 'insert into category set ?'  // 'insert into category(name) values(?);'
const updateAllSql = 'update `category` as t inner join JSON_TABLE(?, "$[*]" COLUMNS('
    + '`id` int PATH "$.id",'
    + '`name` varchar(255) PATH "$.name",'
    + '`order` int PATH "$.order"'
    + ')) as j on t.`id`=j.`id` set t.`order` = j.`order`, t.`name` = j.`name`;';

/**
 * 无条件查询所有类目
 * @returns {Promise<Category[]>}
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

/**
 * 通过productId查询
 * @param {number} productId 商品id
 * @param {boolean} strict  严格模式：查询结果不包含商品id为空项。 默认 true
 * @returns {Promise<Category[]>}
 */
function queryByProduct(productId, strict = true) {
    let query = queryByProductSql;
    if (!strict) query += ' || `product_id` is null';
    return new Promise((resolve, reject) => {
        ConnPool.query(query, [productId], (err, res, fields) => {
            if (err) {
                console.log(err)
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}

/**
 * 添加类目
 * @param {string} name 
 * @param {number} [productId]
 * @returns 
 */
function add(name, productId) {
    let data = { name }
    if (productId) data.product_id = productId;
    return new Promise((resolve, reject) => {
        ConnPool.query(addSql, [data], (err, res, fields) => {
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
 * 批量更新列表中全部类目
 * @param {Category[]} list 
 */
function updateAll(list) {
    let categorylist = list ? JSON.stringify(list) : '[]';
    console.log("%s", categorylist)
    return new Promise((resolve, reject) => {
        ConnPool.query(updateAllSql, [categorylist], (err, res, fields) => {
            if (err) {
                console.log(err.message)
                if (err.code == 'ER_DUP_ENTRY')
                    reject('类目名重复！')
                else
                    reject(err.message)
            } else
                resolve(res)
        })
    })
}

module.exports = {
    queryAll: queryAll,
    queryByProduct: queryByProduct,
    add: add,
    updateAll: updateAll,
}