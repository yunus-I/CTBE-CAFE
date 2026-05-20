import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { RegistrationForm } from "@/components/registration-form";
import { Locale, getTranslation } from "@/lib/translations";

export default async function RegisterPage() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value || "en") as Locale;
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);

  return (
    <AppShell
      title={t("studentRegistration")}
      subtitle={t("registrationSubtitle")}
    >
      <RegistrationForm />
    </AppShell>
  );
}

