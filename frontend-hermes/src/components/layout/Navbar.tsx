import React, { useEffect, useState } from 'react';
import { Bell, Moon, Sun, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <nav className="fixed top-0 w-full z-[100] bg-surface/80 backdrop-blur-xl text-on-surface font-medium tracking-tight shadow-sm border-b border-outline-variant/50 transition-colors duration-300">
      <div className="flex justify-between items-center w-full px-6 py-3 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-8">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-on-primary font-bold text-lg">H</span>
            </div>
            <span className="text-xl font-bold tracking-tighter text-on-surface">Hermes</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate('/')} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Inicio</button>
            <button onClick={() => navigate('/seguimiento')} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Seguimiento</button>
            <button onClick={() => navigate('/admin')} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Panel Interno</button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex relative mr-2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="pl-9 pr-4 py-1.5 rounded-full bg-surface-container-low border-none text-sm focus:ring-2 focus:ring-primary/50 outline-none w-40 lg:w-60 transition-all text-on-surface"
            />
          </div>

          <button className="p-2 rounded-full hover:bg-surface-container transition-colors cursor-pointer text-on-surface-variant">
            <Bell size={20} />
          </button>
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-surface-container transition-colors cursor-pointer text-on-surface-variant"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="h-8 w-px bg-outline-variant mx-1 hidden sm:block"></div>

          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-surface-container-lowest shadow-sm ml-1 cursor-pointer">
            <img 
              alt="User" 
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=32&h=32" 
            />
          </div>
        </div>
      </div>
    </nav>
  );
};
