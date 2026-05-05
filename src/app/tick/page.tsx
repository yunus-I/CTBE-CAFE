import { AppShell } from "@/components/app-shell";
import { TickingStation } from "@/components/ticking-station";

export default function TickPage() {
  return (
    <AppShell
      title="Ticking Station"
      subtitle="Enter a meal card number, confirm the student’s identity, and record one meal at a time with duplicate protection for the current day."
    >
      <TickingStation />
    </AppShell>
  );
}
