import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

/**
 * 警告对话框
 * @param {{open:boolean, title, contentText, handleClose:function}} props 
 * @returns 
 */
export default function AlertDialog(props) {

    let { open, title, contentText, handleClose } = props;
    if (!handleClose) handleClose = defaultHandleClose;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {contentText}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleClose(false)} color="primary">
                    取消
                </Button>
                <Button onClick={() => handleClose(true)} color="primary" autoFocus>
                    确认
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function defaultHandleClose(val) {
    console.log('dialogClosed: ' + val)
}