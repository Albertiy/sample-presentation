import styles from '../styles/edit.module.css'

import Head from 'next/head'

import Product from '../src/model/product'
import Category from '../src/model/category'
import ProductItem from '../src/model/product_item'

import { useState, useEffect } from 'react'

import * as ProductService from '../src/service/product_service'

import { Button, TextInput, FileInput, Select, Image, Box, Grommet } from 'grommet'

import theme from '../src/setting/grommet-theme.json'

import * as Tools from '../src/tool/tools'

import Icon from '@mdi/react'
import { mdiImageSizeSelectActual } from '@mdi/js';

import { useSnackbar } from 'notistack'
import { useRouter } from 'next/router'

import ModelLoading from '../src/component/model_loading'
import Compressor from 'compressorjs'

/** 路由参数刷新计数，第2次可获取query值 */
const defaultRouterTime = 0;

/** @type{Product[]} 产品列表 */
const defaultProductList = [];
/** @type{Category[]} 类目列表 */
const defaultCategoryList = [];

const defaultItemName = '';
const defaultItemLink = '';
/** @type{number} 占位，防止 Select 报错 */
const defaultItemProduct = -1;
/** @type{number[]} */
const defaultItemCategoryList = [];
/** @type{File} */
const defaultItemMainPic = null;
/** @type{File} */
const defaultThumbMainPic = null;
const defaultPreviewSrc = '';
const defaultPreviewOldSrc = '';
/** @type{number} */
const defaultId = null;
const defaultErrorInfo = null;
const defaultShowLoading = false;

const thumb = '?thumb=1';

