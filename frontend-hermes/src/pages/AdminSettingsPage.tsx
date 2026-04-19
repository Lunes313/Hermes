import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Settings, Plus, Trash2, Edit2, Shield, Building2 } from 'lucide-react';

interface Dependencia {
  id: number;
  nombre: string;
}

export const AdminSettingsPage: React.FC = () => {
  const [dependencias, setDependencias] = useState<Dependencia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDependencias();
  }, []);

  const fetchDependencias = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/dependencias');
      if (response.ok) {
        const data = await response.json();
        setDependencias(data);
      }
    } catch (error) {
      console.error('Error fetching dependencias:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <main className="flex-1 overflow-y-auto bg-surface p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-4xl font-headline font-bold text-primary tracking-tight mb-2">
              Configuración Sistema
            </h2>
            <p className="text-on-surface-variant font-medium text-sm">
              Gestión de dependencias y parámetros de seguridad.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Building2 className="text-secondary" />
                  <h3 className="text-lg font-bold text-primary">Dependencias de la Alcaldía</h3>
                </div>
                <button className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all cursor-pointer">
                  <Plus size={16} /> Agregar Dependencia
                </button>
              </div>

              <div className="space-y-2">
                {loading ? (
                  <p className="text-center py-4 text-on-surface-variant">Cargando...</p>
                ) : dependencias.length === 0 ? (
                  <p className="text-center py-4 text-on-surface-variant">No hay dependencias configuradas.</p>
                ) : (
                  dependencias.map((dep) => (
                    <div key={dep.id} className="flex items-center justify-between p-4 rounded-xl border border-outline-variant hover:bg-surface-container transition-colors group">
                      <span className="text-sm font-semibold text-on-surface">{dep.nombre}</span>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-on-surface-variant hover:text-secondary rounded-lg">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-2 text-on-surface-variant hover:text-error rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-6">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="text-secondary" />
                <h3 className="text-lg font-bold text-primary">Seguridad y Roles</h3>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                <p className="text-sm text-on-surface-variant">
                  El sistema utiliza políticas de RLS (Row Level Security) de Supabase para garantizar la privacidad de los datos.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
};
