"use client";

import { useState, useTransition } from "react";
import { departments } from "@/lib/constants";
import { useTranslation } from "@/components/locale-context";
import { getTranslationOrSelf } from "@/lib/translations";

const emptyForm = {
  name: "",
  department: "",
  year: "",
  mealCardNumber: "",
  aauSerial: "",
  aauYear: "",
};

export function RegistrationForm() {
  const { locale, t } = useTranslation();
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField(key: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const payload = new FormData();
    payload.append("name", form.name);
    payload.append("department", form.department);
    payload.append("year", form.year);
    payload.append("mealCardNumber", form.mealCardNumber);
    payload.append("aauId", `UGR-${form.aauSerial}-${form.aauYear}`);
    if (photo) {
      payload.append("photo", photo);
    }

    startTransition(async () => {
      const response = await fetch("/api/students", {
        method: "POST",
        body: payload,
      });

      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setError(getTranslationOrSelf(locale, data.error ?? "Registration failed."));
        return;
      }

      setMessage(getTranslationOrSelf(locale, data.message ?? "Student registered."));
      setForm(emptyForm);
      setPhoto(null);
      const fileInput = document.getElementById("photo") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
    });
  }

  return (
    <div className="panel">
      {/* Form Header */}
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--border)",
          background: "var(--brand-soft)",
        }}
      >
        <h2 className="text-section-heading">{t("studentRegistration")}</h2>
        <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "2px" }}>
          {t("registrationSubtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
          <FormField label={t("studentName")}>
            <input
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="form-input"
              placeholder={locale === "am" ? "አቤል ተስፋዬ" : "Abel Tesfaye"}
            />
          </FormField>

          <FormField label={t("department")}>
            <select
              required
              value={form.department}
              onChange={(e) => updateField("department", e.target.value)}
              className="form-input"
            >
              <option value="">{t("selectDepartment")}</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {getTranslationOrSelf(locale, dept)}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label={t("year")}>
            <input
              required
              type="number"
              min="1"
              max="8"
              value={form.year}
              onChange={(e) => updateField("year", e.target.value)}
              className="form-input"
              placeholder="3"
            />
          </FormField>

          <FormField label={t("mealCardNumber")}>
            <input
              required
              value={form.mealCardNumber}
              onChange={(e) =>
                updateField("mealCardNumber", e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              inputMode="numeric"
              maxLength={4}
              pattern="\d{4}"
              className="form-input"
              placeholder="1224"
            />
          </FormField>

          <FormField label={t("aauId")}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                border: "1px solid #CCCCCC",
                borderRadius: "4px",
                padding: "8px 12px",
                background: "#fff",
                transition: "border-color 0.15s",
              }}
              onFocusCapture={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--brand)";
              }}
              onBlurCapture={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#CCCCCC";
              }}
            >
              <span style={{ fontWeight: 500, color: "var(--muted)", flexShrink: 0 }}>UGR-</span>
              <input
                required
                value={form.aauSerial}
                onChange={(e) =>
                  updateField("aauSerial", e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                inputMode="numeric"
                maxLength={4}
                pattern="\d{4}"
                style={{ border: "none", outline: "none", minWidth: 0, flex: 1, background: "transparent", font: "inherit", fontSize: "14px" }}
                placeholder="1234"
              />
              <span style={{ fontWeight: 500, color: "var(--muted)" }}>-</span>
              <input
                required
                value={form.aauYear}
                onChange={(e) =>
                  updateField("aauYear", e.target.value.replace(/\D/g, "").slice(0, 2))
                }
                inputMode="numeric"
                maxLength={2}
                pattern="\d{2}"
                style={{ border: "none", outline: "none", width: "36px", background: "transparent", font: "inherit", fontSize: "14px" }}
                placeholder="12"
              />
            </div>
          </FormField>

          <FormField label={t("studentPhoto")}>
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              className="form-input"
              style={{ padding: "6px 12px" }}
            />
          </FormField>
        </div>

        {/* Status messages + Submit */}
        <div
          style={{
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            {message && (
              <p style={{ fontSize: "14px", color: "var(--success)", fontWeight: 500 }}>✓ {message}</p>
            )}
            {error && (
              <p style={{ fontSize: "14px", color: "var(--danger)", fontWeight: 500 }}>✗ {error}</p>
            )}
          </div>
          <button type="submit" disabled={isPending} className="btn-primary">
            {isPending ? t("savingStudent") : t("registerStudentSubmitBtn")}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}
