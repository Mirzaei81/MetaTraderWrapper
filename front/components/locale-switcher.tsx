
import { Locale } from "@/i18n.config";
import ClientLocaleSwitcher from "./ClientLocaleSwitcher";
import { getDictionary_menu } from "@/lib/dictionary";

export default async function LocaleSwitcher({
  params: { lang }
}: {
  params: { lang: Locale }
}) {
  const dict = await getDictionary_menu(lang); 

  return (
    <div className="w-full">
      <ClientLocaleSwitcher dict={dict} />
    </div>
  );
}
