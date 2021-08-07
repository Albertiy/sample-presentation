import * as ProductAPI from '../db/product'
import * as CategoryAPI from '../db/category'
import * as ProductItemAPI from '../db/product_item'

export function getProductList() {
    return new Promise((resolve, reject) => {
        ProductAPI.queryAll().then(res => {
            resolve(res)
        }).catch(err => {
            reject(err)
        })
    })
}

export function addNewProduct(name) {
    return new Promise((resolve, reject) => {
        ProductAPI.add(name).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err)
        });
    })
}