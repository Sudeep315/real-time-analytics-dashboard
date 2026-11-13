import { MetricPoint, LiveEvent, RegionTelemetry, TableSchema, SqlQueryResult } from '../types';

export const INITIAL_REGIONS: RegionTelemetry[] = [
  { region: 'US-East', name: 'N. Virginia (us-east-1)', lat: 38.0, lng: -78.0, requests: 14200, latency: 42, status: 'healthy', users: 18400 },
  { region: 'US-West', name: 'Oregon (us-west-2)', lat: 45.5, lng: -122.6, requests: 9800, latency: 55, status: 'healthy', users: 12200 },
  { region: 'EU-Central', name: 'Frankfurt (eu-central-1)', lat: 50.1, lng: 8.6, requests: 12100, latency: 48, status: 'healthy', users: 15300 },
  { region: 'AP-South', name: 'Mumbai (ap-south-1)', lat: 19.0, lng: 72.8, requests: 8400, latency: 74, status: 'warning', users: 9500 },
  { region: 'SA-East', name: 'São Paulo (sa-east-1)', lat: -23.5, lng: -46.6, requests: 3900, latency: 110, status: 'healthy', users: 4300 },
];

export const SERVICES = ['auth-service', 'checkout-api', 'payment-gateway', 'search-engine', 'inventory-db', 'notification-worker'];
export const METHODS: ('GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH')[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
export const ENDPOINTS = [
  '/api/v1/auth/login',
  '/api/v1/cart/checkout',
  '/api/v1/products/search',
  '/api/v1/billing/charge',
  '/api/v1/orders/create',
  '/api/v1/telemetry/heartbeat',
  '/api/v1/analytics/stream'
];

export function generateMetricPoint(prev?: MetricPoint, burstMode: boolean = false): MetricPoint {
  const now = new Date();
  const timeLabel = now.toTimeString().split(' ')[0];

  const baseReq = burstMode ? 4500 : 2200;
  const reqJitter = (Math.random() - 0.48) * (burstMode ? 800 : 250);
  const requestsPerSec = Math.max(100, Math.round((prev ? prev.requestsPerSec : baseReq) * 0.8 + (baseReq + reqJitter) * 0.2));

  const baseUsers = burstMode ? 75000 : 42000;
  const userDelta = Math.round((Math.random() - 0.49) * (burstMode ? 400 : 80));
  const activeUsers = Math.max(1000, (prev ? prev.activeUsers : baseUsers) + userDelta);

  const baseRev = burstMode ? 340 : 185;
  const revenue = Math.max(20, Math.round(baseRev + (Math.random() - 0.4) * 60));

  const baseLatency = burstMode ? 260 : 65;
  const latencyMs = Math.max(15, Math.round((prev ? prev.latencyMs : baseLatency) * 0.7 + (baseLatency + (Math.random() - 0.45) * 40) * 0.3));

  const baseCpu = burstMode ? 82 : 44;
  const cpuUsage = Math.min(99, Math.max(10, Math.round((prev ? prev.cpuUsage : baseCpu) * 0.85 + (baseCpu + (Math.random() - 0.48) * 15) * 0.15)));

  const baseMem = burstMode ? 78 : 58;
  const memoryUsage = Math.min(98, Math.max(20, Math.round((prev ? prev.memoryUsage : baseMem) * 0.95 + (baseMem + (Math.random() - 0.5) * 4) * 0.05)));

  const baseErr = burstMode ? 6.2 : 0.8;
  const errorRate = Math.max(0.1, Number(((prev ? prev.errorRate : baseErr) * 0.8 + (baseErr + (Math.random() - 0.5) * 0.9) * 0.2).toFixed(2)));

  const bandwidthMbps = Math.max(50, Math.round(requestsPerSec * 0.42 + (Math.random() - 0.5) * 30));

  return {
    timestamp: now.toISOString(),
    timeLabel,
    requestsPerSec,
    revenue,
    activeUsers,
    latencyMs,
    cpuUsage,
    memoryUsage,
    errorRate,
    bandwidthMbps,
  };
}

export function generateEvent(burstMode: boolean = false): LiveEvent {
  const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
  const method = METHODS[Math.floor(Math.random() * METHODS.length)];
  const endpoint = ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
  const regions: LiveEvent['region'][] = ['US-East', 'US-West', 'EU-Central', 'AP-South', 'SA-East'];
  const region = regions[Math.floor(Math.random() * regions.length)];

  const isError = Math.random() < (burstMode ? 0.18 : 0.03);
  let statusCode = 200;
  let error: string | undefined;

  if (isError) {
    statusCode = Math.random() < 0.6 ? 500 : 404;
    error = statusCode === 500 ? 'InternalServerError: ConnectionPoolTimeout' : 'NotFoundError: ResourceMissing';
  } else if (Math.random() < 0.12) {
    statusCode = 201;
  } else if (Math.random() < 0.05) {
    statusCode = 304;
  }

  const baseLat = statusCode >= 500 ? 320 : (method === 'POST' ? 90 : 35);
  const latencyMs = Math.round(baseLat + Math.random() * 85);
  const revenue = method === 'POST' && endpoint.includes('checkout') ? Math.round(25 + Math.random() * 240) : undefined;

  return {
    id: 'evt_' + Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    service,
    method,
    endpoint,
    statusCode,
    latencyMs,
    region,
    userId: 'usr_' + Math.floor(1000 + Math.random() * 9000),
    revenue,
    error,
  };
}

export function generateInitialHistory(count: number = 30): MetricPoint[] {
  const points: MetricPoint[] = [];
  let current: MetricPoint | undefined;
  const now = Date.now();

  for (let i = count; i >= 0; i--) {
    const time = new Date(now - i * 2000);
    const p = generateMetricPoint(current);
    p.timestamp = time.toISOString();
    p.timeLabel = time.toTimeString().split(' ')[0];
    points.push(p);
    current = p;
  }
  return points;
}

export const DATASET_SCHEMAS: TableSchema[] = [
  {
    name: 'events',
    description: 'High-frequency HTTP API access logs and microservice request traces',
    rowCountEstimate: 2840500,
    columns: [
      { name: 'id', type: 'VARCHAR(32)', nullable: false, primaryKey: true },
      { name: 'timestamp', type: 'TIMESTAMP', nullable: false },
      { name: 'service', type: 'VARCHAR(64)', nullable: false },
      { name: 'method', type: 'VARCHAR(8)', nullable: false },
      { name: 'endpoint', type: 'VARCHAR(255)', nullable: false },
      { name: 'statusCode', type: 'INT', nullable: false },
      { name: 'latencyMs', type: 'FLOAT', nullable: false },
      { name: 'region', type: 'VARCHAR(32)', nullable: false },
      { name: 'userId', type: 'VARCHAR(32)', nullable: true },
      { name: 'error', type: 'TEXT', nullable: true }
    ]
  },
  {
    name: 'transactions',
    description: 'Processed e-commerce orders, subscription upgrades, and financial transactions',
    rowCountEstimate: 412900,
    columns: [
      { name: 'tx_id', type: 'VARCHAR(36)', nullable: false, primaryKey: true },
      { name: 'timestamp', type: 'TIMESTAMP', nullable: false },
      { name: 'amount_usd', type: 'DECIMAL(10,2)', nullable: false },
      { name: 'currency', type: 'VARCHAR(3)', nullable: false },
      { name: 'payment_status', type: 'VARCHAR(20)', nullable: false },
      { name: 'customer_tier', type: 'VARCHAR(20)', nullable: false },
      { name: 'region', type: 'VARCHAR(32)', nullable: false }
    ]
  },
  {
    name: 'server_metrics',
    description: 'Node cluster resource utilization, CPU, RAM, and throughput snapshots',
    rowCountEstimate: 1850000,
    columns: [
      { name: 'cluster_id', type: 'VARCHAR(32)', nullable: false },
      { name: 'timestamp', type: 'TIMESTAMP', nullable: false },
      { name: 'cpu_percent', type: 'FLOAT', nullable: false },
      { name: 'memory_percent', type: 'FLOAT', nullable: false },
      { name: 'requests_per_sec', type: 'INT', nullable: false },
      { name: 'p95_latency_ms', type: 'FLOAT', nullable: false }
    ]
  }
];

export function executeMockQuery(sql: string, liveEvents: LiveEvent[]): SqlQueryResult {
  const startTime = performance.now();
  const cleaned = sql.trim();

  try {
    const upper = cleaned.toUpperCase();

    // Table 1: events query
    if (upper.includes('FROM EVENTS') || upper.includes('FROM "EVENTS"')) {
      let data = [...liveEvents];

      // WHERE clause filtering
      if (upper.includes('STATUSCODE >= 400') || upper.includes('STATUSCODE > 399')) {
        data = data.filter(e => e.statusCode >= 400);
      } else if (upper.includes("REGION = 'US-EAST'")) {
        data = data.filter(e => e.region === 'US-East');
      } else if (upper.includes("SERVICE = 'CHECKOUT-API'")) {
        data = data.filter(e => e.service === 'checkout-api');
      }

      // GROUP BY REGION
      if (upper.includes('GROUP BY REGION')) {
        const groups: Record<string, { region: string; event_count: number; avg_latency: number; error_count: number; total_lat: number }> = {};
        for (const e of data) {
          if (!groups[e.region]) {
            groups[e.region] = { region: e.region, event_count: 0, avg_latency: 0, error_count: 0, total_lat: 0 };
          }
          groups[e.region].event_count++;
          groups[e.region].total_lat += e.latencyMs;
          if (e.statusCode >= 400) groups[e.region].error_count++;
        }

        const rows = Object.values(groups).map(g => ({
          region: g.region,
          event_count: g.event_count,
          avg_latency_ms: Math.round(g.total_lat / Math.max(1, g.event_count)),
          error_count: g.error_count,
          error_percentage: Number(((g.error_count / Math.max(1, g.event_count)) * 100).toFixed(1)) + '%'
        }));

        const elapsed = Math.round(performance.now() - startTime);
        return {
          columns: [
            { name: 'region', type: 'VARCHAR' },
            { name: 'event_count', type: 'INTEGER' },
            { name: 'avg_latency_ms', type: 'FLOAT' },
            { name: 'error_count', type: 'INTEGER' },
            { name: 'error_percentage', type: 'VARCHAR' }
          ],
          rows,
          executionTimeMs: Math.max(8, elapsed + Math.floor(Math.random() * 15)),
          rowCount: rows.length,
          status: 'success',
          executedAt: new Date().toLocaleTimeString()
        };
      }

      // GROUP BY SERVICE
      if (upper.includes('GROUP BY SERVICE')) {
        const groups: Record<string, { service: string; request_count: number; avg_latency: number; total_lat: number; error_count: number }> = {};
        for (const e of data) {
          if (!groups[e.service]) {
            groups[e.service] = { service: e.service, request_count: 0, avg_latency: 0, total_lat: 0, error_count: 0 };
          }
          groups[e.service].request_count++;
          groups[e.service].total_lat += e.latencyMs;
          if (e.statusCode >= 400) groups[e.service].error_count++;
        }

        const rows = Object.values(groups).map(g => ({
          service: g.service,
          request_count: g.request_count,
          avg_latency_ms: Math.round(g.total_lat / Math.max(1, g.request_count)),
          error_count: g.error_count
        }));

        const elapsed = Math.round(performance.now() - startTime);
        return {
          columns: [
            { name: 'service', type: 'VARCHAR' },
            { name: 'request_count', type: 'INTEGER' },
            { name: 'avg_latency_ms', type: 'FLOAT' },
            { name: 'error_count', type: 'INTEGER' }
          ],
          rows,
          executionTimeMs: Math.max(10, elapsed + Math.floor(Math.random() * 12)),
          rowCount: rows.length,
          status: 'success',
          executedAt: new Date().toLocaleTimeString()
        };
      }

      // ORDER BY latencyMs DESC
      if (upper.includes('ORDER BY LATENCYMS DESC')) {
        data.sort((a, b) => b.latencyMs - a.latencyMs);
      }

      // LIMIT
      const limitMatch = upper.match(/LIMIT\s+(\d+)/);
      const limit = limitMatch ? parseInt(limitMatch[1], 10) : 50;
      const sliced = data.slice(0, limit);

      const rows = sliced.map(e => ({
        id: e.id,
        timestamp: e.timestamp.replace('T', ' ').substring(0, 19),
        service: e.service,
        method: e.method,
        endpoint: e.endpoint,
        statusCode: e.statusCode,
        latencyMs: e.latencyMs,
        region: e.region,
        userId: e.userId,
      }));

      const elapsed = Math.round(performance.now() - startTime);
      return {
        columns: [
          { name: 'id', type: 'VARCHAR' },
          { name: 'timestamp', type: 'TIMESTAMP' },
          { name: 'service', type: 'VARCHAR' },
          { name: 'method', type: 'VARCHAR' },
          { name: 'endpoint', type: 'VARCHAR' },
          { name: 'statusCode', type: 'INTEGER' },
          { name: 'latencyMs', type: 'FLOAT' },
          { name: 'region', type: 'VARCHAR' },
          { name: 'userId', type: 'VARCHAR' }
        ],
        rows,
        executionTimeMs: Math.max(12, elapsed + Math.floor(Math.random() * 18)),
        rowCount: rows.length,
        status: 'success',
        executedAt: new Date().toLocaleTimeString()
      };
    }

    // Table 2: transactions query
    if (upper.includes('FROM TRANSACTIONS')) {
      const sampleTxs = [
        { tx_id: 'tx_9841a0', timestamp: '2026-11-13 21:40:12', amount_usd: 129.99, currency: 'USD', payment_status: 'SUCCESS', customer_tier: 'Enterprise', region: 'US-East' },
        { tx_id: 'tx_9841a1', timestamp: '2026-11-13 21:40:19', amount_usd: 49.00, currency: 'USD', payment_status: 'SUCCESS', customer_tier: 'Pro', region: 'EU-Central' },
        { tx_id: 'tx_9841a2', timestamp: '2026-11-13 21:40:24', amount_usd: 399.50, currency: 'EUR', payment_status: 'SUCCESS', customer_tier: 'Enterprise', region: 'EU-Central' },
        { tx_id: 'tx_9841a3', timestamp: '2026-11-13 21:40:31', amount_usd: 19.99, currency: 'USD', payment_status: 'SUCCESS', customer_tier: 'Starter', region: 'US-West' },
        { tx_id: 'tx_9841a4', timestamp: '2026-11-13 21:40:38', amount_usd: 850.00, currency: 'USD', payment_status: 'DECLINED', customer_tier: 'Enterprise', region: 'AP-South' },
        { tx_id: 'tx_9841a5', timestamp: '2026-11-13 21:40:44', amount_usd: 249.00, currency: 'GBP', payment_status: 'SUCCESS', customer_tier: 'Pro', region: 'EU-Central' },
        { tx_id: 'tx_9841a6', timestamp: '2026-11-13 21:40:51', amount_usd: 89.00, currency: 'USD', payment_status: 'SUCCESS', customer_tier: 'Pro', region: 'US-East' },
      ];

      return {
        columns: [
          { name: 'tx_id', type: 'VARCHAR' },
          { name: 'timestamp', type: 'TIMESTAMP' },
          { name: 'amount_usd', type: 'DECIMAL' },
          { name: 'currency', type: 'VARCHAR' },
          { name: 'payment_status', type: 'VARCHAR' },
          { name: 'customer_tier', type: 'VARCHAR' },
          { name: 'region', type: 'VARCHAR' }
        ],
        rows: sampleTxs,
        executionTimeMs: 14,
        rowCount: sampleTxs.length,
        status: 'success',
        executedAt: new Date().toLocaleTimeString()
      };
    }

    // Default Fallback query runner
    const sampleRows = [
      { metric: 'Active WebSocket Nodes', value: 12, health_pct: '100%', status: 'HEALTHY' },
      { metric: 'Global Ingest Rate', value: '4,280 eps', health_pct: '99.4%', status: 'HEALTHY' },
      { metric: 'Buffer Backlog', value: '0 ms', health_pct: '100%', status: 'OPTIMAL' },
      { metric: 'Cluster Rebalancing', value: 'Complete', health_pct: '100%', status: 'IDLE' },
    ];

    return {
      columns: [
        { name: 'metric', type: 'VARCHAR' },
        { name: 'value', type: 'VARCHAR' },
        { name: 'health_pct', type: 'VARCHAR' },
        { name: 'status', type: 'VARCHAR' }
      ],
      rows: sampleRows,
      executionTimeMs: 18,
      rowCount: sampleRows.length,
      status: 'success',
      executedAt: new Date().toLocaleTimeString()
    };
  } catch (err: any) {
    return {
      columns: [],
      rows: [],
      executionTimeMs: 22,
      rowCount: 0,
      status: 'error',
      error: err?.message || 'Query execution syntax error',
      executedAt: new Date().toLocaleTimeString()
    };
  }
}

export function downloadAsCsv(filename: string, rows: Record<string, any>[]): void {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => headers.map(header => JSON.stringify(row[header] ?? '')).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadAsJson(filename: string, data: any): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

