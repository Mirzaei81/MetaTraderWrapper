"use client"
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import DialogActions from '@mui/material/DialogActions';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export default function WithdrawalRequest({ dict }) {

    const [open, setOpen] = useState(false);
    const { theme } = useTheme();
    const [amount, setAmount] = useState(10);

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = (event, reason) => {
        setOpen(false);

    };

    const onEditOrderClicked = async (target) => {
        try {
            console.log('Starting the request...');
            
            const data = {
                token: sessionStorage.getItem('token'),
                amount: amount,
            };
            console.log('Data to be sent:', data);
    
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/state/rquest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
    
            if (response.status === 200) {
                toast(dict.withdrawal_request_accepted);
                setOpen(false);
                return;
            }
            
            if (!response.ok) {
                toast(res.error);
                return;
            }
        } catch (error) {
            toast(dict.errors.withdrawal_request_error);
        }
    };
    
    return (
<React.Fragment>
  <div
    className="animate-rotateVertical text-2xl rounded-lg hover:bg-slate-50 hover:dark:bg-slate-800"
    onClick={handleClickOpen}
  >
    <RequestQuoteIcon size="small" className="m-2" />
  </div>

  <BootstrapDialog
    sx={{
      "& .MuiPaper-root": {
        backgroundColor: theme === "dark" ? "#263238" : "white",
        color: theme === "dark" ? "#E0E0E0" : "black",
        fontFamily: "__Rubik_6eb173, __Rubik_Fallback_6eb173",
        // maxWidth: "90%",  
        margin: "0 auto",  
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
        py: 0,
        bgcolor: theme === "dark" ? "#263238" : "white",
        color: theme === "dark" ? "#E0E0E0" : "black",
        fontFamily: "__Rubik_6eb173, __Rubik_Fallback_6eb173",
        textAlign: "center",  
      }}
      id="customized-dialog-title"
    >
      {dict.withdrawal_request_title}
    </DialogTitle>
    <IconButton
      aria-label="close"
      onClick={handleClose}
      sx={{
        position: "absolute",
        right: 8,
        top: 8,
        color: theme === "dark" ? "#E0E0E0" : "grey",
      }}
    >
      <CloseIcon />
    </IconButton>
    <DialogContent
      sx={{
        bgcolor: theme === "dark" ? "#263238" : "white",
        color: theme === "dark" ? "#E0E0E0" : "black", 
        dir: dict.lang === "en" ? "ltr" : "rtl",
        textAlign: "center",  
      }}
      dividers
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: theme === "dark" ? "#263238" : "white",
          color: theme === "dark" ? "#E0E0E0" : "black", 
          my: 3,
          mx: { xs: 1, sm: 3, md: 5 }, // تنظیم فاصله برای حالت‌های مختلف صفحه
        //   width: { xs: "100%", sm: "90%", md: "80%" }, // ریسپانسیو کردن عرض Box
        }}
      >
        <spam
          style={{
            color: theme === "dark" ? "#eaeaea" : "black",
            textAlign: "center",
          }}
        >
          {dict.withdrawal_request_txt}
        </spam>

        <TextField
          sx={{
            fontFamily: "__Rubik_6eb173, __Rubik_Fallback_6eb173",
            width: "100%",  my:5,
            // maxWidth: "400px", 
            input: {
              color: theme === "dark" ? "#eaeaea" : "inherit",
            },
            "& .MuiInputLabel-root": {
              color: theme === "dark" ? "#eaeaea" : "black",
            },
          }}
          id="Amunt"
          size="small"
          label={dict.amount}
          variant="outlined"
          value={amount}
          onChange={(event) => {
            setAmount(event.target.value);
          }}
          type="number"
        />
      </Box>
    </DialogContent>
    <DialogActions
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        my: 1,
        fontFamily: "__Rubik_6eb173, __Rubik_Fallback_6eb173",
        bgcolor: theme === "dark" ? "#263238" : "white",
        width: "100%",
      }}
    >
      <Button
        variant="contained"
        sx={{
          fontFamily: "__Rubik_6eb173, __Rubik_Fallback_6eb173",
          width: "100%", // ریسپانسیو کردن دکمه
        //   maxWidth: "300px", // محدود کردن حداکثر عرض دکمه
        }}
        onClick={onEditOrderClicked}
      >
        {dict.request}
      </Button>
    </DialogActions>
  </BootstrapDialog>
</React.Fragment>
    );
}
