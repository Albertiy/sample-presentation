import * as ProductAPI from '../api/product_api';
import Category from "../model/category";
import Product from "../model/product";
import ProductItem from "../model/product_item";

const cacheDelay = 3000;

/** @type{Product[]} */
let productListCache = [];
let productListCacheUpdatedTime = null;     // 缓存上次更新时间
/** @type {Category[]} */
let categoryListCache = [];
let categoryListCacheUpdatedTime = null;    // 缓存上次更新时间

/**
 * 获取产品列表
 * @returns {Promise<Product[]>}
 */
export function getProductList() {
    return new Promise((resolve, reject) => {
        let now = new Date().getTime();
        if (!productListCache || (now - productListCacheUpdatedTime) / cacheDelay > 1)
            ProductAPI.getProductList().then(value => {
                productListCache = value;
                productListCacheUpdatedTime = now;
                resolve(value);
            }).catch(error => {
                reject(error);
            })
        else
            resolve(productListCache);
    });
}


/**
 * 获取分类列表，因数据量小，后台不处理，在此过滤。
 * @param {number} [productId]
 * @param {boolean} [strict] 严格模式：不包含productId为null的类目；默认true
 * @returns  {Promise<Category[]>}
 */
export function getCategoryList(productId, strict = true) {
    return new Promise((resolve, reject) => {
        let now = new Date().getTime();
        let res = [];

        if (!categoryListCacheUpdatedTime || (now - categoryListCacheUpdatedTime) / cacheDelay > 1) {
            ProductAPI.getCategoryList().then(value => {
                categoryListCache = value;
                categoryListCacheUpdatedTime = now;
                if (productId !== null)
                    res = value.filter((val) => {
                        if (strict) return val.product_id == productId;
                        else return (val.product_id == null || val.product_id == productId);
                    });
                else
                    res = value;
                resolve(res);
            }).catch(error => {
                reject(error);
            })
        } else {
            if (productId !== null)
                res = categoryListCache.filter((val) => {
                    if (strict) return val.product_id == productId;
                    else return (val.product_id == null || val.product_id == productId);
                });
            else
                res = categoryListCache;
            resolve(res);
        }
    });
}

/**
 * 获取展示素材项列表，product 为必填
 * @param {number} product 
 * @param {number} [category] 
 * @param {string} [searchString] 
 * @returns  {Promise<ProductItem[]>}
 */
export function getProductItemList(product, category, searchString) {
    return new Promise((resolve, reject) => {
        ProductAPI.getProductItemList(product, category, searchString).then(value => {
            value.forEach(item => {
                item.mainPic = ProductAPI.getFileRemotePath(item.mainPic);
            })
            // console.log('getProductItemList: %o', value)
            resolve(value);
        }).catch(error => {
            reject(error);
        })
    });
}

/**
 * 通过Id获取素材详情
 * @param {number} id 
 * @returns {Promise<ProductItem>}
 */
export function getProductItemById(id) {
    return new Promise((resolve, reject) => {
        if (id == null)
            reject('缺少必要参数')
        else
            ProductAPI.getProductItemById(id).then(value => {
                // console.log('getProductItemById: %o', value)
                value.mainPic = ProductAPI.getFileRemotePath(value.mainPic);
                resolve(value)
            }).catch(error => {
                reject(error)
            })
    });
}

/**
 * 新增产品，返回新增的对象
 * @param {string} name 
 * @returns {Promise<Product>}
 */
export function addNewProduct(name) {
    return new Promise((resolve, reject) => {
        ProductAPI.addNewProduct(name).then(value => {
            resolve(value);
        }).catch(error => {
            reject(error)
        })
    })
}

/**
 * 新增类目，返回新增的对象
 * @param {string} name 
 * @param {number} productId
 * @returns {Promise<Category>}
 */
export function addNewCategory(name, productId) {
    return new Promise((resolve, reject) => {
        ProductAPI.addNewCategory(name, productId).then(value => {
            resolve(value);
        }).catch(error => {
            reject(error)
        })
    })
}

