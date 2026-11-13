import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { MetricPoint, LiveEvent, RegionTelemetry, FilterState, SystemAlert, TabType } from '../types';
import { generateInitialHistory, generateMetricPoint, generateEvent, INITIAL_REGIONS } from '../utils/mockEngine';

interface DashboardContextType {
  history: MetricPoint[];
  currentMetric: MetricPoint;
  liveEvents: LiveEvent[];
  regions: RegionTelemetry[];
  alerts: SystemAlert[];
  filters: FilterState;
  activeTab: TabType;
  isStreaming: boolean;
  burstMode: boolean;
  theme: 'dark' | 'light';
  wsConnected: boolean;
  connectionType: 'websocket' | 'mock-simulation';
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  setActiveTab: (tab: TabType) => void;
  toggleStreaming: () => void;
  toggleBurstMode: () => void;
  toggleTheme: () => void;
  acknowledgeAlert: (id: string) => void;
  clearAlerts: () => void;
  resetFilters: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const INITIAL_FILTERS: FilterState = {
  timeRange: '15m',
  region: 'All',
  statusCode: 'All',
  service: 'All',
  searchQuery: '',
  autoRefresh: true,
  refreshRateMs: 1500,
};

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<MetricPoint[]>(() => generateInitialHistory(25));
  const [currentMetric, setCurrentMetric] = useState<MetricPoint>(() => history[history.length - 1] || generateMetricPoint());
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>(() => Array.from({ length: 15 }, () => generateEvent()));
  const [regions, setRegions] = useState<RegionTelemetry[]>(INITIAL_REGIONS);
  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: 'alt_init_1',
      timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
      severity: 'warning',
      title: 'High Latency in AP-South',
      metric: 'p95_latency',
      currentValue: '112 ms',
      threshold: '100 ms',
      acknowledged: false,
    }
  ]);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [burstMode, setBurstMode] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [connectionType, setConnectionType] = useState<'websocket' | 'mock-simulation'>('mock-simulation');

  const wsRef = useRef<WebSocket | null>(null);

  // Apply dark / light class to root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  // Attempt WebSocket connection to backend
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        // In local development or production, check websocket
        const wsUrl = `${protocol}//${host}/ws`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setWsConnected(true);
          setConnectionType('websocket');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'telemetry') {
              handleNewMetricPoint(data.payload.metric);
              if (data.payload.event) {
                handleNewEvent(data.payload.event);
              }
            }
          } catch (e) {
            // Ignore malformed WS frames
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          setConnectionType('mock-simulation');
          reconnectTimeout = setTimeout(connect, 5000);
        };

        ws.onerror = () => {
          setWsConnected(false);
          setConnectionType('mock-simulation');
          if (ws) ws.close();
        };

        wsRef.current = ws;
      } catch (e) {
        setWsConnected(false);
        setConnectionType('mock-simulation');
      }
    };

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  const handleNewMetricPoint = useCallback((newPoint: MetricPoint) => {
    setCurrentMetric(newPoint);
    setHistory((prev) => {
      const updated = [...prev.slice(-35), newPoint];
      return updated;
    });

    // Check alert conditions
    if (newPoint.errorRate > 5.0) {
      setAlerts((prev) => {
        if (prev.some(a => a.metric === 'error_rate' && !a.acknowledged && Date.now() - new Date(a.timestamp).getTime() < 15000)) {
          return prev;
        }
        return [
          {
            id: 'alt_' + Date.now(),
            timestamp: new Date().toISOString(),
            severity: 'critical',
            title: 'Spike in API Error Rate',
            metric: 'error_rate',
            currentValue: `${newPoint.errorRate}%`,
            threshold: '5.0%',
            acknowledged: false,
          },
          ...prev.slice(0, 19),
        ];
      });
    }

    if (newPoint.cpuUsage > 85) {
      setAlerts((prev) => {
        if (prev.some(a => a.metric === 'cpu_usage' && !a.acknowledged && Date.now() - new Date(a.timestamp).getTime() < 15000)) {
          return prev;
        }
        return [
          {
            id: 'alt_' + Date.now(),
            timestamp: new Date().toISOString(),
            severity: 'warning',
            title: 'Cluster CPU Threshold Exceeded',
            metric: 'cpu_usage',
            currentValue: `${newPoint.cpuUsage}%`,
            threshold: '85%',
            acknowledged: false,
          },
          ...prev.slice(0, 19),
        ];
      });
    }
  }, []);

  const handleNewEvent = useCallback((event: LiveEvent) => {
    setLiveEvents((prev) => [event, ...prev.slice(0, 39)]);

    // Update region stats dynamically
    setRegions((prev) =>
      prev.map((r) => {
        if (r.region === event.region) {
          const newReq = r.requests + 1;
          const newLat = Math.round(r.latency * 0.9 + event.latencyMs * 0.1);
          return {
            ...r,
            requests: newReq,
            latency: newLat,
            status: newLat > 90 ? 'warning' : 'healthy',
          };
        }
        return r;
      })
    );
  }, []);

  // Internal client-side simulation ticker (runs when not using external WS or if WS is idle)
  useEffect(() => {
    if (!isStreaming || wsConnected) return;

    const interval = setInterval(() => {
      const nextPoint = generateMetricPoint(currentMetric, burstMode);
      handleNewMetricPoint(nextPoint);

      const nextEvent = generateEvent(burstMode);
      handleNewEvent(nextEvent);
    }, filters.refreshRateMs);

    return () => clearInterval(interval);
  }, [isStreaming, wsConnected, burstMode, currentMetric, filters.refreshRateMs, handleNewMetricPoint, handleNewEvent]);

  const toggleStreaming = () => setIsStreaming((prev) => !prev);
  const toggleBurstMode = () => setBurstMode((prev) => !prev);
  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <DashboardContext.Provider
      value={{
        history,
        currentMetric,
        liveEvents,
        regions,
        alerts,
        filters,
        activeTab,
        isStreaming,
        burstMode,
        theme,
        wsConnected,
        connectionType,
        setFilters,
        setActiveTab,
        toggleStreaming,
        toggleBurstMode,
        toggleTheme,
        acknowledgeAlert,
        clearAlerts,
        resetFilters,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

