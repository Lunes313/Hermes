import React, { useState } from 'react';
import { Bot, User, Mic, Send, Loader2 } from 'lucide-react';
import { api, type PQRSDOutput } from '../../services/api';

interface ChatAreaProps {
  onAnalyze: (data: PQRSDOutput) => void;
  setIsAnalyzing: (loading: boolean) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ onAnalyze, setIsAnalyzing }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string, time: string }[]>([
    { role: 'ai', text: 'Hola, soy Hermes. Cuéntame en tus propias palabras qué está sucediendo o qué necesitas solicitar a la Alcaldía.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setMessages(prev => [...prev, { role: 'user', text: userMsg, time }]);
    setInput('');
    setLoading(true);
    setIsAnalyzing(true);

    try {
      const result = await api.analyze(userMsg);
      onAnalyze(result);
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: `Entiendo, ${result.nombre !== 'Anónimo' ? result.nombre : 'ciudadano'}. He identificado que tu solicitud es de tipo "${result.tipo_pqrs}" y debe ser atendida por: ${result.dependencias.join(', ')}. ¿Deseas radicarla formalmente?`, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Lo siento, hubo un error al procesar tu solicitud. Intenta de nuevo.', time: '' }]);
    } finally {
      setLoading(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <section className="flex-1 flex flex-col bg-surface-container-low rounded-xl overflow-hidden relative shadow-inner border border-slate-200 dark:border-slate-800">
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'ai' ? 'bg-secondary-container text-on-secondary-container border border-secondary-fixed/30' : 'bg-primary-container text-on-primary'}`}>
              {msg.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'ai' ? 'bg-surface-container-lowest rounded-tl-sm border-l-2 border-secondary text-on-surface' : 'bg-secondary text-on-secondary rounded-tr-sm'}`}>
              <p className="font-body leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <span className={`text-[10px] mt-2 block opacity-70 ${msg.role === 'ai' ? 'text-on-surface-variant' : 'text-on-secondary'}`}>{msg.time}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4 max-w-[85%]">
            <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center animate-pulse">
              <Bot size={20} />
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-2xl rounded-tl-sm border-l-2 border-secondary flex items-center gap-2">
              <Loader2 className="animate-spin text-secondary" size={16} />
              <span className="text-sm text-on-surface-variant">Hermes está analizando...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-surface-container-lowest border-t border-slate-200 dark:border-slate-800">
        <div className="relative flex items-center bg-surface-container-low rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-secondary/30 transition-all">
          <button className="p-2 text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"><Mic size={20} /></button>
          <input 
            className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface font-body outline-none px-2" 
            placeholder="Escribe tu solicitud aquí..." 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};
