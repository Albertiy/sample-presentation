import styles from './input_search.module.css';
import Icon from '@mdi/react';
import { mdiMagnify, mdiCloseCircle } from '@mdi/js';
import { useRef, useState } from 'react';

/**
 * 自定义搜索框组件
 * @param {{onChange?:(value:string)=>{},onInput?:(value:string)=>{}}} props
 * @returns 
 */
export default function SearchInput(props) {

    const { className, onChange, onInput, inputProps } = props;

    const [clearVisible, setClearVisible] = useState(false);

    const inputEle = useRef(null);

    function valueChanged(event) {
        let value = event.target.value;
        // console.log('[onInput] ' + value);
        if (value == '') setClearVisible(false);
        else setClearVisible(true);
        if (onInput != undefined) onInput(value);
    }

    /**
     * 按下回车，才算Change
     * @param {*} event 是React合成事件，原生事件为 event.nativeEvent，触发元素为 event.target
     */
    function keyPressed(event) {
        /** @type {String} */
        let key = event.key;
        // console.log('[key] ' + key);
        let value = event.target.value;
        if ('Enter' == key && onChange != undefined) {
            // console.log('[onChange] ' + value);
            onChange(event.target.value);
        }
    }

    /**
     * 清除input元素内容
     * @param {*} event 
     */
    function ClearBtnClicked(event) {
        if (inputEle.current) {
            inputEle.current.value = ''
            setClearVisible(false)
        }
    }

    return (
        <div className={styles.container}>
            {/* 搜索图标 */}
            <Icon className={styles.icon} path={mdiMagnify} size={1}></Icon>
            <input type='search' className={styles.input} onChange={valueChanged} onKeyPress={keyPressed} ref={inputEle} {...inputProps} />
            {/* 清空图标 */}
            {clearVisible && (<span style={{ display: 'flex' }} onClick={ClearBtnClicked}>
                <Icon className={styles.icon} path={mdiCloseCircle} size={0.75} title='清除'></Icon>
            </span>)}
        </div>
    );
}