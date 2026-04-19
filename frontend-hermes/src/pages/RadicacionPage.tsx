import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { ChatArea } from '../components/pqrsd/ChatArea';
import { InsightsPanel } from '../components/pqrsd/InsightsPanel';
import { Footer } from '../components/layout/Footer';
import { Bot, FileEdit, Send, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { api, type PQRSDOutput } from '../services/api';

export const RadicacionPage: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'chat' | 'form'>('chat');
  const [analysis, setAnalysis] = useState<PQRSDOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    email: '',
    telefono: '',
    tipo: 'Petición',
    territorio: 'Comuna 1 - Popular',
    asunto: '',
    descripcion: '',
    solicitud: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [radicadoCode, setRadicadoCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.email || !formData.asunto || !formData.descripcion) {
      alert('Por favor complete todos los campos principales');
      return;
    }

    setIsSubmitting(true);
    try {
      const combinedTexto = `[IDENTIFICACIÓN]\nCédula: ${formData.cedula}\nTeléfono: ${formData.telefono}\nCorreo: ${formData.email}\n\n[DETALLES]\nTipo de Solicitud: ${formData.tipo}\nTerritorio: ${formData.territorio}\n\n[SOLICITUD ESPECÍFICA]\n${formData.solicitud}\n\n[HECHOS]\n${formData.descripcion}`;

      const response = await api.create({
        asunto: formData.asunto,
        canal: 'Web',
        remitente: formData.nombre,
        texto: combinedTexto
      });
      
      setRadicadoCode(response.radicado);
      setShowSuccess(true);
      
      // Auto-redirect after success animation
      setTimeout(() => {
        navigate(`/seguimiento?code=${response.radicado}`);
      }, 3000);
    } catch (error) {
      console.error('Error creating PQRSD:', error);
      alert('Error al radicar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface transition-colors duration-300">
      <Navbar />
      
      <div className="pt-20 bg-surface border-b border-outline-variant">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('chat')}
              className={clsx(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all cursor-pointer",
                view === 'chat' ? "bg-secondary text-on-secondary shadow-lg shadow-secondary/20" : "text-on-surface-variant hover:bg-surface-container-highest"
              )}
            >
              <Bot size={20} />
              Asistente IA
            </button>
            <button 
              onClick={() => setView('form')}
              className={clsx(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all cursor-pointer",
                view === 'form' ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-on-surface-variant hover:bg-surface-container-highest"
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
          <div className="w-full relative mt-4">
            {showSuccess && (
              <div className="absolute inset-0 z-50 bg-surface/95 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 rounded-3xl">
                <div className="w-20 h-20 bg-tertiary-fixed-dim/20 text-on-tertiary-container rounded-full flex items-center justify-center mb-6 animate-bounce">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-3xl font-bold text-primary mb-2">¡Radicación Exitosa!</h3>
                <p className="text-lg text-on-surface-variant mb-6">Su código de seguimiento es:</p>
                <div className="bg-surface-container px-8 py-4 rounded-2xl border-2 border-dashed border-primary/20 font-mono text-2xl font-black text-primary">
                  {radicadoCode}
                </div>
                <p className="mt-8 text-sm text-on-surface-variant animate-pulse">Redirigiéndolo al panel de seguimiento...</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Left Content: Form & Stepper */}
              <div className="lg:col-span-8">
                <div className="mb-10">
                  <h1 className="text-[2.75rem] font-extrabold tracking-tighter leading-none mb-4 text-primary">Radicar PQRSD</h1>
                  <p className="text-on-surface-variant max-w-2xl">Gestione sus peticiones, quejas, reclamos, sugerencias y denuncias de manera formal ante la administración distrital.</p>
                </div>
                
                {/* Progress Indicator */}
                <div className="flex items-center justify-between mb-12 bg-surface-container-low p-6 rounded-xl overflow-x-auto whitespace-nowrap border border-outline-variant/30">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-sm">1</span>
                    <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Identificación</span>
                  </div>
                  <div className="h-[2px] w-12 bg-outline-variant mx-4 opacity-50"></div>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold text-sm">2</span>
                    <span className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">Hechos</span>
                  </div>
                  <div className="h-[2px] w-12 bg-outline-variant mx-4 opacity-50"></div>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold text-sm">3</span>
                    <span className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">Solicitud</span>
                  </div>
                  <div className="h-[2px] w-12 bg-outline-variant mx-4 opacity-50"></div>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold text-sm">4</span>
                    <span className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">Anexos</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12">
                  {/* Section 1: Identification */}
                  <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/30">
                    <div className="flex items-center gap-2 mb-8">
                      <FileEdit className="text-secondary" />
                      <h2 className="text-xl font-bold tracking-tight">Información del Ciudadano</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Nombre Completo</label>
                        <input className="w-full bg-surface-container-low border-b-2 border-transparent focus:border-secondary transition-all rounded-t-lg p-4 outline-none" placeholder="Ej: Juan Pérez" type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Número de Cédula</label>
                        <input className="w-full bg-surface-container-low border-b-2 border-transparent focus:border-secondary transition-all rounded-t-lg p-4 outline-none" placeholder="1.000.000.000" type="text" value={formData.cedula} onChange={(e) => setFormData({...formData, cedula: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Correo Electrónico</label>
                        <input className="w-full bg-surface-container-low border-b-2 border-transparent focus:border-secondary transition-all rounded-t-lg p-4 outline-none" placeholder="juan.perez@email.com" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Teléfono de Contacto</label>
                        <input className="w-full bg-surface-container-low border-b-2 border-transparent focus:border-secondary transition-all rounded-t-lg p-4 outline-none" placeholder="+57 300 000 0000" type="tel" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
                      </div>
                    </div>
                  </section>

                  {/* Section 2: Request Details */}
                  <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/30">
                    <div className="flex items-center gap-2 mb-8">
                      <FileEdit className="text-secondary" />
                      <h2 className="text-xl font-bold tracking-tight">Detalles del Requerimiento</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Tipo de PQRSD</label>
                        <select className="w-full bg-surface-container-low border-none focus:border-secondary transition-all rounded-t-lg p-4 outline-none" value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value})}>
                          <option>Petición</option>
                          <option>Queja</option>
                          <option>Reclamo</option>
                          <option>Sugerencia</option>
                          <option>Denuncia</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Territorio (Comuna/Corregimiento)</label>
                        <select className="w-full bg-surface-container-low border-none focus:border-secondary transition-all rounded-t-lg p-4 outline-none" value={formData.territorio} onChange={(e) => setFormData({...formData, territorio: e.target.value})}>
                          <option>Comuna 1 - Popular</option>
                          <option>Comuna 2 - Santa Cruz</option>
                          <option>Comuna 3 - Manrique</option>
                          <option>Comuna 4 - Aranjuez</option>
                          <option>Comuna 5 - Castilla</option>
                          <option>Comuna 6 - Doce de Octubre</option>
                          <option>Comuna 7 - Robledo</option>
                          <option>Comuna 8 - Villa Hermosa</option>
                          <option>Comuna 9 - Buenos Aires</option>
                          <option>Comuna 10 - La Candelaria</option>
                          <option>Comuna 11 - Laureles - Estadio</option>
                          <option>Comuna 12 - La América</option>
                          <option>Comuna 13 - San Javier</option>
                          <option>Comuna 14 - El Poblado</option>
                          <option>Comuna 15 - Guayabal</option>
                          <option>Comuna 16 - Belén</option>
                          <option>Corregimiento - San Sebastián de Palmitas</option>
                          <option>Corregimiento - San Cristóbal</option>
                          <option>Corregimiento - Altavista</option>
                          <option>Corregimiento - San Antonio de Prado</option>
                          <option>Corregimiento - Santa Elena</option>
                        </select>
                    </div>
                    <div className="space-y-2 mb-6">
                      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Asunto o Referencia</label>
                      <input className="w-full bg-surface-container-low border-b-2 border-transparent focus:border-secondary transition-all rounded-t-lg p-4 outline-none" placeholder="Breve título de su solicitud" type="text" value={formData.asunto} onChange={(e) => setFormData({...formData, asunto: e.target.value})} required/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Descripción de los Hechos</label>
                      <textarea className="w-full bg-surface-container-low border-b-2 border-transparent focus:border-secondary transition-all rounded-t-lg p-4 resize-none outline-none" placeholder="Relate de forma clara y cronológica los hechos que motivan su solicitud..." rows={6} value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} required></textarea>
                    </div>
                  </section>

                  {/* Section 3: The Request */}
                  <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/30">
                    <div className="flex items-center gap-2 mb-8">
                      <FileEdit className="text-secondary" />
                      <h2 className="text-xl font-bold tracking-tight">Solicitud Específica</h2>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">¿Qué solicita puntualmente?</label>
                      <textarea className="w-full bg-surface-container-low border-b-2 border-transparent focus:border-secondary transition-all rounded-t-lg p-4 resize-none outline-none" placeholder="Defina con claridad la acción que espera por parte de la entidad..." rows={4} value={formData.solicitud} onChange={(e) => setFormData({...formData, solicitud: e.target.value})}></textarea>
                    </div>
                  </section>

                  {/* Section 4: Attachments */}
                  <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/30">
                    <div className="flex items-center gap-2 mb-8">
                      <FileEdit className="text-secondary" />
                      <h2 className="text-xl font-bold tracking-tight">Soportes y Anexos</h2>
                    </div>
                    <div className="border-2 border-dashed border-outline-variant rounded-xl p-12 text-center hover:bg-surface-container-low transition-colors cursor-pointer group">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant group-hover:text-secondary transition-colors mb-4">cloud_upload</span>
                      <p className="text-sm font-medium text-on-surface mb-1">Arrastre archivos o haga clic para subir</p>
                      <p className="text-xs text-on-surface-variant">PDF, JPG o PNG (Máx. 10MB por archivo)</p>
                    </div>
                  </section>

                  <div className="flex justify-between items-center py-6">
                    <button type="button" className="px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-widest text-secondary hover:bg-secondary/5 transition-all cursor-pointer">Guardar Borrador</button>
                    <button disabled={isSubmitting} type="submit" className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-10 py-4 rounded-lg font-bold text-sm uppercase tracking-widest shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50">
                      {isSubmitting ? 'Radicando...' : 'Radicar Solicitud'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Sidebar: Hermes Helper */}
              <aside className="lg:col-span-4 space-y-6">
                <div className="bg-surface-container-low p-8 rounded-2xl sticky top-28 border border-outline-variant/30">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                      <Bot className="text-on-secondary-container" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">Hermes Helper</h3>
                      <span className="text-xs font-semibold text-secondary-container uppercase tracking-tighter">Asistente Ciudadano</span>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/30">
                      <p className="text-sm font-medium leading-relaxed italic text-on-surface-variant">
                        "Para que tu solicitud sea efectiva, recuerda que según la <strong>Ley 1755 de 2015</strong>, tienes derecho a obtener una respuesta clara, oportuna y de fondo."
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Tips de Redacción</h4>
                      <ul className="space-y-4">
                        <li className="flex gap-3">
                          <CheckCircle2 className="text-tertiary-fixed-dim shrink-0" size={18} />
                          <p className="text-sm text-on-surface-variant leading-tight">Sé conciso: Evita rodeos y ve al punto central del problema.</p>
                        </li>
                        <li className="flex gap-3">
                          <CheckCircle2 className="text-tertiary-fixed-dim shrink-0" size={18} />
                          <p className="text-sm text-on-surface-variant leading-tight">Orden cronológico: Describe los hechos desde el más antiguo al más reciente.</p>
                        </li>
                        <li className="flex gap-3">
                          <CheckCircle2 className="text-tertiary-fixed-dim shrink-0" size={18} />
                          <p className="text-sm text-on-surface-variant leading-tight">Pruebas: Adjunta fotos, videos o documentos que respalden tu versión.</p>
                        </li>
                      </ul>
                    </div>
                    <div className="pt-4 border-t border-outline-variant/30">
                      <div className="flex items-center justify-between p-4 bg-primary text-on-primary rounded-xl overflow-hidden relative">
                        <div className="relative z-10">
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Tiempo promedio</p>
                          <p className="text-xl font-black">15 Días Hábiles</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};
