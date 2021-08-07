const mysql = require('mysql');
const fs = require('fs');
const path = require('path');

const databaseConfigPath = path.resolve(__dirname, '../../database.config.json');

class ConnPool {

    /** @type {ConnPool} */
    static _instance = new ConnPool();

    flag = true;
    /**
       {
            host: 'localhost',
            port: '3306',
            user: 'root',
            password: '34477384',
            database: 'zhagen_oa'
        }
     */
    constructor() {
        if (ConnPool._instance) {
            throw new Error('错误：ConnPool 无需实例化')
        }
        let dbConfig = fs.existsSync(databaseConfigPath) ? JSON.parse(fs.readFileSync(databaseConfigPath)) : undefined;
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

};

module.exports = ConnPool;