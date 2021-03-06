import { mdiImageSizeSelectActual } from '@mdi/js'
import Icon from '@mdi/react'
import Compressor from 'compressorjs'
import { Box, Button, FileInput, Grommet, Image, Select, TextInput } from 'grommet'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import { useEffect, useRef, useState } from 'react'
import authenticatedRoute from '../src/component/AuthenticatedRoute/index'
import ModelLoading from '../src/component/model_loading'
import Category from '../src/model/category'
import Product from '../src/model/product'
import ProductItem from '../src/model/product_item'
import * as ProductService from '../src/service/product_service'
import GlobalSettings from '../src/setting/global'
import theme from '../src/setting/grommet-theme.json'
import * as Tools from '../src/tool/tools'
import styles from '../styles/edit.module.css'


/** 路由参数刷新计数，第2次可获取query值 */
const defaultRouterTime = 0;

/** @type{Product[]} 产品列表 */
const defaultProductList = [];
/** @type{Category[]} 类目列表 */
const defaultCategoryList = [];

/** @type{number} */
const defaultId = null;
const defaultItemName = '';
const defaultItemLink = '';
/** @type{number} 占位，防止 Select 报错 */
const defaultItemProductId = -1;
/** @type{number[]} */
const defaultItemCategoryList = [];
/** @type{File} */
const defaultItemMainPic = null;
/** @type{File} */
const defaultThumbMainPic = null;
const defaultPreviewSrc = '';
const defaultPreviewOldSrc = '';

const defaultErrorInfo = null;
const defaultShowLoading = false;

const THUMB = '?thumb=1';

function EditPage() {
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
    const [itemProductId, setItemProductId] = useState(defaultItemProductId)
    const [itemCategoryList, setItemCategoryList] = useState(defaultItemCategoryList)
    const [itemMainPic, setItemMainPic] = useState(defaultItemMainPic)
    const [thumbMainPic, setThumbMainPic] = useState(defaultThumbMainPic)   // 缩略图
    const [previewSrc, setPreviewSrc] = useState(defaultPreviewSrc)
    const [previewOldSrc, setPrivewOldSrc] = useState(defaultPreviewOldSrc)    // 保存目前素材主图的远程地址
    const [showLoading, setShowLoading] = useState(defaultShowLoading)  // loading组件

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    // const fileInputEl = useRef(null);   // 绑定FileInput元素

    /** 初始化列表 */
    useEffect(() => {
        console.log('[商品列表] 请求:')
        ProductService.getProductList().then(value => {
            console.log('[商品列表] 结果: %o', value)
            setProductList(value)
            // if (value.length > 0)
            //     setItemProductId(v => v != defaultItemProductId ? v : value[0].id)
        }).catch(error => {
            console.log(error)
            enqueueSnackbar('' + error, { variant: 'error', autoHideDuration: 2000 })
        })
    }, [])

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
        if (id != defaultId) {
            console.log('[商品项] id: %o 请求: ', id)
            ProductService.getProductItemById(id).then(val => {
                console.log('[商品项] id: %o 结果: %o', id, val)
                setItemName(val.name)   // 字符串
                setItemLink(val.linkUrl)    // 字符串
                setItemProductId(val.productId)   // number
                setItemCategoryList(val.categoryList)   // number数组
                setPrivewOldSrc(val.mainPic + THUMB)  // 是一串远程链接字符串，添加缩略图标记
            }).catch(err => {
                console.log(err)
                enqueueSnackbar(err)
            });
        }
    }, [id])

    /** 加载类目列表 */
    useEffect(() => {
        if (itemProductId != defaultItemProductId) {
            console.log('[类目列表] 请求: itemProductId: %o', itemProductId)
            ProductService.getCategoryList(itemProductId).then(value => {
                console.log('[类目列表] 结果: %o', value)
                setCategoryList(value)
            }).catch(error => {
                console.log(error)
                enqueueSnackbar('' + error, { variant: 'error', autoHideDuration: 2000 })
            })
        }
    }, [itemProductId])

    // categoryList 改变时，检查已选择类目是否有不符合的。由于延迟可能导致将 itemCategoryList清空
    useEffect(() => {
        if (itemCategoryList && categoryList != defaultCategoryList && categoryList.length > 0) {
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

    /** 点击添加商品 */
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
        if (itemProductId == defaultItemProductId) {
            enqueueSnackbar('需要选择产品大类', { autoHideDuration: 2000, variant: 'warning' })
        }
        else if (!(newCategory && newCategory.trim().length > 0)) {
            enqueueSnackbar('请填写类别名称', { autoHideDuration: 2000, variant: 'warning' })
        } else {
            setShowLoading(true)
            ProductService.addNewCategory(newCategory.trim(), itemProductId).then(res => {
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

    /** 点击保存更改按钮 */
    function editItemClicked(e) {
        if (!id) {
            enqueueSnackbar('无效的商品项id，请回到管理页重新点击编辑按钮', { autoHideDuration: 2000, variant: 'warning' })
        } else if (!itemName) {
            enqueueSnackbar('名称不能为空', { autoHideDuration: 2000, variant: 'warning' })
            // } else if (!itemLink) {

        } else if (!itemProductId) {
            enqueueSnackbar('产品大类不能为空', { autoHideDuration: 2000, variant: 'warning' })
        } else if (!itemCategoryList.length) {
            enqueueSnackbar('请至少选择一个类别', { autoHideDuration: 2000, variant: 'warning' })
        } else {  // 图片若未选择新文件，则不提交
            setShowLoading(true)
            ProductService.editProductItem(id, itemName, itemProductId, itemCategoryList, itemLink, itemMainPic, thumbMainPic).then(res => {
                if (res.mainPic) {  // 文件更新
                    setPrivewOldSrc(res.mainPic + THUMB)    // 更新state
                    setItemMainPic(defaultItemMainPic)      // 更新主图
                    setThumbMainPic(defaultThumbMainPic)    // 移除缩略图
                    // console.log('%o', fileInputEl.current);
                    // if (fileInputEl.current) {  // 即使清空target的value或files值，也不能去掉它的文件名，除非...
                    //     /** @type{HTMLInputElement} */
                    //     let fi = fileInputEl.current;
                    //     fi.files = null;
                    //     console.log('%o', fileInputEl.current);
                    // }
                }
                enqueueSnackbar('' + res.message, { autoHideDuration: 2000, variant: 'success' })
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
                <title>{GlobalSettings.siteTitle('修改素材')}</title>
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
                                {/* 需要注意 id 不能为空。这里的value是值而不是对象，所以需要 valueKey={'id'} ，还需要 valueLabel 来手动显示value的label 还是不用吧*/}
                                <Select options={productList} labelKey={'name'} valueKey={'id'}
                                    value={productList.find(pl => pl.id == itemProductId)}
                                    onChange={
                                        ({ option, value, selected }) => {
                                            console.log('value: %o', value)
                                            setItemProductId(value.id)
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
                                {/* 没办法，算了吧 renderFile={(file) => (<span>{itemMainPic && itemMainPic.name}</span>)}； ref={fileInputEl} 不行； value 也没办法 */}
                                <FileInput messages={{
                                    browse: "选择", dropPrompt: "拖动文件到此处，或者点击", dropPromptMultiple: "拖动文件到此处，或者点击",
                                    files: "文件", remove: "移除", remove: "全部移除"
                                }} multiple={false} accept={Tools.imageFileTypes} onChange={fileChanged} ></FileInput>
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
        </Grommet>
    );
}


export default authenticatedRoute(EditPage, { pathAfterFailure: '/login' });