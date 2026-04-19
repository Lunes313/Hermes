import React, { useEffect, useState } from 'react';
import { Filter, Globe, MessageSquare, Clock, MapPin, Sparkles, Loader2 } from 'lucide-react';
import { api, type PQRSD } from '../../services/api';

export const KanbanBoard: React.FC = () => {
  const [pqrsds, setPqrsds] = useState<PQRSD[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.list().then(data => {
      setPqrsds(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const columns = [
    { title: 'Recibida', key: 'radicada' },
    { title: 'Clasificada', key: 'clasificada' }, // Suponiendo estados de tu DB
    { title: 'En Gestión', key: 'gestion' },
  ];

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <main className="flex-1 overflow-hidden flex flex-col bg-surface p-6">
      <div className="mb-6 flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-[2.75rem] font-semibold text-primary dark:text-blue-100 tracking-[-0.02em] leading-none mb-2">Peticiones Activas</h2>
          <p className="text-on-surface-variant text-sm">Seguimiento en tiempo real de las solicitudes ciudadanas.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg border border-outline-variant/30 text-secondary text-sm font-semibold flex items-center gap-2 hover:bg-surface-container transition-colors cursor-pointer">
            <Filter size={18} /> Filtrar
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 items-start">
        {columns.map(col => {
          const filtered = pqrsds.filter(p => p.estado === col.key || (col.key === 'radicada' && p.estado === 'pendiente'));
          return (
            <div key={col.key} className="flex flex-col min-w-[320px] w-[320px] bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-4 h-full shrink-0 border border-slate-200/50 dark:border-slate-800/50">
              <h3 className="text-lg font-bold text-primary dark:text-blue-100 mb-4 flex justify-between items-center px-2">
                {col.title}
                <span className="bg-white dark:bg-slate-800 text-primary dark:text-blue-300 text-xs px-2.5 py-1 rounded-full shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                  {filtered.length}
                </span>
              </h3>
              
              <div className="flex flex-col gap-3 overflow-y-auto pr-1">
                {filtered.map(p => (
                  <div key={p.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-200/50 dark:border-slate-700/50 group cursor-pointer relative overflow-hidden">
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-secondary/10 text-secondary text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider">
                        {p.tipo_pqrs || 'Petición'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{p.radicado}</span>
                    </div>
                    <h4 className="font-bold text-on-surface text-sm mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {p.asunto}
                    </h4>
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-50 dark:border-slate-700/50">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <MapPin size={12} />
                        <span className="truncate max-w-[100px]">{p.lugar || 'Medellín'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-error">
                        <Clock size={12} />
                        <span>15d</span>
                      </div>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="h-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 text-sm font-medium">
                    Sin solicitudes
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};
