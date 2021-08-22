import React, { useState, useEffect } from 'react';

import { Grommet, TextInput, Box, Button } from "grommet";
import theme from '../src/setting/grommet-theme.json';
import Head from 'next/head';

import Icon from '@mdi/react';
import { mdiDragHorizontal } from '@mdi/js';

import { useSnackbar } from 'notistack';
import ModelLoading from '../src/component/model_loading';
import styles from '../styles/login.module.css';
import AlertDialog from '../src/component/alert-dialog';
import { View, Hide } from 'grommet-icons';


export default function Login() {
    const { enqueueSnackbar } = useSnackbar();
    const [isLoading, setIsLoading] = useState(false);
    const [showAlertDialog, setShowAlertDialog] = useState(false);

    const [name, setName] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [reveal, setReveal] = React.useState(false);

    /**
     * 点击登录按钮
     * @param {*} event 
     */
    function loginBtnClicked(event) {
        if (!name)
            enqueueSnackbar('用户名不可为空！', { variant: 'warning', autoHideDuration: 2000 })
        else if (password == undefined || password == '')
            enqueueSnackbar('密码不可为空！', { variant: 'warning', autoHideDuration: 2000 })
        else {
            login()
        }

    }

    /**
     * 登录
     */
    function login() {
        try {
            // TODO 后台请求
            console.log('name: %o, password: %o', name, password)
            enqueueSnackbar('登录成功', { variant: 'success', autoHideDuration: 2000 })
        } finally {
            setShowAlertDialog(false)
        }
    }

    function alertDialogClosed() {
        
    }


    return (<Grommet className={styles.container} theme={theme}>
        <Head>
            <title>登录</title>
            <link rel="icon" href="/img/picturex64m.png" />
        </Head>
        <header className={styles.header}>
            <div className={styles.header_row}>
                <div className={styles.title}>登录</div>
            </div>
        </header>
        <main className={styles.main}>
            <div className={styles.form_container}>
                <div className={styles.form_row}>
                    <Box width="medium" direction="row" margin="medium" align="center" round="small" border>
                        <TextInput plain type={'text'} style={{ height: '42px', }} value={name} onChange={event => setName(event.target.value)} placeholder='用户名' maxLength='50'
                        ></TextInput>
                    </Box>
                </div>
                <div className={styles.form_row}>
                    <Box width="medium" direction="row" margin="medium" align="center" round="small" border>
                        <TextInput plain type={reveal ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} placeholder='密码' maxLength='20'></TextInput>
                        <Button icon={reveal ? <View size="medium" /> : <Hide size="medium" />} onClick={() => setReveal(!reveal)}></Button>
                    </Box>
                </div>
                <div className={styles.form_row}>
                    <Box width="medium" direction="row" margin="medium" align="center" round="small" justify="center">
                        <Button primary size='large' label='登录' onClick={loginBtnClicked}></Button>
                    </Box>
                </div>
            </div>
        </main>
        <footer>
        </footer>
        {isLoading && <ModelLoading />}
        <AlertDialog open={showAlertDialog} title='提示' contentText='确认修改?' handleClose={alertDialogClosed}></AlertDialog>
    </Grommet>);
}