var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');

var config = require('../config');
// var uuidV3 = require('uuid').v3;

var ReqBody = require('../src/model/req_body')
var dbService = require('../src/service/dbService');

var formidable = require('formidable');
var uuidV1 = require('uuid').v1;
const fileService = require('../src/service/fileservice');
const tools = require('../src/tool/tools');

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

/**
   formdata 不能直接从 body 获取
*/
router.post('/productitem', function (req, res, next) {
    try {
        let tempPath = path.resolve(fileService.getFileRoot(), './temp');
        let rootUrl = fileService.getFileRoot();
        fileService.mkdirsSync(tempPath);
        let maxFileSize = 60 * 1024 * 1024;

        // formidable 插件
        let form = new formidable.IncomingForm({
            uploadDir: tempPath,
            keepExtensions: true,
            maxFileSize: maxFileSize,
        });
        // 非文件字段
        form.on('field', (name, value) => {
            console.log('name: %o, value: %o', name, value)
        })
        // 文件传输开始
        form.on('fileBegin', (formName, file) => {
            console.log(formName, file.name, file.size)
        })
        // 文件传输结束
        form.on('file', (formName, file) => {
            console.log(formName, file.name, file.size)
        })

        form.on('error', err => {
            console.log('|| formidable error：%o', err.message);
        })

        form.on('aborted', () => {
            console.log('|| formidable aborted!')
        })
        // 没有作用？
        form.on('data', data => {
            console.log('data: ')
            console.log(data.name)
        })

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.log('formidable parse error: %o', err.message)
                res.send(new ReqBody(0, null, err.message))
            } else {
                console.log(fields);
                let { name, product, categories, linkUrl } = fields;
                product = parseInt(product);
                if (categories && typeof categories == 'string')
                    categories = JSON.parse(categories)
                let relativeUrl = (tools.validateFileName(name) ? name : tools.correctingFileName(name)) + '-' + uuidV1();
                console.log(files);
                if (Object.keys(files).length > 0) {
                    let keys = []   // 目前是单图传输，以后可能会有多图。
                    Object.keys(files).forEach(key => {
                        keys.push(key)
                    })
                    let file = files[keys[0]];
                    console.log('|| 临时文件路径:' + file.path);
                    relativeUrl = relativeUrl + tools.getExtName(file.name)
                    let absoluteUrl = path.resolve(rootUrl, relativeUrl)
                    console.log('|| 目标存储路径:' + absoluteUrl)
                    fs.renameSync(file.path, absoluteUrl);
                    if (!name || !product || !relativeUrl || !linkUrl) {
                        res.send(new ReqBody(0, null, '缺少必要的参数'))
                    } else {
                        dbService.addProductItem(name, product, categories, relativeUrl, linkUrl).then(val => {
                            res.send(new ReqBody(1, val))
                        }).catch(err => {
                            res.send(new ReqBody(0, null, err))
                        })
                        res.send(new ReqBody(1, 'success'))
                        return;
                    }
                } else {
                    res.send(new ReqBody(0, null, '文件上传失败'))
                }
            }
        })
    } catch (e) {
        res.send(new ReqBody(0, null, e))
    }
})


module.exports = router;