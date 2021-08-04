import Head from "next/head";

import styles from "../styles/list.module.css"

import { useState, useEffect } from "react";

import Product from "../src/model/product";
import Category from "../src/model/category";
import * as ProductService from "../src/service/product_service";
import SearchInput from "../src/component/input_search";


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

    // 初始化
    useEffect(() => {
        init();
    }, [])  // [] 只执行一次初始化数据

    // 当selectedProduct变化，触发更新
    useEffect(() => {
        ProductService.getCategoryList(selectedProduct).then(val => {
            setCategoryList(val);
        }).catch(err => { console.log(err) });
        ProductService.getProductItemList(selectedProduct, selectedCategory, searchString).then(val => {
            setProductItemList(val);
        }).catch(err => { console.log(err) });
    }, [selectedProduct])

    return (
        <div className={styles.container}>
            <Head>
                <title>素材列表</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <header>
                {/* 搜索框，固定上方 */}
                <div className={styles.pin_navbar}>
                    <SearchInput className={styles.search_input}></SearchInput>
                </div>
                <div>
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
                </div>
            </header>
            <main className='main-panel'>
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
            `}</style>
            {/* 跨子组件样式 */}
            <style jsx global>{`
            `}</style>
        </div>
    );
}