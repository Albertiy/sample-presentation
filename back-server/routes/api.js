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

router.put('/product', function (req, res, next) {
    let { name } = req.body;
    dbService.addNewProduct(name).then(val => {
        res.send(new ReqBody(1, val))
    }).catch(err => {
        res.send(new ReqBody(0, null, err))
    })
})


module.exports = router;