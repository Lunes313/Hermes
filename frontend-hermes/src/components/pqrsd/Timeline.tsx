import React from 'react';
import { Check, History as TimelineIcon } from 'lucide-react';

export const Timeline: React.FC = () => {
  return (
    <div className="lg:col-span-5 bg-surface-container-low rounded-xl p-8 relative overflow-hidden">
      {/* AI Sparkle Edge */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary-fixed to-transparent opacity-50"></div>
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-secondary-fixed to-transparent opacity-50"></div>
      
      <h2 className="text-xl font-semibold text-primary mb-8 flex items-center gap-3">
        <TimelineIcon size={24} className="text-secondary" />
        Status Timeline
      </h2>
      
      <div className="relative pl-6 space-y-8 before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-surface-variant">
        {/* Step 1: Received (Completed) */}
        <div className="relative">
          <div className="absolute -left-[31px] w-[22px] h-[22px] rounded-full bg-tertiary-fixed-dim border-4 border-surface-container-low flex items-center justify-center z-10">
            <Check size={12} className="text-on-tertiary-fixed font-bold" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-primary">Received</h3>
            <p className="text-sm text-on-surface-variant mt-1">Request entered into the system automatically via Web Portal.</p>
            <span className="text-xs text-on-surface-variant mt-2 block">Oct 24, 2024 • 09:15 AM</span>
          </div>
        </div>
        
        {/* Step 2: Classified (Completed) */}
        <div className="relative">
          <div className="absolute -left-[31px] w-[22px] h-[22px] rounded-full bg-tertiary-fixed-dim border-4 border-surface-container-low flex items-center justify-center z-10">
            <Check size={12} className="text-on-tertiary-fixed font-bold" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-primary">Classified</h3>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-surface-container-lowest rounded-md shadow-[0_2px_10px_rgba(27,27,31,0.02)] border border-outline-variant/15 text-xs">
              <span className="text-secondary">#</span>
              <span className="text-on-surface font-medium">Urban Infrastructure</span>
            </div>
            <span className="text-xs text-on-surface-variant mt-2 block">Oct 24, 2024 • 10:30 AM</span>
          </div>
        </div>
        
        {/* Step 3: Assigned (Completed) */}
        <div className="relative">
          <div className="absolute -left-[31px] w-[22px] h-[22px] rounded-full bg-tertiary-fixed-dim border-4 border-surface-container-low flex items-center justify-center z-10">
            <Check size={12} className="text-on-tertiary-fixed font-bold" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-primary">Assigned</h3>
            <p className="text-sm text-on-surface-variant mt-1">Routed to Department of Public Works.</p>
            <span className="text-xs text-on-surface-variant mt-2 block">Oct 25, 2024 • 08:00 AM</span>
          </div>
        </div>
        
        {/* Step 4: In Review (Active) */}
        <div className="relative">
          <div className="absolute -left-[33px] w-[26px] h-[26px] rounded-full bg-secondary-container border-4 border-surface-container-low flex items-center justify-center z-10 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-on-secondary-container"></div>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-lg shadow-[0_4px_20px_rgba(27,27,31,0.04)] outline outline-1 outline-secondary/20">
            <h3 className="text-base font-semibold text-secondary">In Review</h3>
            <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">Technical team is evaluating the street lighting issue on Carrera 45. Awaiting field report.</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-on-surface-variant">Since Oct 26, 2024</span>
              <span className="text-xs font-medium text-secondary bg-secondary-fixed/50 px-2 py-1 rounded">Est. 3 days left</span>
            </div>
          </div>
        </div>
        
        {/* Step 5: Approved/Resolved (Pending) */}
        <div className="relative opacity-40">
          <div className="absolute -left-[31px] w-[22px] h-[22px] rounded-full bg-surface-container-highest border-4 border-surface-container-low flex items-center justify-center z-10">
          </div>
          <div>
            <h3 className="text-base font-semibold text-on-surface">Resolution</h3>
            <p className="text-sm text-on-surface-variant mt-1">Final decision and action plan communication.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
