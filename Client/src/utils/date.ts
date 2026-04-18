import { format, subDays, getHours } from "date-fns";

/**
 * Returns the business date in "yyyy-MM-dd" format.
 * If the time is before 07:00 AM, it belongs to the previous calendar day.
 */
export const getBusinessDate = (dateParam: Date | string | number): string => {
  const incomingDate = new Date(dateParam);
  let businessDate = incomingDate;

  // If time is before 7:00 AM, subtract 1 day
  if (getHours(incomingDate) < 7) {
    businessDate = subDays(incomingDate, 1);
  }

  return format(businessDate, "yyyy-MM-dd");
};

/**
 * Validates if the given date belongs to today's business date.
 */
export const isTodayBusinessDate = (dateParam: Date | string | number): boolean => {
  return getBusinessDate(dateParam) === getBusinessDate(new Date());
};
