export interface DashboardData {
  totalDocuments: number;
  sharedDocuments: number;
  activeClients: number;
  pendingRequests: number;
  privateDocuments: number;
  chartData: {
    labels: string[];
    values: number[];
  };
}
