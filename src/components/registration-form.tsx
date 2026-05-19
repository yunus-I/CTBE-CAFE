"use client";

import { useState, useTransition } from "react";
import { departments } from "@/lib/constants";

const emptyForm = {
  name: "",
  department: "",
  year: "",
  mealCardNumber: "",
  aauSerial: "",
  aauYear: "",
};

export function RegistrationForm() {
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
        setError(data.error ?? "Registration failed.");
        return;
      }

      setMessage(data.message ?? "Student registered.");
      setForm(emptyForm);
      setPhoto(null);
      const fileInput = document.getElementById("photo") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
    });
  }

  return (
    <form onSubmit={handleSubmit} className="panel rounded-[28px] p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Student Name">
          <input
            required
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-brand"
            placeholder="Abel Tesfaye"
          />
        </Field>

        <Field label="Department">
          <select
            required
            value={form.department}
            onChange={(event) => updateField("department", event.target.value)}
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-brand"
          >
            <option value="">Select department</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Year">
          <input
            required
            type="number"
            min="1"
            max="8"
            value={form.year}
            onChange={(event) => updateField("year", event.target.value)}
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-brand"
            placeholder="3"
          />
        </Field>

        <Field label="Meal Card Number">
          <input
            required
            value={form.mealCardNumber}
            onChange={(event) =>
              updateField("mealCardNumber", event.target.value.replace(/\D/g, "").slice(0, 4))
            }
            inputMode="numeric"
            maxLength={4}
            pattern="\d{4}"
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-brand"
            placeholder="1224"
          />
        </Field>

        <Field label="AAU ID">
          <div className="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-2 rounded-2xl border border-border bg-white px-4 py-3 focus-within:border-brand">
            <span className="font-semibold text-muted">UGR-</span>
            <input
              required
              value={form.aauSerial}
              onChange={(event) =>
                updateField("aauSerial", event.target.value.replace(/\D/g, "").slice(0, 4))
              }
              inputMode="numeric"
              maxLength={4}
              pattern="\d{4}"
              className="min-w-0 bg-transparent outline-none"
              placeholder="1234"
            />
            <span className="font-semibold text-muted">-</span>
            <input
              required
              value={form.aauYear}
              onChange={(event) =>
                updateField("aauYear", event.target.value.replace(/\D/g, "").slice(0, 2))
              }
              inputMode="numeric"
              maxLength={2}
              pattern="\d{2}"
              className="min-w-0 bg-transparent outline-none"
              placeholder="12"
            />
          </div>
        </Field>

        <Field label="Student Photo">
          <input
            id="photo"
            type="file"
            accept="image/*"
            onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
            className="w-full rounded-2xl border border-dashed border-border bg-white px-4 py-3 text-sm outline-none transition file:mr-3 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-2 file:text-white"
          />
        </Field>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-sm">
          {message ? <p className="text-success">{message}</p> : null}
          {error ? <p className="text-danger">{error}</p> : null}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-2xl bg-brand px-5 py-3 font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Saving student..." : "Register Student"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
