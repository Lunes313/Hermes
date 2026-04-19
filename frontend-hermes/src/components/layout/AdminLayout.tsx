import React from 'react';
import { Sidebar } from './Sidebar';
import { Bell, HelpCircle, Search } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="bg-surface text-on-surface flex h-screen overflow-hidden transition-colors duration-300">
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:ml-64 h-screen overflow-hidden">
        {/* TopNavBar Admin */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl text-slate-900 dark:text-slate-50 font-medium tracking-tight shadow-sm flex justify-between items-center w-full px-6 py-3 shrink-0 z-50 transition-colors duration-300 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                className="bg-slate-100 dark:bg-slate-800 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50 outline-none w-64 transition-all" 
                placeholder="Buscar ID, palabra clave..." 
                type="text"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <Bell size={20} />
            </button>
            <button className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <HelpCircle size={20} />
            </button>
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm ml-2">
              <img 
                alt="Admin profile" 
                className="w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=36&h=36" 
              />
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
};
