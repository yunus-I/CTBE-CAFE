"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { StudentAvatar } from "@/components/student-avatar";
import { formatDisplayDate, formatMealLabel, getActiveMealType, getMealStatusMessage } from "@/lib/utils";
import { useTranslation } from "@/components/locale-context";
import { getTranslationOrSelf } from "@/lib/translations";

type StudentResult = {
  id: string;
  name: string;
  department: string;
  year: number;
  aauId: string;
  mealCardNumber: string;
  photoUrl?: string | null;
  mealsToday: Array<{ mealType: string; createdAt: string }>;
};

export function TickingStation() {
  const { locale, t } = useTranslation();
  const [cardNumber, setCardNumber] = useState("");
  const [student, setStudent] = useState<StudentResult | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, startSearch] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const lastSearchedCard = useRef("");
  const activeMealType = getActiveMealType();
  const mealStatusMessage = getMealStatusMessage(new Date(), locale);

  const mealsToday = useMemo(
    () => new Set(student?.mealsToday.map((entry) => entry.mealType) ?? []),
    [student],
  );

  async function searchStudent(normalized: string) {
    setStatus(null);
    setError(null);

    startSearch(async () => {
      const response = await fetch(
        `/api/students/search?mealCardNumber=${encodeURIComponent(normalized)}`,
      );
      const data = (await response.json()) as { error?: string; student?: StudentResult };

      if (!response.ok || !data.student) {
        setStudent(null);
        setError(getTranslationOrSelf(locale, data.error ?? "Student not found."));
        return;
      }

      setStudent(data.student);
      setStatus(`${t("studentLoadedFor")} ${formatDisplayDate(new Date())}.`);
    });
  }

  async function recordMeal(mealType: string) {
    if (!student) return;

    setStatus(null);
    setError(null);

    startSaving(async () => {
      const response = await fetch(`/api/students/${student.id}/meals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealType }),
      });

      const data = (await response.json()) as {
        error?: string;
        message?: string;
        student?: StudentResult;
      };

      if (!response.ok || !data.student) {
        setError(getTranslationOrSelf(locale, data.error ?? "Could not record meal."));
        return;
      }

      setStudent(data.student);
      setStatus(data.message ? getTranslationOrSelf(locale, data.message) : `${formatMealLabel(mealType as never, locale)} ${t("done")}.`);
    });
  }

  async function undoMeal(mealType: string) {
    if (!student) return;

    setStatus(null);
    setError(null);

    startSaving(async () => {
      const response = await fetch(`/api/students/${student.id}/meals`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealType }),
      });

      const data = (await response.json()) as {
        error?: string;
        message?: string;
        student?: StudentResult;
      };

      if (!response.ok || !data.student) {
        setError(getTranslationOrSelf(locale, data.error ?? "Could not undo meal record."));
        return;
      }

      setStudent(data.student);
      setStatus(data.message ? getTranslationOrSelf(locale, data.message) : `${formatMealLabel(mealType as never, locale)} ${t("undoMealLabel")}.`);
    });
  }

  useEffect(() => {
    const normalized = cardNumber.trim();

    if (!/^\d{4}$/.test(normalized)) {
      lastSearchedCard.current = "";
      return;
    }

    if (lastSearchedCard.current === normalized) {
      return;
    }

    lastSearchedCard.current = normalized;
    void searchStudent(normalized);
  }, [cardNumber]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="panel rounded-[28px] p-6">
        <div className="flex flex-col gap-4">
          <input
            value={cardNumber}
            onChange={(event) => {
              const nextValue = event.target.value.replace(/\D/g, "").slice(0, 4);
              setCardNumber(nextValue);

              if (nextValue.length < 4) {
                lastSearchedCard.current = "";
                setStudent(null);
                setError(null);
                setStatus(null);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                if (student && activeMealType && !mealsToday.has(activeMealType) && !isSaving) {
                  void recordMeal(activeMealType);
                }
              }
            }}
            inputMode="numeric"
            maxLength={4}
            placeholder={t("enter4DigitCard")}
            className="flex-1 rounded-2xl border border-border bg-white px-4 py-4 text-lg outline-none transition focus:border-brand"
          />
          <p className="text-sm text-muted">
            {t("loadAutoHelp")}
          </p>
        </div>

        <div className="mt-4 space-y-1 text-sm">
          <p className="text-muted">{mealStatusMessage}</p>
          {isSearching ? <p className="text-muted">{t("searchingStudentRecord")}</p> : null}
          {status ? <p className="text-success">{status}</p> : null}
          {error ? <p className="text-danger">{error}</p> : null}
        </div>

        <div className="mt-6 rounded-[24px] border border-dashed border-border bg-white/70 p-5">
          {student ? (
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <StudentAvatar name={student.name} photoUrl={student.photoUrl} />
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <Info label={t("studentName")} value={student.name} />
                <Info label={t("department")} value={getTranslationOrSelf(locale, student.department)} />
                <Info label={t("year")} value={locale === "am" ? `ዓመት ${student.year}` : `Year ${student.year}`} />
                <Info label={t("aauId")} value={student.aauId} />
                <Info label={t("cardNumberLabel")} value={student.mealCardNumber} />
                <Info
                  label={t("mealsTodayLabel")}
                  value={
                    student.mealsToday.length
                      ? student.mealsToday
                          .map((entry) => formatMealLabel(entry.mealType as never, locale))
                          .join(", ")
                      : t("noMealsRecordedYet")
                  }
                />
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-muted">
              {t("scanCardPlaceholderHelp")}
            </div>
          )}
        </div>
      </section>

      <section className="panel rounded-[28px] p-6">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-brand">{t("recordMeal")}</p>
        {activeMealType ? (
          <div className="mt-4 grid gap-4">
            <button
              type="button"
              disabled={!student || mealsToday.has(activeMealType) || isSaving}
              onClick={() => void recordMeal(activeMealType)}
              className={`rounded-[24px] border px-5 py-5 text-left transition ${
                mealsToday.has(activeMealType)
                  ? "border-transparent bg-emerald-100 text-success"
                  : "border-border bg-white hover:border-brand hover:bg-brand-soft/40"
              } disabled:cursor-not-allowed disabled:opacity-80`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">{formatMealLabel(activeMealType, locale)}</p>
                  <p className="mt-1 text-sm text-muted">
                    {mealsToday.has(activeMealType)
                      ? t("alreadyRecordedToday")
                      : t("recordActiveMealHint")}
                  </p>
                </div>
                <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                  {mealsToday.has(activeMealType) ? t("done") : t("open")}
                </span>
              </div>
            </button>
            <button
              type="button"
              disabled={!student || !mealsToday.has(activeMealType) || isSaving}
              onClick={() => void undoMeal(activeMealType)}
              className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-left text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-base font-semibold">
                    {locale === "am" ? `${formatMealLabel(activeMealType, locale)} ${t("undoMealLabel")}` : `Undo ${formatMealLabel(activeMealType, locale)}`}
                  </p>
                  <p className="mt-1 text-sm text-rose-600/80">
                    {t("removeActiveMealHelp")}
                  </p>
                </div>
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                  {t("undoMealLabel")}
                </span>
              </div>
            </button>
          </div>
        ) : (
          <div className="mt-4 rounded-[24px] border border-dashed border-border bg-white px-5 py-8 text-sm text-muted">
            {t("noActiveMealWindow")}
          </div>
        )}
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

