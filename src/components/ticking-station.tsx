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
    if (lastSearchedCard.current === normalized) return;
    lastSearchedCard.current = normalized;
    void searchStudent(normalized);
  }, [cardNumber]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", alignItems: "start" }}>
      {/* Left: Card Search + Student Preview */}
      <div className="panel" style={{ borderTop: "3px solid var(--brand)" }}>
        {/* Card Input Section */}
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border)" }}>
          <label className="form-label" style={{ display: "block", marginBottom: "8px" }}>
            {t("enter4DigitCard")}
          </label>
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
            placeholder="_ _ _ _"
            className="form-input"
            style={{ fontSize: "22px", letterSpacing: "8px", textAlign: "center", fontWeight: 600 }}
          />
          <p style={{ marginTop: "6px", fontSize: "12px", color: "var(--muted)" }}>
            {t("loadAutoHelp")}
          </p>

          {/* Status messages */}
          <div style={{ marginTop: "10px", minHeight: "20px" }}>
            {isSearching && (
              <p style={{ fontSize: "13px", color: "var(--muted)" }}>⌛ {t("searchingStudentRecord")}</p>
            )}
            {status && (
              <p style={{ fontSize: "13px", color: "var(--success)", fontWeight: 500 }}>✓ {status}</p>
            )}
            {error && (
              <p style={{ fontSize: "13px", color: "var(--danger)", fontWeight: 500 }}>✗ {error}</p>
            )}
          </div>
        </div>

        {/* Meal window status */}
        <div style={{ padding: "10px 20px", background: "var(--brand-soft)", borderBottom: "1px solid var(--border)" }}>
          <p style={{ fontSize: "13px", color: "var(--brand)", fontWeight: 500 }}>{mealStatusMessage}</p>
        </div>

        {/* Student Preview */}
        <div style={{ padding: "20px" }}>
          {student ? (
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <StudentAvatar name={student.name} photoUrl={student.photoUrl} size="lg" />
              <div style={{ flex: 1, minWidth: "200px" }}>
                <table style={{ width: "100%", fontSize: "14px", borderCollapse: "collapse" }}>
                  <tbody>
                    <InfoRow label={t("studentName")} value={student.name} />
                    <InfoRow label={t("department")} value={getTranslationOrSelf(locale, student.department)} />
                    <InfoRow label={t("year")} value={locale === "am" ? `ዓመት ${student.year}` : `Year ${student.year}`} />
                    <InfoRow label={t("aauId")} value={student.aauId} />
                    <InfoRow label={t("cardNumberLabel")} value={student.mealCardNumber} />
                    <InfoRow
                      label={t("mealsTodayLabel")}
                      value={
                        student.mealsToday.length
                          ? student.mealsToday.map((e) => formatMealLabel(e.mealType as never, locale)).join(", ")
                          : t("noMealsRecordedYet")
                      }
                      highlight={student.mealsToday.length > 0}
                    />
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              {t("scanCardPlaceholderHelp")}
            </div>
          )}
        </div>
      </div>

      {/* Right: Record Meal Panel */}
      <div className="panel">
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "var(--brand-soft)" }}>
          <h2 className="text-section-heading" style={{ fontSize: "15px" }}>{t("recordMeal")}</h2>
        </div>

        <div style={{ padding: "16px" }}>
          {activeMealType ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Record Button */}
              <button
                type="button"
                disabled={!student || mealsToday.has(activeMealType) || isSaving}
                onClick={() => void recordMeal(activeMealType)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: mealsToday.has(activeMealType)
                    ? "1px solid #C8E6C9"
                    : "1px solid var(--brand)",
                  borderRadius: "4px",
                  padding: "14px 16px",
                  background: mealsToday.has(activeMealType) ? "#E8F5E9" : "#fff",
                  cursor: (!student || mealsToday.has(activeMealType) || isSaving) ? "not-allowed" : "pointer",
                  opacity: !student ? 0.6 : 1,
                  textAlign: "left",
                  transition: "background 0.15s",
                  width: "100%",
                }}
              >
                <div>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: mealsToday.has(activeMealType) ? "var(--success)" : "var(--brand)" }}>
                    {formatMealLabel(activeMealType, locale)}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>
                    {mealsToday.has(activeMealType) ? t("alreadyRecordedToday") : t("recordActiveMealHint")}
                  </p>
                </div>
                <span
                  className={`badge ${mealsToday.has(activeMealType) ? "badge-success" : "badge-muted"}`}
                  style={{ fontSize: "11px" }}
                >
                  {mealsToday.has(activeMealType) ? t("done") : t("open")}
                </span>
              </button>

              {/* Undo Button */}
              <button
                type="button"
                disabled={!student || !mealsToday.has(activeMealType) || isSaving}
                onClick={() => void undoMeal(activeMealType)}
                className="btn-danger-outline"
                style={{
                  width: "100%",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  opacity: (!student || !mealsToday.has(activeMealType)) ? 0.5 : 1,
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: "14px", fontWeight: 500 }}>
                    {locale === "am"
                      ? `${formatMealLabel(activeMealType, locale)} ${t("undoMealLabel")}`
                      : `Undo ${formatMealLabel(activeMealType, locale)}`}
                  </p>
                  <p style={{ fontSize: "12px", marginTop: "2px", opacity: 0.8 }}>{t("removeActiveMealHelp")}</p>
                </div>
                <span className="badge badge-danger" style={{ fontSize: "11px" }}>
                  {t("undoMealLabel")}
                </span>
              </button>
            </div>
          ) : (
            <div className="empty-state" style={{ margin: "0" }}>
              {t("noActiveMealWindow")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <tr style={{ borderBottom: "1px solid var(--border)" }}>
      <td style={{ padding: "7px 0", fontSize: "12px", color: "var(--muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px", width: "130px", verticalAlign: "top" }}>
        {label}
      </td>
      <td style={{ padding: "7px 0 7px 12px", fontSize: "14px", fontWeight: highlight ? 600 : 400, color: highlight ? "var(--success)" : "var(--foreground)", verticalAlign: "top" }}>
        {value}
      </td>
    </tr>
  );
}
