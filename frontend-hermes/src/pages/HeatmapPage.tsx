import React from 'react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { TrendingUp, CheckCircle2, ArrowRight, Bot, Info } from 'lucide-react';

export const HeatmapPage: React.FC = () => {
  return (
    <AdminLayout>
      {/* Heatmap Layout */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative bg-surface">
        {/* Map Canvas */}
        <div className="flex-1 relative bg-surface-container-low h-full min-h-[512px] lg:min-h-0 order-2 lg:order-1 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-80 mix-blend-multiply dark:mix-blend-normal" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1577083288073-40892c0860a4?auto=format&fit=crop&q=80&w=1200')" }}
          ></div>
          
          {/* Heatmap Overlays */}
          <div className="absolute inset-0 pointer-events-none mix-blend-multiply">
            <div className="absolute top-[40%] left-[50%] w-64 h-64 bg-error/50 rounded-full blur-[40px] transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-[65%] left-[45%] w-80 h-80 bg-secondary/40 rounded-full blur-[50px] transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>

          {/* Map Markers */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[40%] left-[50%] flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-6 h-6 bg-error rounded-full animate-ping absolute opacity-75"></div>
              <div className="w-4 h-4 bg-error rounded-full relative border-[3px] border-surface-container-lowest shadow-md"></div>
            </div>
          </div>

          {/* Floating Legend */}
          <div className="absolute bottom-6 left-6 right-6 lg:right-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-[24px] p-4 rounded-xl shadow-[0_8px_32px_rgba(27,27,31,0.08)] border border-outline-variant/15 flex flex-col gap-3 max-w-sm z-10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-secondary-container flex items-center justify-center text-secondary">
                <Bot size={14} />
              </div>
              <span className="text-sm font-semibold text-primary dark:text-blue-100">Live Density Analysis</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
              <span>Low</span>
              <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-tertiary-fixed via-secondary to-error"></div>
              <span>High</span>
            </div>
          </div>
        </div>

        {/* Analytics Sidebar */}
        <aside className="w-full lg:w-[420px] bg-white dark:bg-slate-900 h-full overflow-y-auto flex flex-col border-l-0 lg:border-l border-slate-200 dark:border-slate-800 shadow-[-10px_0_40px_-10px_rgba(27,27,31,0.05)] order-1 lg:order-2 z-20 relative">
          <div className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-6 py-5 z-10 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-3xl font-bold text-primary dark:text-blue-100 tracking-[-0.02em] leading-none mb-1">Analytics</h2>
            <p className="text-sm text-on-surface-variant font-medium">Territorial Insight & Efficiency</p>
          </div>
          
          <div className="p-6 flex flex-col gap-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col hover:bg-white dark:hover:bg-slate-800 transition-colors group cursor-pointer shadow-sm">
                <span className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mb-2">Total Active</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary dark:text-blue-100 leading-none group-hover:-translate-y-0.5 transition-transform">4,281</span>
                  <span className="text-error text-xs font-bold flex items-center gap-1">
                    <TrendingUp size={14} /> 12%
                  </span>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col hover:bg-white dark:hover:bg-slate-800 transition-colors group cursor-pointer shadow-sm">
                <span className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mb-2">Avg Response</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary dark:text-blue-100 leading-none group-hover:-translate-y-0.5 transition-transform">4.2</span>
                  <span className="text-sm text-on-surface-variant font-medium">days</span>
                </div>
              </div>
            </div>

            {/* AI Priority Insight */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-lg border border-primary/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-error-container/20 dark:bg-error/10 flex items-center justify-center shrink-0 text-error">
                  <Info size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-primary dark:text-blue-100 mb-1">Critical Cluster Detected</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">Unusual spike in 'Public Lighting' requests identified in Comuna 4 (Aranjuez) over the last 12 hours.</p>
                  <button className="mt-3 text-sm font-semibold text-secondary flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                    Analyze Details <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-slate-50 dark:bg-slate-800/30 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-primary dark:text-blue-100 px-4 py-3 pb-2 uppercase tracking-tighter">Department Efficiency</h3>
              <div className="flex flex-col gap-1 p-1">
                {[
                  { name: 'Secretaría de Salud', rate: '98%', rank: '#1', active: true },
                  { name: 'Movilidad', rate: '92%', rank: '#2' },
                  { name: 'Infraestructura', rate: '87%', rank: '#3' },
                ].map((dept) => (
                  <div key={dept.name} className="bg-white dark:bg-slate-800 rounded-lg p-3 flex items-center justify-between shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        "w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs",
                        dept.active ? "bg-secondary/10 text-secondary" : "bg-slate-100 dark:bg-slate-700 text-slate-400"
                      )}>{dept.rank}</div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-on-surface">{dept.name}</span>
                        <span className="text-[10px] text-on-surface-variant">{dept.rate} Resolution Rate</span>
                      </div>
                    </div>
                    {dept.active && <CheckCircle2 size={18} className="text-secondary" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </main>
    </AdminLayout>
  );
};