export default function Edit() {

    const router = useRouter();
    const [routerTime, setRouterTime] = useState(defaultRouterTime);  // 第一次的路由参数总是为{}，被舍弃

    const [id, setId] = useState(defaultId);
    const [errorInfo, setErrorInfo] = useState(defaultErrorInfo);

    const [productList, setProductList] = useState(defaultProductList)
    const [categoryList, setCategoryList] = useState(defaultCategoryList)

    const [newProduct, setNewProduct] = useState('')
    const [newCategory, setNewCategory] = useState('')

    const [itemName, setItemName] = useState(defaultItemName)
    const [itemLink, setItemLink] = useState(defaultItemLink)
    const [itemProduct, setItemProduct] = useState(defaultItemProduct)
    const [itemCategoryList, setItemCategoryList] = useState(defaultItemCategoryList)
    const [itemMainPic, setItemMainPic] = useState(defaultItemMainPic)
    const [thumbMainPic, setThumbMainPic] = useState(defaultThumbMainPic)   // 缩略图
    const [previewSrc, setPreviewSrc] = useState(defaultPreviewSrc)
    const [previewOldSrc, setPrivewOldSrc] = useState(defaultPreviewOldSrc)    // 保存目前素材主图的远程地址
    const [showLoading, setShowLoading] = useState(defaultShowLoading)  // loading组件

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    /**
     * 从路由参数中获取id
     * @param {*} query 
     */
    function init(query) {
        console.log('初始化')
        if (query && query.id) {
            console.log('query.id：%o', query.id);
            try {
                let i = parseInt(query.id.trim());
                setId(i);
                setErrorInfo(defaultErrorInfo)
            } catch (e) {
                setErrorInfo('无效的素材id')
            }
        } else {
            setErrorInfo('无效的素材id')
        }
    }

    /** 路由初始化 */
    useEffect(() => {
        setRouterTime(value => {
            console.log('路由刷新第 %d 次：%o', value + 1, router.query)
            if (value == 1) {
                init(router.query);
            }
            value++;
            return value;
        })
    }, [router.query])

    /** 根据id加载内容 */
    useEffect(() => {
        if (id != null)
            ProductService.getProductItemById(id).then(val => {
                console.log('根据id获取到素材内容：%o', val)
                setItemName(val.name)   // 字符串
                setItemLink(val.linkUrl)    // 字符串
                setItemProduct(val.productId)   // number
                setItemCategoryList(val.categoryList)   // number数组
                setPrivewOldSrc(val.mainPic + thumb)  // 是一串远程链接字符串，添加缩略图标记
            }).catch(err => {
                console.log(err)
                enqueueSnackbar(err)
            });
    }, [id])

    /** 初始化列表 */
    useEffect(() => {
        ProductService.getProductList().then(value => {
            setProductList(value)
            if (value.length > 0)
                setItemProduct(v => v != defaultItemProduct ? v : value[0])
        }).catch(error => {
            console.log(error)
            enqueueSnackbar('' + error, { variant: 'error', autoHideDuration: 2000 })
        })
    }, [])

    /** 加载类目列表 */
    useEffect(() => {
        ProductService.getCategoryList(itemProduct).then(value => {
            setCategoryList(value)
        }).catch(error => {
            console.log(error)
            enqueueSnackbar('' + error, { variant: 'error', autoHideDuration: 2000 })
        })
    }, [itemProduct])


    // categoryList 改变时，检查已选择类目是否有不符合的。
    useEffect(() => {
        if (itemCategoryList && categoryList) {
            let notFound = [];
            itemCategoryList.map((val, idx) => {
                if (categoryList.findIndex(item => val == item.id) == -1)
                    notFound.push(idx);
            })
            // 倒转数组，从后往前移除元素
            notFound.reverse().forEach(idx => {
                itemCategoryList.splice(idx, 1);
            })
        }

    }, [categoryList])

    /** 选中的图片变化 */
    useEffect(() => {
        if (itemMainPic != defaultItemMainPic) {
            let reader = new FileReader();
            reader.readAsDataURL(itemMainPic)
            reader.onload = function (e) {
                setPreviewSrc(this.result)
            }
        } else {
            setPreviewSrc(defaultPreviewSrc)
        }
    }, [itemMainPic])

    /**
     * 文件选择改变
     * @param {*} e 
     */
    function fileChanged(e) {
        const fileList = e.target.files;
        if (fileList) {
            for (let i = 0; i < fileList.length; i += 1) {
                const file = fileList[i];
                console.log(file)
            }
            let temp = fileList[0];
            if (temp && Tools.validImageType(temp)) {
                setItemMainPic(temp);
                // 压缩一个缩略图
                new Compressor(temp, {
                    quality: 0.85,
                    success: (result) => {
                        setThumbMainPic(result)
                        enqueueSnackbar('图片压缩成功', { variant: 'success', autoHideDuration: 2000 })
                    }, error: (err) => {
                        setThumbMainPic(defaultThumbMainPic)    // 清除上次的压缩图片
                        console.log('err')
                        enqueueSnackbar(err, { variant: 'warning', autoHideDuration: 2000 })
                    },
                    maxWidth: 600,
                    maxHeight: 1200,
                    checkOrientation: false,
                    convertSize: Infinity
                })
            } else {
                enqueueSnackbar('不是有效的图片文件', { autoHideDuration: 2000, variant: 'warning' })
            }
        } else {
            // 清除选择的文件
            setItemMainPic(defaultItemMainPic);
            setThumbMainPic(defaultThumbMainPic);
        }
    }

    /** 点击添加产品 */
    function addProductClicked(e) {
        if (newProduct && newProduct.trim().length > 0) {
            setShowLoading(true)
            ProductService.addNewProduct(newProduct.trim()).then(res => {
                console.log(productList)
                if (productList.findIndex(item => item.id == res.id) == -1) {
                    setProductList(old => {
                        old.push(res)
                        return old;
                    });
                }
                enqueueSnackbar('添加成功', { autoHideDuration: 2000, variant: 'success' })
            }).catch(err => {
                enqueueSnackbar('' + err, { autoHideDuration: 2000, variant: 'error' });
            }).finally(() => {
                setShowLoading(false)
            })
        } else
            enqueueSnackbar('请填写内容', { autoHideDuration: 2000, variant: 'warning' })
    }

    /** 点击添加类目 */
    function addCategoryClicked(e) {
        if (newCategory && newCategory.trim().length > 0) {
            setShowLoading(true)
            ProductService.addNewCategory(newCategory.trim()).then(res => {
                console.log(res)
                setCategoryList(old => {
                    old.push(res);
                    return old;
                })
                enqueueSnackbar('添加成功', { autoHideDuration: 2000, variant: 'success' })
            }).catch(err => {
                enqueueSnackbar('' + err, { autoHideDuration: 2000, variant: 'error' });
            }).finally(() => {
                setShowLoading(false)
            })

        } else
            enqueueSnackbar('请填写内容', { autoHideDuration: 2000, variant: 'warning' })
    }

    /** 点击保存更改按钮 */
    function editItemClicked(e) {
        if (id && itemName && itemLink && itemProduct) {  // 图片若未选择新文件，则不提交
            setShowLoading(true)
            ProductService.editProductItem(id, itemName, itemProduct, itemCategoryList, itemLink, itemMainPic, thumbMainPic).then(res => {
                if (res.mainPic) {  // 文件更新
                    setPrivewOldSrc(res.mainPic + thumb)    // 更新state
                    setItemMainPic(defaultItemMainPic)      // 更新主图
                    setThumbMainPic(defaultThumbMainPic)    // 移除缩略图
                }
                enqueueSnackbar('' + res.message, { autoHideDuration: 2000, variant: 'success' })
            }).catch(err => {
                enqueueSnackbar('' + err, { autoHideDuration: 2000, variant: 'error' })
            }).finally(() => {
                setShowLoading(false)
            })
        } else {
            enqueueSnackbar('请补全信息', { autoHideDuration: 2000, variant: 'warning' })
        }

    }

    return (
        <Grommet className={styles.container} theme={theme}>
            <Head>
                <title>修改素材</title>
                <link rel="icon" href="/img/picturex64e.png" />
            </Head>
            <header className={styles.header_panel}>
                <div className={styles.pin_header}>
                    <span>修改素材</span>
                </div>
            </header>
            {errorInfo ? (<h1>无效的素材id</h1>) :
                (<main className={styles.main_panel}>
                    <div className={styles.left_spark}>
                        <div className={[styles.left_panel, styles.product_panel].join(" ")}>
                            <label>新增产品：</label>
                            <TextInput placeholder='产品名称' maxLength='120' value={newProduct} onChange={e => { setNewProduct(e.target.value) }} />
                            <Button primary label="添加" onClick={addProductClicked} />
                        </div>
                        <div className={[styles.left_panel, styles.category_panel].join(" ")}>
                            <label>新增类别：</label>
                            <TextInput placeholder='类别名称' maxLength='50' value={newCategory} onChange={e => { setNewCategory(e.target.value) }} />
                            <Button primary label="添加" onClick={addCategoryClicked} />
                        </div>
                    </div>
                    <div className={styles.right_spark}>
                        <div className={styles.item_panel}>
                            <div>&nbsp;&nbsp;</div>
                            <div className={styles.form_row}>
                                <label className={styles.label}>名称：</label>
                                <TextInput placeholder="名称" value={itemName} onChange={e => { setItemName(e.target.value) }} size="medium" maxLength='120' />
                            </div>
                            <div className={styles.form_row}>
                                <label className={styles.label}>链接：</label>
                                <TextInput placeholder="链接" value={itemLink} onChange={e => { setItemLink(e.target.value) }} size="medium" maxLength='240' />
                            </div>
                            <div className={styles.form_row}>
                                <label className={styles.label}>产品大类：</label>
                                {/* 需要注意 id 不能为空。这里的value是值而不是对象，所以需要 valueKey={'id'} ，还需要 valueLabel 来手动显示value的label 还是不用吧*/}
                                <Select options={productList} labelKey={'name'} valueKey={'id'}
                                    value={productList.find(pl => pl.id == itemProduct)}
                                    onChange={
                                        ({ option, value, selected }) => {
                                            console.log('value: %o', value)
                                            setItemProduct(value.id)
                                        }}
                                ></Select>
                            </div>
                            <div className={styles.form_row}>
                                <label className={styles.label}>类别：</label>
                                <Select options={categoryList} multiple={true} labelKey={'name'} valueKey={'id'}
                                    value={categoryList.filter(cl => { return itemCategoryList.findIndex(ic => ic == cl.id) != -1 })}
                                    onChange={({ option, value, selected }) => {  // selected是序号
                                        console.log('value: %o', value)
                                        let i = value.map(v => v.id)
                                        console.log(i)
                                        setItemCategoryList(i)
                                    }}
                                    // 尝试设置为空时的占位符，都失败了
                                    messages={{
                                        multiple: categoryList.filter(cl => itemCategoryList.findIndex(ic => ic == cl.id) != -1).map(item => item.name).join(', ')
                                    }}
                                ></Select>
                            </div>
                            {/* itemCategoryList.map(item => item.name).join(', ') */}
                            <div className={styles.form_row}>
                                <label className={styles.label}>图片：</label>
                                {/* // TODO 清除 FileInput中的选项 */}
                                <FileInput messages={{
                                    browse: "选择", dropPrompt: "拖动文件到此处，或者点击", dropPromptMultiple: "拖动文件到此处，或者点击",
                                    files: "文件", remove: "移除", remove: "全部移除"
                                }} multiple={false} accept={Tools.imageFileTypes} onChange={fileChanged}></FileInput>
                            </div>
                            <div className={styles.form_row}>
                                <label className={styles.label}>预览：</label>
                                <Box height='small' width='small' className={styles.image_container}>
                                    {itemMainPic || previewOldSrc ? (
                                        <Image fit='contain' src={previewSrc || previewOldSrc} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                                    ) : (
                                        <Icon path={mdiImageSizeSelectActual} size={1}></Icon>
                                    )}

                                </Box>
                            </div>
                            <div className={styles.form_row}>
                                <Button primary label="保存修改" style={{ width: '100px', alignSelf: 'center' }} onClick={editItemClicked} />
                            </div>
                        </div>
                    </div>
                </main>)
            }
            <footer>
            </footer>
            {showLoading && <ModelLoading />}
        </Grommet >
    );
}