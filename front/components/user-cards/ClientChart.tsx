import React from 'react'
import {
    Card,
    CardContent,
  } from "@/components/shadcn/card"

const ClientChart = ({dict}:{dict:any}) => {
  return (
    <div className='w-full h-full sm:h-full overflow-y-scroll overflow-x-hidden'>
        <Card className='w-full h-full'>
            <CardContent className='w-full h-full px-2 pl-1'>
                <div className='w-full h-full flex items-center justify-center'>
                    <p>Chart</p>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}

export default ClientChart