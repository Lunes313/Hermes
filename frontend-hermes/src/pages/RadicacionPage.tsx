import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { ChatArea } from '../components/pqrsd/ChatArea';
import { InsightsPanel } from '../components/pqrsd/InsightsPanel';
import { Footer } from '../components/layout/Footer';
import { Bot, FileEdit } from 'lucide-react';
import { clsx } from 'clsx';
import { type PQRSDOutput } from '../services/api';

export const RadicacionPage: React.FC = () => {
  const [view, setView] = useState<'chat' | 'form'>('chat');
  const [analysis, setAnalysis] = useState<PQRSDOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-surface transition-colors duration-300">
      <Navbar />
      
      <div className="pt-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('chat')}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer",
                view === 'chat' ? "bg-secondary/10 text-secondary" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <Bot size={20} />
              Asistente IA
            </button>
            <button 
              onClick={() => setView('form')}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer",
                view === 'form' ? "bg-primary/10 text-primary dark:text-blue-400" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <FileEdit size={20} />
              Radicación Directa
            </button>
          </div>
        </div>
      </div>

      <main className="flex-grow flex flex-col md:flex-row max-w-[1440px] w-full mx-auto p-4 md:p-6 gap-6 min-h-0">
        {view === 'chat' ? (
          <>
            <div className="flex-1 flex flex-col h-[calc(100vh-180px)]">
              <ChatArea onAnalyze={setAnalysis} setIsAnalyzing={setIsAnalyzing} />
            </div>
            <InsightsPanel analysis={analysis} isAnalyzing={isAnalyzing} />
          </>
        ) : (
          <div className="flex-1 bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 max-w-4xl mx-auto w-full h-fit mt-4">
            <h2 className="text-2xl font-bold text-primary dark:text-white mb-6">Formulario de Radicación Directa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-on-surface">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Nombre Completo</label>
                <input type="text" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/20" placeholder="Ej: Juan Pérez" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Correo Electrónico</label>
                <input type="email" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/20" placeholder="juan@correo.com" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold">Asunto</label>
                <input type="text" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/20" placeholder="Resumen corto..." />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold">Descripción</label>
                <textarea rows={4} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/20" placeholder="Explique su solicitud..." />
              </div>
            </div>
            <button className="mt-8 w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition-all cursor-pointer">
              Enviar Solicitud
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};
