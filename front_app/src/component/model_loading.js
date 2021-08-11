import styles from './model_loading.module.css'

import Icon from '@mdi/react';
import { mdiLoading } from '@mdi/js';

export default function ModelLoading(props) {
    return (
        <div className={styles.container}>
            <span className={styles.loading}><Icon path={mdiLoading} spin={1}></Icon></span>
        </div>
    )
}