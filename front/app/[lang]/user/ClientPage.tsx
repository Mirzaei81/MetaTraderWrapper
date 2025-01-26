'use client';
import React, { useEffect, useState, useRef } from 'react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn/tabs"
import { LuHistory, LuMessageSquare, LuFileBarChart2 } from "react-icons/lu";
import { CgArrowsExchangeAltV } from "react-icons/cg";
import Prices from "@/components/user-cards/Prices";
import Trade from "@/components/user-cards/Trade";
import History from "@/components/user-cards/History";
import Message from "@/components/user-cards/Message";
import { useRouter } from 'next/navigation';
import { useAppContext } from "@/context";

type StatType = {
  balance: number;
  equity?: number;
  free_margin?: number;
  margin_level?: number;
  margin?: number;
};


const ClientPage = (
  { dict, dict2, dict_message, lang }:
    { dict: any; dict2: any; dict_message: any; lang: string }
) => {

  const { user, setUser } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [symbols, setSymols] = useState<Array<any>>([]);
  const [trades, setTrades] = useState<Array<any>>([]);
  const [pending, setPending] = useState<Array<any>>([]);
  const [stat, setStat] = useState<StatType>({ balance: 0 });
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push(`/${lang}`);
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user) {
      setIsLoading(false);
    }
  }, [user]);


  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connectWebSocket = () => {
    const token = sessionStorage.getItem('token');

    if (!token) {
      console.error('No authentication token found!');
      return;
    }
    const socketUrl = `${process.env.NEXT_PUBLIC_TRADELIST_URL}/?token=${token}`;
    socketRef.current = new WebSocket(socketUrl);

    socketRef.current.onopen = () => {
      console.log('WebSocket connected');
      reconnectAttempts.current = 0;
    };
    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.pairs) setSymols(data.pairs)
        if (data.trades) setTrades(data.trades)
        if (data.pending) setPending(data.pending)
        if (data.statistic) setStat({ ...stat, ...data.statistic })
        // console.log(typeof data.statistic)
        // if (data.transaction) setTransaction(data.transaction) trades.length trades.length pending.length  data.statistic.balance
        // console.log(data.transaction)
        // console.log(data.trades[1].profit)
        // console.log(data.statistic.equity)[...stat, ...data.statistic]
        // console.log({'data.messages':data.messages})

      } catch (error) {
        console.error('Error parsing message from server:', error);
      }
    };

    socketRef.current.onclose = (event) => {
      console.log('WebSocket disconnected:', event);
      if (!event.wasClean && reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current += 1;
        const reconnectDelay = Math.min(5000, 1000 * reconnectAttempts.current);
        setTimeout(() => {
          console.log(`Attempting to reconnect... (${reconnectAttempts.current})`);
          connectWebSocket();
        }, reconnectDelay);
      } else if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error('Max reconnect attempts reached.');
      }
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  if (isLoading) {
    return <div className='w-full text-center text-xl'>Loading...</div>;
  }


  return (
    <main className="flex flex-col items-start sm:items-start w-full min-h-screen  md:pt-10">

      <div className="fixed bottom-0 left-0 md:relative flex h-full w-full items-center justify-center">
        <Tabs defaultValue="price" className="w-full h-full flex flex-col items-center justify-center md:hidden object-cover ">
          <div className="pt-10 w-full h-full object-cover">
            <TabsContent className="contents md:hidden" value="message"><Message dict={dict} dict_message={dict_message} len_trades={trades.length} len_pending={pending.length} balance={stat.balance ?? 0} /></TabsContent>
            <TabsContent className="contents md:hidden" value="history"><History dict={dict} len_trades={trades.length} len_pending={pending.length} balance={stat.balance ?? 0} /></TabsContent>
            <TabsContent className="contents md:hidden" value="trade"><Trade dict={dict} trades={trades} pending={pending} stat={stat} symbols={symbols} /></TabsContent>

            <TabsContent className="contents md:hidden" value="price"><Prices dict={dict} symbols={symbols} trades={trades} orders={pending} /></TabsContent>
          </div>
          <TabsList className="my-2 md:my-0">
            <TabsTrigger className="flex flex-col md:flex-row" value="message"><LuMessageSquare className=' md:mx-1' /><span>{dict2.nav.message}</span></TabsTrigger>
            <TabsTrigger className="flex flex-col md:flex-row" value="history"><LuHistory className='md:mx-1' /><span>{dict2.nav.history}</span></TabsTrigger>
            <TabsTrigger className="flex flex-col md:flex-row" value="trade"><LuFileBarChart2 className='md:mx-1' /><span>{dict2.nav.trade}</span></TabsTrigger>

            <TabsTrigger className="flex flex-col md:flex-row" value="price"><CgArrowsExchangeAltV className='md:mx-1' /><span>{dict2.nav.price}</span></TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="h-full w-full  hidden md:grid grid-cols-6 grid-rows-2 gap-5 ">
        <div className="col-span-3 lg:col-span-2 flex items-center justify-center ">
          <Prices dict={dict} symbols={symbols} trades={trades} orders={pending} />
        </div>
        <div className="col-start-4 lg:col-start-3 col-span-3 lg:col-span-4 row-span-1 flex items-center justify-center w-full h-full">
          <Trade dict={dict} trades={trades} stat={stat} pending={pending} symbols={symbols} />
        </div>

        <div className="col-start-1 col-span-4 row-start-2 row-span-1 flex items-center justify-center w-full h-full">
          <History dict={dict} len_trades={trades.length} len_pending={pending.length} balance={stat.balance ?? 0} />
        </div>
        <div className="col-start-5 col-span-2 row-start-2 row-span-1 flex items-center justify-center w-full h-full">
          <Message dict={dict} dict_message={dict_message} len_trades={trades.length} len_pending={pending.length} balance={stat.balance ?? 0} />
        </div>

      </div>

    </main>
  )
}

export default ClientPage