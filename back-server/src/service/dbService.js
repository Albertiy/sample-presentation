const ProductAPI = require('../db/product')
const CategoryAPI = require('../db/category')
const ProductItemAPI = require('../db/product_item')
const AccountAPI = require('../db/account')

const Product = require('../model/product')
const Category = require('../model/category')
const ProductItem = require('../model/product_item')
const Account = require('../model/account')


/**
 * 
 * @returns {Promise<Product[]>}
 */
function getProductList() {
    return new Promise((resolve, reject) => {
        ProductAPI.queryAll().then(res => {
            let list = [];
            res.forEach(ele => {
                list.push(new Product(ele.id, ele.name, ele.order))
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
 * 查询类目列表
 * @param {{productId?:number}} params
 * @returns {Promise<Category[]>}
 */
function getCategoryList(params) {
    let { productId } = params;
    return new Promise((resolve, reject) => {
        if (!productId) {
            CategoryAPI.queryAll().then(res => {
                let list = [];
                res.forEach(ele => {
                    list.push(new Category(ele.id, ele.name, ele.order, ele.product_id, ele.parent_id))
                });
                resolve(list)
            }).catch(err => {
                reject(err)
            })
        } else {
            CategoryAPI.queryByProduct(productId).then(res => {
                let list = [];
                res.forEach(ele => {
                    list.push(new Category(ele.id, ele.name, ele.order, ele.product_id, ele.parent_id))
                });
                resolve(list)
            }).catch(err => {
                reject(err)
            })
        }
    })
}

/**
 * 新增类目
 * @param {{name:string, productId?:number}} params 
 * @returns {Promise<Category>} 返回的Category对象其实是组装的而不是查询的
 */
function addNewCategory(params) {
    let { name, productId } = params;
    return new Promise((resolve, reject) => {
        CategoryAPI.add(name, productId).then(res => {
            resolve(new Category(res.insertId, name, null, productId))
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

/**
 * 更新
 * @param {number} id 
 * @param {string} name 
 * @param {string} linkUrl 
 * @param {number} product 
 * @param {number[]} categories 
 * @param {string} [mainPic] 
 * @returns 
 */
function updateProductItem(id, name, linkUrl, product, categories, mainPic) {
    return new Promise((resolve, reject) => {
        ProductItemAPI.update(id, name, linkUrl, product, categories, mainPic).then(result => {
            console.log(result)
            resolve('更新成功')
        }).catch(err => {
            reject(err)
        })
    })
}

/**
 * 更新
 * @param {Category[]} list 
 */
function updateCategoryList(list) {
    return new Promise((resolve, reject) => {
        if (list && list.length > 0) {
            let updateList = list.filter(val => val.id != null && val.name != null && val.name.trim() != '').map(val => {
                return { id: val.id, name: val.name.trim(), order: val.order }
            })
            // 只更新 name 和 order 字段。
            console.log(updateList)
            CategoryAPI.updateAll(updateList).then(result => {
                console.log(result)
                resolve('更新成功')
            }).catch(err => {
                reject(err)
            })
        } else reject('缺少必要参数')
    })
}

/**
 * 检查登录 和 登录应该分开，因为登录提供新的token，而检查登录不一定？
 * @param {string} name 
 * @param {string} password 
 * @returns 
 */
function checkLogin(name, password) {
    return new Promise((resolve, reject) => {
        if (name && password) {
            AccountAPI.checkAccount(new Account(undefined, name, password)).then(res => {
                resolve(res)
            }).catch(err => {
                reject(err)
            })
        } else reject('缺少必要参数')
    })
}

/**
 * 修改密码
 * @param {string} name 
 * @param {string} oldPwd 
 * @param {string} newPwd 
 * @returns 
 */
function changePwd(name, oldPwd, newPwd) {
    return new Promise((resolve, reject) => {
        if (name && oldPwd != undefined && newPwd != undefined) {
            AccountAPI.updatePassword(new Account(undefined, name, oldPwd, newPwd)).then(res => {
                resolve(res)
            }).catch(err => {
                reject(err)
            })
        } else reject('缺少必要参数')
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
    updateProductItem: updateProductItem,
    updateCategoryList: updateCategoryList,
    checkLogin: checkLogin,
    changePwd: changePwd,
}