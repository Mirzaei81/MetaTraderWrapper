import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditOrderDialog from './EditOrderDialog'; // فرض می‌کنم این یک کامپوننت جداگانه است

const OrderCard = ({ order, dict, idx }) => {
    const [isOpen, setIsOpen] = useState(false);
    const onCloseOrderClicked = async (id) => {
        try {
            const data = {
                token: sessionStorage.getItem('token'),
                id: id
            };
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mt5/close_order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const res = await response.json();
            if (!response.ok) {
                toast(res.error);
                return;
            }
            toast(dict.order.closed);
        } catch (error) {
            toast(dict.order.errors.order_error);
        }
    };

    return (
        <div key={idx} className='w-full relative min-h-24 flex flex-col justify-center items-center border dark:border-sky-700 m-2 px-3 pb-2 rounded-lg'>
            {/* Header section - always visible */}
            <div className='w-full flex items-center justify-between pt-1' onClick={() => setIsOpen(!isOpen)}>
                <p className={`space-x-2 w-36 text-sm sm:w-40 font-bold`}>
                    <span className='w-20 inline-block ' style={{ color: 'blue' }}>
                        {dict.trade[order.type]}
                    </span>
                </p>
                <p className='text-lg font-bold'>
                    {order.symbol_name[dict.lang] || 'No Name'}
                </p>
                <p className={`space-x-2 w-36 text-sm sm:w-40 font-bold`}>
                    <span className='w-20 inline-block ' >
                    {order.price}
                    </span>
                </p>

                
            </div>

            {/* Detailed section - only visible if card is open */}
            {isOpen && (
                <>
                    <div className='w-full flex items-center justify-between mt-2'>
                        <div className="mx-2">
                            <IconButton color="inherit" size='small' onClick={() => { onCloseOrderClicked(order.id) }}>
                                <DeleteForeverIcon />
                            </IconButton>
                        </div>
                        <div className="mx-1">
                            <EditOrderDialog
                                order_type={order.type}
                                order_id={order.id}
                                order_price={order.price}
                                order_tp={order.tp}
                                order_sl={order.sl}
                                order_leverage={order.leverage}
                                order_unit={order.unit}
                                dict={dict}
                            />
                        </div>
                    </div>
                    <div className='w-full flex items-center justify-between'>
                        <p className='space-x-2 w-36 text-sm sm:w-40'>
                            <span className='w-14 sm:w-20 inline-block'>{dict.order.price}</span>
                            <span>:</span>
                            <span>{order.price}</span>
                        </p>
                        <p className='space-x-2 w-36 text-sm sm:w-40'>
                            <span className='w-14 sm:w-20 inline-block'>{dict.trade.lot}</span>
                            <span>:</span>
                            <span dir='ltr'>
                                <span className='font-semibold'>{order.unit}</span>
                                <span className='text-xs text-gray-500'>X</span>
                                <span className='text-sm'>{order.leverage}</span>
                            </span>
                        </p>
                    </div>
                    <div className='w-full flex items-center justify-between'>
                        <p className='space-x-2 w-36 text-sm sm:w-40'>
                            <span className='w-14 sm:w-20 inline-block'>{dict.trade.sl}</span>
                            <span>:</span>
                            <span>{order.sl}</span>
                        </p>
                        <p className='space-x-2 w-36 text-sm sm:w-40'>
                            <span className='w-14 sm:w-20 inline-block'>{dict.trade.tp}</span>
                            <span>:</span>
                            <span>{order.tp}</span>
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};

export default OrderCard;
