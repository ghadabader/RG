// Only same-site relative paths are allowed as post-login destinations (Spec 0001 ACCEPT 7).
export function safeNext(value: string | null | undefined): string {
  if (typeof value !== "string") return "/";
  // Browsers strip tabs and newlines from URLs, so "/\t/evil" would become "//evil".
  if (/[\u0000-\u001f\u007f]/.test(value)) return "/";
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/";
  return value;
}
