var express = require('express');
var router = express.Router();

const dbService = require('../src/service/dbService');
var ReqBody = require('../src/model/req_body')

/**
 * 查询-商品列表
 */
router.get('/productlist', function (req, res, next) {
    dbService.getProductList().then(val => {
        res.send(new ReqBody(1, val))
    }).catch(err => {
        res.send(new ReqBody(0, null, err))
    })
})

/**
 * 新增-商品
 */
router.post('/product', function (req, res, next) {
    let { name } = req.body;
    if (name)
        dbService.addNewProduct(name).then(val => {
            res.send(new ReqBody(1, val))
        }).catch(err => {
            res.send(new ReqBody(0, null, err))
        })
    else res.send(new ReqBody(0, null, '缺少必要参数'))
})

module.exports = router;