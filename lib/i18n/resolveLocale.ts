// Spec 0006 INTERFACE — built early by Spec 0001 (amendment 2).
// Order (ADR 0010): cookie → best Accept-Language match → en. Unknown cookie values are ignored.
import { DEFAULT_LOCALE, isLocale, type Locale } from "./locales";

export function resolveLocale(
  cookieValue: string | null | undefined,
  acceptLanguageHeader: string | null | undefined,
): Locale {
  if (isLocale(cookieValue)) return cookieValue;
  return bestAcceptLanguageMatch(acceptLanguageHeader) ?? DEFAULT_LOCALE;
}

function bestAcceptLanguageMatch(header: string | null | undefined): Locale | null {
  if (!header) return null;
  const ranked = header
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { language: tag.trim().toLowerCase().split("-")[0], q: q ? Number(q.slice(2)) : 1, index };
    })
    .filter((entry) => entry.language && Number.isFinite(entry.q) && entry.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  return ranked.map((entry) => entry.language).find(isLocale) ?? null;
}
