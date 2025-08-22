import {
  type DailyStat,
  type MonthlyStat,
  type FileStatsData,
} from "@/app/api/api";

export interface StatsCalculations {
  totalFiles: number;
  averageFilesPerDay: number;
  averageFilesPerMonth: number;
  percentageChange: number;
  maxFilesInPeriod: number;
  minFilesInPeriod: number;
  totalDays: number;
  totalMonths: number;
  // Week-over-week deltas computed from daily stats
  weekOverWeekDeltaTotal: number;
  weekOverWeekDeltaPercent: number;
}

/**
 * Calculate statistics from file stats data
 */
export function calculateStats(
  data: FileStatsData,
  period: "week" | "month" | "year",
): StatsCalculations {
  let stats: DailyStat[] | MonthlyStat[] = [];

  switch (period) {
    case "week":
      stats = data.last_7_days;
      break;
    case "month":
      stats = data.last_30_days;
      break;
    case "year":
      stats = data.last_365_days;
      break;
  }

  if (stats.length === 0) {
    return {
      totalFiles: 0,
      averageFilesPerDay: 0,
      averageFilesPerMonth: 0,
      percentageChange: 0,
      maxFilesInPeriod: 0,
      minFilesInPeriod: 0,
      totalDays: 0,
      totalMonths: 0,
      weekOverWeekDeltaTotal: 0,
      weekOverWeekDeltaPercent: 0,
    };
  }

  // Calculate total files
  const totalFiles = stats.reduce((sum, stat) => sum + stat.file_count, 0);

  // Calculate max and min files in period
  const fileCounts = stats.map((stat) => stat.file_count);
  const maxFilesInPeriod = Math.max(...fileCounts);
  const minFilesInPeriod = Math.min(...fileCounts);

  // Calculate averages
  const totalDays = period === "year" ? 365 : period === "month" ? 30 : 7;
  const totalMonths = period === "year" ? 12 : period === "month" ? 1 : 0.25;

  const averageFilesPerDay = totalFiles / totalDays;
  const averageFilesPerMonth = totalFiles / totalMonths;

  // Calculate percentage change (comparing first half vs second half of the period)
  let percentageChange = 0;
  if (stats.length >= 2) {
    const midPoint = Math.floor(stats.length / 2);
    const firstHalf = stats.slice(0, midPoint);
    const secondHalf = stats.slice(midPoint);

    const firstHalfTotal = firstHalf.reduce(
      (sum, stat) => sum + stat.file_count,
      0,
    );
    const secondHalfTotal = secondHalf.reduce(
      (sum, stat) => sum + stat.file_count,
      0,
    );

    if (firstHalfTotal > 0) {
      percentageChange =
        ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;
    }
  }

  // Compute week-over-week deltas using daily stats when available
  let weekOverWeekDeltaTotal = 0;
  let weekOverWeekDeltaPercent = 0;
  try {
    // Use last_7_days as current week and the preceding 7 days from last_30_days as previous week
    const currentWeek = Array.isArray(data.last_7_days)
      ? [...data.last_7_days]
      : [];
    const last30 = Array.isArray(data.last_30_days)
      ? [...data.last_30_days]
      : [];

    // Ensure chronological order by date
    const sortByDateAsc = (arr: DailyStat[]) =>
      arr
        .slice()
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );

    const currentWeekSorted = sortByDateAsc(currentWeek);
    const last30Sorted = sortByDateAsc(last30);

    const currentWeekTotal = currentWeekSorted.reduce(
      (sum, d) => sum + (typeof d.file_count === "number" ? d.file_count : 0),
      0,
    );

    let previousWeekTotal = 0;
    if (last30Sorted.length >= 14) {
      // Take the 7 days immediately before the current week window
      const previousWeek = last30Sorted.slice(-14, -7);
      previousWeekTotal = previousWeek.reduce(
        (sum, d) => sum + (typeof d.file_count === "number" ? d.file_count : 0),
        0,
      );
    }

    weekOverWeekDeltaTotal = currentWeekTotal - previousWeekTotal;
    if (previousWeekTotal > 0) {
      weekOverWeekDeltaPercent =
        (weekOverWeekDeltaTotal / previousWeekTotal) * 100;
    } else if (currentWeekTotal > 0) {
      // Define 100% increase if there were 0 files previous week but some this week
      weekOverWeekDeltaPercent = 100;
    } else {
      weekOverWeekDeltaPercent = 0;
    }
  } catch {
    // Fallback to zero deltas if anything goes wrong
    weekOverWeekDeltaTotal = 0;
    weekOverWeekDeltaPercent = 0;
  }

  return {
    totalFiles,
    averageFilesPerDay,
    averageFilesPerMonth,
    percentageChange,
    maxFilesInPeriod,
    minFilesInPeriod,
    totalDays,
    totalMonths,
    weekOverWeekDeltaTotal,
    weekOverWeekDeltaPercent,
  };
}

