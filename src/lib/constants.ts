export const mealTypes = ["BREAKFAST", "LUNCH", "DINNER"] as const;

export const mealTypeLabels: Record<(typeof mealTypes)[number], string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
};

export const cafeTimeZone = "Africa/Addis_Ababa";

export const mealWindows = [
  {
    mealType: "BREAKFAST" as const,
    label: "Breakfast",
    startMinutes: 7 * 60 + 30,
    endMinutes: 9 * 60,
    hours: "7:30 AM - 9:00 AM",
  },
  {
    mealType: "LUNCH" as const,
    label: "Lunch",
    startMinutes: 11 * 60 + 30,
    endMinutes: 13 * 60,
    hours: "11:30 AM - 1:00 PM",
  },
  {
    mealType: "DINNER" as const,
    label: "Dinner",
    startMinutes: 16 * 60 + 30,
    endMinutes: 18 * 60,
    hours: "4:30 PM - 6:00 PM",
  },
] as const;
