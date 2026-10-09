import Link from "next/link";
import { getTranslations } from "next-intl/server";
import AuthForm from "@/components/auth/AuthForm";
import { safeNext } from "@/lib/auth/safeNext";

// Reads ?next= and ?error= on every request; see app/layout.tsx.
export const instant = false;

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const params = await searchParams;
  const t = await getTranslations("auth");
  const next = safeNext(typeof params.next === "string" ? params.next : null);
  const nextQuery = next === "/" ? "" : `?next=${encodeURIComponent(next)}`;

  return (
    <AuthForm
      title={t("signup.title")}
      action={`/api/auth/signup${nextQuery}`}
      submitLabel={t("signup.submit")}
      errors={[params.error ?? []].flat()}
      fields={[
        { name: "email", label: t("email"), autoComplete: "email" },
        { name: "password", label: t("password"), autoComplete: "new-password" },
      ]}
    >
      <p>
        {t("signup.haveAccount")} <Link href={`/login${nextQuery}`}>{t("signup.login")}</Link>
      </p>
    </AuthForm>
  );
}
