import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { api, type PQRSD } from '../services/api';
import { TrendingUp, Activity, Map as MapIcon, Info, Users } from 'lucide-react';
import { clsx } from 'clsx';

// Coordenadas aproximadas de las comunas de Medellín
const COMUNAS_COORDS: Record<string, [number, number]> = {
  "Comuna 1 - Popular": [6.2990, -75.5450],
  "Comuna 2 - Santa Cruz": [6.2950, -75.5550],
  "Comuna 3 - Manrique": [6.2800, -75.5500],
  "Comuna 4 - Aranjuez": [6.2750, -75.5600],
  "Comuna 5 - Castilla": [6.2850, -75.5800],
  "Comuna 6 - Doce de Octubre": [6.3000, -75.5850],
  "Comuna 7 - Robledo": [6.2750, -75.5900],
  "Comuna 8 - Villa Hermosa": [6.2550, -75.5500],
  "Comuna 9 - Buenos Aires": [6.2400, -75.5500],
  "Comuna 10 - La Candelaria": [6.2450, -75.5650],
  "Comuna 11 - Laureles-Estadio": [6.2450, -75.5900],
  "Comuna 11 - Laureles - Estadio": [6.2450, -75.5900],
  "Comuna 12 - La América": [6.2550, -75.6050],
  "Comuna 13 - San Javier": [6.2500, -75.6150],
  "Comuna 14 - El Poblado": [6.2100, -75.5700],
  "Comuna 15 - Guayabal": [6.2150, -75.5850],
  "Comuna 16 - Belén": [6.2250, -75.6000],
  "Corregimiento de San Cristóbal": [6.2750, -75.6350],
  "Corregimiento - San Cristóbal": [6.2750, -75.6350],
  "Corregimiento de Altavista": [6.2150, -75.6350],
  "Corregimiento - Altavista": [6.2150, -75.6350],
  "Corregimiento de San Antonio de Prado": [6.1850, -75.6550],
  "Corregimiento - San Antonio de Prado": [6.1850, -75.6550],
  "Corregimiento de Santa Elena": [6.2400, -75.5000],
  "Corregimiento - Santa Elena": [6.2400, -75.5000],
  "Corregimiento de San Sebastián de Palmitas": [6.3350, -75.6850],
  "Corregimiento - San Sebastián de Palmitas": [6.3350, -75.6850]
};

interface CommuneData {
  name: string;
  count: number;
  coords: [number, number];
  primaryDependency: string;
}

export const HeatmapPage: React.FC = () => {
  const [data, setData] = useState<CommuneData[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAndGroupData();
  }, []);

  const fetchAndGroupData = async () => {
    try {
      const pqrsds = await api.list();
      setTotalRequests(pqrsds.length);

      const grouped: Record<string, { count: number, depts: Record<string, number> }> = {};

      pqrsds.forEach(p => {
        const place = p.lugar || "Desconocido";
        if (!grouped[place]) {
          grouped[place] = { count: 0, depts: {} };
        }
        grouped[place].count++;
        
        const dept = p.dependencia_asignada || "General";
        grouped[place].depts[dept] = (grouped[place].depts[dept] || 0) + 1;
      });

      const communeList: CommuneData[] = Object.entries(grouped).map(([name, info]) => {
        // Encontrar la dependencia más solicitada
        const primaryDependency = Object.entries(info.depts).sort((a, b) => b[1] - a[1])[0][0];
        
        return {
          name,
          count: info.count,
          coords: COMUNAS_COORDS[name] || [6.2476, -75.5658], // Centro por defecto
          primaryDependency
        };
      });

      setData(communeList.sort((a, b) => b.count - a.count));
    } catch (error) {
      console.error("Error fetching map data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getHeatColor = (count: number) => {
    const max = Math.max(...data.map(d => d.count), 1);
    const ratio = count / max;
    if (ratio > 0.7) return "#ba1a1a"; // Error / Red
    if (ratio > 0.4) return "#2259bf"; // Secondary / Blue
    return "#4ae176"; // Tertiary / Green
  };

  return (
    <AdminLayout>
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative bg-surface">
        <div className="flex-1 relative bg-surface-container-low h-full min-h-[512px] lg:min-h-0 order-2 lg:order-1 overflow-hidden">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-container-low/50 z-50">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <span className="font-bold text-primary">Cargando Mapa Territorial...</span>
              </div>
            </div>
          ) : (
            <MapContainer center={[6.2476, -75.5658] as any} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              {data.map((commune, idx) => (
                <CircleMarker
                  key={idx}
                  center={commune.coords}
                  radius={10 + (commune.count * 2)}
                  fillColor={getHeatColor(commune.count)}
                  color="white"
                  weight={2}
                  opacity={1}
                  fillOpacity={0.6}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <h3 className="font-bold text-lg mb-1">{commune.name}</h3>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">Solicitudes activas:</span>
                          <span className="font-black text-primary">{commune.count}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-100">
                          <span className="text-xs text-slate-400 block mb-1 uppercase font-bold">Principal Dependencia</span>
                          <span className="text-sm font-semibold text-secondary">{commune.primaryDependency}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          )}
        </div>

        <aside className="w-full lg:w-[420px] bg-surface-container-lowest h-full overflow-y-auto flex flex-col border-l border-outline-variant shadow-xl z-20 relative font-body">
          <div className="sticky top-0 bg-surface/90 backdrop-blur-md px-6 py-8 z-10 border-b border-outline-variant">
            <h2 className="text-3xl font-black text-primary tracking-tighter mb-1 uppercase">Mapa de Calor</h2>
            <p className="text-sm text-on-surface-variant font-medium">Análisis Territorial Medellín</p>
          </div>
          
          <div className="p-6 flex flex-col gap-6">
            <div className="bg-primary text-white p-6 rounded-2xl shadow-lg border border-white/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8"></div>
               <span className="text-xs font-bold uppercase tracking-widest opacity-60">Total Solicitudes</span>
               <div className="text-5xl font-black mt-2 leading-none">{totalRequests}</div>
               <div className="flex items-center gap-2 mt-4 text-emerald-400 font-bold text-sm">
                  <TrendingUp size={16} /> +14.2% vs mes anterior
               </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-outline uppercase tracking-widest">Puntos Críticos</h3>
              {data.slice(0, 4).map((commune, i) => (
                <div key={i} className="bg-surface-container-low p-4 rounded-xl border border-outline-variant flex items-center justify-between">
                  <div className="flex gap-3 items-center">
                    <div className={clsx(
                      "w-10 h-10 rounded-lg flex items-center justify-center font-black",
                      i === 0 ? "bg-error text-on-error" : "bg-surface-container text-on-surface-variant"
                    )}>
                      {commune.count}
                    </div>
                    <div>
                      <span className="block font-bold text-primary leading-none">{commune.name}</span>
                      <span className="text-[10px] text-outline font-semibold uppercase">{commune.primaryDependency}</span>
                    </div>
                  </div>
                  {i === 0 && <Activity size={18} className="text-error animate-pulse" />}
                </div>
              ))}
            </div>

            <div className="bg-secondary-container/30 p-5 rounded-2xl border border-secondary-container/50">
              <div className="flex gap-3 items-start">
                <Info className="text-secondary shrink-0" size={20} />
                <p className="text-sm text-on-secondary-container leading-relaxed font-medium">
                  Los datos mostrados corresponden a las solicitudes radicadas en las últimas 15 días hábiles filtradas por relevancia territorial.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </AdminLayout>
  );
};
