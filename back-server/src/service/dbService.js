const ProductAPI = require('../db/product')
const CategoryAPI = require('../db/category')
const ProductItemAPI = require('../db/product_item')

function getProductList() {
    return new Promise((resolve, reject) => {
        ProductAPI.queryAll().then(res => {
            resolve(res)
        }).catch(err => {
            reject(err)
        })
    })
}

function addNewProduct(name) {
    return new Promise((resolve, reject) => {
        ProductAPI.add(name).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err)
        });
    })
}

function getCategoryList() {
    return new Promise((resolve, reject) => {
        CategoryAPI.queryAll().then(res => {
            resolve(res)
        }).catch(err => {
            reject(err)
        })
    })
}

function addNewCategory(name) {
    return new Promise((resolve, reject) => {
        CategoryAPI.add(name).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err)
        });
    })
}

/**
 * 
 * @param {number} product 
 * @param {number} category 
 * @param {string} searchString 
 * @returns 
 */
function getProductItemList(product, category, searchString) {
    return new Promise((resolve, reject) => {
        ProductItemAPI.query(product, category, searchString).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err)
        });
    })
}

/**
 * 
 * @param {string} name 
 * @param {number} product 
 * @param {number[]} categories 
 * @param {string} mainPic 
 * @param {string} linkUrl 
 * @returns {Promise<>}
 */
function addProductItem(name, product, categories, mainPic, linkUrl) {
    return new Promise((resolve, reject) => {
        ProductItemAPI.add(name, product, categories, mainPic, linkUrl).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err)
        });
    })
}

module.exports = {
    getProductList: getProductList,
    addNewProduct: addNewProduct,
    getCategoryList: getCategoryList,
    addNewCategory: addNewCategory,
    getProductItemList: getProductItemList,
    addProductItem: addProductItem,
}