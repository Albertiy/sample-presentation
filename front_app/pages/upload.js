import styles from '../styles/upload.module.css'

import Head from 'next/head'

import Product from '../src/model/product'
import Category from '../src/model/category'

import { useState, useEffect } from 'react'

import * as ProductService from '../src/service/product_service'

import { Button, TextInput, FileInput, Select, Image, Box, Grommet } from 'grommet'

import theme from '../src/setting/grommet-theme.json'

import * as Tools from '../src/tool/tools'

import Icon from '@mdi/react'
import { mdiImageSizeSelectActual } from '@mdi/js';

import { useSnackbar } from 'notistack'
import ModelLoading from '../src/component/model_loading'

import Compressor from 'compressorjs'

import authenticatedRoute from '../src/component/AuthenticatedRoute/index';
import GlobalSettings from '../src/setting/global'


/** @type{Product[]} */
const defaultProductList = [];
/** @type{Category[]} */
const defaultCategoryList = [];

const defaultItemName = '';
const defaultItemLink = '';
/** 只是为了占个位，防止 Select 报错 */
const defaultItemProduct = new Product(-1, '未选择');
/** @type{Category[]} */
const defaultItemCategoryList = [];
/** @type{File} */
const defaultItemMainPic = null;
/** @type{File} */
const defaultThumbMainPic = null;
const defaultPrivewSrc = '';
const defaultShowLoading = false;


