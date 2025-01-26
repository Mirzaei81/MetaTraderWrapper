"use client";
import React from 'react'
import IconButton from '@mui/material/IconButton';
import LanguageIcon from '@mui/icons-material/Language';
import { i18n, type Locale } from "@/i18n.config";
import { usePathname } from "next/navigation";
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu"

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
          <DropdownMenuTrigger className="flex items-center justify-center h-full">
            <IconButton color="inherit">
              <LanguageIcon />
            </IconButton>
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
    </div>
  )
}

export default ClientLocaleSwitcher