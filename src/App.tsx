import React from 'react';
import { useDashboard } from './context/DashboardContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { FilterBar } from './components/dashboard/FilterBar';
import { KPISection } from './components/dashboard/KPISection';
import { RealtimeAreaChart } from './components/charts/RealtimeAreaChart';
import { RevenueBarChart } from './components/charts/RevenueBarChart';
import { GeoDistributionMap } from './components/charts/GeoDistributionMap';
import { DonutChart } from './components/charts/DonutChart';
import { LiveEventStreamTable } from './components/charts/LiveEventStreamTable';
import { SqlLab } from './components/sqllab/SqlLab';
import { ChartStudio } from './components/explore/ChartStudio';
import { AlertsPanel } from './components/alerts/AlertsPanel';
import { DatasetsView } from './components/datasets/DatasetsView';
import { DeploymentGuide } from './components/deployment/DeploymentGuide';

export const AppContent: React.FC = () => {
  const { activeTab } = useDashboard();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto space-y-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              {/* Native Filter Bar */}
              <FilterBar />

              {/* Real-time KPI Metric Cards */}
              <KPISection />

              {/* Row 1: Real-time Area Chart + Revenue Bar Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RealtimeAreaChart />
                </div>
                <div>
                  <RevenueBarChart />
                </div>
              </div>

              {/* Row 2: Global PoPs + Donut Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <GeoDistributionMap />
                </div>
                <div>
                  <DonutChart />
                </div>
              </div>

              {/* Row 3: Live Trace Stream Table */}
              <LiveEventStreamTable />
            </div>
          )}

          {activeTab === 'explore' && (
            <div className="animate-fade-in">
              <ChartStudio />
            </div>
          )}

          {activeTab === 'sqllab' && (
            <div className="animate-fade-in">
              <SqlLab />
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="animate-fade-in">
              <AlertsPanel />
            </div>
          )}

          {activeTab === 'datasets' && (
            <div className="animate-fade-in">
              <DatasetsView />
            </div>
          )}

          {activeTab === 'deployment' && (
            <div className="animate-fade-in">
              <DeploymentGuide />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

