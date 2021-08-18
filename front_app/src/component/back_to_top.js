import PropTypes from 'prop-types';
import styles from "./back_to_top.module.css";
import Icon from "@mdi/react";
import { mdiFormatVerticalAlignTop } from '@mdi/js';
import useScrollTrigger from './useScrollTrigger';

export default function BackToTop(props) {

    const { children, anchor } = props;

    console.log('anchor: %o', anchor)

    const trigger = useScrollTrigger({ target: anchor });

    const handleClick = (event) => {
        console.log('BackToTop!')
        // const anchor = (event.target.ownerDocument || document).querySelector('#back-to-top-anchor');

        if (anchor) {
            anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    return (
        <div id='backToTop' className={styles.container} onClick={handleClick} style={trigger ? {} : { display: 'none' }}>
            {children || (
                <div className={styles.button}>
                    <Icon className={styles.icon} path={mdiFormatVerticalAlignTop}></Icon>
                </div>
            )}
        </div>
    )
}

BackToTop.protoTypes = {
    children: PropTypes.element,
    anchor: PropTypes.element
}