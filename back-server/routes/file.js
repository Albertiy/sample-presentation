var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
const fileService = require('../src/service/fileservice');
const tools = require('../src/tool/tools');

/** 缩略图文件默认后缀 */
const THUMB_NAME = '-thumb';

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
        let tempfilePath = tools.expandFileName(filePath, null, THUMB_NAME)
        let absoluteTempFilePath = path.join(fileService.getFileRoot(), tempfilePath);
        if (fs.existsSync(absoluteTempFilePath)) {
            res.sendFile(absoluteTempFilePath);
            return;
        } else {
            console.log('缩略图不存在: %s', absoluteTempFilePath)
        }
    }
    let absoluteFilePath = path.join(fileService.getFileRoot(), filePath);
    console.log('原文件: %s', absoluteFilePath);
    res.sendFile(absoluteFilePath); // 传输为字节流文件
});

module.exports = router;