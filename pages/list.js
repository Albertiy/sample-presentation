import Head from "next/head";

import { useState } from "react";

import Product from "../src/model/product";
import Category from "../src/model/category";
import { getProductList } from "../src/service/product_service";


export default function List() {
    // getProductList().then(value => {

    // })
    // const [productList, setProductList] = useState();
    // const [categoryList, setCategoryList] = useState([new Category(1, '招牌')])

    return (
        <div className='container'>
            <Head>
                <title>素材列表</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <header>
                {/* 搜索框 */}
                <input className='search-input'></input>
                {/* product 列表 */}
                <div className='nav-list'>
                    <ul>
                        <li></li>
                    </ul>
                </div>
                {/* category 列表 */}
                <div className='nav-list'>
                    <ul>
                        <li></li>
                    </ul>
                </div>
            </header>
            <main>
                {/* productItem 列表 */}
                <section>
                    <ul>
                        <li>全部</li>
                    </ul>
                </section>
            </main>
            <footer></footer>
            {/* 组件内部样式 */}
            <style jsx>{`
            .serach-input {
                width: 100%;
            }
            `}</style>
            {/* 跨子组件样式 */}
            <style jsx global>{`

            `}</style>
        </div>
    );
}