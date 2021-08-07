var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
// var formidable = require('formidable');
// var tools = require('../tools/tools');
var config = require('../config');
// var uuidV3 = require('uuid').v3;

var ReqBody = require('../src/model/req_body')
var dbService = require('../src/service/dbService');

router.get('/product', function (req, res, next) {
    dbService.getProductList().then(val => {
        res.send(new ReqBody(1, val))
    }).catch(err => {
        res.send(new ReqBody(0, null, err))
    })
})

router.post('/product', function (req, res, next) {
    let { name } = req.body;
    if (name)
        dbService.addNewProduct(name).then(val => {
            res.send(new ReqBody(1, val))
        }).catch(err => {
            res.send(new ReqBody(0, null, err))
        })
    else res.send(new ReqBody(0, null, 'need parameters'))
})

router.get('/category', function (req, res, next) {
    dbService.getCategoryList().then(val => {
        res.send(new ReqBody(1, val))
    }).catch(err => {
        res.send(new ReqBody(0, null, err))
    })
})

router.post('/category', function (req, res, next) {
    let { name } = req.body;
    if (name)
        dbService.addNewCategory(name).then(val => {
            res.send(new ReqBody(1, val))
        }).catch(err => {
            res.send(new ReqBody(0, null, err))
        })
    else res.send(new ReqBody(0, null, 'need parameters'))
})

router.get('/productitem', function (req, res, next) {
    console.log('queryParams: %o', req.query)
    let { product, category, searchString } = req.query;
    try {
        if (product) product = parseInt(product);
        if (category) category = parseInt(product);
    } catch {
        res.send(new ReqBody(0, null, '参数格式错误'))
    }


    dbService.getProductItemList(product, category, searchString).then(val => {
        res.send(new ReqBody(1, val))
    }).catch(err => {
        res.send(new ReqBody(0, null, err))
    })
})


module.exports = router;