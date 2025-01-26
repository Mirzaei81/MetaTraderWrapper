import React from 'react'
import ClientMessage from './ClientMessage';

const Message = ({
  dict, dict_message, len_trades, len_pending, balance
}: {
  dict: any; dict_message: any, len_trades: number, len_pending: number, balance: number,
}) => {
  return (
    <div className='w-full h-full'>
      <ClientMessage dict={dict} dict_message={dict_message} len_trades={len_trades} len_pending={len_pending} balance={balance} />
    </div>
  )
}

export default Message