import styles from './nav_horizontal_scroll.module.css';
import Icon from '@mdi/react';
import { mdiMagnify, mdiCloseCircle } from '@mdi/js';
import { useEffect, useRef, useState } from 'react';

/**
 * 自定义横向滚动导航条组件
 * @param {{
 *   className?: string,
 *   selectedClassName?: string,
 *   items: [],
 *   defaultValue: any,
 *   valueProp: string,
 *   displayProp: string,
 *   onChange?:(value:any, item: any)=>{},
 *   itemStyle?: any,
 *   }} props
 * @returns 
 */
export default function HorizontalScrollNav(props) {

    const { className, selectedClassName, items, defaultValue, valueProp = 'id', displayProp = 'name', onChange, itemStyle = {} } = props;

    const [value, setValue] = useState(defaultValue);   // defaultValue 是值，不是对象！

    // 外部属性改变也会引起值改变。
    useEffect(() => {
        // console.log('defaultValueChanged!' + defaultValue)
        setValue(defaultValue);
    }, [defaultValue]);

    function itemClicked(value) {
        // console.log('[itemClicked] ' + value);
        setValue(value);
        if (onChange != undefined) onChange(value);
    }

    return (
        <div className={`${styles.container} ${className != undefined ? className : ''}`}>
            {items.map((val, index, array) => {
                return (
                    <span className={[styles.item, val[valueProp] == value ? (selectedClassName ? selectedClassName : styles.item_selected) : null].join(' ')} style={{ ...itemStyle }} key={val[valueProp]} onClick={itemClicked.bind(this, val[valueProp])}>
                        {val[displayProp].toString()}
                    </span>
                )
            })}
        </div>
    );
}