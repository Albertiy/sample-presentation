import React, { useState, useEffect } from 'react';

import { Grommet, TextInput, Box, Button } from "grommet";
import theme from '../src/setting/grommet-theme.json';
import Head from 'next/head';

import Icon from '@mdi/react';
import { mdiDragHorizontal } from '@mdi/js';

import { useSnackbar } from 'notistack';
import ModelLoading from '../src/component/model_loading';
import styles from '../styles/user.module.css';
import AlertDialog from '../src/component/alert-dialog';
import { View, Hide } from 'grommet-icons';

import authenticatedRoute from '../src/component/AuthenticatedRoute/index';


function User() {
    const { enqueueSnackbar } = useSnackbar();
    const [isLoading, setIsLoading] = useState(false);
    const [showAlertDialog, setShowAlertDialog] = useState(false);

    const [account, setAccount] = React.useState('admin');

    const [oldValue, setOldValue] = React.useState('');
    const [oldReveal, setOldReveal] = React.useState(false);

    const [value, setValue] = React.useState('');
    const [reveal, setReveal] = React.useState(false);

    /**
     * 点击保存修改按钮
     * @param {*} event 
     */
    function saveChangeClicked(event) {
        if (!value || !oldValue)
            enqueueSnackbar('密码不可为空！', { variant: 'warning', autoHideDuration: 2000 })
        else
            setShowAlertDialog(true)
    }

    /**
     * 关闭弹窗事件
     * @param {*} res 
     */
    function alertDialogClosed(res) {
        try {
            if (res) {
                // TODO 修改密码
                console.log('account: %o, oldPw: %o, newPw: %o', account, oldValue, value)
            }
            else enqueueSnackbar('未保存', { variant: 'info', autoHideDuration: 2000 })

        } finally {
            setShowAlertDialog(false)
        }
    }


    return (<Grommet className={styles.container} theme={theme}>
        <Head>
            <title>用户管理</title>
            <link rel="icon" href="/img/picturex64u.png" />
        </Head>
        <header className={styles.header}>
            <div className={styles.header_row}>
                <div className={styles.title}>用户管理</div>
                <Button primary label='保存修改' onClick={saveChangeClicked}></Button>
            </div>
        </header>
        <main className={styles.main}>
            <div className={styles.form_container}>
                <div className={styles.form_row}>
                    <Box width="medium" direction="row" margin="medium" align="center" round="small" border>
                        <TextInput plain type={oldReveal ? 'text' : 'password'} value={oldValue} onChange={event => setOldValue(event.target.value)} placeholder='旧密码' maxLength='20'></TextInput>
                        <Button icon={oldReveal ? <View size="medium" /> : <Hide size="medium" />} onClick={() => setOldReveal(!oldReveal)}></Button>
                    </Box>
                </div>
                <div className={styles.form_row}>
                    <Box width="medium" direction="row" margin="medium" align="center" round="small" border>
                        <TextInput plain type={reveal ? 'text' : 'password'} value={value} onChange={event => setValue(event.target.value)} placeholder='新密码' maxLength='20'
                        ></TextInput>
                        <Button icon={reveal ? <View size="medium" /> : <Hide size="medium" />} onClick={() => setReveal(!reveal)}></Button>
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

export default authenticatedRoute(User, { pathAfterFailure: '/login' });