function UploadPage(props) {

    const [productList, setProductList] = useState(defaultProductList)
    const [categoryList, setCategoryList] = useState(defaultCategoryList)

    const [newProduct, setNewProduct] = useState('')
    const [newCategory, setNewCategory] = useState('')

    const [itemName, setItemName] = useState(defaultItemName)
    const [itemLink, setItemLink] = useState(defaultItemLink)
    const [itemProduct, setItemProduct] = useState(defaultItemProduct)
    const [itemCategoryList, setItemCategoryList] = useState(defaultItemCategoryList)
    const [itemMainPic, setItemMainPic] = useState(defaultItemMainPic)
    const [thumbMainPic, setThumbMainPic] = useState(defaultThumbMainPic)
    const [previewSrc, setPreviewSrc] = useState(defaultPrivewSrc)
    const [showLoading, setShowLoading] = useState(defaultShowLoading)

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    useEffect(() => {
        ProductService.getProductList().then(value => {
            setProductList(value)
            if (value.length > 0)
                setItemProduct(value[0])
        }).catch(error => {
            console.log(error)
            enqueueSnackbar('' + error, { variant: 'error', autoHideDuration: 2000 })
        })
    }, [])

    useEffect(() => {
        ProductService.getCategoryList(itemProduct.id).then(value => {
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
                if (categoryList.findIndex(item => val.id == item.id) == -1)
                    notFound.push(idx);
            })
            // 倒转数组，从后往前移除元素
            notFound.reverse().forEach(idx => {
                itemCategoryList.splice(idx, 1);
            })
        }

    }, [categoryList])

    useEffect(() => {
        if (itemMainPic != defaultItemMainPic) {
            let reader = new FileReader();
            reader.readAsDataURL(itemMainPic)
            reader.onload = function (e) {
                setPreviewSrc(this.result)
            }
        } else {
            setPreviewSrc(defaultPrivewSrc)
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
                // 额外压缩一个缩略图
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
            setItemMainPic(defaultItemMainPic);
        }
    }

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

    /**
     * 点击添加类目
     * @param {*} e 
     */
    function addCategoryClicked(e) {
        if (itemProduct.id == defaultItemProduct.id) {
            enqueueSnackbar('需要选择产品大类', { autoHideDuration: 2000, variant: 'warning' })
        }
        else if (!(newCategory && newCategory.trim().length > 0)) {
            enqueueSnackbar('请填写类别名称', { autoHideDuration: 2000, variant: 'warning' })
        } else {
            setShowLoading(true)
            ProductService.addNewCategory(newCategory.trim(), itemProduct.id).then(res => {
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
        }
    }

    /**
     * 添加新商品项
     * @param {*} e 
     */
    function addItemClicked(e) {
        if (!itemName) {
            enqueueSnackbar('名称不能为空', { autoHideDuration: 2000, variant: 'warning' })
            // } else if (!itemLink) {
        } else if (!itemProduct) {
            enqueueSnackbar('产品大类不能为空', { autoHideDuration: 2000, variant: 'warning' })
        } else if (!itemCategoryList.length) {
            enqueueSnackbar('请至少选择一个类别', { autoHideDuration: 2000, variant: 'warning' })
        } else if (!itemMainPic) {
            enqueueSnackbar('图片不能为空', { autoHideDuration: 2000, variant: 'warning' })
        } else {
            setShowLoading(true)
            let productId = itemProduct.id;
            let categories = [];
            if (itemCategoryList) itemCategoryList.forEach(item => { categories.push(item.id) })
            ProductService.addNewProductItem(itemName, productId, categories, itemLink, itemMainPic, thumbMainPic).then(res => {
                enqueueSnackbar('' + res, { autoHideDuration: 2000, variant: 'success' })
                // 清空部分值
                setItemName('');
                setItemLink('');
            }).catch(err => {
                enqueueSnackbar('' + err, { autoHideDuration: 2000, variant: 'error' })
            }).finally(() => {
                setShowLoading(false)
            })
        }
    }

    return (
        <Grommet className={styles.container} theme={theme}>
            <Head>
                <title>{GlobalSettings.siteTitle('添加素材')}</title>
                <link rel="icon" href="/img/picturex64u.png" />
            </Head>
            <header className={styles.header_panel}>
                <div className={styles.pin_header}>
                    <span>添加素材</span>
                </div>
            </header>
            <main className={styles.main_panel}>
                <div className={styles.left_spark}>
                    <div className={[styles.left_panel, styles.product_panel].join(" ")}>
                        <label>新增产品：</label>
                        <TextInput placeholder='产品名称' maxLength='120' value={newProduct} onChange={e => { setNewProduct(e.target.value) }} />
                        <Button primary label="添加" onClick={addProductClicked} />
                    </div>
                    <div className={[styles.left_panel, styles.category_panel].join(" ")}>
                        <label>在当前选中大类下新增类别：</label>
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
                            {/* 需要注意 id 不能为空 */}
                            <Select options={productList} labelKey={'name'} value={itemProduct} valueKey={'id'} onChange={({ option }) => { setItemProduct(option) }}></Select>
                        </div>
                        <div className={styles.form_row}>
                            <label className={styles.label}>类别：</label>
                            <Select options={categoryList} multiple={true} labelKey={'name'} value={itemCategoryList} valueKey={'id'} onChange={({ option, value, selected }) => {
                                console.log({ option, value, selected })
                                setItemCategoryList(value)
                            }} messages={{ multiple: itemCategoryList.map(item => item.name).join(', ') }} ></Select>
                        </div>
                        <div className={styles.form_row}>
                            <label className={styles.label}>图片：</label>
                            <FileInput messages={{
                                browse: "选择", dropPrompt: "拖动文件到此处，或者点击", dropPromptMultiple: "拖动文件到此处，或者点击",
                                files: "文件",
                                remove: "移除",
                                remove: "全部移除"
                            }} multiple={false} accept={Tools.imageFileTypes} onChange={fileChanged}></FileInput>
                        </div>
                        <div className={styles.form_row}>
                            <label className={styles.label}>预览：</label>
                            <Box height='small' width='small' className={styles.image_container}>
                                {itemMainPic ? (
                                    <Image fit='contain' src={previewSrc} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                                ) : (
                                    <Icon path={mdiImageSizeSelectActual} size={1}></Icon>
                                )}

                            </Box>
                        </div>
                        <div className={styles.form_row}>
                            <Button primary label="添加" style={{ width: '100px', alignSelf: 'center' }} onClick={addItemClicked} />
                        </div>
                    </div>
                </div>
            </main>
            <footer>
            </footer>
            {showLoading && <ModelLoading />}
        </Grommet>
    );
}

export default authenticatedRoute(UploadPage, { pathAfterFailure: '/login' });