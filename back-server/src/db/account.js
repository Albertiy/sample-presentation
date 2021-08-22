const ConnPool = require('./conn_pool')

const pool = ConnPool.getPool();

const Account = require('./account');


const checkAccountSql = "select distinct * from `account` where `name` = ? && password = ?";

function checkAccount(account) {
    return new Promise((resolve, reject) => {
        let { name, password } = account;
        if (name && password != undefined) {
            ConnPool.query(checkAccountSql, [name, password], (err, res, fields) => {
                if (err) {
                    console.log(err.message)
                    reject(err.message)
                } else {
                    console.log(res)
                    if (res && res.length > 0)
                        resolve(res[0])
                    else {
                        reject('账号或密码错误')
                    }
                }
            })
        } else
            reject('账号密码不能为空')
    })
}

const updatePasswordSql = "update `account` set `password` = ? where `name` = ? and password = ?";

/**
 * 更新密码
 * @param {Account} account 
 * @returns 
 */
function updatePassword(account) {
    return new Promise((resolve, reject) => {
        let { name, password, newPassword } = account;
        if (name && password != undefined && newPassword != undefined)
            ConnPool.query(updatePasswordSql, [newPassword, name, password], (err, res, fields) => {
                if (err) {
                    console.log('err: ' + err)
                    reject(err)
                } else {
                    console.log(res)
                    if (res.affectedRows == 0)
                        reject('原密码错误，修改失败')
                    else
                        resolve('密码修改成功')
                }
            })
        else
            reject('缺少必要参数')
    })
}

module.exports = {
    checkAccount: checkAccount,
    updatePassword: updatePassword,
}