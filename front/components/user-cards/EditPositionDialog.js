import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { MdEditDocument } from 'react-icons/md';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { useAppContext } from "@/context";
import BorderColorIcon from '@mui/icons-material/BorderColor';
import Divider from '@mui/material/Divider';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export default function EditPositionDialog({ order_id,order_type,current_price,order_ticket, order_tp, order_sl, dict }) {
    const [open, setOpen] = useState(false);
    const [sl, setSl] = useState(order_sl);
    const [tp, setTp] = useState(order_tp);
    const { theme } = useTheme();

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = (event, reason) => {
        setSl(order_sl)
        setTp(order_tp)
        setOpen(false);
    };

    const onEditOrderClicked = async () => {
        try {
            const data = {
                token: sessionStorage.getItem('token'),
                ticket: order_ticket,
                id: order_id,
                sl: sl,
                tp: tp,
            };
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mt5/modify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const res = await response.json();

            if (response.status === 200) {
                toast(dict.trade.modify_success);
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
            <IconButton color="inherit" size='small' onClick={handleClickOpen}>
                <BorderColorIcon />
            </IconButton>
            <BootstrapDialog
                sx={{
                    '& .MuiPaper-root': {
                        backgroundColor: theme === 'dark' ? '#263238' : 'white',
                        color: theme === 'dark' ? '#E0E0E0' : 'white',
                        fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173',
                        dir: dict.lang == 'en' ? 'ltr' : 'ltr'
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
                    {dict.price.modify}
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
                        fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173',
                        bgcolor: theme === 'dark' ? '#263238' : 'white',
                        color: theme === 'dark' ? '#E0E0E0' : 'white',
                    }}
                    dividers
                >
                    <Box
                        sx={{
                            '& > :not(style)': { m: 1, width: '25ch' },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center', fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173',
                            bgcolor: theme === 'dark' ? '#263238' : 'white',
                            color: theme === 'dark' ? '#E0E0E0' : 'white',
                        }}
                    >
                        <TextField
                            sx={{
                                fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173',
                                input: { color: theme === 'dark' ? '#eaeaea' : 'inherit', fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173', },
                                '& .MuiInputLabel-root': { color: theme === 'dark' ? '#eaeaea' : 'black', fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173', },
                            }}error={ sl < 0 || (order_type=='buy' && sl > current_price&& sl!=0) || 
                                (order_type=='sell' && sl < current_price&& sl!=0)}
                            id="Stop Loss"
                            size="small"
                            label={dict.trade.sl}
                            variant="outlined"
                            value={sl}
                            onChange={(event) => {
                                setSl(event.target.value);
                            }}

                            type="number"
                        /><Divider />
                        <TextField
                            sx={{
                                fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173',
                                input: { color: theme === 'dark' ? '#eaeaea' : 'inherit', fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173', },
                                '& .MuiInputLabel-root': { color: theme === 'dark' ? '#eaeaea' : 'black', fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173', },
                            }} error={ tp < 0 || (order_type=='buy' && tp < current_price&& tp!=0) || 
                                (order_type=='sell' && tp > current_price&& tp!=0)}
                            id="Take Profit"
                            size="small"
                            label={dict.trade.tp}
                            variant="outlined"
                            value={tp}
                            onChange={(event) => { setTp(event.target.value) }}
                            type="number"
                        />
                    </Box>
                </DialogContent>
                <DialogActions
                    sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        my: 1, fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173',
                        bgcolor: theme === 'dark' ? '#263238' : 'white',
                    }}
                >
                    <Button disabled={   tp < 0 || (order_type=='buy' && tp < current_price && tp!=0) || 
                                (order_type=='sell' && tp > current_price && tp!=0) || sl < 0 || (order_type=='buy' && sl > current_price&& sl!=0) || 
                                (order_type=='sell' && sl < current_price && sl!=0) }
                    variant="contained" sx={{ fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173', }} onClick={onEditOrderClicked}>
                        {dict.price.modify}
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </React.Fragment>
    );
}
