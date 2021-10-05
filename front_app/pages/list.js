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
import GlobalSettings from '../src/setting/global';
import styles from "../styles/list.module.css";


/** @type{number} 默认商品id */
const defaultSelectedProductId = null;
/** @type{number} 默认类目id */
const defaultSelectedCategoryId = null;
/** @type{string} 默认搜索字符串 */
const defaultSearchString = null;
/** @type{Product[]} */
const defaultProductList = [];
/** @type{Category[]} */
const defaultCategoryList = [];
/** @type{ProductItem[]} */
const defaultProductItemList = [];
/** 默认图片路径 */
const defaultImgSrc = '/img/placeholder.jpg';
const defaultShowLoading = false;
const defaultRouterTime = 0;


export default function ListPage() {
    const router = useRouter();
    const [routerTime, setRouterTime] = useState(defaultRouterTime);  // 第一次的路由参数总是为{}，被舍弃
    const [selectedProductId, setSelectedProductId] = useState(defaultSelectedProductId);
    const [selectedCategoryId, setSelectedCategoryId] = useState(defaultSelectedCategoryId);
    const [searchString, setSearchString] = useState(defaultSearchString);
    const [productList, setProductList] = useState(defaultProductList);
    const [categoryList, setCategoryList] = useState(defaultCategoryList);
    const [productItemList, setProductItemList] = useState(defaultProductItemList);
    const [showLoading, setShowLoading] = useState(defaultShowLoading);

    // 用于保存路由参数，使用一次就置null
    const routerProduct = useRef(null);
    const routerCategory = useRef(null);
    const routerSearchString = useRef(null);
    const routerOnly = useRef(null);

    // 滚动组件的锚点元素
    const scrollToTopAnchor = useRef(null);

    /** 初始化，此时路由参数仍然为空，finally时也为空 */
    // useEffect(() => {
    //     init();
    // }, [])  // [] 只执行一次

    /** 待路由参数加载后再初始化 */
    useEffect(() => {
        setRouterTime(value => {
            console.log('[路由刷新] 第 %d 次：%o', value + 1, router.query)
            // 第0次参数总为空，故以第1次为准
            if (value == 1) {
                setRouterParams();  // 获取路由参数
                init(); // 从获取Product列表开始
            }
            value++;
            return value;
        })
    }, [router.query])  // 用 isReady 一样的

    /** 选中的产品变化。现去除默认选项。 */
    useEffect(() => {
        if (selectedProductId != defaultSelectedProductId) {  // productId 为必要参数
            loadCategoryList()
        }
    }, [selectedProductId])

    /** 选择类目变化 */
    useEffect(() => {
        if (selectedCategoryId != defaultSelectedCategoryId) {
            if (routerCategory.current == null) {
                let query = router.query;
                query.category = selectedCategoryId;
                console.log('[selectedCategoryId] 更新路由: %o', query);
                router.replace({ pathname: '/list', query: query }, null, { shallow: true });
            }
            // 防止页面初始化时重复查询的解决方法。
            // 因为页面初始化一定会给searchString更新非null值，从而导致查询
            if (searchString != defaultSearchString) {
                loadProductItemList();
            }
        }
    }, [selectedCategoryId])

    /** 查询语句变化 */
    useEffect(() => {
        if (searchString != defaultSearchString) {
            if (!routerSearchString.current) {
                let query = router.query;
                query.searchString = searchString;
                console.log('[searchString] 更新路由: %o', query);
                router.replace({ pathname: '/list', query: query }, null, { shallow: true });
            }
            loadProductItemList();
        }
    }, [searchString])

    /**
     * 从路由获取查询参数。使用 ref 保存值
     */
    function setRouterParams() {
        let { product, category, searchString: search, only } = router.query;
        if (product) {
            try {
                product = parseInt(product);
                routerProduct.current = product;
            } catch (e) { console.log('无效的查询参数：product'); product = null; }
        }
        if (category) {
            try {
                category = parseInt(category);
                routerCategory.current = category;
            } catch (e) { console.log('category'); category = null; }
        }
        if (search && search.trim() != '') {
            search = search.trim();
            routerSearchString.current = search;
        }
        if (only !== undefined) {
            routerOnly.current = true;
        }
        console.log('[router params] product: %o', routerProduct.current)
        console.log('[router params] category: %o', routerCategory.current)
        console.log('[router params] searchString: %o', routerSearchString.current)
        console.log('[router params] only: %o', routerOnly.current)
    }

    /**
     * 初始化
     */
    function init() {
        console.log('[init]')
        loadProductList()
    }

    /**
     * 获取商品列表，并设置选中的商品id
     */
    function loadProductList() {
        console.log('[商品列表] 请求: ')
        ProductService.getProductList().then(res => {
            console.log('[商品列表]: 结果：%o', res)
            if (res.length > 0) {
                /** @type{Product} 默认选中的商品对象 */
                let targetProduct = null;
                console.log('[routerProduct]: %d', routerProduct.current)
                if (routerProduct.current) {
                    targetProduct = res.find((val, idx, list) => val.id == routerProduct.current);
                }
                targetProduct = targetProduct ? targetProduct : res[0];
                console.log('[targetProduct]: %o', targetProduct);

                // 当有only参数，product列表只能保留一项：选中项（如果有）或者第一项。
                console.log('[routerOnly]: %o', routerOnly.current)
                if (routerOnly.current) {
                    setProductList([targetProduct]);
                } else {
                    setProductList(res);
                }
                // 当前选中商品使用路由参数指定的id，若不存在，且尚未初始化，使用第一项的id
                if (routerProduct.current != null) {
                    setSelectedProductId(value => {
                        let p = targetProduct.id;
                        routerProduct.current = null;
                        return p;
                    })
                } else if (selectedProductId == defaultSelectedProductId) {
                    setSelectedProductId(value => {
                        return res[0].id;
                    })
                }
            }
        }).catch(err => { console.log(err) });
    }

    /**
     * 获取类目列表，并设置搜索字符串
     */
    function loadCategoryList() {
        // 若保存的路由参数为空，说明参数已被使用，可以修改路由参数
        if (!routerProduct.current) {
            let query = router.query;
            query.product = selectedProductId;
            // 当前参数写入URL
            router.replace({ pathname: '/list', query: query }, null, { shallow: true });
        }
        console.log('[分类列表]: 请求: product=%o', selectedProductId)
        // 1.加载分类列表
        ProductService.getCategoryList(selectedProductId).then(res => {
            // 添加一个全部item
            // if (res && ((res.length > 0 && res[0].id != defaultCategory) || res.length == 0)) {
            //     res.unshift(new Category(defaultCategory, '全部')) }
            console.log('[分类列表]: product=%o 结果: %o', selectedProductId, res)
            setCategoryList(res);
            // 若路由参数尚未使用，使用并抹除路由参数; 否则若当前选中的分类为空或不在列表中，则重置选中的分类为第一项
            if (routerCategory.current != null
                && res.findIndex(item => item.id == routerCategory.current) != -1) {
                setSelectedCategoryId(value => {
                    console.log('[routerCategory]: %o', routerCategory.current);
                    let c = routerCategory.current;
                    routerCategory.current = null;
                    return c;
                })
            } else if (selectedCategoryId == defaultSelectedCategoryId
                || res.findIndex(item => item.id == selectedCategoryId) == -1) {
                console.log('在此商品下未找到对应分类，重置选中的分类')
                if (res.length > 0)
                    setSelectedCategoryId(value => { return res[0].id });
            }
            // 若searchString路由参数不为空，则初始化并废弃searchString路由参数
            if (routerSearchString.current != null) {
                setSearchString(value => {
                    let s = routerSearchString.current;
                    routerSearchString.current = null;
                    return s;
                })
            } else if (searchString == defaultSearchString) {
                setSearchString(value => '')
            }
        }).catch(err => { console.log(err) });
        //// 2.加载商品目录。这里浪费了性能，因为若selectedCategory改变，还会触发一次请求。但同步太难了，只能先这样。
        //// loadProductItemList();
    }

    /**
     * 加载商品项列表
     */
    function loadProductItemList() {
        let p = selectedProductId;
        let c = selectedCategoryId == defaultSelectedCategoryId ? null : selectedCategoryId;
        let s = searchString && searchString.trim() != '' ? searchString.trim() : null;
        if (p) {    // product 为必要参数
            console.log('[商品项列表] 请求: product=%o category=%o searchString=%o', p, c, s)
            setShowLoading(true)
            ProductService.getProductItemList(p, c, s).then(res => {
                console.log('[商品项列表] product=%o category=%o searchString=%o : 结果: %o', p, c, s, res);
                setProductItemList(res);
                setShowLoading(false);
            }).catch(err => { console.log(err) });
        }
    }

    /**
     * 点击商品项，跳转详情页
     * @param {ProductItem} item 
     */
    function itemClicked(item) {
        console.log('itemClicked: %o', item)
        window.open('/detail?id=' + item.id, '_self')
    }

    /**
     * 点击图片右上角的链接按钮。this 无效。
     * @param {ProductItem} item 
     */
    function linkBtnClicked(item) {
        console.log('linkBtnClicked: %o', item)
        if (item.linkUrl) {
            // 检查是否包含协议头，若无可能被前端服务器识别为内部地址。
            if (!item.linkUrl.startsWith('http://') && !item.linkUrl.startsWith('https://'))
                window.open('http://' + item.linkUrl, '_blank')
            else
                window.open(item.linkUrl, '_blank')
        }
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>{GlobalSettings.siteTitle('素材列表')}</title>
                <link rel="icon" href="/img/sirwhiston.ico" />
                {/* picturex64.png */}
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
                        <HorizontalScrollNav items={categoryList} defaultValue={selectedCategoryId} valueProp={'id'} displayProp={'name'} onChange={(value, item) => {
                            console.log('Category Navbar onChange: ' + value);
                            setSelectedCategoryId(value);
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
                                        {item.linkUrl && <div className={styles.link_btn} onClick={linkBtnClicked.bind(this, item)}><Icon path={mdiLinkVariant}></Icon></div>}
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
            {/* 回到顶部 */}
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