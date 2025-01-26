import React from 'react'
import { TbBrandInstagram, TbBrandTelegram, TbCircleLetterC, TbMessage } from 'react-icons/tb'
import { IoLocationOutline } from "react-icons/io5";
import Link from 'next/link';
import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary'

const Footer = async ({
    params: { lang }
  } : {
    params: {lang: Locale}
  }) => {

    const dict:any = await getDictionary(lang)

    return (
    <footer>
        <div className='grid grid-cols-2 sm:grid-cols-3 h-full'>
          <div className='col-span-1 flex flex-col items-start justify-start min-w-44 sm:min-w-64'>
            <div className='flex flex-row'>
              <p className='text-md font-normal p-4 pl-2 sm:pl-6'>
              Meta Copy
              </p>
            </div>
            <div className='flex flex-col items-start gap-16'>
              <div className='flex flex-row items-start '>
                <div className="flex items-center">
                  <IoLocationOutline/>
                </div>
                <div className="flex z-10 px-2">
                  <span className='text-sm font-normal'>
                    {dict.footer.address}
                  </span>
                </div>
              </div>
              <div className="flex flex-col z-10 px-2 gap-1">
                <div className='flex flex-row items-center gap-2'>
                  <TbMessage />
                  <h1 className='heading text-lg'>
                    {dict.footer.contact}
                  </h1>
                </div>
                <span className='text-xs font-normal'>
                    +98 21 1234-1234
                </span>
              </div>
              <div className="flex flex-col z-10 px-2 gap-1">
                <div className='flex flex-row'>
                  <div>  
                    <TbCircleLetterC />
                  </div>
                  <div className='text-xs font-normal pl-2'>  
                   {dict.footer.copyright}
                  </div>
                </div>
                <span className='text-xs font-light'>
                    {dict.footer.creator}
                </span>
              </div>
            </div>
          </div>

          <div className='col-span-1 flex flex-col items-center justify-start pt-4'>
            
            <h1 className='heading text-lg'>{dict.footer.map}</h1>
            <div className='flex flex-col items-center justify-center gap-4 pt-6'>
              <Link href={`#`} className='z-20 hover:underline'>{dict.footer.faq}</Link>
              <Link href={`/${lang}/about-us`} className='z-20 hover:underline'>{dict.footer.about}</Link>
              <div className='hidden sm:block my-4 h-[3px] w-full bg-black dark:bg-white'/>
              <div className='hidden sm:flex flex-col h-full w-full items-center gap-2 '>
                <Link href={`/${lang}/privacy-policy`} className='pt-4 text-xs z-20 hover:underline'>{dict.footer.privacy}</Link>
                <Link href={`/${lang}/terms-and-conditions`} className='text-xs z-20 hover:underline'>{dict.footer.terms}</Link>
                <Link href={`/${lang}/refund-policy`} className='text-xs z-20 hover:underline'>{dict.footer.refund}</Link>
              </div>
            </div>
          </div>

          <div className='col-span-2 sm:col-span-1 flex flex-col items-center justify-start pt-4'>
            
            <h1 className='heading text-lg'>{dict.footer.social}</h1>
            <div className='flex flex-row sm:flex-col items-center justify-center gap-4 pt-6'>
              <a href="https://instagram.com" className='z-20 hover:underline flex flex-row items-center gap-2'><TbBrandInstagram/> <span className='hidden sm:flex'>{dict.footer.insta}</span></a>
              <a href="https://telegram.com" className='z-20 hover:underline flex flex-row items-center gap-2'><TbBrandTelegram /> <span className='hidden sm:flex'>{dict.footer.tel}</span></a>
            </div>
          </div>
          
          <div className='sm:hidden col-span-2 sm:col-span-1 flex flex-col items-center justify-start pt-4 pb-16 sm:pb-1'>
            
            <div className='h-[1px] w-full bg-neutral-700'/>
            <div className='flex flex-row sm:flex-col items-center justify-center gap-4 pt-6'>
              <Link href={`/${lang}/privacy-policy`} className='text-xs z-20 hover:underline'>{dict.footer.privacy}</Link>
              <Link href={`/${lang}/terms-and-conditions`} className='text-xs z-20 hover:underline'>{dict.footer.terms}</Link>
              <Link href={`/${lang}/refund-policy`} className='text-xs z-20 hover:underline'>{dict.footer.refund}</Link>
            </div>
          </div>
        </div>
    </footer>
  )
}

export default Footer