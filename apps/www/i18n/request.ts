import { getRequestConfig } from "next-intl/server";

import { loadMessages } from "./messages";
import { defaultLocale, isLocale, type Locale } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale: Locale =
    typeof locale === "string" && isLocale(locale) ? locale : defaultLocale;

  return {
    locale: resolvedLocale,
    messages: await loadMessages(resolvedLocale),
  };
});
