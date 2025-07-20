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

  return {
    totalFiles,
    averageFilesPerDay,
    averageFilesPerMonth,
    percentageChange,
    maxFilesInPeriod,
    minFilesInPeriod,
    totalDays,
    totalMonths,
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
