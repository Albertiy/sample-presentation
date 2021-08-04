import styles from './nav_horizontal_scroll.module.css';
import Icon from '@mdi/react';
import { mdiMagnify, mdiCloseCircle } from '@mdi/js';
import { useRef, useState } from 'react';

/**
 * 自定义横向滚动导航条组件
 * @param {{
 *   className?: string,
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

    const { className, items, defaultValue, valueProp = 'id', displayProp = 'name', onChange, itemStyle = {} } = props;

    const [value, setValue] = useState(defaultValue);   // defaultValue 是值，不是对象！

    function itemClicked(value) {
        console.log('[itemClicked] ' + value);
        setValue(value);
        if (onChange != undefined) onChange(value);
    }

    return (
        <div className={`${styles.container} ${className != undefined ? className : ''}`}>
            {items.map((val, index, array) => {
                return (
                    <span className={styles.item} style={{ ...itemStyle }} key={val[valueProp]} onClick={itemClicked.bind(this, val[valueProp])}>
                        {val[displayProp].toString()}
                    </span>
                )
            })}
        </div>
    );
}