import styles from '../styles/detail.module.css'
import Head from 'next/head'
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import * as ProductService from "../src/service/product_service";
import ProductItem from '../src/model/product_item';
import Icon from '@mdi/react';
import { mdiEmoticonKissOutline, mdiChevronLeft } from '@mdi/js';

/** @type{ProductItem} */
const defaultItem = null;

export default function Detail() {

    let router = useRouter();
    const [id, setId] = useState(null);
    const [item, setItem] = useState(defaultItem);
    const [error, setError] = useState('');

    useEffect(() => {
        console.log('初始化')
        if (router && router.query && router.query.id) {
            console.log(router.query);
            let i = router.query.id;
            setId(i);
        }
    }, []);

    useEffect(() => {
        console.log('初始化')
        if (router && router.query && router.query.id) {
            console.log(router.query);
            let i = router.query.id;
            setId(i);
        }
    }, [router]);

    useEffect(() => {
        ProductService.getProductItemById(id).then(val => {
            setItem(val);
        }).catch(err => {
            setError(err)
        });
    }, [id])

    function backBtnClicked() {
        console.log('backClicked')
        console.log(history)
        if (window.history.length > 1) {
            console.log('1');
            if (router) router.back();
            else history.back();
        } else {
            console.log('2');
            if (router) router.push('/list');
            else window.open('/list', '_self');
        }
    }


    return (
        <div className={styles.container}>
            <Head>
                <title>[{id}]素材详情</title>
                <link rel="icon" href="/img/picturex64.png" />
            </Head>
            <header>
                <div className={styles.navbar_container}>
                    <div className={styles.pin_navbar}>
                        <div className={styles.nav_back} onClick={backBtnClicked}>
                            <Icon path={mdiChevronLeft} size={1.2}></Icon>
                        </div>
                    </div>
                </div>
            </header>
            <main className={styles.main_panel}>
                {item ? (
                    <div className={styles.image_container}>
                        <img className={styles.main_pic} src={item ? item.mainPic : ''}></img>
                    </div>
                ) : (
                    <div className={styles.error_container}>
                        <Icon path={mdiEmoticonKissOutline} size={2}></Icon>
                        <div>{error}</div>
                    </div>
                )}
            </main>
            <footer>

            </footer>
        </div >
    );
}