/**
 * Calculate statistics from a custom list of daily stats (e.g., filtered by date range).
 */
export function calculateStatsFromDaily(daily: DailyStat[]): StatsCalculations {
  if (!Array.isArray(daily) || daily.length === 0) {
    return {
      totalFiles: 0,
      averageFilesPerDay: 0,
      averageFilesPerMonth: 0,
      percentageChange: 0,
      maxFilesInPeriod: 0,
      minFilesInPeriod: 0,
      totalDays: 0,
      totalMonths: 0,
      weekOverWeekDeltaTotal: 0,
      weekOverWeekDeltaPercent: 0,
    };
  }

  // Ensure chronological order by date
  const sorted = daily
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const totalFiles = sorted.reduce((sum, stat) => sum + stat.file_count, 0);
  const fileCounts = sorted.map((stat) => stat.file_count);
  const maxFilesInPeriod = Math.max(...fileCounts);
  const minFilesInPeriod = Math.min(...fileCounts);

  const totalDays = sorted.length;
  const averageFilesPerDay = totalDays > 0 ? totalFiles / totalDays : 0;
  // Approximate monthly average from daily average to avoid over/under counting on partial months
  const averageFilesPerMonth = averageFilesPerDay * 30;

  // Percentage change: first half vs second half of selected period
  let percentageChange = 0;
  if (sorted.length >= 2) {
    const midPoint = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, midPoint);
    const secondHalf = sorted.slice(midPoint);
    const firstHalfTotal = firstHalf.reduce((s, d) => s + d.file_count, 0);
    const secondHalfTotal = secondHalf.reduce((s, d) => s + d.file_count, 0);
    if (firstHalfTotal > 0) {
      percentageChange =
        ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;
    }
  }

  // Week-over-week delta using last 7 days vs previous 7 days within the range
  let weekOverWeekDeltaTotal = 0;
  let weekOverWeekDeltaPercent = 0;
  if (sorted.length >= 14) {
    const currentWeek = sorted.slice(-7);
    const previousWeek = sorted.slice(-14, -7);
    const currentWeekTotal = currentWeek.reduce((s, d) => s + d.file_count, 0);
    const previousWeekTotal = previousWeek.reduce(
      (s, d) => s + d.file_count,
      0,
    );
    weekOverWeekDeltaTotal = currentWeekTotal - previousWeekTotal;
    if (previousWeekTotal > 0) {
      weekOverWeekDeltaPercent =
        (weekOverWeekDeltaTotal / previousWeekTotal) * 100;
    } else if (currentWeekTotal > 0) {
      weekOverWeekDeltaPercent = 100;
    }
  }

  // totalMonths is not strictly used for calculations by consumers but we keep a reasonable value
  const totalMonths = Math.max(1, Math.round(totalDays / 30));

  return {
    totalFiles,
    averageFilesPerDay,
    averageFilesPerMonth,
    percentageChange,
    maxFilesInPeriod,
    minFilesInPeriod,
    totalDays,
    totalMonths,
    weekOverWeekDeltaTotal,
    weekOverWeekDeltaPercent,
  };
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Format number with appropriate suffix
 */
export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

/**
 * Get period description for display
 */
export function getPeriodDescription(
  period: "week" | "month" | "year",
): string {
  switch (period) {
    case "week":
      return "ultimi 7 giorni";
    case "month":
      return "ultimi 30 giorni";
    case "year":
      return "ultimi 365 giorni";
  }
}
