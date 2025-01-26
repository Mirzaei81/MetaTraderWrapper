import React from 'react'
import ClientPrice from './ClientPrice';


const Prices = ({
  dict, symbols,trades,orders
} : {
  dict:any , symbols:Array<any>;trades:Array<any>;orders:Array<any>;
}) => {
    return(
    <div className='w-full h-full'>
        <ClientPrice dict={dict} symbols={symbols} trades={trades} orders={orders}  />
    </div>
    )
}

export default Prices

