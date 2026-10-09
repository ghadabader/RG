import Link from "next/link";
import { getTranslations } from "next-intl/server";
import AuthForm from "@/components/auth/AuthForm";
import { safeNext } from "@/lib/auth/safeNext";

// Reads ?next= and ?error= on every request; see app/layout.tsx.
export const instant = false;

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const t = await getTranslations("auth");
  const next = safeNext(typeof params.next === "string" ? params.next : null);
  const nextQuery = next === "/" ? "" : `?next=${encodeURIComponent(next)}`;

  return (
    <AuthForm
      title={t("login.title")}
      action={`/api/auth/login${nextQuery}`}
      submitLabel={t("login.submit")}
      errors={[params.error ?? []].flat()}
      fields={[
        { name: "email", label: t("email"), autoComplete: "email" },
        { name: "password", label: t("password"), autoComplete: "current-password" },
      ]}
    >
      <p>
        <Link href="/forgot-password">{t("login.forgot")}</Link>
      </p>
      <p>
        {t("login.noAccount")} <Link href={`/signup${nextQuery}`}>{t("login.signup")}</Link>
      </p>
    </AuthForm>
  );
}
