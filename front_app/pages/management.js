import Head from 'next/head'

import styles from '../styles/management.module.css'

import { useState, useEffect } from "react";
import { useRouter } from 'next/router'

import Product from "../src/model/product";
import Category from "../src/model/category";
import ProductItem from "../src/model/product_item";
import * as ProductService from "../src/service/product_service";

import Icon from "@mdi/react";
import { mdiShapeSquarePlus, mdiPageNextOutline, mdiSquareEditOutline, mdiOpenInNew, mdiMenuOpen, mdiShieldAccount } from '@mdi/js';

import dayjs from 'dayjs'
import { Space } from 'antd';
import { Table as AntTable } from 'antd';
import { Button, TextInput, FileInput, Select, Image, Box, Grommet } from 'grommet'
import theme from '../src/setting/grommet-theme.json'
import { useSnackbar } from 'notistack';
import ModelLoading from '../src/component/model_loading'
import InView from "react-intersection-observer";

import authenticatedRoute from '../src/component/AuthenticatedRoute/index'
import GlobalSettings from '../src/setting/global';

/** @type{Product[]} */
const defaultProductList = [];
/** @type{Category[]} */
const defaultCategoryList = [];
/** @type{Product} */
const defaultProduct = new Product(-1, '未选择');
/** @type{Category} 因为用了Select，所以value是对象而不是值 */
const defaultCategory = new Category(-1, '未选择');
/** @type{ProductItem[]} */
const defaultProductItemList = [];
const defaultSearchString = '';   // 默认空串
const defaultIsLoading = false;

const defaultImgSrc = '/img/placeholder.jpg';   // 默认图


