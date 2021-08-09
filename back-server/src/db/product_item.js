const ConnPool = require('./conn_pool')

const pool = ConnPool.getPool();

const querySql = 'select * from product_item as t '

/**
 * 
 * @param {number} [product] 产品id
 * @param {number} [category] 若之后需要多选，就全部读出来再循环判断好了。
 * @param {*} [searchString] 搜索语句
 * @returns {Promise<[]>}
 */
function query(product, category, searchString) {
    let params = [];
    let where = '';
    if (product) { params.push(product); where += " and t.product_id = ? "; }
    if (category) { params.push(category); where += " and JSON_contains(t.category_list, '?', '$')"; } // JSON类型最外层有引号
    if (searchString) { params.push('%' + searchString + '%'); where += " and name like ? "; }
    if (where) {
        if (where.trim().startsWith('and'))
            where = where.replace('and', '')
        where = ' where ' + where
    }
    return new Promise((resolve, reject) => {
        ConnPool.query(querySql + where, params, (err, res, fields) => {
            if (err) {
                console.log(err)
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}


const addSql = "insert into product_item(`name`, product_id, category_list, main_pic, link_url) values(?, ?, convert(?,json), ?, ?)"

/**
 * 
 * @param {string} name 
 * @param {number} product 
 * @param {number[]} categories 
 * @param {string} picUrl 
 * @param {string} linkUrl 
 * @returns 
 */
function add(name, product, categories, picUrl, linkUrl) {
    let categoryList = categories ? JSON.stringify(categories) : '[]';  // stringify 自动添加引号
    return new Promise((resolve, reject) => {
        ConnPool.query(addSql, [name, product, categoryList, picUrl, linkUrl], (err, res, fields) => {
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

const getSql = 'select * from product_item where id = ?'

/**
 * 
 * @param {number} id 
 * @returns {Promise<>}
 */
function get(id) {
    return new Promise((resolve, reject) => {
        ConnPool.query(getSql, [id], (err, results, fields) => {
            if (err) {
                console.log(err)
                reject(err)
            } else {
                console.log(results)
                if (results.length < 1)
                    reject('未找到对应内容')
                resolve(results[0])
            }
        })
    })
}

module.exports = {
    query: query,
    add: add,
    get: get,
}