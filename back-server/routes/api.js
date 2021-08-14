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

router.get('/productlist', function (req, res, next) {
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

router.get('/categorylist', function (req, res, next) {
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

router.get('/productitemlist', function (req, res, next) {
    console.log('queryParams: %o', req.query)
    let { product, category, searchString } = req.query;
    try {
        if (product) product = parseInt(product);
        if (category) category = parseInt(category);
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
                console.log('上传文件数：%o', Object.keys(files).length);
                let { name, product, categories, linkUrl } = fields;
                if (!name || !product || !linkUrl) {
                    res.send(new ReqBody(0, null, '缺少必要的参数'))
                } else {
                    try {
                        product = parseInt(product);
                        if (categories && typeof categories == 'string')
                            categories = JSON.parse(categories)    // 在前台JSON处理了，应该是number数组
                    } catch (e) {
                        res.send(new ReqBody(0, null, '参数格式错误'))
                        return;
                    }

                    let relativeUrl = (tools.validateFileName(name) ? name : tools.correctingFileName(name)) + '-' + uuidV1();
                    if (Object.keys(files).length > 0) {
                        let keys = []   // 目前是单图传输，以后可能会有多图。
                        Object.keys(files).forEach(key => {
                            keys.push(key)
                        })
                        let file = files[keys[0]];
                        console.log('|| 临时文件路径:' + file.path);
                        relativeUrl = relativeUrl + tools.getExtName(file.name)
                        let absoluteUrl = path.resolve(rootUrl, relativeUrl)
                        console.log('mainPic:' + absoluteUrl)
                        dbService.addProductItem(name, product, categories, relativeUrl, linkUrl).then(val => {
                            fs.renameSync(file.path, absoluteUrl);  // 确保写入数据库后再移动文件，若记录创建失败则文件待在临时文件夹中，便于区分
                            res.send(new ReqBody(1, val))
                        }).catch(err => {
                            res.send(new ReqBody(0, null, err))
                        })
                    } else {
                        res.send(new ReqBody(0, null, '文件上传失败'))
                    }
                }
            }
        })
    } catch (e) {
        res.send(new ReqBody(0, null, e))
    }
})

/**
 * 获取一个素材项
 */
router.get('/productitem', function (req, res, next) {
    let { id } = req.query;
    if (id) {
        try {
            if (typeof id == 'string') id = parseInt(id)
        } catch (e) {
            res.send(new ReqBody(0, null, '参数的格式不正确'))
        }
        dbService.getProductItem(id).then(val => {
            console.log(val)
            res.send(new ReqBody(1, val))
        }).catch(err => {
            console.log(err)
            res.send(new ReqBody(0, null, err))
        })
    } else {
        res.send(new ReqBody(0, null, '缺少必要参数'))
    }
})

/**
 * 获取图片链接(以及缩略图链接，默认只有jpg有缩略图)
 * 后台生成图片链接，不用担心CORS问题
 * 参数：文件相对于根文件夹的路径。
 * 为了方便拼接，文件名不作为路径的参数，而是作为path的一部分。可能需要 uldecode 解码。
 */
router.get('/file/*', function (req, res, next) {
    // console.log(req.query)
    // console.log(req.params) // 放心，不会带上?后面的内容
    let { thumb } = req.query;  // 与缩略图共用接口
    /** @type{string} */
    let filePath = req.params[0];
    if (thumb != undefined) {
        let tempfilePath = tools.expandFileName(filePath, null, '-thumbnail')
        let absoluteTempFilePath = path.join(fileService.getFileRoot(), tempfilePath);
        if (fs.existsSync(absoluteTempFilePath)) {
            res.sendFile(absoluteTempFilePath);
            return;
        } else {
            console.log('缩略图不存在: %s', absoluteTempFilePath)
        }
    }
    let absoluteFilePath = path.join(fileService.getFileRoot(), filePath);
    console.log('原图: %s', absoluteFilePath);
    res.sendFile(absoluteFilePath); // 传输为字节流文件
});


module.exports = router;