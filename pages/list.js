import Head from "next/head";


import { useState, useEffect } from "react";

import Product from "../src/model/product";
import Category from "../src/model/category";
import * as ProductService from "../src/service/product_service";


export default function List() {
    const [productList, setProductList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null); // 默认null，表示全部类型
    const [productItemList, setProductItemList] = useState([]);
    const [searchString, setSearchString] = useState('');   // 默认空串

    function init() {
        ProductService.getProductList().then(val => {
            setProductList(val);
            if (val.length > 0 && selectedProduct == null)
                setSelectedProduct(val[0].id);
            console.log(selectedProduct)
        }).catch(err => { console.log(err) });
    }

    useEffect(() => {
        init();
    }, [])  // [] 只执行一次初始化数据

    useEffect(() => {
        ProductService.getCategoryList(selectedProduct).then(val => {
            setCategoryList(val);
        }).catch(err => { console.log(err) });
        ProductService.getProductItemList(selectedProduct, selectedCategory, searchString).then(val => {
            setProductItemList(val);
        }).catch(err => { console.log(err) });
    }, [selectedProduct])

    return (
        <div className='container'>
            <Head>
                <title>素材列表</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <header>
                {/* 搜索框 */}
                <input className='search-input'></input>
                {/* product 列表 */}
                <div className='nav-list'>
                    <ul>
                        <li></li>
                    </ul>
                </div>
                {/* category 列表 */}
                <div className='nav-list'>
                    <ul>
                        <li></li>
                    </ul>
                </div>
            </header>
            <main>
                {/* productItem 列表 */}
                <section>
                    <ul>
                        <li>全部</li>
                    </ul>
                </section>
            </main>
            <footer></footer>
            {/* 组件内部样式 */}
            <style jsx>{`
            .serach-input {
                width: 100%;
            }
            `}</style>
            {/* 跨子组件样式 */}
            <style jsx global>{`

            `}</style>
        </div>
    );
}