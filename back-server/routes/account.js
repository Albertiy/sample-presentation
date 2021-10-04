var express = require('express');
var router = express.Router();

var ReqBody = require('../src/model/req_body')
const dbService = require('../src/service/dbService');
const tokenService = require('../src/service/tokenService');
var config = require('../config');

/**
 * 检查登录，在cookie中添加token，若已有token则不变。
 */
router.post('/checklogin', function (req, res, next) {
    let { name, password } = req.body;
    if (name && password != undefined) {
        dbService.checkLogin(name, password).then((val) => {
            if (req.cookies.token != null) {
                let token = req.cookies.token;
                console.log('cookie token: %o', token);
                let payload = tokenService.verToken(token);
                console.log('payload: ' + payload)
                res.send(new ReqBody(1, { code: 'EXISTS_TOKEN' }))
            } else {
                let token = tokenService.genToken(name, password);
                res.cookie("token", token, { maxAge: config.application().tokenExpires * 1000, path: "/", httpOnly: false }) // httpOnly: true,
                res.send(new ReqBody(1, { code: 'NEW_TOKEN' }))
            }
        }).catch((err) => {
            res.clearCookie("token");
            res.send(new ReqBody(0, null, err))
        });
    } else
        res.send(new ReqBody(0, null, '用户名密码不能为空'))
})

/**
 * 修改密码
 */
router.post('/changepwd', function (req, res, next) {
    let { name, oldPwd, newPwd } = req.body;
    if (name && oldPwd != undefined && newPwd != undefined && newPwd != '') {
        dbService.changePwd(name, oldPwd, newPwd).then((val) => {
            let token = tokenService.genToken(name, newPwd);
            res.cookie("token", token, { maxAge: config.application().tokenExpires * 1000, httpOnly: false })
            res.send(new ReqBody(1, val))
        }).catch((err) => {
            res.send(new ReqBody(0, null, err))
        });
    } else
        res.send(new ReqBody(0, null, '密码不能为空'))
})


module.exports = router;