import Category from "../model/category";
import Product from "../model/product";
import ProductItem from "../model/product_item";

const productList = [
    new Product(1, '易拉宝'),
    new Product(2, '不锈钢广告牌'),
    new Product(3, '巴拉巴拉')
];

const categoryList = [
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

const productItemList = [
    new ProductItem(1, '圣诞快乐1', 1, 'www.baidu.com', '/img/merryChristmas.png', [8]),
    new ProductItem(2, '春节快乐2', 1, 'www.baidu.com', '/img/merryChristmas.png', [7]),
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
export function getProductItemList(product, category, searchString) {
    return new Promise((resolve, reject) => {
        if (!product && !category && !searchString) {
            resolve(productItemList);
        } else {
            resolve(productItemList.filter((value, idx, array) => {
                return (!product || value.productId == product)
                    && (!category || value.categoryList.includes(category))
                    && (!searchString || value.name.includes(searchString))
            }));
        }
    })
}