import { AppShell } from "@/components/app-shell";
import { cookies } from "next/headers";
import { Locale, getTranslation } from "@/lib/translations";

export const dynamic = "force-dynamic";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const mealSlots = [
  {
    label: "Breakfast",
    time: "7:30 – 9:00 AM",
    items: {
      Monday: ["Genfo", "Kategna"],
      Tuesday: ["Fitti", "Tea"],
      Wednesday: ["Genfo", "Bread"],
      Thursday: ["Kategna", "Coffee"],
      Friday: ["Fitti", "Juice"],
      Saturday: ["Genfo", "Tea"],
      Sunday: ["Special Platter"],
    },
  },
  {
    label: "Lunch",
    time: "11:30 AM – 1:00 PM",
    items: {
      Monday: ["Shiro Wot", "Injera"],
      Tuesday: ["Beyaynetu"],
      Wednesday: ["Misir Wot", "Rice"],
      Thursday: ["Shiro Wot", "Salad"],
      Friday: ["Beyaynetu", "Injera"],
      Saturday: ["Misir Wot"],
      Sunday: ["Special Feast"],
    },
  },
  {
    label: "Dinner",
    time: "4:30 – 6:00 PM",
    items: {
      Monday: ["Tibs", "Injera"],
      Tuesday: ["Kitfo"],
      Wednesday: ["Tibs", "Salad"],
      Thursday: ["Shiro Wot", "Rice"],
      Friday: ["Beyaynetu", "Juice"],
      Saturday: ["Tibs"],
      Sunday: ["Special Dinner"],
    },
  },
];

const slotColors: Record<string, { bg: string; color: string }> = {
  Breakfast: { bg: "#FFF3E0", color: "#F57C00" },
  Lunch: { bg: "#E3F0FF", color: "#003087" },
  Dinner: { bg: "#F3E5F5", color: "#6A1B9A" },
};

export default async function SchedulePage() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value || "en") as Locale;
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);

  // Get current day index (0=Mon ... 6=Sun)
  const today = new Date();
  // JS getDay(): 0=Sun, 1=Mon...6=Sat. Convert to 0=Mon..6=Sun
  const jsDay = today.getDay();
  const currentDayIndex = jsDay === 0 ? 6 : jsDay - 1;

  return (
    <AppShell
      title="Meal Scheduling"
      subtitle="Weekly meal schedule for the CTBE Cafe. View and manage breakfast, lunch, and dinner items for each day."
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button type="button" className="btn-secondary" style={{ padding: "6px 12px", fontSize: "13px" }}>
            ← Prev Week
          </button>
          <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--foreground)", padding: "0 8px" }}>
            Current Week
          </span>
          <button type="button" className="btn-secondary" style={{ padding: "6px 12px", fontSize: "13px" }}>
            Next Week →
          </button>
        </div>
        <button type="button" className="btn-primary">
          + Add Schedule Item
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="panel" style={{ overflowX: "auto", marginBottom: "24px" }}>
        <div className="schedule-grid" style={{ minWidth: "800px" }}>
          {/* Header row */}
          <div className="schedule-cell-header" style={{ borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
            Meal / Day
          </div>
          {days.map((day, idx) => (
            <div
              key={day}
              className="schedule-cell-header"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.2)",
                background: idx === currentDayIndex ? "rgba(255,255,255,0.15)" : undefined,
                position: "relative",
              }}
            >
              {day}
              {idx === currentDayIndex && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "4px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#FFD700",
                  }}
                />
              )}
            </div>
          ))}

          {/* Meal rows */}
          {mealSlots.map((slot) => {
            const colors = slotColors[slot.label];
            return [
              // Row label
              <div
                key={`label-${slot.label}`}
                className="schedule-row-label"
                style={{ flexDirection: "column", alignItems: "flex-start", gap: "2px" }}
              >
                <span style={{ color: "var(--brand)" }}>{slot.label}</span>
                <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                  {slot.time}
                </span>
              </div>,
              // Day cells
              ...days.map((day) => (
                <div
                  key={`${slot.label}-${day}`}
                  className="schedule-cell"
                >
                  {(slot.items as Record<string, string[]>)[day]?.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        background: colors.bg,
                        color: colors.color,
                        borderRadius: "3px",
                        padding: "3px 7px",
                        fontSize: "12px",
                        fontWeight: 500,
                        marginBottom: "4px",
                        display: "inline-block",
                      }}
                    >
                      {item}
                    </div>
                  )) ?? (
                    <span style={{ color: "#CCCCCC", fontSize: "12px" }}>—</span>
                  )}
                </div>
              )),
            ];
          })}
        </div>
      </div>

      {/* Legend */}
      <div
        className="panel"
        style={{
          padding: "16px 20px",
          display: "flex",
          gap: "20px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span className="form-label" style={{ marginBottom: 0 }}>Legend:</span>
        {Object.entries(slotColors).map(([label, colors]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "14px", height: "14px", borderRadius: "3px", background: colors.bg, border: `1px solid ${colors.color}`, flexShrink: 0 }} />
            <span style={{ fontSize: "13px", color: "var(--foreground)" }}>{label}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FFD700", flexShrink: 0 }} />
          <span style={{ fontSize: "13px", color: "var(--foreground)" }}>Today</span>
        </div>
      </div>
    </AppShell>
  );
}
