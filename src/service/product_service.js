import * as ProductAPI from '../api/product_api_mock'

const cacheDelay = 3000;

let productListCache = [];
let productListCacheUpdatedTime = null;     // 缓存上次更新时间
let categoryListCache = [];
let categoryListCacheUpdatedTime = null;    // 缓存上次更新时间

/**
 * 获取产品列表
 * @returns 
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
 * 获取分类列表
 * @returns 
 */
export function getCategoryList() {
    return new Promise((resolve, reject) => {
        let now = new Date().getTime();
        if (!categoryListCacheUpdatedTime || (now - categoryListCacheUpdatedTime) / cacheDelay > 1)
            ProductAPI.getCategoryList().then(value => {
                categoryListCache = value;
                categoryListCacheUpdatedTime = now;
                resolve(value);
            }).catch(error => {
                reject(error);
            })
        else
            resolve(categoryListCache);
    });
}

/**
 * 获取展示列表
 * @param {number} product 
 * @param {number} category 
 * @param {string} searchString 
 * @returns 
 */
export function getProductItemList(product, category, searchString) {
    return new Promise((resolve, reject) => {
        ProductAPI.getProductItemList(product, category, searchString).then(value => {
            resolve(value);
        }).catch(error => {
            reject(error);
        })
    });
}