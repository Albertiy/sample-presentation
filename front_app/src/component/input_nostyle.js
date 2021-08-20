import { useEffect, useRef } from 'react';
import styles from './input_nostyle.module.css'

/** 无样式输入框组件 */
export default function NoStyleInput(props) {
    const { className, defaultValue = '', placeholder = '', onChange = () => { } } = props;
    const ele = useRef(null);
    useEffect(() => {
        if (ele.current) {
            ele.current.value = defaultValue;
        }
    }, []);
    return (<input ref={ele} className={[styles.input, className].join(' ')} placeholder={placeholder} onChange={(event) => { onChange(event.target) }}></input>)
}