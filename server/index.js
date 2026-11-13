import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const PORT = process.env.PORT || 5000;
const STREAM_INTERVAL_MS = parseInt(process.env.STREAM_INTERVAL_MS || '1500', 10);

app.use(cors());
app.use(express.json());

// In-memory telemetry generator state
let lastMetric = {
  timestamp: new Date().toISOString(),
  timeLabel: new Date().toTimeString().split(' ')[0],
  requestsPerSec: 2150,
  revenue: 180,
  activeUsers: 43200,
  latencyMs: 58,
  cpuUsage: 42,
  memoryUsage: 55,
  errorRate: 0.7,
  bandwidthMbps: 880,
};

const SERVICES = ['auth-service', 'checkout-api', 'payment-gateway', 'search-engine', 'inventory-db', 'notification-worker'];
const METHODS = ['GET', 'POST', 'PUT', 'DELETE'];
const REGIONS = ['US-East', 'US-West', 'EU-Central', 'AP-South', 'SA-East'];
const ENDPOINTS = ['/api/v1/auth/login', '/api/v1/cart/checkout', '/api/v1/products/search', '/api/v1/billing/charge'];

function getNextMetric() {
  const now = new Date();
  const reqDelta = Math.round((Math.random() - 0.48) * 160);
  const requestsPerSec = Math.max(200, lastMetric.requestsPerSec + reqDelta);
  const activeUsers = Math.max(1000, lastMetric.activeUsers + Math.round((Math.random() - 0.5) * 50));
  const revenue = Math.max(20, Math.round(180 + (Math.random() - 0.4) * 50));
  const latencyMs = Math.max(20, Math.round(lastMetric.latencyMs * 0.8 + (55 + Math.random() * 25) * 0.2));
  const cpuUsage = Math.min(98, Math.max(10, Math.round(lastMetric.cpuUsage * 0.85 + (42 + Math.random() * 10) * 0.15)));
  const memoryUsage = Math.min(95, Math.max(20, Math.round(lastMetric.memoryUsage * 0.95 + (55 + Math.random() * 3) * 0.05)));
  const errorRate = Math.max(0.1, Number((0.7 + (Math.random() - 0.45) * 0.5).toFixed(2)));
  const bandwidthMbps = Math.max(100, Math.round(requestsPerSec * 0.42));

  lastMetric = {
    timestamp: now.toISOString(),
    timeLabel: now.toTimeString().split(' ')[0],
    requestsPerSec,
    revenue,
    activeUsers,
    latencyMs,
    cpuUsage,
    memoryUsage,
    errorRate,
    bandwidthMbps,
  };
  return lastMetric;
}

function getNextEvent() {
  const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
  const method = METHODS[Math.floor(Math.random() * METHODS.length)];
  const endpoint = ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
  const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
  const isErr = Math.random() < 0.04;
  const statusCode = isErr ? (Math.random() < 0.6 ? 500 : 404) : (Math.random() < 0.1 ? 201 : 200);

  return {
    id: 'evt_' + Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    service,
    method,
    endpoint,
    statusCode,
    latencyMs: Math.round(30 + Math.random() * 80),
    region,
    userId: 'usr_' + Math.floor(1000 + Math.random() * 9000),
    revenue: method === 'POST' ? Math.round(30 + Math.random() * 200) : undefined,
    error: isErr ? 'InternalServerError: DatabaseTimeout' : undefined,
  };
}

// REST Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    activeWebSockets: wss.clients.size,
    memory: process.memoryUsage(),
  });
});

app.get('/api/metrics/summary', (req, res) => {
  res.json(lastMetric);
});

app.get('/api/events', (req, res) => {
  const events = Array.from({ length: 20 }, () => getNextEvent());
  res.json({ count: events.length, events });
});

app.post('/api/query', (req, res) => {
  const { sql } = req.body;
  const startTime = Date.now();

  res.json({
    status: 'success',
    executedQuery: sql,
    executionTimeMs: Date.now() - startTime + 8,
    rowCount: 5,
    columns: [
      { name: 'region', type: 'VARCHAR' },
      { name: 'event_count', type: 'INTEGER' },
      { name: 'avg_latency_ms', type: 'FLOAT' }
    ],
    rows: [
      { region: 'US-East', event_count: 14200, avg_latency_ms: 42.1 },
      { region: 'EU-Central', event_count: 12100, avg_latency_ms: 48.5 },
      { region: 'US-West', event_count: 9800, avg_latency_ms: 55.2 },
      { region: 'AP-South', event_count: 8400, avg_latency_ms: 74.8 },
      { region: 'SA-East', event_count: 3900, avg_latency_ms: 110.0 }
    ]
  });
});

// Serve frontend build in production
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// WebSocket streaming broadcast
wss.on('connection', (ws) => {
  // Send initial payload immediately
  ws.send(JSON.stringify({
    type: 'telemetry',
    payload: {
      metric: lastMetric,
      event: getNextEvent(),
    }
  }));

  ws.on('error', () => {});
});

setInterval(() => {
  if (wss.clients.size === 0) return;
  const metric = getNextMetric();
  const event = getNextEvent();
  const message = JSON.stringify({
    type: 'telemetry',
    payload: { metric, event }
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}, STREAM_INTERVAL_MS);

server.listen(PORT, () => {
  console.log(`[Real-time Analytics Server] HTTP listening on port ${PORT}`);
  console.log(`[Real-time Analytics Server] WebSocket endpoint active at ws://localhost:${PORT}/ws`);
});

