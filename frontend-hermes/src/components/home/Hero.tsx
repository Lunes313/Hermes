import React from 'react';
import { FileEdit, Search, Bot } from 'lucide-react';
import { siteContent } from '../../data/mockData';

export interface HeroProps {
  onRadicarClick?: () => void;
  onConsultarClick?: () => void;
  onChatClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onRadicarClick,
  onConsultarClick,
  onChatClick
}) => {
  const { hero } = siteContent;

  return (
    <section className="relative rounded-2xl overflow-hidden bg-surface-container mb-24 min-h-[500px] flex items-center">
      <div className="absolute inset-0 z-0">
        <img
          alt="Medellin Architecture"
          className="w-full h-full object-cover opacity-20 mix-blend-luminosity"
          src="https://images.unsplash.com/photo-1577083288073-40892c0860a4?auto=format&fit=crop&q=80&w=1200"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-transparent"></div>
      </div>
      
      <div className="relative z-10 p-12 md:p-20 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container mb-6 text-sm font-medium">
          <Bot size={16} />
          {hero.badge}
        </div>
        
        <h1 className="text-[2.75rem] leading-tight font-bold text-primary tracking-[-0.02em] mb-6">
          {hero.title}
        </h1>
        
        <p className="text-lg text-on-surface-variant mb-10 max-w-2xl font-light">
          {hero.description}
        </p>
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={onRadicarClick}
            className="bg-primary text-on-primary px-8 py-4 rounded-xl font-medium flex items-center gap-3 transition-transform hover:-translate-y-0.5 ambient-shadow cursor-pointer"
          >
            <FileEdit size={20} />
            {hero.ctaRadicar}
          </button>
          
          <button
            onClick={onConsultarClick}
            className="px-8 py-4 rounded-xl font-medium text-secondary border border-outline flex items-center gap-3 transition-transform hover:-translate-y-0.5 hover:bg-surface-container cursor-pointer"
          >
            <Search size={20} />
            {hero.ctaConsultar}
          </button>
          
          <button
            onClick={onChatClick}
            className="px-8 py-4 rounded-xl font-medium bg-secondary text-on-secondary flex items-center gap-3 transition-transform hover:-translate-y-0.5 ambient-shadow cursor-pointer"
          >
            <Bot size={20} />
            {hero.ctaChat}
          </button>
        </div>
      </div>
    </section>
  );
};
