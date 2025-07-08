import { format, isToday, isYesterday } from "date-fns";
import { it } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";

/**
 * Formats a date string into a user-friendly, dynamic format.
 * - If the date is today, it returns "Oggi alle HH:mm".
 * - If the date is yesterday, it returns "Ieri alle HH:mm".
 * - Otherwise, it returns the date in "d MMM yyyy 'alle' HH:mm" format.
 *
 * It correctly handles time zones by converting the input date to the user's local time zone.
 *
 * @param dateString - The ISO date string to format (e.g., from an API).
 * @param timeZone - The IANA time zone identifier (e.g., 'Europe/Rome'). Defaults to 'UTC'.
 * @returns The formatted date string.
 */
export const formatDynamicDate = (
  dateString: string | undefined | null,
  timeZone = "Europe/Rome",
): string => {
  if (!dateString) return "Non disponibile";

  try {
    // Convert the UTC/server date to the specified time zone
    const zonedDate = toZonedTime(new Date(dateString), timeZone);

    let pattern: string;

    if (isToday(zonedDate)) {
      pattern = "'Oggi alle' HH:mm";
    } else if (isYesterday(zonedDate)) {
      pattern = "'Ieri alle' HH:mm";
    } else {
      pattern = "d MMM yyyy 'alle' HH:mm";
    }

    return format(zonedDate, pattern, { locale: it });
  } catch (error) {
    console.error("Date formatting error:", error);
    return dateString; // Fallback to original string on error
  }
};
