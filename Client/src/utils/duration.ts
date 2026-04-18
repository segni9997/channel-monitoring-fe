import { differenceInMinutes } from "date-fns";

/**
 * Calculates downtime duration in minutes.
 * If the downtimeEnd time is technically before downtimeStart,
 * we assume a 24-hour rollover occurred and add 1440 minutes.
 * Both inputs are ISO strings or Date objects.
 */
export const calculateDuration = (
  startParam: string | Date,
  endParam: string | Date
): number => {
  const startDate = new Date(startParam);
  const endDate = new Date(endParam);

  let diffMinutes = differenceInMinutes(endDate, startDate);

  if (diffMinutes < 0) {
    // Rollover applied: add 24 hours (1440 minutes)
    diffMinutes += 1440;
  }

  return diffMinutes;
};
