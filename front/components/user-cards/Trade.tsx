
import React from 'react'
import ClientTrade from './ClientTradejs'; 

const Trade = ({
  dict, trades , stat, pending, symbols
} : {
  dict:any; trades:Array<any>; stat:Object; pending:Array<any>; symbols:Array<any>
}) => {
  return (
    <div className='w-full h-full'>
        <ClientTrade dict={dict} trades={trades} stat={stat} pending={pending} symbols={symbols}/>
    </div>
  )
}

export default Trade 