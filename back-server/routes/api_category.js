var express = require('express');
var router = express.Router();

const dbService = require('../src/service/dbService');
var ReqBody = require('../src/model/req_body')

/**
 * 查询-类目列表
 */
router.get('/categorylist', function (req, res, next) {
    dbService.getCategoryList().then(val => {
        res.send(new ReqBody(1, val))
    }).catch(err => {
        res.send(new ReqBody(0, null, err))
    })
})

/**
 * 新增-类目
 */
router.post('/category', function (req, res, next) {
    let { name, productId } = req.body;
    if (name)
        dbService.addNewCategory({ name, productId }).then(val => {
            res.send(new ReqBody(1, val))
        }).catch(err => {
            res.send(new ReqBody(0, null, err))
        })
    else res.send(new ReqBody(0, null, '缺少必要参数'))
})

/**
 * 更新-类目列表
 */
router.put('/categorylist', function (req, res, next) {
    /** @type{Category[]} */
    let { list } = req.body;
    if (list) {
        console.log(list)
        dbService.updateCategoryList(list).then(val => {
            res.send(new ReqBody(1, val))
        }).catch(err => {
            res.send(new ReqBody(0, null, err))
        })
    } else
        res.send(new ReqBody(0, null, '缺少必要参数'))
})

module.exports = router;