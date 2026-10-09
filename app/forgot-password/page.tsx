import Link from "next/link";
import { getTranslations } from "next-intl/server";
import AuthForm from "@/components/auth/AuthForm";

// Reads the query string on every request; see app/layout.tsx.
export const instant = false;

export default async function ForgotPasswordPage({ searchParams }: PageProps<"/forgot-password">) {
  const params = await searchParams;
  const t = await getTranslations("auth");

  return (
    <AuthForm
      title={t("forgot.title")}
      action="/api/auth/forgot-password"
      submitLabel={t("forgot.submit")}
      notice={params.sent === "1" ? t("forgot.sent") : undefined}
      errors={[params.error ?? []].flat()}
      fields={[{ name: "email", label: t("email"), autoComplete: "email" }]}
    >
      <p>
        <Link href="/login">{t("forgot.back")}</Link>
      </p>
    </AuthForm>
  );
}
