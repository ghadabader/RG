// Spec 0006 INTERFACE — built early by Spec 0001 (amendment 2).
// next-intl without i18n routing (ADR 0011): the locale comes from resolveLocale(), never the URL.
import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE } from "@/lib/i18n/locales";
import { resolveLocale } from "@/lib/i18n/resolveLocale";

export default getRequestConfig(async () => {
  const locale = resolveLocale(
    (await cookies()).get(LOCALE_COOKIE)?.value,
    (await headers()).get("accept-language"),
  );
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
