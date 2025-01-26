import NavigationSmall from "@/components/NavigationSmall";
import { Locale } from '@/i18n.config';
import { getDictionary, getDictionary_user, getDictionary_message } from "@/lib/dictionary";
import ClientPage from "./ClientPage";



export default async function Home({
  params: { lang }
} : {
  params: {lang: Locale}
}) {

  const p = {lang};
  
  const dict:any = await getDictionary_user(lang)
  const dict2:any = await getDictionary(lang)
  const dict_message:any = await getDictionary_message(lang)
  
  return (
    <div className="flex items-center justify-items-center w-full
    min-h-screen p-4 pb-20 sm:p-6 bg-slate-200 dark:bg-slate-900"
    suppressHydrationWarning >
        <NavigationSmall params={p}/>
        <ClientPage dict={dict} dict2={dict2} dict_message={dict_message} lang={lang}/>
    </div>
  );
}
