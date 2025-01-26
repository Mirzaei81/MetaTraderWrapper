import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditPositionDialog from './EditPositionDialog'; 
import { toast } from 'sonner';

const TradeCard = ({ trade, dict, idx }) => {
    const [isOpen, setIsOpen] = useState(false);
    const onCloseTradeClicked = async (ticket, symbol_id) => {
        try {
            const data = {
                token: sessionStorage.getItem('token'),
                symbol: symbol_id,
                ticket: ticket
            };
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mt5/close_single`, {
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
            toast(dict.trade.closed);
        } catch (error) {
            toast(dict.trade.errors.close_error);
        }
    };
    return (
        <div key={idx} className='w-full relative min-h-24 flex flex-col justify-center items-center border dark:border-sky-700 m-2 px-3 pb-2 rounded-lg sm:mx-0'>
            {/* Header section - always visible */}
            <div className='w-full md:max-w-full md:pr-0 flex items-center justify-between pt-1' onClick={() => setIsOpen(!isOpen)}>
                <p className={`text-base w-14 sm:px-0 font-bold`} style={{ color: trade.type === 'buy' ? 'green' : 'red' }}>
                    {dict.trade[trade.type]}
                </p>
                <p className='text-lg font-bold px-4 sm:px-0'>
                    {trade.symbol_name[dict.lang] || 'No Name'}
                </p>
                <p className='sm:flex text-sm w-14 px-0 font-bold' style={{ color: trade.profit > 0  ? 'green' : 'red' }} >{trade.profit.toFixed(2)}</p>
            </div>

            {/* Detailed section - only visible if card is open */}
            {isOpen && (
                <>
                    <div className='w-full flex items-center justify-between mt-2'>
                        <div className="mx-2 sm:mx-0">
                            <IconButton color="inherit" size='small' onClick={() => { onCloseTradeClicked(trade.ticket, trade.symbol_id) }}>
                                <DeleteForeverIcon />
                            </IconButton>
                        </div>
                        <div className="mx-1 sm:mx-0">
                            <EditPositionDialog
                                order_type={trade.type}
                                current_price={trade.current}
                                order_id={trade.id}
                                order_ticket={trade.ticket}
                                order_tp={trade.tp}
                                order_sl={trade.sl}
                                dict={dict}
                            />
                        </div>
                    </div>
                    <div className='w-full flex items-center justify-between'>
                        <p className='space-x-2 w-36 text-sm sm:w-40'>
                            <span className='w-14 sm:w-20 inline-block'>{dict.trade.current}</span>
                            <span>:</span>
                            <span className='mt-1'>{trade.current}</span>
                        </p>
                        <p className=' sm:flex text-sm w-14 px-0 '>{trade.ticket}</p>
                    </div>
                    <div className='w-full flex items-center justify-between'>
                        <p className='space-x-2 w-36 text-sm sm:w-40'>
                            <span className='w-14 sm:w-20 inline-block'>{dict.trade.lot}</span>
                            <span>:</span>
                            <span dir='ltr'>
                                <span className='font-semibold'>{trade.unit}</span>
                                <span className='text-xs text-gray-500'>X</span>
                                <span className='text-sm'>{trade.leverage}</span>
                            </span>
                        </p>
                        <p className='space-x-2 w-36 text-sm sm:w-40'>
                            <span className='w-14 sm:w-20 inline-block'>{dict.trade.entry}</span>
                            <span>:</span>
                            <span>{trade.entry}</span>
                        </p>
                    </div>
                    <div className='w-full flex items-center justify-between'>
                        <p className='space-x-2 w-36 text-sm sm:w-40'>
                            <span className='w-14 sm:w-20 inline-block'>{dict.trade.sl}</span>
                            <span>:</span>
                            <span>{trade.sl}</span>
                        </p>
                        <p className='space-x-2 w-36 text-sm sm:w-40'>
                            <span className='w-14 sm:w-20 inline-block'>{dict.trade.tp}</span>
                            <span>:</span>
                            <span>{trade.tp}</span>
                        </p>
                    </div>
                    <div className='w-full flex items-center justify-between'>
                        <p className='space-x-2 w-36 text-sm sm:w-40'>
                            <span className='w-14 sm:w-20 inline-block'>{dict.trade.swap}</span>
                            <span>:</span>
                            <span>{trade.swap.toFixed(2)}</span>
                        </p>
                        <p className='space-x-2 w-36 text-sm sm:w-40'>
                            <span className='w-14 sm:w-20 inline-block'>{dict.trade.commission}</span>
                            <span>:</span>
                            <span>{trade.commission.toFixed(2)}</span>
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};

export default TradeCard;
