var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var formidable = require('formidable');
var uuidV1 = require('uuid').v1;

const dbService = require('../src/service/dbService');
const fileService = require('../src/service/fileservice');
const tools = require('../src/tool/tools');
const ReqBody = require('../src/model/req_body')

const THUMB_NAME = '-thumb';

/**
 * 查询-商品项列表
 */
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
 * 查询-商品项
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
 * 新增-商品项
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
                if (!name || !product) { // || !linkUrl
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
                    // 拼接自定义的文件名，格式 “<素材名>-uuid<扩展名>”
                    let mainRelativePath = (tools.validateFileName(name) ? name : tools.correctingFileName(name)) + '-' + uuidV1();
                    // 缩略图加上后缀
                    let thumbRelativePath = mainRelativePath + THUMB_NAME;
                    if (Object.keys(files).length > 0) {
                        let keys = []   // 目前是单图传输，以后可能会有多图。
                        Object.keys(files).forEach(key => {
                            keys.push(key)
                        })
                        console.log(keys)
                        let mainPicIdx = keys.findIndex(value => value == 'mainPic')
                        let thumbPicIdx = keys.findIndex(value => value == 'thumbPic')
                        // 原图
                        if (mainPicIdx != -1) {
                            let mainPic = files[keys[mainPicIdx]]
                            console.log('|| 临时文件路径:' + mainPic.path);
                            mainRelativePath += tools.getExtName(mainPic.name)
                            thumbRelativePath += tools.getExtName(mainPic.name)
                            let mainAbsolutePath = path.resolve(rootUrl, mainRelativePath)
                            let thumbAbsolutePath = path.resolve(rootUrl, thumbRelativePath)
                            console.log('mainPic 存储路径:' + mainAbsolutePath)

                            dbService.addProductItem(name, product, categories, mainRelativePath, linkUrl).then(val => {
                                fs.renameSync(mainPic.path, mainAbsolutePath);  // 确保写入数据库后再移动文件，若记录创建失败则文件待在临时文件夹中，便于区分
                                if (thumbPicIdx != -1) {
                                    let thumbPic = files[keys[thumbPicIdx]]
                                    fs.renameSync(thumbPic.path, thumbAbsolutePath)
                                    console.log('thumbPic 存储路径:' + thumbAbsolutePath)
                                } else {
                                    console.log('没有上传缩略图')
                                }
                                res.send(new ReqBody(1, val))
                            }).catch(err => {
                                res.send(new ReqBody(0, null, err))
                            })
                        } else {
                            res.send(new ReqBody(0, null, '原图上传失败'))
                        }
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
 * 更新-商品项
 */
router.put('/productitem', function (req, res, next) {
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
                let { id, name, product, categories, linkUrl } = fields;
                if (!id || !name || !product) { //  || !linkUrl
                    res.send(new ReqBody(0, null, '缺少必要的参数'))
                } else {
                    try {
                        id = parseInt(id);
                        product = parseInt(product);
                        if (categories && typeof categories == 'string')
                            categories = JSON.parse(categories)    // 在前台JSON处理了，应该是number数组
                    } catch (e) {
                        res.send(new ReqBody(0, null, '参数格式错误'))
                        return;
                    }

                    // 拼接自定义的文件名，格式 “<素材名>-uuid<扩展名>”
                    let mainRelativePath = (tools.validateFileName(name) ? name : tools.correctingFileName(name)) + '-' + uuidV1();
                    let thumbRelativePath = mainRelativePath + THUMB_NAME;

                    /** @type{File} */
                    let mainPic;    // 若文件为空，不会报错，会没有扩展名，且创建的文件内容为空
                    /** @type{File} */
                    let thumbPic;

                    let mainAbsolutePath;
                    let thumbAbsolutePath;

                    // 检查是否上传了文件
                    if (Object.keys(files).length > 0) {
                        let keys = []
                        Object.keys(files).forEach(key => {
                            keys.push(key)
                        })
                        console.log(keys)
                        let mainPicIdx = keys.findIndex(value => value == 'mainPic')
                        let thumbPicIdx = keys.findIndex(value => value == 'thumbPic')
                        // 原图
                        if (mainPicIdx != -1) {
                            mainPic = files[keys[mainPicIdx]]
                            console.log('|| 临时文件路径:' + mainPic.path);
                            mainRelativePath += tools.getExtName(mainPic.name)
                            thumbRelativePath += tools.getExtName(mainPic.name)
                            mainAbsolutePath = path.resolve(rootUrl, mainRelativePath)
                            thumbAbsolutePath = path.resolve(rootUrl, thumbRelativePath)
                            if (thumbPicIdx != -1) {
                                thumbPic = files[keys[thumbPicIdx]]
                            }
                            //TODO 从数据库获取原mainPic值
                        } else {
                            console.log('未修改图片')
                        }
                    } else {
                        console.log('未修改图片')
                    }
                    // 先读数据库，获取原图地址
                    dbService.getProductItem(id).then(val => {
                        let oldMainRelativePath = val.mainPic;
                        let oldThumbRelativePath = tools.expandFileName(oldMainRelativePath, null, THUMB_NAME);
                        let oldMainAbsolutePath = path.resolve(rootUrl, oldMainRelativePath);
                        let oldThumbAbsolutePath = path.resolve(rootUrl, oldThumbRelativePath);
                        console.log('oldMainAbsolutePath: ' + oldMainAbsolutePath);
                        console.log('oldThumbAbsolutePath: ' + oldThumbAbsolutePath);

                        // 写入数据库
                        dbService.updateProductItem(id, name, linkUrl, product, categories, mainPic && mainPic.size > 0 ? mainRelativePath : null).then(val => {
                            let data = { message: val };
                            // 若上传了图片
                            if (mainPic && mainPic.size > 0) {  // 空参数的情况下，size为0
                                fs.renameSync(mainPic.path, mainAbsolutePath);
                                console.log('mainPic 存储路径:' + mainAbsolutePath)
                                if (thumbPic && mainPic.size > 0) {
                                    fs.renameSync(thumbPic.path, thumbAbsolutePath)
                                    console.log('thumbPic 存储路径:' + thumbAbsolutePath)
                                } else {
                                    console.log('没有上传缩略图')
                                }
                                data.mainPic = mainRelativePath.trim();

                                // 删除原图。突然想到图片的内容本该和url无关的，应该是固定的才对。file接口更像是一个纯粹的资源路径。
                                fs.rm(oldMainAbsolutePath, { force: true }, (err) => {
                                    if (!err) console.log('oldMainPic删除成功');
                                    else console.log(err);
                                })
                                fs.rm(oldThumbAbsolutePath, { force: true }, (err) => {
                                    if (!err) console.log('oldThumbPic删除成功');
                                    else console.log(err);
                                })
                            }
                            res.send(new ReqBody(1, data))
                        }).catch(err => {
                            res.send(new ReqBody(0, null, err))
                        })

                    }).catch(err => { res.send(new ReqBody(0, null, err)) });
                }
            }
        })
    } catch (e) {
        res.send(new ReqBody(0, null, e))
    }
})

module.exports = router;