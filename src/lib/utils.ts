import { format } from "date-fns";
import { cafeTimeZone, mealTypeLabels, mealTypes, mealWindows } from "@/lib/constants";

type MealType = (typeof mealTypes)[number];

function getCafeDateParts(value = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: cafeTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(value);

  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: Number(getPart("year")),
    month: Number(getPart("month")),
    day: Number(getPart("day")),
    hour: Number(getPart("hour")),
    minute: Number(getPart("minute")),
  };
}

export function createRecordDate(value = new Date()) {
  const { year, month, day } = getCafeDateParts(value);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDisplayDate(value: Date | string) {
  return format(new Date(value), "MMM d, yyyy");
}

export function formatDateInput(value: Date | string) {
  return format(new Date(value), "yyyy-MM-dd");
}

export function parseDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day));
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function getActiveMealWindow(value = new Date()) {
  const { hour, minute } = getCafeDateParts(value);
  const currentMinutes = hour * 60 + minute;

  return (
    mealWindows.find(
      (window) =>
        currentMinutes >= window.startMinutes && currentMinutes <= window.endMinutes,
    ) ?? null
  );
}

export function getActiveMealType(value = new Date()): MealType | null {
  return getActiveMealWindow(value)?.mealType ?? null;
}

export function getCafeTimeLabel(value = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: cafeTimeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(value);
}

export function getMealStatusMessage(value = new Date()) {
  const activeWindow = getActiveMealWindow(value);

  if (activeWindow) {
    return `${activeWindow.label} service is active now (${activeWindow.hours}).`;
  }

  return `No meal window is active at ${getCafeTimeLabel(value)}. Service windows are ${mealWindows
    .map((window) => `${window.label}: ${window.hours}`)
    .join(", ")}.`;
}

export function formatMealLabel(mealType: MealType) {
  return mealTypeLabels[mealType];
}
