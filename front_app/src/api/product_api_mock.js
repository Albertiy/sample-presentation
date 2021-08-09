import Category from "../model/category";
import Product from "../model/product";
import ProductItem from "../model/product_item";

let productList = [
    new Product(1, '易拉宝'),
    new Product(2, '不锈钢广告牌'),
    new Product(3, '巴拉巴拉'),
    new Product(4, '咕叽咕叽'),
];

let categoryList = [
    new Category(1, '招牌'),
    new Category(2, '美食'),
    new Category(3, '培训'),
    new Category(4, '婚庆', 2),
    new Category(5, '开业'),
    new Category(6, '房地产'),
    new Category(7, '金榜提名'),
    new Category(8, '节日'),
    new Category(9, '演出'),
];

let productItemList = [
    new ProductItem(1, '圣诞快乐1', 1, 'www.baidu.com', '/img/merryChristmas.png', [8]),
    new ProductItem(2, '春节快乐2fdsa fdsa fdsaf ds fdsf', 1, 'www.baidu.com', '/img/merryChristmas.png', [7]),
    new ProductItem(3, '节日快乐3', 1, 'www.baidu.com', '/img/merryChristmas.png', [6]),
    new ProductItem(4, '毕业快乐4', 1, 'www.baidu.com', '/img/merryChristmas.png', [5]),
    new ProductItem(5, '周岁快乐5', 1, 'www.baidu.com', '/img/merryChristmas.png', [4]),
    new ProductItem(6, '演出快乐6', 1, 'www.baidu.com', '/img/merryChristmas.png', [3]),
];

/**
 * 
 * @returns {Promise<Product[]>}
 */
export function getProductList() {
    return new Promise((resolve, reject) => {
        resolve(productList);
    })
}

/**
 * 
 * @returns {Promise<Category[]>}
 */
export function getCategoryList() {
    return new Promise((resolve, reject) => {
        resolve(categoryList);
    })
}

/**
 * 
 * @param {number} product 产品
 * @param {number} category 类别
 * @param {string} searchString 查询语句
 * @returns {Promise<ProductItem[]>}
 */
export function getProductItemList(product = null, category = null, searchString = null) {
    console.log(`product=${product} category=${category} searchString=${searchString}`)
    return new Promise((resolve, reject) => {
        if (product == null && category == null && searchString == null) {
            resolve(productItemList);
        } else {
            let temp = productItemList.filter((item, idx, array) => {
                // console.log(`${item.productId} == ${product} ? ${item.productId == product}`);
                // console.log(`${item.categoryList} includes ${category} ? ${item.categoryList.includes(category)}`);
                // console.log(`${item.name} includes ${searchString} ? ${item.name.includes(searchString)}`);
                return (product == undefined || item.productId == product)
                    && (category == undefined || item.categoryList.includes(category))
                    && (searchString == undefined || item.name.includes(searchString))
            });
            resolve(temp);
        }
    })
}

export function getProductItemById(id) {
    // console.log(id)
    return new Promise((resolve, reject) => {
        if (id != null) {
            let res = productItemList.find(item => {
                return item.id == id;
            })
            if (res) resolve(res)
            else reject('未查询到结果')
        } else {
            reject('缺少必要参数')
        }
    })
}

export function addNewProduct(name) {
    return new Promise((resolve, reject) => {
        if (name) {
            if (productList.findIndex(item => item.name == name) != -1)
                reject('产品名重复')
            else {
                let newProduct = new Product(productList.length + 1, name.trim())
                productList.push(newProduct)
                resolve(newProduct)
            }
        }
    })
}

export function addNewCategory(name) {
    return new Promise((resolve, reject) => {
        if (name) {
            if (categoryList.findIndex(item => item.name == name) != -1)
                reject('类别名重复')
            else {
                let newCategory = new Category(categoryList.length + 1, name.trim())
                categoryList.push(newCategory)
                resolve(newCategory)
            }
        }
    })
}

/**
 * 
 * @param {FormData} formData 
 * @returns 
 */
export function addNewProductItem(formData) {
    return new Promise((resolve, reject) => {
        console.log(formData)
        let name = formData.get('name')
        let product = formData.get('product')
        let categories = formData.get('categories')
        let linkUrl = formData.get('linkUrl')
        let mainPic = formData.get('mainPic')
        if (productItemList.findIndex(item => item.name == name) != -1)
            reject('名称重复')
        else {
            let newProductItem = new ProductItem(categoryList.length += 1, name.trim(), product, linkUrl.trim(), mainPic.name, categories)
            productItemList.push(newProductItem)
            resolve('新增成功')
        }
    })
}