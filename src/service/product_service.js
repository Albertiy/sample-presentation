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

/**
 * 获取分类列表，因数据量小，后台不处理，在此过滤。
 * @param {number} [product]
 * @returns  {Promise<Category[]>}
 */
export function getCategoryList(product) {
    return new Promise((resolve, reject) => {
        let now = new Date().getTime();
        if (!categoryListCacheUpdatedTime || (now - categoryListCacheUpdatedTime) / cacheDelay > 1)
            ProductAPI.getCategoryList().then(value => {
                categoryListCache = value;
                categoryListCacheUpdatedTime = now;
                if (product !== null)
                    resolve(value.filter((val) => {
                        return (val.product_id == null || val.product_id == product);
                    }));
                else
                    resolve(value);
            }).catch(error => {
                reject(error);
            })
        else {
            if (product !== null)
                resolve(categoryListCache.filter((val) => {
                    return (val.product_id == null || val.product_id == product);
                }));
            else
                resolve(categoryListCache);
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
            console.log(value);
            resolve(value);
        }).catch(error => {
            reject(error);
        })
    });
}