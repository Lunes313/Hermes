import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Timeline } from '../components/pqrsd/Timeline';
import { RequestDetails } from '../components/pqrsd/RequestDetails';
import { Footer } from '../components/layout/Footer';
import { Search, Loader2 } from 'lucide-react';
import { api, type PQRSD } from '../services/api';

export const SeguimientoPage: React.FC = () => {
  const [radicado, setRadicado] = useState('');
  const [result, setResult] = useState<PQRSD | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSearch = async () => {
    if (!radicado.trim()) return;
    setLoading(true);
    setError(false);
    
    try {
      // Buscar en la lista (filtro simple por ahora si no hay endpoint exacto por string)
      const list = await api.list();
      const found = list.find(p => p.radicado.toLowerCase() === radicado.toLowerCase().trim());
      
      if (found) {
        setResult(found);
      } else {
        setResult(null);
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface transition-colors duration-300">
      <Navbar />
      <main className="flex-grow flex flex-col items-center py-12 px-4 md:px-8 max-w-[1440px] mx-auto w-full gap-12 pt-28">
        {/* Search Section */}
        <section className="w-full max-w-2xl text-center space-y-6">
          <h1 className="text-4xl md:text-[3.5rem] leading-tight font-black text-primary dark:text-blue-50 tracking-tighter">
            Rastrea tu Solicitud
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-xl mx-auto font-medium">
            Ingresa tu número de radicado (ej: HER-2024...) para ver el estado y la historia de tu solicitud oficial.
          </p>
          
          <div className="relative max-w-lg mx-auto w-full group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-secondary transition-colors">
              <Search size={24} />
            </div>
            <input 
              className="w-full pl-14 pr-32 py-5 bg-white dark:bg-slate-900 text-on-surface placeholder-slate-400 rounded-2xl border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all shadow-xl shadow-slate-200/50 dark:shadow-none text-lg font-bold" 
              placeholder="HER-YYYYMMDD-XXXX" 
              type="text" 
              value={radicado}
              onChange={(e) => setRadicado(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="absolute inset-y-2 right-2 px-8 bg-primary text-white font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer shadow-lg disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Rastrear'}
            </button>
          </div>
          {error && <p className="text-error font-bold text-sm">No se encontró ninguna solicitud con ese número.</p>}
        </section>

        {/* Results Canvas */}
        <section className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          <Timeline />
          <RequestDetails data={result} loading={loading} />
        </section>
      </main>
      <Footer />
    </div>
  );
};
