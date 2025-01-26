import React from 'react'
import ClientHistory from './ClientHistory';

const History = ({
  dict, len_trades, len_pending, balance
}: {
  dict: any, len_trades: number, len_pending: number, balance: number,
}) => {
  return (
    <div className='w-full h-full'>
      <ClientHistory dict={dict} len_trades={len_trades} len_pending={len_pending} balance={balance} />
    </div>
  )
}

export default History