import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, Mic, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { api, type PQRSDOutput } from '../../services/api';
import { clsx } from 'clsx';

interface ChatAreaProps {
  onAnalyze: (data: PQRSDOutput) => void;
  setIsAnalyzing: (loading: boolean) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ onAnalyze, setIsAnalyzing }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string, time: string }[]>([
    { role: 'ai', text: '¡Hola! Soy Hermes, tu asistente inteligente de la Alcaldía de Medellín. Cuéntame en tus propias palabras qué está sucediendo o qué necesitas solicitar.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [loading, setLoading] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<PQRSDOutput | null>(null);
  const [radicadoExitoso, setRadicadoExitoso] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading || radicadoExitoso) return;

    const userMsg = input.trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setMessages(prev => [...prev, { role: 'user', text: userMsg, time }]);
    setInput('');
    setLoading(true);
    setIsAnalyzing(true);

    // Check for confirmation keywords
    const confirmationKeywords = ['sí', 'si', 'proceda', 'claro', 'adelante', 'proceder', 'estoy de acuerdo'];
    const isConfirmation = confirmationKeywords.some(k => userMsg.toLowerCase().includes(k));

    if (isConfirmation && lastAnalysis && lastAnalysis.nombre) {
      try {
        const response = await api.create({
          asunto: `Solicitud de ${lastAnalysis.nombre} en ${lastAnalysis.lugar}`,
          canal: 'Chat IA',
          remitente: lastAnalysis.nombre,
          texto: messages.filter(m => m.role === 'user').map(m => m.text).join(' ')
        });
        
        setRadicadoExitoso(response.radicado);
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: `¡Listo! He radicado tu solicitud oficialmente. Tu número de radicado es ${response.radicado}. Estaré enviando actualizaciones a tu correo.`, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }]);
        setLoading(false);
        setIsAnalyzing(false);
        return;
      } catch (error) {
        console.error("Error creating radicado from chat:", error);
      }
    }

    try {
      // Send conversation history to the backend context
      const conversationContext = messages
        .filter(m => m.role === 'user')
        .map(m => m.text)
        .join('. ') + '. ' + userMsg;

      const response = await api.chatInteract(conversationContext);
      
      // Anti-repetition logic
      let finalText = response.respuesta;
      const lastAiMsg = messages.filter(m => m.role === 'ai').pop();
      
      if (lastAiMsg && lastAiMsg.text === response.respuesta) {
        // Simple client-side rephrasing if backend doesn't handle it well
        finalText = `Entiendo perfectamente. ${response.respuesta} ¿Hay algún otro detalle que deba saber sobre lo que ocurre en ${response.analisis.lugar || 'tu sector'}?`;
      }

      setLastAnalysis(response.analisis);
      onAnalyze(response.analisis);
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: finalText, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Lo siento, hubo un error al procesar tu solicitud. ¿Podrías repetirlo?', time: '' }]);
    } finally {
      setLoading(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <section className="flex-1 flex flex-col bg-surface-bright rounded-2xl overflow-hidden relative border border-outline-variant">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'self-end flex-row-reverse' : ''}`}>
            <div className={clsx(
              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform hover:scale-110",
              msg.role === 'ai' ? 'bg-secondary text-on-secondary' : 'bg-primary text-on-primary'
            )}>
              {msg.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div className={clsx(
              "p-4 rounded-2xl shadow-sm relative group",
              msg.role === 'ai' ? 'bg-white rounded-tl-sm text-on-surface border border-outline-variant/30' : 'bg-secondary text-on-secondary rounded-tr-sm'
            )}>
              <p className="font-body leading-relaxed whitespace-pre-wrap text-sm md:text-base">{msg.text}</p>
              <span className={clsx(
                "text-[10px] mt-2 block opacity-70",
                msg.role === 'ai' ? 'text-on-surface-variant' : 'text-on-secondary'
              )}>{msg.time}</span>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-4 max-w-[85%] animate-pulse">
            <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-sm border border-outline-variant/30 flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-xs font-bold text-secondary uppercase tracking-widest">Analizando reporte...</span>
            </div>
          </div>
        )}

        {radicadoExitoso && (
          <div className="bg-tertiary-fixed-dim/10 border border-tertiary-fixed-dim/20 p-6 rounded-2xl flex flex-col items-center gap-4 animate-in zoom-in duration-500 my-4 shadow-lg shadow-tertiary-fixed/10">
            <div className="w-12 h-12 bg-tertiary-fixed-dim text-on-tertiary-container rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle2 size={24} />
            </div>
            <div className="text-center">
              <h4 className="text-on-tertiary-container font-black text-lg">PROCESO FINALIZADO</h4>
              <p className="text-on-tertiary-fixed-variant text-sm mt-1">Radicado generado con éxito.</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-surface-container-low border-t border-surface-variant">
        <div className="relative flex items-center bg-surface-container-lowest rounded-full px-4 py-3 focus-within:ring-2 focus-within:ring-secondary/20 transition-all group border border-surface-variant focus-within:border-secondary">
          <button className="p-2 text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"><Mic size={20} /></button>
          <input 
            className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface font-body outline-none px-2 text-sm md:text-base disabled:opacity-50" 
            placeholder={radicadoExitoso ? "Solicitud radicada" : "Cuéntame tu problema..."}
            type="text" 
            value={input}
            disabled={radicadoExitoso || loading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim() || !!radicadoExitoso}
            className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:scale-100 disabled:shadow-none shrink-0"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};
