import NavigationSmall from "@/components/NavigationSmall";
import { Locale } from '@/i18n.config';
import { getDictionary_payment } from "@/lib/dictionary";

import React  from "react";
import ClientPayment from "./ClientPayment";


export default async function Payment({
  params: { lang }
} : {
  params: {lang: Locale}
}) {
  const p = {lang};
  const dict:any = await getDictionary_payment(lang)

  return (
    <div className="flex items-center justify-items-center w-full
    min-h-screen p-4 pb-20 sm:p-6 bg-slate-200 dark:bg-slate-900">
        <NavigationSmall params={p}/>
        <ClientPayment dict={dict}/>
    </div>
  );
}
