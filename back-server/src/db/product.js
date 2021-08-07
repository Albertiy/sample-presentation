import ConnPool from './conn_pool'

const pool = ConnPool.getPool();

const queryAllSql = 'select * from product;'

export function queryAll() {
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
export function addNew(name) {
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