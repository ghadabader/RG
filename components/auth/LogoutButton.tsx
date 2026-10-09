// A plain form post to /api/auth/logout. Rendered by Spec 0002's AvatarMenu for logged-in
// users; nothing in Spec 0001 mounts it.
import { useTranslations } from "next-intl";

export default function LogoutButton() {
  const t = useTranslations("auth");
  return (
    <form method="post" action="/api/auth/logout">
      <button type="submit">{t("logout")}</button>
    </form>
  );
}
