const ProductAPI = require('../db/product')
const CategoryAPI = require('../db/category')
const ProductItemAPI = require('../db/product_item')

const Product = require('../model/product')
const Category = require('../model/category')
const ProductItem = require('../model/product_item')

/**
 * 
 * @returns {Promise<Product[]>}
 */
function getProductList() {
    return new Promise((resolve, reject) => {
        ProductAPI.queryAll().then(res => {
            let list = [];
            res.forEach(ele => {
                list.push(new Product(ele.id, ele.name))
            });
            resolve(list)
        }).catch(err => {
            reject(err)
        })
    })
}

/**
 * 
 * @param {string} name 
 * @returns {Promise<Product>}
 */
function addNewProduct(name) {
    return new Promise((resolve, reject) => {
        ProductAPI.add(name).then(res => {
            resolve(new Product(res.insertId, name))
        }).catch((err) => {
            reject(err)
        });
    })
}

/**
 * 
 * @returns {Promise<Category[]>}
 */
function getCategoryList() {
    return new Promise((resolve, reject) => {
        CategoryAPI.queryAll().then(res => {
            let list = [];
            res.forEach(ele => {
                list.push(new Category(ele.id, ele.name, ele.order, ele.product_id, ele.parent_id))
            });
            resolve(list)
        }).catch(err => {
            reject(err)
        })
    })
}

/**
 * 
 * @param {string} name 
 * @returns {Promise<Category>}
 */
function addNewCategory(name) {
    return new Promise((resolve, reject) => {
        CategoryAPI.add(name).then(res => {
            resolve(new Category(res.insertId, name))
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
 * @returns {Promise<ProductItem[]>}
 */
function getProductItemList(product, category, searchString) {
    return new Promise((resolve, reject) => {
        ProductItemAPI.query(product, category, searchString).then((res) => {
            let list = [];
            res.forEach(ele => {
                let categories = ele.category_list;
                if (categories && typeof categories == 'string')
                    categories = JSON.parse(categories);
                else
                    categories = [];
                list.push(new ProductItem(ele.id, ele.name, ele.product_id, ele.link_url, ele.main_pic, categories))
            });
            resolve(list)
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
            resolve('添加成功')
        }).catch((err) => {
            reject(err)
        });
    })
}

/**
 * 获取单个item
 * @param {number} id 
 * @return {Promise<ProductItem>}
 */
function getProductItem(id) {
    return new Promise((resolve, reject) => {
        ProductItemAPI.get(id).then(result => {
            let categories = result.category_list;
            if (categories && typeof categories == 'string')
                categories = JSON.parse(categories)
            let productItem = new ProductItem(result.id, result.name, result.product_id, result.link_url, result.main_pic, categories)
            resolve(productItem)
        }).catch(err => {
            reject(err)
        })
    })
}

module.exports = {
    getProductList: getProductList,
    addNewProduct: addNewProduct,
    getCategoryList: getCategoryList,
    addNewCategory: addNewCategory,
    getProductItemList: getProductItemList,
    addProductItem: addProductItem,
    getProductItem: getProductItem,
}