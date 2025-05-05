import { type DashboardData } from "../types";

export function getMockDashboardData(): DashboardData {
  return {
    totalDocuments: 1516,
    sharedDocuments: 40,
    activeClients: 128,
    pendingRequests: 23,
    privateDocuments: 752,
    chartData: {
      labels: [
        "1 Jan",
        "2 Jan",
        "3 Jan",
        "4 Jan",
        "5 Jan",
        "6 Jan",
        "7 Jan",
        "8 Jan",
        "9 Jan",
        "10 Jan",
        "11 Jan",
        "12 Jan",
        "13 Jan",
        "14 Jan",
      ],
      values: [
        60000, 58000, 55000, 48000, 52000, 60000, 65000, 62000, 58000, 65000,
        60000, 58000, 52000, 61490,
      ],
    },
  };
}
