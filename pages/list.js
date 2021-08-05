import Head from "next/head";

import styles from "../styles/list.module.css"

import { useState, useEffect } from "react";

import Product from "../src/model/product";
import Category from "../src/model/category";
import ProductItem from "../src/model/product_item";
import * as ProductService from "../src/service/product_service";
import SearchInput from "../src/component/input_search";
import HorizontalScrollNav from "../src/component/nav_horizontal_scroll";
import Icon from "@mdi/react";
import { mdiEmoticonKissOutline } from '@mdi/js';
import InView from "react-intersection-observer";

import { useRouter } from 'next/router';

/** @type{Product[]} */
const defaultProductList = [];
/** @type{Category[]} */
const defaultCategoryList = [];
/** @type{Product} */
const defaultProduct = null;
const defaultCategory = -1;
/** @type{ProductItem[]} */
const defaultProductItemList = [];
const defaultSearchString = '';   // 默认空串

const defaultImgSrc = '/img/picture.png';   // 默认图



export default function List() {
    const [productList, setProductList] = useState(defaultProductList);
    const [categoryList, setCategoryList] = useState(defaultCategoryList);
    const [selectedProduct, setSelectedProduct] = useState(defaultProduct);
    const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
    const [productItemList, setProductItemList] = useState(defaultProductItemList);
    const [searchString, setSearchString] = useState(defaultSearchString);
    const router = useRouter();

    /**
     * 初始化获取产品列表
     */
    function init() {
        ProductService.getProductList().then(res => {
            console.log('初始化产品列表：')
            setProductList(res);
            if (res.length > 0 && selectedProduct == null)
                setSelectedProduct(res[0].id);
        }).catch(err => { console.log(err) });
    }

    /**
     * 加载商品列表
     */
    function loadProductItems() {
        console.log('加载商品列表：')
        let p = selectedProduct;
        let c = selectedCategory == defaultCategory ? null : selectedCategory;
        let s = searchString && searchString.trim() != '' ? searchString.trim() : null;
        ProductService.getProductItemList(p, c, s).then(res => {
            console.log(res);
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
            console.log('加载分类列表：')
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

    /**
     * 
     * @param {ProductItem} item 
     */
    function itemClicked(item) {
        console.log(item)
        // if (router)
        //router.push('/detail', { query: { id: item.id } });
        // else 
        window.open('/detail?id=' + item.id, '_self')
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>素材列表</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <header>
                <div className={styles.pin_navbar_container}>
                    {/* 搜索框，固定上方 */}
                    <div className={styles.pin_navbar}>
                        <SearchInput className={styles.search_input} onChange={value => {
                            console.log(value);
                            setSearchString(value);
                        }} placeholder='搜索素材'></SearchInput>
                    </div>
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
            <main className={styles.main_panel}>
                {/* productItem 列表 */}
                {productItemList && productItemList.length > 0 ? (
                    <section className={styles.item_list_container}>
                        {productItemList.map((item, idx) => {
                            return (
                                <div key={item.id} className={styles.item_container} onClick={itemClicked.bind(this, item)}>
                                    <div className={styles.image_container}>
                                        <InView triggerOnce={true}>
                                            {({ inView, ref, entry }) => (
                                                <img ref={ref} className={styles.main_pic} alt={item.name} src={inView ? item.mainPic : defaultImgSrc}></img>
                                            )}
                                        </InView>
                                    </div>
                                    <div className={styles.item_name}>{item.name}</div>
                                </div>
                            )

                        })}
                    </section>
                ) : (
                    <div className={styles.empty_list}>
                        <Icon path={mdiEmoticonKissOutline} size={2}></Icon>
                        <div>{`没有查询到结果，换条件个再试试吧`}</div>
                    </div>
                )}

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