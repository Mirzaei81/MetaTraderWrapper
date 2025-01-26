import React from 'react'
import ClientChart from './ClientChart';


const Chart = ({
  dict
} : {
  dict:any
  }) => {
    
    return(
    <div className='w-full h-full'>
        <ClientChart dict={dict}/>
    </div>
    )
}

export default Chart

