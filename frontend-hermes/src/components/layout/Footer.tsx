import React from 'react';
import { Phone, Globe, Share2 } from 'lucide-react';
import { siteContent } from '../../data/mockData';

export const Footer: React.FC = () => {
  const { footer } = siteContent;

  return (
    <footer className="bg-surface-container-lowest text-on-surface-variant text-xs uppercase tracking-widest w-full py-12 px-8 border-t border-outline-variant" id="contacto">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-8">
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="text-primary font-bold tracking-tighter normal-case text-lg mb-1">{footer.brand}</span>
          <span className="normal-case tracking-normal">{footer.copyright}</span>
          <div className="flex items-center gap-2 mt-2 text-secondary normal-case tracking-normal">
            <Phone size={16} />
            <span className="font-medium">{footer.phone}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6">
          {footer.links.map((link) => (
            <a 
              key={link.label}
              className="hover:text-blue-500 underline transition-all text-slate-500 normal-case tracking-normal" 
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </div>
        
        <div className="flex gap-4">
          <a className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-highest transition-colors" href="#">
            <Globe size={18} />
          </a>
          <a className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-highest transition-colors" href="#">
            <Share2 size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
};
