'use client';
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/shadcn/card';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
// import CalculateSummary from '@/components/user-cards/CalculateSummary'

const ClientPrice = ({ dict, symbols, trades,orders }: { dict: any; symbols: Array<any>; trades: Array<any>; orders: Array<any>; }) => {
  const [list, setList] = useState<Array<any>>(symbols);

  useEffect(() => {
    setList((prevList) => {
      if (prevList.length === 0) {
        return symbols;
      }
      return prevList.map((item) => {
        const updatedItem = symbols.find((symbol) => symbol.id === item.id);
        return updatedItem ? { ...item, ...updatedItem } : item;
      });
    });
  }, [symbols]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(list);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setList(items);
  };

  return (
    <div className='w-full h-full overflow-hidden'>
      <Card className='w-full h-full'>
        <CardHeader className='flex items-center justify-center py-2'>
          <div className='w-full flex items-center justify-between mx-3 mt-3'>
            <div className='flex items-center w-6'></div>
            <p className='font-semibold text-lg'>{dict.price.header}</p>
            <p className='w-6 hidden sm:flex'></p>
          </div>
        </CardHeader>
        <CardContent className='w-full h-full px-2 pl-1'>
          <div className='w-full overflow-hidden'>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId={'lists'}>
                {(provided: any) => (
                  <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className='h-[71.2vh] sm:h-80 overflow-y-scroll overflow-x-hidden'
                  >
                    {list.map((item: any, idx: number) => (
                      <Draggable key={item.id} draggableId={item.id.toString()} index={idx}>
                        {(provided: any) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <Item key={item.id} item={item} dict={dict} trades={trades} orders={orders} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientPrice;

interface Trade {
  symbol_id: number;
  type: 'buy' | 'sell';
  unit: number;
  entry: number;
  exit: number;
  commission: number;
  swap: number;
  profit: number;
}

interface SummaryResult {
  totalBuyVolume: number;
  totalSellVolume: number;
  totalBuyPrice: number;
  totalSellPrice: number;
  totalBuy: number;
  totalSell: number;
  totalCommission: number;
  totalSwap: number;
  netProfitLoss: number;
  avgBuyPrice?: number;
  avgSellPrice?: number;
}

function CalculateSummary(trades: Trade[], id: number): SummaryResult {
  const result: SummaryResult = {
    totalBuyVolume: 0,
    totalSellVolume: 0,
    totalBuyPrice: 0,
    totalSell: 0,
    totalBuy: 0,
    totalSellPrice: 0,
    totalCommission: 0,
    totalSwap: 0,
    netProfitLoss: 0,
  };

  trades.forEach((trade) => {
    if (trade.symbol_id === id) {
      const type = trade.type;

      if (type === 'buy') {
        result.totalBuy += 1;
        result.totalBuyVolume += trade.unit;
        result.totalBuyPrice += trade.entry * trade.unit;
      } else if (type === 'sell') {
        result.totalSell += 1;
        result.totalSellVolume += trade.unit;
        result.totalSellPrice += trade.entry * trade.unit;
      }

      result.totalCommission += trade.commission;
      result.totalSwap += trade.swap;
      result.netProfitLoss += trade.profit;
    }
  });

  result.avgBuyPrice = result.totalBuyVolume > 0 ? result.totalBuyPrice / result.totalBuyVolume : 0;
  result.avgSellPrice = result.totalSellVolume > 0 ? result.totalSellPrice / result.totalSellVolume : 0;

  return result;
}
// ========================================

interface Order {
  symbol: number;
  type: 'buy' | 'sell';
  unit: number;
  price: number;
  exit: number;
  commission: number;
  swap: number;
  profit: number;
}

interface OrderSummaryResult {
  totalBuyVolume: number;
  totalSellVolume: number;
  totalBuyPrice: number;
  totalSellPrice: number;
  totalBuy: number;
  totalSell: number;
  totalCommission: number;
  totalSwap: number;
  netProfitLoss: number;
  avgBuyPrice?: number;
  avgSellPrice?: number;
}

function OrderCalculateSummary(order: Order[], id: number): OrderSummaryResult {
  const result: SummaryResult = {
    totalBuyVolume: 0,
    totalSellVolume: 0,
    totalBuyPrice: 0,
    totalSell: 0,
    totalBuy: 0,
    totalSellPrice: 0,
    totalCommission: 0,
    totalSwap: 0,
    netProfitLoss: 0,
  };

  order.forEach((order) => {

    if (order.symbol === id) {
      const type = order.type;

      if (type === 'buy') {
        result.totalBuy += 1;
        result.totalBuyVolume += order.unit;
        result.totalBuyPrice += order.price * order.unit;
      } else if (type === 'sell') {
        result.totalSell += 1;
        result.totalSellVolume += order.unit;
        result.totalSellPrice += order.price * order.unit;
      }
    }
  });

  result.avgBuyPrice = result.totalBuyVolume > 0 ? result.totalBuyPrice / result.totalBuyVolume : 0;
  result.avgSellPrice = result.totalSellVolume > 0 ? result.totalSellPrice / result.totalSellVolume : 0;

  return result;
}



function matchDecimalPlaces(num1: number, num2: number): number {
  const num1DecimalPlaces = (num1.toString().split('.')[1] || '').length;
  return parseFloat(num2.toFixed(num1DecimalPlaces));
}

interface ItemInt {
  item: any;
  dict: any;
  trades: Array<any>;
  orders: Array<any>;
}
import Divider from '@mui/material/Divider';

const Item = ({ item, dict, trades , orders}: ItemInt) => {
  const [isOpen, setIsOpen] = useState(false);
  let resault = CalculateSummary(trades, item.id)
  let orders_resault = OrderCalculateSummary(orders, item.id)
  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <li
      onClick={toggleOpen}
      className='flex flex-col items-center justify-between px-4 my-3 w-full list-none border-b dark:border-slate-700 cursor-pointer transition-all duration-300'
    >
      <div className='flex items-center justify-between w-full'>
        <div className='grid grid-cols-2 items-center justify-start w-[56vw] sm:w-auto mr-6'>
          <div className='col-span-1 flex flex-col items-center justify-start w-[23vw] sm:w-auto'>
            <p className='font-bold w-full text-left sm:mx-1'>{item.ask}</p>
            <p className='text-xs w-full text-left sm:mx-1'>{item.high} H</p>
          </div>
          <div className='col-span-1 flex flex-col items-center justify-start w-[23vw] sm:w-auto'>
            <p className='font-bold w-full text-left sm:mx-1'>{item.bid}</p>
            <p className='text-xs w-full text-left sm:mx-1'>{item.low} L</p>
          </div>
        </div>
        <div className='flex flex-col items-center justify-end'>
          <div className='flex items-center justify-end w-full'>
            <p className='font-bold'>{item.names[dict.lang] || 'No Name'}</p>
          </div>
          <div className='py-1 flex items-center justify-end w-full text-xs sm:text-sm font-medium'>
            {item.last_update.split('.')[0]}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className='overflow-hidden transition-all duration-500 ease-in-out w-full mt-0 dark:bg-slate-800 p-1 rounded-md' dir={dict.lang === 'en' ? 'ltr' : 'rtl'}>
          <div className='w-full'>

            <div className='flex justify-between items-center w-full'>
              <span className='w-1/2 text-start'>{dict.price.avgBuyPrice}</span>
              <span className='w-1/2 text-end'>{matchDecimalPlaces(item.bid, resault.avgBuyPrice ?? 0)}</span>
            </div>

            <div className='flex justify-between items-center w-full'>
              <span className='w-1/2 text-start'>{dict.price.avgSellPrice}</span>
              <span className='w-1/2 text-end'>{matchDecimalPlaces(item.bid, resault.avgSellPrice ?? 0)}</span>
            </div>

            <div className='flex justify-between items-center w-full'>
              <span className='w-1/2 text-start'>{dict.price.totalBuy}</span>
              <span className='w-1/2 text-end'>{resault.totalBuy ?? 0}</span>
            </div>

            <div className='flex justify-between items-center w-full'>
              <span className='w-1/2 text-start'>{dict.price.totalSell}</span>
              <span className='w-1/2 text-end'>{resault.totalSell ?? 0}</span>
            </div>

            <div className='flex justify-between items-center w-full'>
              <span className='w-1/2 text-start'>{dict.price.totalBuyVol}</span>
              <span className='w-1/2 text-end'>{resault.totalBuyVolume ?? 0}</span>
            </div>

            <div className='flex justify-between items-center w-full'>
              <span className='w-1/2 text-start'>{dict.price.totalSellVol}</span>
              <span className='w-1/2 text-end'>{resault.totalSellVolume ?? 0}</span>
            </div>

            <div className='flex justify-between items-center w-full'>
              <span className='w-1/2 text-start'>{dict.price.totalCommission}</span>
              <span className='w-1/2 text-end'>{resault.totalCommission.toFixed(2) ?? 0}</span>
            </div>

            <div className='flex justify-between items-center w-full'>
              <span className='w-1/2 text-start'>{dict.price.totalSwap}</span>
              <span className='w-1/2 text-end'>{resault.totalSwap.toFixed(2) ?? 0}</span>
            </div>

            <div className='flex justify-between items-center w-full'>
              <span className='w-1/2 text-start'>{dict.price.netPnL}</span>
              <span className='w-1/2 text-end'>{resault.netProfitLoss.toFixed(2) ?? 0}</span>
            </div>


            <Divider />



            <div className='flex justify-between items-center w-full'>
              <span className='w-1/2 text-start'>{dict.price.orderavgBuyPrice}</span>
              <span className='w-1/2 text-end'>{matchDecimalPlaces(item.bid, orders_resault.avgBuyPrice ?? 0)}</span>
            </div>

            <div className='flex justify-between items-center w-full'>
              <span className='w-1/2 text-start'>{dict.price.orderavgSellPrice}</span>
              <span className='w-1/2 text-end'>{matchDecimalPlaces(item.bid, orders_resault.avgSellPrice ?? 0)}</span>
            </div>

            <div className='flex justify-between items-center w-full'>
              <span className='w-1/2 text-start'>{dict.price.ordertotalBuy}</span>
              <span className='w-1/2 text-end'>{orders_resault.totalBuy ?? 0}</span>
            </div>

            <div className='flex justify-between items-center w-full'>
              <span className='w-1/2 text-start'>{dict.price.ordertotalSell}</span>
              <span className='w-1/2 text-end'>{orders_resault.totalSell ?? 0}</span>
            </div>

            <div className='flex justify-between items-center w-full'>
              <span className='w-1/2 text-start'>{dict.price.ordertotalBuyVol}</span>
              <span className='w-1/2 text-end'>{orders_resault.totalBuyVolume ?? 0}</span>
            </div>

            <div className='flex justify-between items-center w-full'>
              <span className='w-1/2 text-start'>{dict.price.ordertotalSellVol}</span>
              <span className='w-1/2 text-end'>{orders_resault.totalSellVolume ?? 0}</span>
            </div>


          </div>
        </div>
      )}
    </li>);
};
