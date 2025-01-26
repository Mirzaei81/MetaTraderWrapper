import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import Divider from '@mui/material/Divider';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export default function GroupClose({ dict }) {
    const [open, setOpen] = useState(false);
    const { theme } = useTheme();

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = (event, reason) => {
        setOpen(false);

    };

    const onEditOrderClicked = async (target) => {
        try {
            const data = {
                token: sessionStorage.getItem('token'),
            };
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mt5/${target}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const res = await response.json();

            if (response.status === 200) {
                toast(dict.trade.closed);
                setOpen(false);
                return;
            }
            if (!response.ok) {
                toast(res.error);
                return;
            }
        } catch (error) {
            toast(dict.order.errors.order_error);
        }
    };

    return (
        <React.Fragment>
            <IconButton color="inherit" size='small' onClick={handleClickOpen} >
                <WorkspacesIcon />
            </IconButton>
            <BootstrapDialog
                sx={{
                    '& .MuiPaper-root': {
                        backgroundColor: theme === 'dark' ? '#263238' : 'white',
                        color: theme === 'dark' ? '#E0E0E0' : 'white',
                        fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173',
                    },
                }}
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
            >
                <DialogTitle
                    sx={{
                        m: 0,
                        p: 2,
                        my: 1,
                        py: 0, fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173',
                        bgcolor: theme === 'dark' ? '#263238' : 'white',
                        color: theme === 'dark' ? '#E0E0E0' : 'black',
                    }}
                    id="customized-dialog-title"
                >
                    {dict.trade.manage_all}
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme === 'dark' ? '#E0E0E0' : 'grey',
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent
                    sx={{
                        bgcolor: theme === 'dark' ? '#263238' : 'white',
                        color: theme === 'dark' ? '#E0E0E0' : 'white',
                    }}
                    dividers
                >
                    <Box
                        sx={{
                            '& > :not(style)': { m: 1, minWidth: '30ch' },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center', fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173',
                            bgcolor: theme === 'dark' ? '#263238' : 'white',
                            color: theme === 'dark' ? '#E0E0E0' : 'white',
                        }}
                    >
                        <Button sx={{ textTransform: 'none',my: 5, fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173', }} fullWidth variant="contained" color="error" size="large"
                            onClick={() => onEditOrderClicked('close_all')}
                        >
                            {dict.trade.close_all}
                        </Button><Divider />
                        <Button sx={{ textTransform: 'none',my: 5, fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173', }} fullWidth variant="contained" color="error" size="large"
                            onClick={() => onEditOrderClicked('close_profit')}
                        >
                            {dict.trade.close_all_in_profit}
                        </Button><Divider />
                        <Button sx={{ textTransform: 'none',my: 5, fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173', }} fullWidth variant="contained" color="error" size="large"
                            onClick={() => onEditOrderClicked('close_loss')}
                        >
                            {dict.trade.close_all_in_loss}
                        </Button><Divider />
                        <Button sx={{ textTransform: 'none',my: 5, fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173', }} fullWidth variant="contained" color="error" size="large"
                            onClick={() => onEditOrderClicked('close_buys')}
                        >
                            {dict.trade.close_all_buys}
                        </Button><Divider />
                        <Button sx={{ textTransform: 'none',my: 5, fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173', }} fullWidth variant="contained" color="error" size="large"
                            onClick={() => onEditOrderClicked('close_sells')}
                        >
                            {dict.trade.close_all_sells}
                        </Button>
                    </Box>
                </DialogContent>
            </BootstrapDialog>
        </React.Fragment>
    );
}
