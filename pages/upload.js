import styles from '../styles/upload.module.css'

import Head from 'next/head'

export default function Upload(props) {
    return (
        <div className={styles.container}>
            <Head>
                <title>添加素材</title>
                <link rel="icon" href="/img/picturex64.png" />
            </Head>
            <header>
            </header>
            <main>
                <div className={styles.main_panel}>
                    <div className={styles.addProductPanel}>
                        <label>新增产品：</label><input></input><button>添加</button>
                    </div>
                    <div className={styles.addCategoryPanel}>
                        <label>新增类别：</label><input></input><button>添加</button>
                    </div>
                    <div className={styles.addItemPanel}>
                        <label>名称：<input /></label>
                        <label>链接：<input /></label>
                        <select>
                            <option>A</option>
                            <option>B</option>
                        </select>
                        <select>
                            <option>A</option>
                            <option>B</option>
                        </select>
                        <label>图片：<input type="file"></input></label>
                        预览：<img src='' alt='预览图' />
                    </div>
                </div>

            </main>
            <footer>
            </footer>
        </div>
    );
}