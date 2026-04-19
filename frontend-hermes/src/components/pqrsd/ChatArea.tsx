import React, { useEffect, useRef, useState } from 'react';
import { Bot, CheckCircle2, Mic, Send, User } from 'lucide-react';
import { clsx } from 'clsx';
import { api, type ChatHistoryMessage, type PQRSDOutput } from '../../services/api';

interface ChatAreaProps {
  onAnalyze: (data: PQRSDOutput) => void;
  setIsAnalyzing: (loading: boolean) => void;
}

type UiMessage = {
  role: 'ai' | 'user';
  text: string;
  time: string;
};

const initialAssistantText =
  'Hola. Soy Hermes, tu asistente inteligente de la Alcaldia de Medellin. Cuentame en tus propias palabras que esta sucediendo o que necesitas solicitar.';

const nowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const ChatArea: React.FC<ChatAreaProps> = ({ onAnalyze, setIsAnalyzing }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<UiMessage[]>([
    { role: 'ai', text: initialAssistantText, time: nowTime() },
  ]);
  const [history, setHistory] = useState<ChatHistoryMessage[]>([
    { role: 'assistant', content: initialAssistantText },
  ]);
  const [loading, setLoading] = useState(false);
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
    const userUiMessage: UiMessage = { role: 'user', text: userMsg, time: nowTime() };
    const nextHistory: ChatHistoryMessage[] = [...history, { role: 'user', content: userMsg }];

    setMessages(prev => [...prev, userUiMessage]);
    setHistory(nextHistory);
    setInput('');
    setLoading(true);
    setIsAnalyzing(true);

    try {
      const response = await api.chatInteract(nextHistory);
      let finalText = response.respuesta;
      const lastAiMsg = messages.filter(m => m.role === 'ai').pop();

      if (lastAiMsg && lastAiMsg.text.trim() === response.respuesta.trim()) {
        finalText = `Ya tengo presente lo anterior. ${response.respuesta}`;
      }

      setHistory(prev => [...prev, { role: 'assistant', content: finalText }]);
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: finalText,
          time: nowTime(),
        },
      ]);

      setRadicadoExitoso(response.radicado ?? null);
      onAnalyze(response.analisis);
    } catch (error) {
      console.error(error);
      const errorText = 'Lo siento, hubo un error al procesar tu solicitud. Podrias repetirlo?';
      setHistory(prev => [...prev, { role: 'assistant', content: errorText }]);
      setMessages(prev => [...prev, { role: 'ai', text: errorText, time: nowTime() }]);
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
              'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform hover:scale-110',
              msg.role === 'ai' ? 'bg-secondary text-on-secondary' : 'bg-primary text-on-primary'
            )}>
              {msg.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div className={clsx(
              'p-4 rounded-2xl shadow-sm relative group',
              msg.role === 'ai' ? 'bg-white rounded-tl-sm text-on-surface border border-outline-variant/30' : 'bg-secondary text-on-secondary rounded-tr-sm'
            )}>
              <p className="font-body leading-relaxed whitespace-pre-wrap text-sm md:text-base">{msg.text}</p>
              <span className={clsx(
                'text-[10px] mt-2 block opacity-70',
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
                <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
              <p className="text-on-tertiary-fixed-variant text-sm mt-1">Radicado generado: {radicadoExitoso}</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-surface-container-low border-t border-surface-variant">
        <div className="relative flex items-center bg-surface-container-lowest rounded-full px-4 py-3 focus-within:ring-2 focus-within:ring-secondary/20 transition-all group border border-surface-variant focus-within:border-secondary">
          <button className="p-2 text-on-surface-variant hover:text-secondary transition-colors cursor-pointer" type="button">
            <Mic size={20} />
          </button>
          <input
            className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface font-body outline-none px-2 text-sm md:text-base disabled:opacity-50"
            placeholder={radicadoExitoso ? 'Solicitud radicada' : 'Cuentame tu problema...'}
            type="text"
            value={input}
            disabled={radicadoExitoso !== null || loading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim() || radicadoExitoso !== null}
            className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:scale-100 disabled:shadow-none shrink-0"
            type="button"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};
