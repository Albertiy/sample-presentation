import Category from "../model/category";
import Product from "../model/product";
import ProductItem from "../model/product_item";
import ReqBody from "../model/req_body";

import axios from 'axios'

const getProductListUrl = 'api/productlist';
const getCategoryListUrl = 'api/categorylist';
const getProductItemListUrl = 'api/productitemlist';
const getProductItemByIdUrl = 'api/productitem';
const addNewProductUrl = 'api/product';
const addNewCategoryUrl = 'api/category';
const addNewProductItemUrl = 'api/productitem';
const fileUrl = 'api/file';

// 拦截服务器错误
axios.interceptors.response.use((response) => {
    return response;
}, err => {
    console.log('请求错误', err.response)
    return Promise.reject('服务器错误')
})

/**
 * 获取产品列表
 * @returns {Promise<Product[]>}
 */
export function getProductList() {
    return new Promise((resolve, reject) => {
        axios.get(getProductListUrl).then((result) => {
            /** @type {ReqBody} */
            let res = result.data;
            if (res.state) resolve(res.data)
            else reject(res.error)
        }).catch((err) => {
            reject(err)
        });
    })
}

/**
 * 获取类目列表
 * @returns {Promise<Category[]>}
 */
export function getCategoryList() {
    return new Promise((resolve, reject) => {
        axios.get(getCategoryListUrl).then((result) => {
            /** @type {ReqBody} */
            let res = result.data;
            if (res.state) resolve(res.data)
            else reject(res.error)
        }).catch((err) => {
            reject(err)
        });
    })
}

/**
 * 获取产品项列表
 * @param {number} product 产品
 * @param {number} category 类别
 * @param {string} searchString 查询语句
 * @returns {Promise<ProductItem[]>}
 */
export function getProductItemList(product = null, category = null, searchString = null) {
    console.log(`product=${product} category=${category} searchString=${searchString}`)
    return new Promise((resolve, reject) => {
        axios.get(getProductItemListUrl, {
            params: {
                product: product,
                category: category,
                searchString: searchString
            }
        }).then(result => {
            /** @type {ReqBody} */
            let res = result.data;
            if (res.state) {
                let list = res.data;
                resolve(list);
            }
            else reject(res.err);
        }).catch(error => {
            reject(error);
        })
    })
}

/**
 * 根据ID获取产品项
 * @param {number} id 
 * @returns {Promise<ProductItem>}
 */
export function getProductItemById(id) {
    console.log(id)
    return new Promise((resolve, reject) => {
        axios.get(getProductItemByIdUrl, { params: { id: id } }).then(result => {
            /** @type {ReqBody} */
            let res = result.data;
            if (res.state) resolve(res.data)
            else reject(res.error)
        }).catch(err => {
            reject(err)
        })
    })
}

/**
 * 新增产品
 * @param {string} name 产品名称
 * @returns 
 */
export function addNewProduct(name) {
    return new Promise((resolve, reject) => {
        if (name) {
            axios.post(addNewProductUrl, { name: name }).then(result => {
                /** @type {ReqBody} */
                let res = result.data;
                if (res.state) resolve(res.data)
                else reject(res.error)
            }).catch(err => {
                reject(err)
            })
        } else {
            reject('名称不能为空')
        }
    })
}

/**
 * 新增类目
 * @param {string} name 类目名称
 * @returns 
 */
export function addNewCategory(name) {
    return new Promise((resolve, reject) => {
        if (name) {
            axios.post(addNewCategoryUrl, { name: name }).then((result) => {
                /** @type {ReqBody} */
                let res = result.data;
                if (res.state) resolve(res.data)
                else reject(res.error)
            }).catch((err) => {
                reject(err)
            });
        }
    })
}

/**
 * 添加新素材项
 * @param {FormData} formData 
 * @returns 
 */
export function addNewProductItem(formData) {
    console.log(formData)
    return new Promise((resolve, reject) => {
        axios.post(addNewProductItemUrl, formData).then((result) => {
            /** @type {ReqBody} */
            let res = result.data;
            if (res.state) resolve(res.data)
            else reject(res.error)
        }).catch((err) => {
            reject(err)
        });
    })
}

/**
 * 获取拼接后的文件远程路径
 * @param {string} filePath 
 * @param {string} [fileName] 
 * @returns 
 */
export function getFileRemotePath(filePath, fileName = '') {
    filePath = filePath.replace('\\', '/')
    fileName = fileName.replace('\\', '/')
    return `${fileUrl}/${filePath}${fileName != '' ? '/' + fileName : ''}`;
}