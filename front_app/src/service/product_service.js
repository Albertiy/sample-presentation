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
 * @param {number} [product]
 * @returns  {Promise<Category[]>}
 */
export function getCategoryList(product) {
    return new Promise((resolve, reject) => {
        let now = new Date().getTime();
        let res = [];

        if (!categoryListCacheUpdatedTime || (now - categoryListCacheUpdatedTime) / cacheDelay > 1) {
            ProductAPI.getCategoryList().then(value => {
                categoryListCache = value;
                categoryListCacheUpdatedTime = now;
                if (product !== null)
                    res = value.filter((val) => {
                        return (val.product_id == null || val.product_id == product);
                    });
                else
                    res = value;
                resolve(res);
            }).catch(error => {
                reject(error);
            })
        } else {
            if (product !== null)
                res = categoryListCache.filter((val) => {
                    return (val.product_id == null || val.product_id == product);
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
                console.log('getProductItemById: %o', value)
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
 * @returns {Promise<Category>}
 */
export function addNewCategory(name) {
    return new Promise((resolve, reject) => {
        ProductAPI.addNewCategory(name).then(value => {
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