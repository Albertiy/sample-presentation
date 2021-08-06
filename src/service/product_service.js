import * as ProductAPI from '../api/product_api_mock';
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

// 当未选择时，id = -1
const defaultCategory = new Category(-1, '全部')

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
                categoryListCache = value // .unshift(defaultCategory); // 添加默认分类
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
 * 获取展示列表
 * @param {number} product 
 * @param {number} category 
 * @param {string} searchString 
 * @returns  {Promise<ProductItem[]>}
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

export function getProductItemById(id) {
    return new Promise((resolve, reject) => {
        ProductAPI.getProductItemById(id).then(value => {
            resolve(value)
        }).catch(error => {
            reject(error)
        })
    });
}

export function addNewProduct(name) {
    return new Promise((resolve, reject) => {
        ProductAPI.addNewProduct(name).then(value => {
            resolve(value);
        }).catch(error => {
            reject(error)
        })
    })
}

export function addNewCategory(name) {
    return new Promise((resolve, reject) => {
        ProductAPI.addNewCategory(name).then(value => {
            resolve(value);
        }).catch(error => {
            reject(error)
        })
    })
}