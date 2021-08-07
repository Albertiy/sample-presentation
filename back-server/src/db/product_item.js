const ConnPool = require('./conn_pool')

const pool = ConnPool.getPool();

const querySql = 'select * from product_item as t '

/**
 * 
 * @param {number} [product] 产品id
 * @param {number} [category] 若之后需要多选，就全部读出来再循环判断好了。
 * @param {*} [searchString] 搜索语句
 * @returns {Promise<>}
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


const addSql = 'insert into product_item(name) values(?);'

function add(name) {
    return new Promise((resolve, reject) => {
        ConnPool.query(addSql, [name], (err, res, fields) => {
            if (err) {
                console.log(err)
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}

module.exports = {
    query: query,
    add: add,
}