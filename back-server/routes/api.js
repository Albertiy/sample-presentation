var express = require('express');
var router = express.Router();

const accountRouter = require('./api_account')
const fileRouter = require('./api_file')
const productRouter = require('./api_product')
const productItemRouter = require('./api_productitem')
const categoryRouter = require('./api_category')
router.use('/', accountRouter)
router.use('/', fileRouter)
router.use('/', productRouter)
router.use('/', productItemRouter)
router.use('/', categoryRouter)

module.exports = router;