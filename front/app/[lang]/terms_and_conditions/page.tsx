import React from "react";
import { Metadata } from "next"
import { Locale } from '@/i18n.config';
import { getDictionary_terms } from "@/lib/dictionary";
import { TracingBeam } from "@/components/aceternity/traceBeam";
import BlurIn from "@/components/magic/blurIn";
import Link from "next/link";
import { IoIosArrowRoundBack } from "react-icons/io";

export async function generateMetadata(
    { params }:any
  ): Promise<Metadata> {
    // read route params
    const lang = params.lang
    const t = lang==='en' ? "terms and conditions" : "شرایط و ضوابط" ;
    const description = lang === 'en' ? 'full text of terms and conditions of meta copy' : 'توضیح کامل شرایط و ضوابط سایت meta copy' ;
    return {
      title: t,
      description: description
    }
  }
  
export default async function Terms({
    params: { lang }
  } : {
    params: {lang: Locale}
  }) {
    const p = {lang};
    const dict:any = await getDictionary_terms(lang)

    return(
        <div className="flex min-h-screen flex-col items-center overflow-hidden justify-start pb-2 pt-6 px-2">
          <div className="px-5 mb-8 sm:px-10 w-full flex justify-start h-8 items-center">
            <Link href={`/${lang}?signup=1`}><IoIosArrowRoundBack className="text-3xl hover:text-4xl ease-in-out duration-200 transition"/></Link>
          </div>

          <BlurIn
            word={dict.title}
            className="text-4xl font-bold"
          />
          <TracingBeam className="px-6">
            <div className="p-3 flex flex-col items-center justify-start mt-4" dangerouslySetInnerHTML={{ __html: dict.text }}/>
          </TracingBeam>
        </div>
    )

}