import { mdiEmoticonKissOutline, mdiFormatVerticalAlignTop, mdiLinkBoxVariantOutline, mdiLinkVariant } from '@mdi/js';
import Icon from "@mdi/react";
import Head from "next/head";
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from "react";
import InView from "react-intersection-observer";
import BackToTop from "../src/component/back_to_top";
import SearchInput from "../src/component/input_search";
import ModelLoading from "../src/component/model_loading";
import HorizontalScrollNav from "../src/component/nav_horizontal_scroll";
import Category from "../src/model/category";
import Product from "../src/model/product";
import ProductItem from "../src/model/product_item";
import * as ProductService from "../src/service/product_service";
import styles from "../styles/list.module.css";


/** @type{Product[]} */
const defaultProductList = [];
/** @type{Category[]} */
const defaultCategoryList = [];
/** @type{number} 商品id而不是商品对象 */
const defaultProductId = null;
const defaultCategory = null;   // -1
/** @type{ProductItem[]} */
const defaultProductItemList = [];
const defaultSearchString = null;   // 默认null而不是空串

const defaultImgSrc = '/img/placeholder.jpg';   // 默认图
const defaultShowLoading = false;   // 显示loading
const defaultRouterTime = 0;


export default function List() {
    const router = useRouter();
    const [routerTime, setRouterTime] = useState(defaultRouterTime);  // 第一次的路由参数总是为{}，被舍弃
    const [productList, setProductList] = useState(defaultProductList);
    const [categoryList, setCategoryList] = useState(defaultCategoryList);
    const [selectedProductId, setSelectedProductId] = useState(defaultProductId);
    const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
    const [productItemList, setProductItemList] = useState(defaultProductItemList);
    const [searchString, setSearchString] = useState(defaultSearchString);
    const [showLoading, setShowLoading] = useState(defaultShowLoading);

    // 用于保存路由参数
    const routerProduct = useRef(null);
    const routerCategory = useRef(null);
    const routerSearchString = useRef(null);
    const routerOnly = useRef(null);

    // 滚动组件的锚点元素
    const scrollToTopAnchor = useRef(null);

    /**
     * 获取产品列表
     */
    function loadProductList() {
        console.log('[商品列表] 加载: ')
        ProductService.getProductList().then(res => {
            console.log('[商品列表]: 结果：%o', res)
            if (res.length > 0) {
                let p = null;
                if (routerProduct.current) {
                    console.log('routerProduct: %d', routerProduct.current)
                    p = res.find((val, idx, list) => val.id == routerProduct.current);
                    console.log('p: %o', p);
                }
                console.log('routerOnly: %o', routerOnly.current)

                // 当有only参数，product列表只保留选中项或者第一项
                if (routerOnly.current) {
                    console.log('商品列表只保留一个：')
                    if (p) setProductList([p]);
                    else setProductList(res.slice(0, 1))
                } else {
                    setProductList(res);
                }
                console.log(routerProduct)
                if (routerProduct.current != null) {    // 路由参数
                    setSelectedProductId(value => {
                        console.log('routerProduct: ' + routerProduct.current)
                        let p = routerProduct.current;
                        routerProduct.current = null;
                        return p;
                    })
                } else if (selectedProductId == defaultProductId) { // 若当选中项值初始化，选中第一个商品
                    setSelectedProductId(value => {
                        return res[0].id;
                    })
                }
            }
        }).catch(err => { console.log(err) });
    }

    /**
     * 初始化
     */
    function init() {
        console.log('[init]')
        loadProductList()
    }

    /**
     * 加载商品列表
     */
    function loadProductItems() {
        let p = selectedProductId;
        let c = selectedCategory == defaultCategory ? null : selectedCategory;
        let s = searchString && searchString.trim() != '' ? searchString.trim() : null;
        if (p) {    // product 为必要参数
            console.log('加载商品列表：product=%o category=%o searchString=%o', p, c, s)
            setShowLoading(true)
            ProductService.getProductItemList(p, c, s).then(res => {
                console.log('加载商品列表：product=%o category=%o searchString=%o 结果：%o', p, c, s, res);
                setProductItemList(res);
                setShowLoading(false);
            }).catch(err => { console.log(err) });
        }
    }

    /**
     * 从路由获取查询参数。使用 ref 保存值
     */
    function setRouterParams() {
        let { product, category, searchString: search, only } = router.query;
        // console.log('router product: %o', product)
        // console.log('router category: %o', category)
        // console.log('router searchString: %o', search)
        // console.log('router only: ', only)
        if (product)
            try {
                product = parseInt(product);
                routerProduct.current = product;
            } catch (e) { console.log('无效的查询参数：product'); product = null; }
        if (category)
            try {
                category = parseInt(category);
                routerCategory.current = category;
            } catch (e) { console.log('category'); category = null; }
        if (search && search.trim() != '') {
            search = search.trim();
            routerSearchString.current = search;
        }
        if (only !== undefined) {
            routerOnly.current = true;
        }
        console.log('router product: %o', routerProduct.current)
        console.log('router category: %o', routerCategory.current)
        console.log('router searchString: %o', routerSearchString.current)
        console.log('router only: %o', routerOnly.current)
    }

    // 初始化，此时路由参数仍然为空，finally时也为空
    // useEffect(() => {
    //     init();
    // }, [])  // [] 只执行一次

    useEffect(() => {
        setRouterTime(value => {
            console.log('[路由刷新] 第 %d 次：%o', value + 1, router.query)
            if (value == 1) {
                setRouterParams();  // 获取路由参数
                init(); // 从获取Product列表开始
            }
            value++;
            return value;
        })
    }, [router.query])  // 用 isReady 一样的

    // 选中的产品变化。现去除默认选项。
    useEffect(() => {
        if (selectedProductId != defaultProductId) {  // product为必要参数
            if (!routerProduct.current) {
                let query = router.query;
                query.product = selectedProductId;
                // 参数写入URL
                router.replace({ pathname: '/list', query: query }, null, { shallow: true });
            }
            console.log('加载分类列表：%o', selectedProductId)
            // 1.加载分类列表
            ProductService.getCategoryList(selectedProductId).then(res => {
                // if (res && ((res.length > 0 && res[0].id != defaultCategory) || res.length == 0)) {
                //     res.unshift(new Category(defaultCategory, '全部'))   // 添加一个全部item
                // }
                console.log('加载分类列表：%o 结果: %o', selectedProductId, res)
                setCategoryList(res);
                // 路由参数尚未使用，使用路由参数
                if (routerCategory.current != null && res.findIndex(item => item.id == routerCategory.current) != -1) {
                    setSelectedCategory(value => {
                        console.log(routerCategory.current);
                        let c = routerCategory.current;
                        routerCategory.current = null;
                        return c;
                    })
                }  // 若当前选中的分类为空或不在列表中，则重置选中的分类
                else if (selectedCategory == defaultCategory || res.findIndex(item => item.id == selectedCategory) == -1) {
                    console.log('在此商品下未找到对应分类，重置选中的分类')
                    if (res.length > 0)
                        setSelectedCategory(value => { return res[0].id });
                }
                // 若searchString路由参数不为空，则初始化并废弃searchString路由参数
                if (routerSearchString.current != null) {
                    setSearchString(value => {
                        let s = routerSearchString.current;
                        routerSearchString.current = null;
                        return s;
                    })
                }
            }).catch(err => { console.log(err) });
            // 2.加载商品目录。这里浪费了性能，因为若selectedCategory改变，还会触发一次请求。但同步太难了，只能先这样。
            loadProductItems();
        }
    }, [selectedProductId])

    // 选中的分类变化时。这里有重复查询问题
    useEffect(() => {
        if (selectedCategory != defaultCategory) {
            // if (!routerCategory.current) {
            let query = router.query;
            console.log('[selectedCategory changed!]: %o', query);
            query.category = selectedCategory;
            router.replace({ pathname: '/list', query: query }, null, { shallow: true });
            // }
            loadProductItems();
        }
    }, [selectedCategory])

    //查询语句变化
    useEffect(() => {
        if (searchString != defaultSearchString) {
            if (!routerSearchString.current) {
                let query = router.query;
                query.searchString = searchString;
                router.replace({ pathname: '/list', query: query }, null, { shallow: true });
            }
            loadProductItems();
        }
    }, [searchString])

    /**
     * 
     * @param {ProductItem} item 
     */
    function itemClicked(item) {
        console.log('itemClicked: %o', item)
        // if (router)
        // else 
        window.open('/detail?id=' + item.id, '_self')
    }

    /**
     * 点击图片右上角的链接按钮。this 无效。
     * @param {ProductItem} item 
     */
    function linkBtnClicked(item) {
        console.log('linkBtnClicked: %o', item)
        // 检查是否包含协议头，若无可能被前端服务器识别为内部地址。
        if (!item.linkUrl.startsWith('http://') && !item.linkUrl.startsWith('https://'))
            window.open('http://' + item.linkUrl, '_blank')
        else
            window.open(item.linkUrl, '_blank')
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>素材列表</title>
                <link rel="icon" href="/img/picturex64.png" />
            </Head>
            <header>
                <div id='topbar' className={styles.pin_navbar_container} ref={scrollToTopAnchor}>
                    {/* 搜索框，固定上方 */}
                    <div className={styles.pin_navbar}>
                        <SearchInput className={styles.search_input} defaultValue={searchString} onChange={value => {
                            console.log(value);
                            setSearchString(value);
                        }} placeholder='搜索素材'></SearchInput>
                    </div>
                </div>
                <div>
                    {/* product 列表 */}
                    <div className={styles.nav_list}>
                        <HorizontalScrollNav selectedClassName={styles.product_selected} items={productList} defaultValue={selectedProductId} valueProp={'id'} displayProp={'name'} onChange={(value, item) => {
                            console.log('Product Navbar onChange: ' + value);
                            setSelectedProductId(value);
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
                                <div key={item.id} className={styles.item_container}>
                                    <div className={styles.image_container}>
                                        <div className={styles.link_btn} onClick={linkBtnClicked.bind(this, item)}><Icon path={mdiLinkVariant}></Icon></div>
                                        <InView triggerOnce={true}>
                                            {({ inView, ref, entry }) => (
                                                <img ref={ref} className={styles.main_pic} alt={item.name} src={inView ? item.mainPic + '?thumb=1' : defaultImgSrc} onClick={itemClicked.bind(this, item)}></img>
                                            )}
                                        </InView>
                                    </div>
                                    <div className={styles.item_name} onClick={itemClicked.bind(this, item)}>{item.name}</div>
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
            <footer>
            </footer>
            {/* //TODO 回到顶部 */}
            <BackToTop anchor={scrollToTopAnchor.current} />
            {showLoading && <ModelLoading />}
            {/* 组件内部样式 */}
            <style jsx>{`
            `}</style>
            {/* 跨子组件样式 */}
            <style jsx global>{`
            `}</style>
        </div >
    );
}