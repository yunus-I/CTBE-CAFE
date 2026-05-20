import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { TickingStation } from "@/components/ticking-station";
import { Locale, getTranslation } from "@/lib/translations";

export default async function TickPage() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value || "en") as Locale;
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);

  return (
    <AppShell
      title={t("tickingStation")}
      subtitle={t("tickingStationSubtitle")}
    >
      <TickingStation />
    </AppShell>
  );
}

