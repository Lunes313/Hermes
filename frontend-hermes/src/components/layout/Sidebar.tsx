import React from 'react';
import { Landmark, Plus, LayoutDashboard, FileText, Map as MapIcon, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Kanban', icon: LayoutDashboard, path: '/admin', active: location.pathname === '/admin' },
    { label: 'Mapa Territorial', icon: MapIcon, path: '/admin/heatmap', active: location.pathname === '/admin/heatmap' },
    { label: 'Solicitudes', icon: FileText, path: '/admin/requests', active: location.pathname === '/admin/requests' },
    { label: 'Configuración', icon: Settings, path: '/admin/settings', active: location.pathname === '/admin/settings' },
  ];

  return (
    <nav className="h-screen w-64 flex-col fixed left-0 top-0 bg-surface-container-low text-primary font-medium text-sm flex gap-4 p-4 z-40 border-r border-transparent transition-colors duration-300">
      <div 
        className="flex items-center gap-3 px-2 mb-4 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
          <Landmark size={24} className="text-on-primary" />
        </div>
        <div>
          <h1 className="text-lg font-black text-on-surface leading-tight">Hermes</h1>
          <p className="text-xs text-on-surface-variant">Digital Concierge</p>
        </div>
      </div>
      
      <button className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl py-3 px-4 font-semibold shadow-md flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform mb-4 cursor-pointer">
        <Plus size={18} />
        New Request
      </button>
      
      <div className="flex flex-col gap-1">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg hover:translate-x-1 transition-transform duration-200 cursor-pointer w-full text-left",
              item.active 
                ? "bg-surface-container-lowest text-primary shadow-sm border border-outline-variant" 
                : "text-on-surface-variant hover:bg-surface-container-high/30"
            )}
          >
            <item.icon size={20} className={item.active ? "fill-current/10" : ""} />
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
};
