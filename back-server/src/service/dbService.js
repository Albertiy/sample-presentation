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

module.exports = {
    getProductList: getProductList,
    addNewProduct: addNewProduct,
    getCategoryList: getCategoryList,
    addNewCategory: addNewCategory,
}