import React from 'react'
import ClientResult from './ClientResult';
import { Locale } from '@/i18n.config';
import { getDictionary_payment } from "@/lib/dictionary";

export default async function Page({
    params: { lang }
  } : {
    params: {lang: Locale}
  }) {
    const p = {lang};
    const dict:any = await getDictionary_payment(lang)
  
    return (
        <ClientResult dict={dict}/>
    )
}
