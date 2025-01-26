import ClientSideSignup from "./ClientSideSignup";
import { Metadata } from "next";
import { Locale } from '@/i18n.config';
import { getDictionary_form } from "@/lib/dictionary";

export const metadata: Metadata = {
  title: "Signup | Crypto Punch",
  description: "sign up to crypto punch",
};

export default async function Signup({
  params: { lang }
}: {
  params: { lang: Locale }
}) {
  const dict = await getDictionary_form(lang);

  return (
    <main className="flex min-h-screen flex-col items-center overflow-hidden justify-start">
      <ClientSideSignup dict={dict} lang={lang} />
    </main>
  );
}
