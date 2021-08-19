import Head from 'next/head'

import styles from '../styles/category.module.css'
import Category from "../src/model/category";
import * as ProductService from '../src/service/product_service'

import { useSnackbar } from 'notistack';
import ModelLoading from '../src/component/model_loading'

import { useState, useEffect } from 'react';

import theme from '../src/setting/grommet-theme.json'
import { Grommet, Card, CardBody, Button, TextInput, FileInput, Select, Image, Box, Keyboard } from 'grommet'
import Icon from '@mdi/react';
import { mdiDragHorizontal } from '@mdi/js';

import { useDroppable, useDraggable, DragOverlay } from '@dnd-kit/core';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensors, useSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableItem from '../src/component/sortable_item';

/**@type{Category[]} */
const defaultCategoryList = [];

export default function Cagegory() {

    const { enqueueSnackbar } = useSnackbar();

    const [categoryList, setCategoryList] = useState(defaultCategoryList)

    const [isLoading, setIsLoading] = useState(false)

    const [activeId, setActiveId] = useState(null)

    const sensors = useSensors(useSensor(PointerSensor, {}), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates, }), useSensor(TouchSensor, { activationConstraint: { delay: 250 } }));

    useEffect(() => {
        ProductService.getCategoryList().then(res => {
            setCategoryList(res)
        }).catch(err => {
            enqueueSnackbar('获取类目列表失败', { variant: 'error', autoHideDuration: 2000 })
            console.log('获取类目列表失败：' + err)
        })
        return () => { }
    }, [])

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
        console.log('active: %o\n over: %o', active, over)
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

    return (
        <Grommet className={styles.container} theme={theme}>
            <Head>
                <title>素材管理 - 类目管理</title>
                <link rel="icon" href="/img/picturex64m.png" />
            </Head>
            <header className={styles.header}>
                <div className={styles.header_row}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>类目管理</div>
                    <Button primary label='保存'></Button>
                </div>
            </header>
            <main className={styles.main}>
                <div className={styles.list_container}>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                        <SortableContext items={categoryList} strategy={verticalListSortingStrategy}>
                            {categoryList.map((item, idx, arr) => (
                                <SortableItem key={item.id} id={item.id}>
                                    <Card background="light-1" style={item.id == activeId ? { opacity: 0.5 } : {}}>
                                        <div className={styles.list_item}>
                                            <div className={styles.list_item_order}>{item.order ? item.order : '无'}</div>
                                            <div className={styles.list_item_text}>{item.name}</div>
                                            <div className={styles.list_item_icon}>
                                                <Icon path={mdiDragHorizontal} size={0.6}></Icon>
                                            </div>
                                        </div>
                                    </Card>
                                </SortableItem>
                            ))}
                        </SortableContext>
                        <DragOverlay>
                            {activeId ? (
                                <Card background="light-1">
                                    <div className={styles.list_item}>
                                        <div className={styles.list_item_order}>{categoryList.find(val => val.id == activeId).order || '无'}</div>
                                        <div className={styles.list_item_text}>{categoryList.find(val => val.id == activeId).name}</div>
                                        <div className={styles.list_item_icon}>
                                            <Icon path={mdiDragHorizontal} size={0.6}></Icon>
                                        </div>
                                    </div>
                                </Card>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            </main>
            <footer>
            </footer>
            {isLoading && <ModelLoading />}
        </Grommet>
    );
}