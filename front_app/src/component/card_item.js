import PropTypes from 'prop-types'
import { Card } from "grommet"
import Icon from "@mdi/react";
import { mdiDragHorizontal } from "@mdi/js";

import styles from './card_item.module.css'


export default function CardItem(props) {
    const { order, text, style } = props;

    return (
        <Card background="light-1" style={style || {}}>
            <div className={styles.list_item}>
                <div className={styles.list_item_order}>{order}</div>
                <div className={styles.list_item_text}>{text}</div>
                <div className={styles.list_item_icon}>
                    <Icon path={mdiDragHorizontal} size={0.6}></Icon>
                </div>
            </div>
        </Card>
    )
}

CardItem.prototype = {
    order: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    style: PropTypes.object,
}