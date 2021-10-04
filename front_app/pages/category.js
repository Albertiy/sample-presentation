import { closestCenter, DndContext, DragOverlay, KeyboardSensor, PointerSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { mdiDragHorizontal } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Button, Card, CardBody, FileInput, Grommet, Image, Keyboard, Select, TextInput } from 'grommet';
import Head from 'next/head';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import AlertDialog from '../src/component/alert-dialog';
import authenticatedRoute from '../src/component/AuthenticatedRoute/index';
import CardItem from '../src/component/card_item';
import NoStyleInput from '../src/component/input_nostyle';
import ModelLoading from '../src/component/model_loading';
// import { restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers';
import SortableItem from '../src/component/sortable_item';
import Category from "../src/model/category";
import Product from "../src/model/product";
import * as ProductService from '../src/service/product_service';
import theme from '../src/setting/grommet-theme.json';
import styles from '../styles/category.module.css';


/** @type{Product[]} */
const defaultProductList = [];
/**@type{Category[]} */
const defaultCategoryList = [];
/** @type{Product} */
const defaultProduct = new Product(-1, '未选择');

function CategoryPage() {

    const { enqueueSnackbar } = useSnackbar();

    const [productList, setProductList] = useState(defaultProductList)
    const [categoryList, setCategoryList] = useState(defaultCategoryList)
    const [selectedProduct, setSelectedProduct] = useState(defaultProduct)
    const [newCategory, setNewCategory] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [activeId, setActiveId] = useState(null)
    const [showAlertDialog, setShowAlertDialog] = useState(false)

    /** useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates, }), */
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { delay: 250, tolerance: 5 } }), useSensor(TouchSensor, { activationConstraint: { delay: 250 } }));


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

    function getCategoryListByProductId(productId) {
        ProductService.getCategoryList(productId).then(res => {
            console.log('类目数量: ' + res.length)
            console.log('获取类目列表: productId: %d, 类目：%o', productId, res)
            setCategoryList(res)
        }).catch(err => {
            enqueueSnackbar('获取类目列表失败', { variant: 'error', autoHideDuration: 2000 })
            console.log('获取类目列表失败：' + err)
        })
    }

    /**
     * 下拉框选择的商品发生变化
     * @param {*} param0 
     */
    function selectedProductChanged({ option, value, selected }) {
        console.log('selectedProductChanged: %o, %o, %o', option, value, selected)
        setSelectedProduct(option)
    }

    useEffect(() => {
        init()
        // return () => { }
    }, [])

    useEffect(() => {
        let productId = selectedProduct.id;
        if (productId != defaultProduct.id)
            getCategoryListByProductId(productId)
    }, [selectedProduct])

    /**
     * 新增类目
     * @param {*} e 
     */
    function addCategoryClicked(e) {
        if (!(newCategory && newCategory.trim().length > 0)) {
            enqueueSnackbar('请填写类目名', { autoHideDuration: 2000, variant: 'warning' })
        } else if (!selectedProduct) {
            enqueueSnackbar('清先选择将类目添加到哪个商品中', { autoHideDuration: 2000, variant: 'warning' })
        } else {
            setIsLoading(true)
            ProductService.addNewCategory(newCategory.trim(), selectedProduct.id).then(res => {
                console.log('新增项：' + res)
                setCategoryList(old => {
                    old.push(res);
                    return old;
                })
                enqueueSnackbar('添加成功', { autoHideDuration: 2000, variant: 'success' })
            }).catch(err => {
                enqueueSnackbar('' + err, { autoHideDuration: 2000, variant: 'error' });
            }).finally(() => {
                setIsLoading(false)
            })
        }
    }

    function handleDragStart(event) {
        const { active } = event;
        setActiveId(active.id);
    }

    /**
     * 拖拽结束事件
     * @param {*} event 
     */
    function handleDragEnd(event) {
        const { active, over } = event;
        // console.log('active: %o\n over: %o', active, over)
        if (active.id !== over.id) {
            setCategoryList((items) => {
                const oldIndex = items.findIndex((value) => active.id == value.id);
                const newIndex = items.findIndex((value) => over.id == value.id);
                let newList = arrayMove(items, oldIndex, newIndex);    // dnd-kit 提供的一个数组移动方法
                newList.forEach((val, idx) => {
                    val.order = idx + 1;    // 更新order字段，即使有null此时也没了
                    console.log(val.order, val.id, val.name)
                })
                return newList;
            })
        }
        setActiveId(null)
    }

    /**
     * 点击保存修改按钮
     * @param {*} event 
     */
    function saveChangeClicked(event) {
        console.log(categoryList)
        setShowAlertDialog(true)
    }

    /**
     * 关闭弹窗事件
     * @param {*} res 
     */
    function alertDialogClosed(res) {
        try {
            if (res) saveCategoryListChange();
            else enqueueSnackbar('未保存', { variant: 'info', autoHideDuration: 2000 })

        } finally {
            setShowAlertDialog(false)
        }
    }

    /**
     * 保存
     */
    function saveCategoryListChange() {
        let temp = categoryList.filter(val => !val.name || !val.name.trim());
        if (temp.length > 0)
            enqueueSnackbar('类目名不能为空！', { variant: 'warning', autoHideDuration: 2000 })
        else {
            setIsLoading(true);
            ProductService.saveCategoryListModify(categoryList).then(val => {
                enqueueSnackbar('' + val, { variant: 'success', autoHideDuration: 2000 })
            }).catch(err => {
                enqueueSnackbar('' + err, { variant: 'error', autoHideDuration: 2000 })
            }).finally(() => {
                setIsLoading(false);
            })
        }
    }

    return (
        <Grommet className={styles.container} theme={theme}>
            <Head>
                <title>素材管理 - 类目管理</title>
                <link rel="icon" href="/img/picturex64m.png" />
            </Head>
            <header className={styles.header}>
                <div className={styles.header_row}>
                    <div className={styles.title}>类目管理</div>
                    <Button primary label='保存修改' onClick={saveChangeClicked}></Button>
                </div>
            </header>
            <main className={styles.main}>
                <section className={styles.filter_container}>
                    <div className={styles.filter_row}>
                        <label className={styles.label}>产品大类：</label>
                        <Select multiple={false} options={productList} labelKey={'name'} value={selectedProduct} valueKey={'id'} onChange={selectedProductChanged}></Select>
                    </div>
                    <div className={styles.filter_row}>
                        <label className={styles.label}>新增类目：</label>
                        <TextInput placeholder='类别名称' maxLength='50' value={newCategory} onChange={e => { setNewCategory(e.target.value) }} />
                        <Button primary label="添加" onClick={addCategoryClicked} />
                    </div>
                </section>
                <section className={styles.center_container}>
                    <div className={styles.list_container}>
                        {/* modifiers={[restrictToFirstScrollableAncestor]}  */}
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                            <SortableContext items={categoryList} strategy={verticalListSortingStrategy}>
                                {categoryList.map((item, idx, arr) => (
                                    <SortableItem key={item.id} id={item.id}>
                                        <Card background="light-1" style={item.id == activeId ? { opacity: 0.5 } : {}}>
                                            <div className={styles.list_item}>
                                                <div className={styles.list_item_order}>{item.order ? item.order : '无'}</div>
                                                <NoStyleInput className={styles.list_item_text} placeholder={item.name} defaultValue={item.name} onChange={(ele) => {
                                                    item.name = ele.value.trim();
                                                }}></NoStyleInput>
                                                <div className={styles.list_item_icon}>
                                                    <Icon path={mdiDragHorizontal} size={0.6}></Icon>
                                                </div>
                                            </div>
                                        </Card>
                                    </SortableItem>
                                ))}
                            </SortableContext>
                            <DragOverlay>
                                {/* style={activeId ? { transform: 'scale(1.1)' } : {}} */}
                                {activeId ? (
                                    <CardItem
                                        order={categoryList.find(val => val.id == activeId).order || '无'}
                                        text={categoryList.find(val => val.id == activeId).name}></CardItem>
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    </div>
                </section>
            </main>
            <footer>
            </footer>
            {isLoading && <ModelLoading />}
            <AlertDialog open={showAlertDialog} title='提示' contentText='确认保存对类目的修改?' handleClose={alertDialogClosed}></AlertDialog>
        </Grommet>
    );
}

export default authenticatedRoute(CategoryPage, { pathAfterFailure: '/login' });