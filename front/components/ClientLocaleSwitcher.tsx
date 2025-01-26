"use client";
import React from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/shadcn/collapsible"
import { i18n, type Locale } from "@/i18n.config";
import { usePathname } from "next/navigation";
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu"

import { RxCaretDown } from "react-icons/rx";
import LanguageIcon from '@mui/icons-material/Language';
const ClientLocaleSwitcher = ({
  dict
}: {
  dict: any
}) => {
  const pathName = usePathname();
  const redirectedPathName = (locale: Locale) => {
    if (!pathName) return "/";
    const segments = pathName.split("/");
    segments[1] = locale;
    return segments.join("/");
  };

  return (
    <div className="flex items-center justify-center w-full">
      <div className="flex">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-center h-full ">
              <LanguageIcon sx={{m:1}} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {i18n.locales.map((locale) => (
              <div key={locale}>
                <DropdownMenuItem><Link href={redirectedPathName(locale)} className="w-full">{locale}</Link></DropdownMenuItem>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* <div className="sm:hidden w-full">
        <Collapsible className={`w-full flex flex-col justify-end ${dict.lang == "language" ? 'items-start' : 'items-end'} `}>
          <CollapsibleTrigger dir={dict.lang == "language" ? 'ltr' : 'rtl'}><span>{dict.lang}</span> <RxCaretDown className='inline' /></CollapsibleTrigger>
          <CollapsibleContent className='w-full'>
            {i18n.locales.map((locale: any) => (
              <div dir={dict.lang == "language" ? 'ltr' : 'rtl'} key={locale} className='border-b p-2 w-full'>
                <Link href={redirectedPathName(locale)} className="w-full">{dict[locale]}</Link>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div> */}
    </div>
  )
}

export default ClientLocaleSwitcher