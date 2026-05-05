import { AppShell } from "@/components/app-shell";
import { RegistrationForm } from "@/components/registration-form";

export default function RegisterPage() {
  return (
    <AppShell
      title="Student Registration"
      subtitle="Create student profiles with card number, AAU ID, department, year, and photo so the cafe team can verify each meal visually."
    >
      <RegistrationForm />
    </AppShell>
  );
}
