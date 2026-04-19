import React from 'react';
import { Sparkles, Gavel, MapPin, Tag, User, AlertCircle, Clock } from 'lucide-react';
import { type PQRSD } from '../../services/api';

interface RequestDetailsProps {
  data: PQRSD | null;
  loading: boolean;
}

export const RequestDetails: React.FC<RequestDetailsProps> = ({ data, loading }) => {
  if (loading) return (
    <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl p-12 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800 animate-pulse">
      <Clock size={40} className="text-slate-300 animate-spin mb-4" />
      <p className="text-slate-400">Buscando detalles del radicado...</p>
    </div>
  );

  if (!data) return (
    <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800">
      <AlertCircle size={40} className="text-slate-300 mb-4" />
      <p className="text-slate-400">Ingresa un número de radicado válido para ver los detalles.</p>
    </div>
  );

  return (
    <div className="lg:col-span-7 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* AI Summary Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 relative">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-primary dark:text-blue-300 text-xs font-bold rounded-md tracking-wider border border-slate-200 dark:border-slate-700">
                {data.radicado}
              </span>
              <span className="px-2.5 py-1 bg-error/10 text-error text-xs font-bold rounded-md flex items-center gap-1">
                <AlertCircle size={14} /> Prioridad Alta
              </span>
            </div>
            <h2 className="text-2xl font-bold text-primary dark:text-blue-50 leading-tight">
              {data.asunto}
            </h2>
          </div>
        </div>
        
        {/* AI Insight */}
        <div className="bg-secondary/5 dark:bg-secondary/10 p-5 rounded-xl mb-6 border-l-4 border-secondary transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary">
              <Sparkles size={16} />
            </div>
            <span className="text-xs font-black text-secondary uppercase tracking-widest">Análisis de Hermes</span>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed italic">
            "Este caso ha sido clasificado automáticamente como **{data.tipo_pqrs}**. 
            La IA ha identificado que la competencia principal recae sobre **{data.dependencia_asignada}**. 
            Se ha detectado una ubicación crítica en **{data.lugar}**, lo que prioriza su gestión en el mapa territorial."
          </p>
        </div>
        
        {/* Citizen Testimony */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Testimonio Ciudadano</h3>
          <p className="text-base text-on-surface-variant leading-relaxed font-body bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
            "{data.texto}"
          </p>
        </div>
        
        {/* Meta Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Remitente</span>
            <div className="flex items-center gap-2 text-sm font-bold text-primary dark:text-blue-200">
              <User size={14} className="text-slate-400" /> {data.nombre_identificado || data.remitente}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Tipo</span>
            <div className="flex items-center gap-2 text-sm font-bold text-primary dark:text-blue-200">
              <Tag size={14} className="text-slate-400" /> {data.tipo_pqrs}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Ubicación</span>
            <div className="flex items-center gap-2 text-sm font-bold text-primary dark:text-blue-200">
              <MapPin size={14} className="text-slate-400" /> {data.lugar || 'Medellín'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Guarantee Card */}
      <div className="bg-gradient-to-br from-primary to-primary-container rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-primary/20 transition-transform hover:scale-[1.01]">
        <div className="flex items-start gap-5">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md text-white shadow-inner">
            <Gavel size={28} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-1 tracking-tight">Garantía de Respuesta Ciudadana</h4>
            <p className="text-white/80 text-sm max-w-md leading-relaxed font-light">
              Bajo la **Ley 1755**, este requerimiento debe ser resuelto en un plazo máximo de **15 días hábiles**. 
              Tu solicitud fue radicada el {new Date(data.fecha_creacion).toLocaleDateString()}.
            </p>
          </div>
        </div>
        <button className="whitespace-nowrap px-8 py-3 bg-white text-primary hover:bg-slate-100 font-bold rounded-xl transition-all text-sm shadow-lg cursor-pointer">
          Ver Carta Ciudadana
        </button>
      </div>
    </div>
  );
};
