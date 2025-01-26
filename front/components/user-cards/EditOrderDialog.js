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

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export default function EditOrderDialog({ order_type, order_id, order_tp, order_sl, order_price, order_leverage, order_unit, dict }) {
    const [open, setOpen] = useState(false);
    const [price, setPrice] = useState(order_price);
    const [sl, setSl] = useState(order_sl);
    const [tp, setTp] = useState(order_tp);
    const [unit, setUnit] = useState(order_unit);
    const [leverage, setLeverage] = useState(order_leverage);
    const { theme } = useTheme();

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = (event, reason) => {
        setOpen(false);

    };

    const onEditOrderClicked = async () => {
        try {
            const data = {
                token: sessionStorage.getItem('token'),
                id: order_id,
                entry: price,
                sl: sl,
                tp: tp,
                unit: unit,
                leverage: leverage,
            };
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mt5/modify_pending`, {
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
            toast(dict.order.errors.modify_error);
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
                            }}
                            error={sl < 0
                                || (order_type == 'buy' && sl > order_price && sl != 0) || (order_type == 'sell' && sl < order_price && sl != 0)}
                            id="Stop Loss"
                            size="small"
                            label={dict.trade.sl}
                            variant="outlined"
                            value={sl}
                            min={0}
                            type="number"
                            onChange={(e) => { setSl(e.target.value) }}
                        />
                        <TextField
                            sx={{
                                fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173',
                                input: { color: theme === 'dark' ? '#eaeaea' : 'inherit', fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173', },
                                '& .MuiInputLabel-root': { color: theme === 'dark' ? '#eaeaea' : 'black', fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173', },
                            }}
                            error={tp < 0
                                || (order_type == 'buy' && tp < order_price && tp != 0) || (order_type == 'sell' && tp > order_price && tp != 0)}
                            id="Take Profit"
                            size="small"
                            label={dict.trade.tp}
                            variant="outlined"
                            value={tp}
                            min={0}
                            type="number"
                            onChange={(e) => { setTp(e.target.value) }}
                        />
                        <TextField
                            sx={{
                                fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173',
                                input: { color: theme === 'dark' ? '#eaeaea' : 'inherit', fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173', },
                                '& .MuiInputLabel-root': { color: theme === 'dark' ? '#eaeaea' : 'black', fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173', },
                            }} error={leverage <= 0}
                            id="leverage"
                            size="small"
                            label={dict.trade.leverage}
                            variant="outlined"
                            value={leverage}
                            // min={1}
                            step={1}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                const parsedValue = parseInt(newValue, 10);

                                if (!isNaN(parsedValue)) {
                                    setLeverage(parsedValue);
                                } else if (newValue === "") {
                                    setLeverage("");
                                }
                            }}
                            type="number"
                        />
                        <TextField
                            sx={{
                                fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173',
                                input: { color: theme === 'dark' ? '#eaeaea' : 'inherit', fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173', },
                                '& .MuiInputLabel-root': { color: theme === 'dark' ? '#eaeaea' : 'black', fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173', },

                            }} error={unit <= 0}
                            id="unit"
                            size="small"
                            label={dict.trade.lot}
                            variant="outlined"
                            value={unit}
                            // min={1}
                            step={1}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                const parsedValue = parseInt(newValue, 10);

                                if (!isNaN(parsedValue)) {
                                    setUnit(parsedValue);
                                } else if (newValue === "") {
                                    setUnit("");
                                }
                            }}
                            type="number"
                        />
                        <TextField
                            sx={{
                                fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173',
                                input: { color: theme === 'dark' ? '#eaeaea' : 'inherit', fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173', },
                                '& .MuiInputLabel-root': { color: theme === 'dark' ? '#eaeaea' : 'black', fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173', },
                            }} error={price <= 0}
                            id="Open Price"
                            size="small"
                            label={dict.trade.placeholder}
                            variant="outlined"
                            value={price}
                            type="number"
                            min={0}
                            onChange={(e) => { setPrice(e.target.value) }}
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
                    <Button disabled={price <= 0 || tp < 0 || sl < 0 || unit <= 0 || leverage <= 0 ||
                        (order_type == 'buy' && tp < order_price && tp != 0) || (order_type == 'sell' && tp > order_price && tp != 0) || (order_type == 'buy' && sl > order_price && sl != 0) || (order_type == 'sell' && sl < order_price && sl != 0)

                    }
                        variant="contained" sx={{ fontFamily: '__Rubik_6eb173, __Rubik_Fallback_6eb173', }} onClick={onEditOrderClicked}>
                        {dict.price.modify}
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </React.Fragment>
    );
}
