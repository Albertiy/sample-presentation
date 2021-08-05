import Head from "next/head";

import styles from "../styles/list.module.css"

import { useState, useEffect } from "react";

import Product from "../src/model/product";
import Category from "../src/model/category";
import * as ProductService from "../src/service/product_service";
import SearchInput from "../src/component/input_search";
import HorizontalScrollNav from "../src/component/nav_horizontal_scroll";

const defaultCategory = -1;

export default function List() {
    const [productList, setProductList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(defaultCategory); // 默认 -1，表示全部类型
    const [productItemList, setProductItemList] = useState([]);
    const [searchString, setSearchString] = useState('');   // 默认空串

    /**
     * 初始化获取产品列表
     */
    function init() {
        ProductService.getProductList().then(res => {
            setProductList(res);
            if (res.length > 0 && selectedProduct == null)
                setSelectedProduct(res[0].id);
        }).catch(err => { console.log(err) });
    }

    /**
     * 加载商品列表
     */
    function loadProductItems() {
        console.log('加载商品里列表')
        let p = selectedProduct;
        let c = selectedCategory == defaultCategory ? null : selectedCategory;
        let s = searchString && searchString.trim() != '' ? searchString.trim() : null;
        ProductService.getProductItemList(p, c, s).then(res => {
            setProductItemList(res);
        }).catch(err => { console.log(err) });
    }

    // 初始化
    useEffect(() => {
        init();
    }, [])  // [] 只执行一次

    // 选中的产品变化
    useEffect(() => {
        // 1.加载分类列表
        ProductService.getCategoryList(selectedProduct).then(res => {
            if (res && ((res.length > 0 && res[0].id != defaultCategory) || res.length == 0)) {
                res.unshift(new Category(-1, '全部'))   // 添加一个全部item
            }
            setCategoryList(res);
            // 若当前选中的分类不在列表中，则重置选中的分类
            if (res.findIndex(item => item.id == selectedCategory) == -1) {  // 联动
                console.log('在此商品下未找到对应分类，重置选中的分类')
                setSelectedCategory(defaultCategory);
            }
        }).catch(err => { console.log(err) });
        // 2.加载商品目录
        loadProductItems();
    }, [selectedProduct])

    // 选中的分类变化，或者查询语句变化时
    useEffect(() => {
        // 加载商品目录
        loadProductItems();
    }, [selectedCategory, searchString])

    return (
        <div className={styles.container}>
            <Head>
                <title>素材列表</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <header>
                {/* 搜索框，固定上方 */}
                <div className={styles.pin_navbar}>
                    <SearchInput className={styles.search_input} onChange={value => {
                        console.log(value);
                        setSearchString(value);
                    }}></SearchInput>
                </div>
                <div>
                    {/* product 列表 */}
                    <div className={styles.nav_list}>
                        <HorizontalScrollNav items={productList} defaultValue={selectedProduct} valueProp={'id'} displayProp={'name'} onChange={(value, item) => {
                            console.log('Product Navbar onChange: ' + value);
                            setSelectedProduct(value);
                        }} itemStyle={{ fontSize: '0.8rem' }} />
                    </div>
                    {/* category 列表 */}
                    <div className={[styles.nav_list, styles.nav_list_shadow].join(' ')}>
                        <HorizontalScrollNav items={categoryList} defaultValue={selectedCategory} valueProp={'id'} displayProp={'name'} onChange={(value, item) => {
                            console.log('Category Navbar onChange: ' + value);
                            setSelectedCategory(value);
                        }} itemStyle={{ fontSize: '0.8rem' }} />
                    </div>
                </div>
            </header>
            <main className='main-panel'>
                {/* productItem 列表 */}
                <section>
                    <ul>
                        <li></li>
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
        </div >
    );
}