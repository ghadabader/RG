import { getTranslations } from "next-intl/server";
import AuthForm from "@/components/auth/AuthForm";

// Needs a session; the recovery session from /auth/confirm counts (enforced by proxy.ts).
// Reads the query string on every request; see app/layout.tsx.
export const instant = false;

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const params = await searchParams;
  const t = await getTranslations("auth");

  return (
    <AuthForm
      title={t("reset.title")}
      action="/api/auth/reset-password"
      submitLabel={t("reset.submit")}
      errors={[params.error ?? []].flat()}
      fields={[{ name: "password", label: t("newPassword"), autoComplete: "new-password" }]}
    />
  );
}