/**
 * 新增素材项
 * @param {string} itemName 
 * @param {number} itemProduct 
 * @param {number[]} [itemCategoryList] 
 * @param {string} itemLink 
 * @param {File} itemMainPic 原图
 * @param {File} thumbMainPic 缩略图
 * @returns 
 */
export function addNewProductItem(itemName, itemProduct, itemCategoryList = [], itemLink, itemMainPic, thumbMainPic) {
    return new Promise((resolve, reject) => {
        const data = new FormData();
        data.append('name', itemName)
        data.append('product', itemProduct)
        // itemCategoryList.forEach(item => { data.append('categories', item) })
        data.append('categories', JSON.stringify(itemCategoryList))
        data.append('linkUrl', itemLink)
        data.append('mainPic', itemMainPic, itemMainPic.name)
        data.append('thumbPic', thumbMainPic, thumbMainPic.name)
        ProductAPI.addNewProductItem(data).then(res => {
            resolve(res)
        }).catch(err => {
            reject(err)
        })
    })
}

/**
 * 修改素材项
 * @param {number} id 素材id
 * @param {string} itemName 名称
 * @param {number} itemProduct 产品id
 * @param {number[]} [itemCategoryList] 类目id列表
 * @param {string} itemLink 链接
 * @param {File} itemMainPic 原图
 * @param {File} thumbMainPic 缩略图
 * @returns {Promise<{message:string, mainPic:string|null}>}
 */
export function editProductItem(id, itemName, itemProduct, itemCategoryList = [], itemLink, itemMainPic, thumbMainPic) {
    return new Promise((resolve, reject) => {
        const data = new FormData();
        data.append('id', id)
        data.append('name', itemName)
        data.append('product', itemProduct)
        // itemCategoryList.forEach(item => { data.append('categories', item) })
        data.append('categories', JSON.stringify(itemCategoryList))
        data.append('linkUrl', itemLink)
        if (itemMainPic) {  // 有图传图，没图不传
            data.append('mainPic', itemMainPic, itemMainPic.name)
            if (thumbMainPic)
                data.append('thumbPic', thumbMainPic, thumbMainPic.name)
        }
        ProductAPI.updateProductItem(data).then(res => {
            if (res && res.mainPic)
                res.mainPic = ProductAPI.getFileRemotePath(res.mainPic);
            console.log(res)
            resolve(res)
        }).catch(err => {
            reject(err)
        })
    })
}

/**
 * 修改类目列表
 * @param {Category[]} list 
 * @returns {Promise<string>} 结果信息
 */
export function saveCategoryListModify(list) {
    return new Promise((resolve, reject) => {
        if (!list) {
            reject('缺少必要参数')
            return;
        }
        ProductAPI.updateCategoryList(list).then(res => {
            console.log(res)
            resolve(res)
        }).catch(err => {
            reject(err)
        })
    })
}

/**
 * 登录
 * @param {string} name 
 * @param {string} password 
 * @returns 
 */
export function login(name, password) {
    return new Promise((resolve, reject) => {
        if (name && password != undefined && password != '') {
            ProductAPI.login(name, password).then((res) => {
                console.log(res)
                if (res.code == 'EXISTS_TOKEN')
                    resolve('已登录')
                else if (res.code == 'NEW_TOKEN')
                    resolve('登录成功')
                else
                    resolve('登录成功')
            }).catch((err) => {
                reject(err)
            })
        } else
            reject('用户名和密码不能为空')

    })

}

/**
 * 修改密码
 * @param {string} name 
 * @param {string} oldPwd 
 * @param {string} newPwd 
 */
export function changePassword(name, oldPwd, newPwd) {
    return new Promise((resolve, reject) => {
        ProductAPI.changePwd(name, oldPwd, newPwd).then((result) => {
            resolve(result);
        }).catch((err) => {
            reject(err);
        });
    })
}