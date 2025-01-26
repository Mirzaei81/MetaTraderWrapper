'use client';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/shadcn/select";
import TradeCard from "@/components/user-cards/TradeCard";
import OrderCard from "@/components/user-cards/OrderCard";
import GroupClose from "@/components/user-cards/GroupClose";
import { LuFilePlus2 } from "react-icons/lu";
import { Input } from '../shadcn/input';
import { Checkbox } from '../shadcn/checkbox';
import { toast } from 'sonner';
import { Grid2 } from '@mui/material';
import IconButton from '@mui/material/IconButton';

const ClientTrade = ({ dict, trades, stat, pending, symbols }) => {
    const [marketPrice, setMarketPrice] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [list, setList] = useState(trades);
    const [statistic, setStatistic] = useState(stat);
    const [pending_order, setPending] = useState(pending);
    const [symbols_list, setSymbols_list] = useState(symbols);
    const [symbolToTrade, setSymbolToTrade] = useState("");
    const [askValue, setAskValue] = useState("");
    const [bidValue, setBidValue] = useState("");
    const [maxLeverage, setMaxLeverage] = useState("");
    // console.log({list})
    useEffect(() => {
        setList(trades);
        setStatistic(stat);
        setPending(pending);
        setSymbols_list(symbols);
        const selectedPair = symbols.find(symbol => symbol.id === symbolToTrade);
        if (selectedPair) {
            setAskValue(selectedPair.ask);
            setBidValue(selectedPair.bid);
            setMaxLeverage(selectedPair.max_leverage);
        }
    }, [trades, stat, pending, symbols]);

    const handleSymbolSelectChange = (value) => {
        setSymbolToTrade(value);
        if (symbols) {
            const selectedPair = symbols.find(symbol => symbol.symbol_id === value);
            if (selectedPair) {
                setAskValue(selectedPair.ask);
                setBidValue(selectedPair.bid);
                setMaxLeverage(selectedPair.max_leverage);
            }
        }
    };
    const [price, setPrice] = useState(0);
    const [unit, setUnit] = useState(1);
    const [leverage, setLeverage] = useState(1);
    const [sl, setSl] = useState(0);
    const [tp, setTp] = useState(0);

    const handleTrade = async (type) => {
        const token = sessionStorage.getItem('token');

        if (!symbolToTrade) {
            toast(dict.trade.errors.symbol_notfound);
            return;
        }
        if (!unit) {
            toast(dict.trade.errors.unit_empty);
            return;
        }
        if (!leverage) {
            toast(dict.trade.errors.leverage_empty);
            return;
        }

        setIsLoading(true);
        const data = {
            token: token,
            symbol: symbolToTrade,
            type: type,
            price: marketPrice ? 0 : price,
            unit: unit,
            leverage: leverage,
            sl: sl || 0,
            tp: tp || 0,
        };
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mt5/trade`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast(dict.trade.success);
                setPrice(0)
                setUnit(1)
                setLeverage(1)
                setSl(0)
                setTp(0)
                setSymbolToTrade('')
                setMarketPrice(false)
            } else {
                const errorData = await response.json();
                toast(errorData.error);
            }
        } catch (error) {
            toast(dict.trade.sth_went_wrong);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='w-full h-full sm:h-full overflow-y-scroll overflow-x-hidden'>
            <Card className='w-full h-full overflow-hidden'>
                <CardHeader className='flex items-center justify-center py-2'>
                    <div className='w-full flex items-center justify-between mx-3 mt-3'>
                        <Drawer>
                            <div className=' flex flex-row top-0 left-0 m-0 mx-0 px-0'>
                                <div className="relative px-2 py-1"    >
                                    <DrawerTrigger className='flex items-center w-6'>
                                        <IconButton color="inherit" size='small'  >
                                            <LuFilePlus2 className='text-xl' />
                                        </IconButton>
                                    </DrawerTrigger>
                                </div>
                                <div className="relative px-2 my-0 py-0 "    >
                                    <GroupClose dict={dict} />
                                </div>
                            </div>
                            <DrawerContent className='sm:w-[50vw] mx-auto pb-16'>
                                <DrawerHeader className='flex items-center justify-between'>
                                    <DrawerTitle></DrawerTitle>
                                </DrawerHeader>
                                <div className='w-full flex items-center justify-center mb-3'>
                                    <p>{dict.trade.title}</p>
                                </div>
                                <div className='flex items-center justify-center my-3 w-full'>
                                    <Select onValueChange={handleSymbolSelectChange} value={symbolToTrade}>
                                        <SelectTrigger className="w-48 min-w-[12rem]">
                                            <SelectValue placeholder={dict.price.placeholder} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {symbols.map((symbol, idx) => (
                                                <div key={idx}>
                                                    <SelectItem
                                                        value={symbol.id}
                                                        className='w-full flex items-center justify-between'
                                                    >
                                                        <span>{symbol.names[dict.lang]}</span>
                                                    </SelectItem>
                                                </div>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='flex items-center justify-center my-3'>
                                    <span className='text-sky-500 px-2'>{askValue}</span>
                                    <div >
                                        <label htmlFor='price' className='z-10 bg-white dark:bg-slate-950 h-3 translate-y-0 px-1 mx-1 dark:bg-[#020617]'>{dict.trade.placeholder}</label>
                                        <Input
                                            id="price" placeholder={dict.trade.placeholder}
                                            className='w-48'
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            disabled={marketPrice || !symbolToTrade} />
                                    </div>
                                    <span className='text-red-500 px-2'>{bidValue}</span>
                                </div>
                                <div className='flex items-center justify-center my-3'>
                                    <Checkbox id="market_price" checked={marketPrice} onCheckedChange={() => setMarketPrice(!marketPrice)} />
                                    <label
                                        htmlFor="market_price"
                                        className="z-10 bg-white dark:bg-slate-950 text-sm mx-2 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {dict.trade.market}
                                    </label>
                                </div>
                                <div className='flex items-center justify-center my-3 '>
                                    <div className='px-3 ' style={{ maxWidth: '220px' }}>
                                        <label htmlFor='sl' className='z-10 bg-white dark:bg-slate-950 h-3 translate-y-0 px-1 mx-1 dark:bg-[#020617]'>{dict.trade.sl}</label>
                                        <Input id='sl' type="number"
                                            value={sl} style={{ borderColor: sl < 0 ? 'red' : '' }}
                                            onChange={(e) => setSl(e.target.value)}

                                            name="sl" />
                                    </div>
                                    <div className='px-3 ' style={{ maxWidth: '220px' }} >
                                        <label htmlFor='tp' className='z-10 bg-white dark:bg-slate-950 h-3 translate-y-0 px-1 mx-1 dark:bg-[#020617]'>{dict.trade.tp}</label>
                                        <Input id='tp' type="number"
                                            value={tp} style={{ borderColor: tp < 0 ? 'red' : '' }}
                                            onChange={(e) => setTp(e.target.value)}
                                            name="tp" />
                                    </div>
                                </div>
                                <div className='flex items-center justify-center my-3  '>
                                    <div >
                                        <label htmlFor='leverage' className='z-10 bg-white dark:bg-slate-950 h-3 translate-y-0 px-1 mx-1 dark:bg-[#020617]'>{dict.trade.leverage}</label>
                                        <Input id='leverage' type="number" className="w-48 min-w-[12rem]"
                                            value={leverage} style={{ borderColor: leverage <= 0 ? 'red' : '' }}
                                            onChange={(e) => {
                                                const newValue = e.target.value;
                                                const parsedValue = parseInt(newValue, 10);
                                                if (!isNaN(parsedValue)) {
                                                    setLeverage(parsedValue);
                                                } else if (newValue === "") {
                                                    setLeverage("");
                                                }

                                            }}
                                            // min={1}
                                            step={1}
                                            name="leverage" />
                                    </div>
                                </div>
                                <div className='flex items-center justify-center my-3'>
                                    <div >
                                        <label htmlFor='unit' className='z-10 bg-white dark:bg-slate-950 h-3 translate-y-0 px-1 mx-1 dark:bg-[#020617]'>{dict.trade.lot}</label>
                                        <Input id='unit' type="number" className="w-48 min-w-[12rem]"
                                            value={unit} style={{ borderColor: unit <= 0 ? 'red' : '' }}
                                            onChange={(e) => {
                                                const newValue = e.target.value;
                                                const parsedValue = parseInt(newValue, 10);

                                                if (!isNaN(parsedValue)) {
                                                    setUnit(parsedValue);
                                                } else if (newValue === "") {
                                                    setUnit("");
                                                }

                                                // if (/^\d*$/.test(e.target.value)) setUnit(Math.floor(e.target.value) ) 

                                            }}
                                            // min={1}
                                            step={1}
                                            name="unit" />
                                    </div>
                                </div>
                                <div className='flex items-center justify-center '>
                                    <button onClick={() => handleTrade('buy')}
                                        disabled={isLoading || !symbolToTrade || (price == 0 && !marketPrice) || leverage <= 0 || unit <= 0 || tp < 0 || sl < 0 
                                            || (!marketPrice && sl>price && tp !=0)  || (!marketPrice && tp<price && tp !=0)

                                        }
                                        className='bg-sky-500 px-5 py-1 mx-2 rounded-md hover:bg-sky-600'>{isLoading ? dict.trade.loading_btn : dict.trade.buy}</button>
                                    <button onClick={() => handleTrade('sell')}
                                        disabled={isLoading || !symbolToTrade || (price == 0 && !marketPrice) || leverage <= 0 || unit <= 0 || tp < 0 || sl < 0
                                            || (!marketPrice && sl<price && sl!=0)  || (!marketPrice && tp>price&& sl!=0)

                                        }
                                        className='bg-red-500 px-5 py-1 mx-2 rounded-md hover:bg-red-600'>{isLoading ? dict.trade.loading_btn : dict.trade.sell}</button>
                                </div>
                            </DrawerContent>
                        </Drawer>
                        <p className='font-semibold text-lg'>{dict.trade.header}</p>
                        <p className='w-6 hidden sm:flex'></p>
                    </div>
                </CardHeader>
                <CardContent className='w-full px-2 pl-1'>
                    <div className='w-full h-full flex flex-col items-center justify-start px-3' dir={dict.trade.header === "Trades" ? 'ltr' : 'rtl'}>
                        <div className='w-full flex items-center justify-center'>
                            <p className='whitespace-nowrap'>{dict.trade.balance}</p>
                            <div className='w-full mx-6 border-b-2 border-dotted dark:border-slate-700' />
                            <p>{statistic.balance ? statistic.balance.toFixed(2) : '0.0'}</p>
                        </div>
                        <div className='w-full flex items-center justify-center'>
                            <p className='whitespace-nowrap'>{dict.trade.equity}</p>
                            <div className='w-full mx-6 border-b-2 border-dotted dark:border-slate-700' />
                            <p>{statistic.equity ? statistic.equity.toFixed(2) : '0.0'}</p>
                        </div>
                        <div className='w-full flex items-center justify-center'>
                            <p className='whitespace-nowrap'>{dict.trade.margin}</p>
                            <div className='w-full mx-6 border-b-2 border-dotted dark:border-slate-700' />
                            <p>{statistic.free_margin ? statistic.margin.toFixed(2) : '0.0'}</p>
                        </div>
                        <div className='w-full flex items-center justify-center'>
                            <p className='whitespace-nowrap'>{dict.trade.free_m}</p>
                            <div className='w-full mx-6 border-b-2 border-dotted dark:border-slate-700' />
                            <p>{statistic.free_margin ? statistic.free_margin.toFixed(2) : '0.0'}</p>
                        </div>
                        <div className='w-full flex items-center justify-center'>
                            <p className='whitespace-nowrap'>{dict.trade.margin_level}</p>
                            <div className='w-full mx-6 border-b-2 border-dotted dark:border-slate-700' />
                            <p>{statistic.free_margin ? statistic.margin_level.toFixed(2) : '0.0'}</p>
                        </div>
                        <div className='w-full h-2 border-b dark:border-slate-700' />
                    </div>

                    <Grid2 dir={dict.trade.header === "Trades" ? 'ltr' : 'rtl'}
                        container
                        sx={{
                            width: '100%',
                            maxHeight: { xs: '55vh', sm: '14rem' },
                            minHeight: { xs: '55vh', sm: '14rem' },
                            paddingX: 3,
                            paddingy: 3,
                            overflowY: 'scroll',
                            overflowX: 'hidden',
                        }}

                    >


                        {list.map((trade, idx) => (
                            <TradeCard  trade={trade} dict={dict} idx={idx} />
                        ))}

                        <hr className='w-full mt-4' />
                        <p className='w-full h-4 text-center translate-y-[-15px]'><span className='px-2 my-2 bg-white dark:bg-slate-950'>{dict.pending}</span></p>

                        {pending_order.map((order, idx) => (
                              <OrderCard  order={order} dict={dict} idx={idx} />       
                        ))}



                    </Grid2>
                </CardContent>
            </Card>
        </div>
    );
};

export default ClientTrade;
