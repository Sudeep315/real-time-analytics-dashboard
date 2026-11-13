export interface MetricPoint {
  timestamp: string;
  timeLabel: string;
  requestsPerSec: number;
  revenue: number;
  activeUsers: number;
  latencyMs: number;
  cpuUsage: number;
  memoryUsage: number;
  errorRate: number;
  bandwidthMbps: number;
}

export interface LiveEvent {
  id: string;
  timestamp: string;
  service: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  statusCode: number;
  latencyMs: number;
  region: 'US-East' | 'US-West' | 'EU-Central' | 'AP-South' | 'SA-East';
  userId: string;
  revenue?: number;
  error?: string;
}

export interface RegionTelemetry {
  region: string;
  name: string;
  lat: number;
  lng: number;
  requests: number;
  latency: number;
  status: 'healthy' | 'warning' | 'critical';
  users: number;
}

export interface FilterState {
  timeRange: '5m' | '15m' | '1h' | '24h' | '7d';
  region: string;
  statusCode: string;
  service: string;
  searchQuery: string;
  autoRefresh: boolean;
  refreshRateMs: number;
}

export interface SystemAlert {
  id: string;
  timestamp: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  metric: string;
  currentValue: number | string;
  threshold: number | string;
  acknowledged: boolean;
}

export interface SqlColumn {
  name: string;
  type: string;
}

export interface SqlQueryResult {
  columns: SqlColumn[];
  rows: Record<string, any>[];
  executionTimeMs: number;
  rowCount: number;
  status: 'idle' | 'running' | 'success' | 'error';
  error?: string;
  executedAt?: string;
}

export interface TableSchema {
  name: string;
  description: string;
  columns: { name: string; type: string; nullable: boolean; primaryKey?: boolean }[];
  rowCountEstimate: number;
}

export interface ChartConfig {
  id: string;
  title: string;
  type: 'area' | 'line' | 'bar' | 'donut' | 'scatter' | 'gauge';
  dataset: string;
  metric: string;
  dimension: string;
  timeBucket: '1s' | '10s' | '1m' | '1h';
  color: string;
}

export type TabType = 'dashboard' | 'explore' | 'sqllab' | 'alerts' | 'datasets' | 'deployment';

