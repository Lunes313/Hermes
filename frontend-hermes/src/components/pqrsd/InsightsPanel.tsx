import React from 'react';
import { LineChart, AlertCircle, Building2, Database, MapPin, Loader2, User } from 'lucide-react';
import { type PQRSDOutput } from '../../services/api';

interface InsightsPanelProps {
  analysis: PQRSDOutput | null;
  isAnalyzing: boolean;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ analysis, isAnalyzing }) => {
  return (
    <aside className="w-full md:w-80 flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-primary dark:text-blue-100 px-2 flex items-center gap-2">
        <LineChart size={20} className="text-secondary" />
        Análisis en tiempo real
      </h2>
      
      <div className="flex flex-col gap-4">
        {isAnalyzing && (
          <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-xl border border-dashed border-secondary/30 flex flex-col items-center justify-center gap-3 animate-pulse">
            <Loader2 className="animate-spin text-secondary" size={24} />
            <span className="text-xs font-medium text-secondary uppercase tracking-widest">IA Procesando...</span>
          </div>
        )}

        {!analysis && !isAnalyzing && (
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center gap-3 opacity-60">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Database size={24} />
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Describe tu problema en el chat para ver el análisis de la IA.
            </p>
          </div>
        )}

        {analysis && (
          <>
            {/* Ciudadano */}
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
              <div className="flex items-center gap-2 mb-3">
                <User size={14} className="text-primary" />
                <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Remitente</span>
              </div>
              <span className="text-lg font-bold text-on-surface">{analysis.nombre}</span>
            </div>

            {/* Tipo */}
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-error"></div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={14} className="text-error" />
                <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Tipo detectado</span>
              </div>
              <span className="text-xl font-bold text-on-surface">{analysis.tipo_pqrs}</span>
            </div>

            {/* Dependencias */}
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={14} className="text-secondary" />
                <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Dependencias</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.dependencias.map((d, i) => (
                  <span key={i} className="bg-secondary/10 text-secondary px-2 py-1 rounded text-xs font-semibold">{d}</span>
                ))}
              </div>
            </div>

            {/* Lugar */}
            {analysis.lugar && (
              <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-tertiary-fixed-dim"></div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={14} className="text-on-tertiary-container" />
                  <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Ubicación</span>
                </div>
                <span className="text-sm font-semibold text-on-surface">{analysis.lugar}</span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-auto p-4 flex items-center justify-center gap-2 text-[10px] text-on-surface-variant uppercase tracking-tighter">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-fixed opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-on-tertiary-container"></span>
        </span>
        Hermes está escuchando...
      </div>
    </aside>
  );
};