function Management() {
    const [productList, setProductList] = useState(defaultProductList);
    const [categoryList, setCategoryList] = useState(defaultCategoryList);
    const [selectedProduct, setSelectedProduct] = useState(defaultProduct);
    const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
    const [productItemList, setProductItemList] = useState(defaultProductItemList);
    const [searchString, setSearchString] = useState(defaultSearchString);
    const [isLoading, setIsLoading] = useState(defaultIsLoading);

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const router = useRouter();

    /**
     * 初始化获取产品列表
     */
    function init() {
        ProductService.getProductList().then(res => {
            console.log('初始化产品列表：%o', res);
            setProductList(res);
            if (res.length > 0 && (!selectedProduct || selectedProduct.id == defaultProduct.id))
                setSelectedProduct(res[0]);
        }).catch(err => { console.log(err) });
    }

    /**
     * 加载素材项列表
     */
    function loadProductItems() {
        setIsLoading(true);
        let p = (selectedProduct && selectedProduct.id != defaultProduct.id) ? selectedProduct.id : null;
        let c = (selectedCategory && selectedCategory.id != defaultCategory.id) ? selectedCategory.id : null;
        let s = searchString && searchString.trim() != '' ? searchString.trim() : null;
        ProductService.getProductItemList(p, c, s).then(res => {
            console.log('加载素材项列表：%o', res);
            setProductItemList(res);
        }).catch(err => { console.log(err) }).finally(() => {
            setIsLoading(false);
        });
    }

    // 初始化
    useEffect(() => {
        init();
    }, [])  // [] 只执行一次

    // 选中的产品变化
    useEffect(() => {
        // 1.加载分类列表
        ProductService.getCategoryList(selectedProduct.id).then(res => {
            if (res && ((res.length > 0 && res[0].id != defaultCategory.id) || res.length == 0)) {
                res.unshift(defaultCategory)   // 添加一个全部item
            }
            console.log('加载分类列表：%o', res)
            setCategoryList(res);
            // 若当前选中的分类不在列表中，则重置选中的分类
            if (res.findIndex(item => item.id == selectedCategory.id) == -1) {  // 联动
                console.log('当前产品下无选择的类目，重置类目')
                setSelectedCategory(defaultCategory);
            } else {
                // 2.加载商品目录
                loadProductItems();
            }
        }).catch(err => { console.log(err) });
    }, [selectedProduct])

    // 选中的分类变化，或者查询语句变化时
    useEffect(() => {
        // 加载商品目录
        loadProductItems();
    }, [selectedCategory, searchString])

    function selectedProductChanged({ option, value, selected }) {
        // console.log('selectedProduct now: %o', selectedProduct)
        console.log('selectedProductChanged: %o, %o, %o', option, value, selected)
        setSelectedProduct(option)
    }

    function selectedCategoryChanged({ option, value, selected }) {
        console.log('selectedCategoryChanged: %o', option)
        setSelectedCategory(option)
    }

    /**
     * 
     * @param {ProductItem} item 
     */
    function itemClicked(item) {
        console.log('itemClicked: %o', item)
        // if (router)
        //router.push('/detail', { query: { id: item.id } });
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

    /**
     * 渲染Product名字
     * @param {number} value 
     * @param {ProductItem} row 
     * @param {number} index 
     * @returns 
     */
    function renderProduct(value, row, index) {
        if (productList) {
            let p = productList.find(item => {
                return item.id == value;
            })
            if (p) return p.name;
            else return value;
        }
        return value;
    }

    /**
     * 渲染CategoryList名字
     * @param {number} value 
     * @param {ProductItem} row 
     * @param {number} index 
     * @returns 
     */
    function renderCategoryList(value, row, index) {
        if (value) {
            if (categoryList) {
                let temp = [];
                value.forEach(item => {
                    let c = categoryList.find(cl => cl.id == item)
                    if (c) temp.push(c.name)
                    else temp.push(value)
                })
                return temp.join(',')
            }

        } else
            return ''
    }

    // AntTable 的列信息
    const tableColumns = [
        {
            title: '',
            width: 50,
            align: 'center',
            render: (text, record, index) => `${index + 1}`,
        }, {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 100,
            align: 'center'
        }, {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            align: 'center'
        }, {
            title: '产品',
            dataIndex: 'productId',
            key: 'productId',
            width: 100,
            align: 'center',
            render: renderProduct
        }, {
            title: '类目',
            dataIndex: 'categoryList',
            key: 'categoryList',
            width: 200,
            align: 'center',
            render: renderCategoryList
        }, {
            title: '链接',
            dataIndex: 'linkUrl',
            key: 'linkUrl',
            width: 200,
            align: 'center',
            render: (value, row, index) => {
                let link = (!value.startsWith('http://') && !value.startsWith('https://')) ? 'http://' + value : value;
                return <a href={link} target='_blank'>{'' + value}</a>
            }
        }, {
            title: '图片',
            dataIndex: 'mainPic',
            key: 'mainPic',
            render: (value, row, index) => {
                return (
                    <InView triggerOnce={true}>
                        {({ inView, ref, entry }) => (
                            <img ref={ref} className={styles.image} alt={value} src={inView ? value + '?thumb=1' : defaultImgSrc}></img>
                        )}
                    </InView>)
            },
            width: 100,
            align: 'center'
        }, {
            title: '操作',
            key: 'operation',
            fixed: 'right',
            render: (value, row, index) => {
                return (
                    <div className={styles.button_bar}>
                        <Button className={styles.button_modify} plain title='修改' icon={
                            <Icon path={mdiSquareEditOutline} size={0.85}></Icon>
                        } onClick={() => {
                            // enqueueSnackbar('目前无法编辑', { variant: 'warning', autoHideDuration: 2000 })
                            window.open('/edit?id=' + value.id, '_blank')
                        }}></Button>
                        <Button plain title='展示页' icon={
                            <Icon className={styles.button} path={mdiOpenInNew} size={0.85}></Icon>
                        } onClick={() => { window.open('/detail?id=' + value.id, '_blank') }}></Button>
                    </div>
                )
            },
            width: 150,
            align: 'center',
        }
    ]

    const tablePagination = {
        position: 'bottomRight',
        pageSizeOptions: [10, 20, 50],
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `共 ${total} 项，当前显示 ${range[0]}-${range[1]} 项`,
        locale: {
            items_per_page: " / 页",
            jump_to: "跳转至",
            jump_to_confirm: "确认",
            next_3: "下 3 页",
            next_5: "下 5 页",
            next_page: "下一页",
            Page: "",
            prev_3: "上 3 页",
            prev_5: "上 5 页",
            prev_page: "上一页",
        }
        // 这部分需要状态
        // total: this.state.tableResultCount,
        // current: this.state.tablePageNumber,
        // pageSize: this.state.tableMaxRows,
        // onChange: this.onPaginationChange,   // 已经有了 onTableChange，此项无效
    }


    return (
        <Grommet className={styles.container} theme={theme} >
            <Head>
                <title>{GlobalSettings.siteTitle('素材管理')}</title>
                <link rel="icon" href="/img/picturex64m.png" />
            </Head>
            <header className={styles.header}>
                <div className={styles.filter_row}>
                    <label className={styles.label}>产品大类：</label>
                    {/* 需要注意 id 不能为空 */}
                    <Select multiple={false} options={productList} labelKey={'name'} value={selectedProduct} valueKey={'id'} onChange={selectedProductChanged}></Select>
                </div>
                <div className={styles.filter_row}>
                    <label className={styles.label}>类别：</label>
                    <Select multiple={false} options={categoryList} labelKey={'name'} value={selectedCategory} valueKey={'id'} onChange={selectedCategoryChanged} ></Select>
                </div>
                <div className={styles.header_right}>
                    <div className={styles.filter_row}>
                        <Button primary icon={<Icon path={mdiShieldAccount} size={0.5}></Icon>} label='修改密码' onClick={() => { window.open('/user', '_blank') }}></Button>
                    </div>
                    <div className={styles.filter_row}>
                        <Button primary icon={<Icon path={mdiShapeSquarePlus} size={0.5}></Icon>} label='新增素材' onClick={() => { window.open('/upload', '_blank') }}></Button>
                    </div>
                    <div className={styles.filter_row}>
                        <Button primary icon={<Icon path={mdiMenuOpen} size={0.6}></Icon>} label='类别管理' onClick={() => { window.open('/category', '_blank') }}></Button>
                    </div>
                    <div className={styles.filter_row}>
                        <Button primary icon={<Icon path={mdiPageNextOutline} size={0.5}></Icon>} reverse={true} label='客户展示页' onClick={() => { window.open('/list', '_blank') }}></Button>
                    </div>
                </div>
            </header>

            {/* // TODO: 后端分页以后再说吧 pagination={{
                    ...tablePagination, current: tablePageNumber, pageSize: this.state.tableMaxRows, total: this.state.tableResultCount,
                }}  */}
            {/* 
                // TODO: 页面大小自适应也不搞了，这么短时间搞毛 scroll={{ scrollToFirstRowOnChange: false, x: true, y: tableHeight }} 
                onChange={onTableChange} 
             */}
            <main>
                <AntTable className={styles.main_table} rowKey="id" columns={tableColumns} dataSource={productItemList} loading={isLoading} content
                    pagination={{ ...tablePagination }}></AntTable>
            </main>
            <footer>

            </footer>
            {isLoading && <ModelLoading />}
        </Grommet>
    );
}

export default authenticatedRoute(Management, { pathAfterFailure: '/login' });