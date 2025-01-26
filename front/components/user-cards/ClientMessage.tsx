"use client";
import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/shadcn/card";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/shadcn/drawer";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle
} from "@/components/shadcn/dialog";
import { LuSearch } from "react-icons/lu";
import { Input } from '../shadcn/input';
import { toast } from 'sonner';
import { MdDeleteOutline } from "react-icons/md";
import { useAppContext } from "@/context";

const ClientMessage = ({
    dict, dict_message, len_trades, len_pending, balance
}: {
    dict: any; dict_message: any, len_trades: number, len_pending: number, balance: number,
}) => {
    const [messages, setMessages] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    const handleDeleteMessage = async (id: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/message/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: sessionStorage.getItem('token'), id: id }),
            });
            if (response.ok) {
                setMessages(messages.filter((msg: any) => msg.id !== id));
            }
        } catch (error) {
            console.error('Error during POST request:', error);
        }
    };

    const handlePageChange = (direction: string) => {
        if (direction === "next" && currentPage * itemsPerPage < messages.length) {
            setCurrentPage((prev) => prev + 1);
        } else if (direction === "prev" && currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(parseInt(event.target.value));
        setCurrentPage(1);
    };

    const getCurrentItems = (items: any[]) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return items.slice(startIndex, startIndex + itemsPerPage);
    };

    const getTotalPages = (totalItems: number) => {
        return Math.ceil(totalItems / itemsPerPage);
    };
    // useEffect(() => {
    //     const intervalId = setInterval(async () => {
    //         try {
    //             const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/message/messages`, {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //                 body: JSON.stringify({ token: sessionStorage.getItem('token') }),
    //             });

    //             if (!response.ok) {
    //                 console.error('Failed to send POST request');
    //                 toast(dict.api_error)
    //             } else {
    //                 const result = await response.json();
    //                 setMessages(result); // Log the response from the server
    //             }
    //         } catch (error) {
    //             console.error('Error during POST request:', error);
    //         }
    //     }, 5000); // 15000 milliseconds = 15 second

    //     // Cleanup function to clear the interval on component unmount
    //     return () => clearInterval(intervalId);
    //   }, []);
    useEffect(() => {
        const get_messagees = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/message/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token: sessionStorage.getItem('token') }),
                });

                const res = await response.json();
                if (!response.ok) {
                    toast(res.error)
                    return
                }
                setMessages(res)
            } catch (error) {
                toast(dict.history.errors.order_error)
            }
        }

        get_messagees();

    }, [len_trades, len_pending, balance])


    return (
        <div className='w-full h-full sm:h-full overflow-y-scroll overflow-x-hidden'>
            <Card className='w-full h-full'>
                <CardHeader className='flex items-center justify-center py-2'>
                    <div className='w-full flex items-center justify-center mx-3 mt-3'>
                        <p className='font-semibold text-lg'>{dict.message.header}</p>
                        <p className='w-6 hidden sm:flex'></p>
                    </div>
                </CardHeader>
                <CardContent className='w-full px-2'>
                    <div className='w-full h-[60vh] sm:h-80 flex flex-col items-center overflow-y-scroll overflow-x-hidden'>
                        {getCurrentItems(messages).map((message: any, idx: number) => (
                            <div key={idx} className='w-full'>
                                <MessageItem
                                    message={message}
                                    dict_message={dict_message}
                                    onDelete={handleDeleteMessage}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="relative">
                        <div className='absolute inset-0 flex items-center justify-center mt-3'   >
                            <button
                                className='px-3 font-semibold rounded-full shadow-lg transition-all duration-300 ease-in-out bg-gradient-to-r from-blue-300 to-blue-500   hover:from-blue-600 hover:to-blue-800 hover:scale-105 disabled:bg-gray-400 disabled:text-gray-800 disabled:cursor-not-allowed'
                                onClick={() => handlePageChange("prev")}
                            >
                                {dict.history.prev}
                            </button>
                            <span className='text-m   text-gray-800  px-1 py-1 '>
                                {dict.history.page}
                            </span>
                            <span className='text-m  text-gray-800  px-1 py-1 '>
                                {currentPage}
                            </span>
                            <span className='text-m   text-gray-800  px-1 py-1 '>
                                {dict.history.from}
                            </span>
                            <span className='text-m  text-gray-800  px-1 py-1 '>
                                {getTotalPages(messages.length)}
                            </span>

                            <button
                                className='px-3 font-semibold rounded-full shadow-lg transition-all duration-300 ease-in-out bg-gradient-to-r from-blue-300 to-blue-500   hover:from-blue-600 hover:to-blue-800 hover:scale-105 disabled:bg-gray-400 disabled:text-gray-800 disabled:cursor-not-allowed'
                                onClick={() => handlePageChange("next")}
                            >
                                {dict.history.next}
                            </button>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
};

export default ClientMessage;

interface MessageItemProps {
    message: any;
    dict_message: any;
    onDelete: (id: string) => void;
}

export const MessageItem = ({ message, dict_message, onDelete }: MessageItemProps) => {
    const messageContent = dict_message[message.code];
    let content = '';
    const username = message.user_name || '';
    const trade_price = message.trade ? message.trade.entry : '';
    const trade_exit = message.trade ? message.trade.exit : '';
    const trade_ticket = message.trade ? message.trade.ticket : '';
    const trade_profit = message.trade ? message.trade.profit : '';
    const trade_sl = message.trade ? message.trade.sl : '';
    const trade_tp = message.trade ? message.trade.tp : '';
    const order_id = message.order ? message.order.id : '';
    const order_price = message.order ? message.order.price : '';
    const order_time = message.order ? message.order.time_jalali : '';
    const increase = message.increased_amount || '';
    const balance = message.balance || '';
    const withdraw_amount = message.withdraw_amount || '';
    const withdraw_rial = message.withdraw_rial || '';

    const values = {
        username: username,
        trade_price: trade_price,
        trade_exit: trade_exit,
        trade_ticket: trade_ticket,
        trade_profit: trade_profit,
        trade_sl: trade_sl,
        trade_tp: trade_tp,
        order_id: order_id,
        order_price: order_price,
        order_time: order_time,
        increase: increase,
        balance: balance,
        withdraw_amount: withdraw_amount,
        withdraw_rial: withdraw_rial,
    };
    if (messageContent) {
        content = formatString(messageContent.content, values);
    }

    const handle_read_messages = async (id: string) => {
        if (message.is_read) {
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/message/set_read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: sessionStorage.getItem('token'), id: id }),
            });
        } catch (error) {
            console.error('Error during POST request:', error);
        }
    };

    const handle_delete_message = () => {
        onDelete(message.id);
    };

    return (
        <div dir={dict_message.lang == "en" ? 'ltr' : 'rtl'}
            className={`relative flex items-center justify-start w-full my-3
        ${message.is_read ? 'filter opacity-60' : ''}`}>
            <div className={`absolute w-2 h-2 rounded-full bg-sky-500 animate-ping
                ${message.is_read ? 'hidden' : 'block'} -top-1 left-1`} />
            <div className='w-full flex flex-col items-center justify-center'>
                <Dialog onOpenChange={() => { handle_read_messages(message.id) }}>
                    <DialogTrigger className='flex items-center justify-start w-full'>
                        <div className='flex items-center justify-between px-1 w-full'>
                            <p className='truncate font-semibold bg-clip-text text-transparent bg-gradient-to-r from-sky-700 to-indigo-600 dark:from-sky-400 dark:to-indigo-400'>
                                {message.code == '10' ? message.title : messageContent ? messageContent.title : 'Unknown Message'}
                            </p>
                            <span className='text-xs'>{message.time_jalali}</span>
                        </div>
                    </DialogTrigger>
                    <DialogContent className='flex flex-col items-center justify-center'>
                        <div className='flex items-center justify-between px-1 w-full'>
                            <span className='text-sm w-16' />
                            <p className='font-semibold text-lg bg-clip-text text-transparent bg-gradient-to-r from-sky-700 to-indigo-600 dark:from-sky-400 dark:to-indigo-400'>
                                {message.code == '10' ? message.title : messageContent ? messageContent.title : 'Unknown Message'}
                            </p>
                            <span className='text-xs w-16'>{message.time_jalali}</span>
                        </div>
                        <div className='flex items-center justify-between px-1 w-full'>
                            <p className={`w-full text-sm ${dict_message.lang == 'en' ? 'text-left' : 'text-right'}`}>
                                {message.code == '10' ? message.content : content}
                            </p>
                        </div>
                        <div className='flex items-center justify-between px-1 w-full'>
                            <span className='text-xs underline px-2'>{message.sender}</span>
                        </div>
                    </DialogContent>
                </Dialog>
                <div className='flex items-center justify-between px-1 w-full'>
                    <p className='truncate text-xs'>
                        {message.code == '10' ? message.content : content}
                    </p>
                    <div className='flex'>
                        <span className='text-xs underline px-2'>{message.sender}</span>
                        <button className='hover:text-amber-400' onClick={handle_delete_message}><MdDeleteOutline /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

function formatString(template: string, values: { [key: string]: any }): string {
    return template.replace(/{(\w+)}/g, (match, key) => {
        return typeof values[key] !== 'undefined' ? values[key] : match;
    });
}
