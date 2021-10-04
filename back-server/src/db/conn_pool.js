const mysql = require('mysql');
const fs = require('fs');
const path = require('path');

const config = require('../../config')

class ConnPool {

    /** @type {ConnPool} */
    static _instance = new ConnPool();

    flag = true;


    constructor() {
        if (ConnPool._instance) {
            throw new Error('错误：ConnPool 无需实例化')
        }
        let dbConfig = config.database();
        this.host = dbConfig && dbConfig['host'] ? dbConfig['host'] : 'localhost';
        this.port = dbConfig && dbConfig['port'] ? dbConfig['port'] : '3306';
        this.user = dbConfig && dbConfig['user'] ? dbConfig['user'] : 'root';
        this.password = dbConfig && dbConfig['password'] ? dbConfig['password'] : '123456';
        this.database = dbConfig && dbConfig['database'] ? dbConfig['database'] : 'yilabaodb';
        this.pool = mysql.createPool({
            host: this.host,
            port: this.port,
            user: this.user,
            password: this.password,
            database: this.database,
        });
    }

    static getPool() {
        return ConnPool._instance.pool;
    }

    /**
     * 查询，适用于业务只需执行一条查询语句的情况，连接立即被释放。
     * @param {string|mysql.QueryOptions} sql 
     * @param {*} data 
     * @param {mysql.queryCallback} callback 
     */
    static query(sql, data, callback) {
        ConnPool.getPool().getConnection((err, conn) => {
            conn.query(sql, data, (err, res, fields) => {   // 将conn传入回调函数，或许可以使用bind？
                try {
                    callback(err, res, fields)
                } finally {
                    conn.release();
                }
            })
        })
    }
    
    /**
     * 事务查询，目前只能执行一条查询语句，会回滚或提交。
     * @param {string|mysql.QueryOptions} sql 查询语句
     * @param {*} data 
     * @param {mysql.queryCallback} callback 
     */
    static execTrans(sql, data, callback) {
        ConnPool.getPool().getConnection((err, conn) => {
            conn.beginTransaction(err => {
                if (err) {
                    return '开启事务失败'
                } else {
                    conn.query(sql, data, (err, res, fields) => {   // 将conn传入回调函数，或许可以使用bind？
                        try {
                            if (err) {
                                conn.rollback((err) => { if (err) console.log('回滚事务失败：%o', err); else console.log('回滚事务') })
                            } else {
                                conn.commit((err) => { if (err) console.log('提交事务失败：%o', err); else console.log('提交事务') })
                            }
                            callback(err, res, fields)
                        } finally {
                            conn.release();
                        }
                    })
                }
            })

        })
    }
};

module.exports = ConnPool;