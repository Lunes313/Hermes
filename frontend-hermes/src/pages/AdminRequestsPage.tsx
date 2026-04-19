import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { api, type PQRSD } from '../services/api';
import { 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Search,
  ArrowUpDown
} from 'lucide-react';
import { clsx } from 'clsx';

export const AdminRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<PQRSD[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await api.list();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, estado: newStatus } : r));
    // For effect in demo
    console.log(`Status of ${id} changed to ${newStatus}`);
  };

  const filteredRequests = requests.filter(r => 
    r.asunto.toLowerCase().includes(filter.toLowerCase()) ||
    r.radicado.toLowerCase().includes(filter.toLowerCase()) ||
    r.remitente.toLowerCase().includes(filter.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('pendiente') || statusLower.includes('recibida')) {
      return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><Clock size={10} /> {status}</span>;
    }
    if (statusLower.includes('gestion') || statusLower.includes('asignada')) {
      return <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><AlertCircle size={10} /> {status}</span>;
    }
    if (statusLower.includes('cerrada') || statusLower.includes('respondida')) {
      return <span className="bg-tertiary-fixed-dim text-on-tertiary-container px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><CheckCircle size={10} /> {status}</span>;
    }
    return <span className="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full text-[10px] font-black uppercase w-fit">{status}</span>;
  };

  return (
    <AdminLayout>
      <main className="flex-1 overflow-y-auto bg-surface p-6 font-body">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-[2.75rem] font-headline font-semibold text-primary tracking-[-0.02em] leading-none mb-2">
                Active Petitions
              </h2>
              <p className="text-on-surface-variant font-medium text-sm">
                Real-time tracking of citizen requests across all phases.
              </p>
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input 
                  type="text" 
                  placeholder="Filter ID, keyword..."
                  className="bg-surface-container-lowest border border-outline-variant rounded-full py-2 pl-10 pr-4 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 w-64 transition-all text-on-surface"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
              <button className="bg-surface-container-low border border-outline-variant px-4 py-2 rounded-lg text-primary text-xs font-bold flex items-center gap-2 hover:bg-surface-container transition-colors shadow-sm">
                <Filter size={14} /> Filter
              </button>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-outline-variant overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="px-6 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">Radicado</th>
                    <th className="px-6 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">Solicitud</th>
                    <th className="px-6 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">Ubicación</th>
                    <th className="px-6 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">Estado</th>
                    <th className="px-6 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">Acción</th>
                    <th className="px-6 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/20">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                           <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                           <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-on-surface-variant text-sm font-medium italic">
                        No requests found matching your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-surface-container-high/30 transition-colors group">
                        <td className="px-6 py-6">
                          <span className="text-sm font-black text-primary tabular-nums">{req.radicado}</span>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-on-surface group-hover:text-secondary transition-colors mb-0.5">{req.asunto}</span>
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tight">{req.remitente}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                           <div className="flex items-center gap-1.5">
                             <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                             <span className="text-xs font-bold text-on-surface-variant">{req.lugar}</span>
                           </div>
                        </td>
                        <td className="px-6 py-6">
                          {getStatusBadge(req.estado)}
                        </td>
                        <td className="px-6 py-6">
                           <select 
                            className="bg-surface-container-low text-on-surface border-none rounded-lg text-[9px] font-black uppercase px-2 py-1.5 outline-none cursor-pointer focus:ring-2 focus:ring-secondary/20 transition-all shadow-sm"
                            value={req.estado}
                            onChange={(e) => handleStatusChange(req.id, e.target.value)}
                          >
                            <option value="Recibida">Recibida</option>
                            <option value="Asignada">Asignada</option>
                            <option value="En Gestión">En Gestión</option>
                            <option value="Respondida">Respondida</option>
                            <option value="Cerrada">Cerrada</option>
                          </select>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-secondary hover:bg-secondary/10 rounded-xl transition-all shadow-sm hover:shadow-md">
                              <Eye size={16} />
                            </button>
                            <button className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-all shadow-sm hover:shadow-md">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
};
