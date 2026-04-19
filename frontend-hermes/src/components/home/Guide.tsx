import React from 'react';
import { siteContent } from '../../data/mockData';
import { MailCheck, TextQuote } from 'lucide-react';

export const Guide: React.FC = () => {
  const { guide } = siteContent;

  return (
    <section className="mb-24" id="como-escribir">
      <div className="mb-12">
        <h2 className="text-[1.375rem] font-bold text-primary mb-2">{guide.title}</h2>
        <p className="text-on-surface-variant">{guide.subtitle}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Large Card */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-surface-container-lowest rounded-2xl p-8 ambient-shadow ai-glow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <TextQuote size={80} />
          </div>
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container mb-6">
              <span className="font-bold">1</span>
            </div>
            <h3 className="text-lg font-bold text-primary mb-3">{guide.steps[0].title}</h3>
            <div className="text-on-surface-variant mb-4 text-sm leading-relaxed whitespace-pre-line">
              {guide.steps[0].content}
            </div>
          </div>
        </div>

        {/* Small Cards */}
        {guide.steps.slice(1, 4).map((step, index) => (
          <div 
            key={step.id} 
            className="bg-surface-container-low rounded-2xl p-6 transition-colors hover:bg-surface-container-lowest hover:ambient-shadow"
          >
            <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant mb-4">
              <span className="font-medium text-sm">{index + 2}</span>
            </div>
            <h3 className="font-bold text-primary mb-2">{step.title}</h3>
            <p className="text-on-surface-variant text-sm">{step.content}</p>
          </div>
        ))}

        {/* Bottom Wide Card */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-surface-container-low rounded-2xl p-6 flex items-center justify-between transition-colors hover:bg-surface-container-lowest hover:ambient-shadow">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                <span className="font-medium text-sm">5</span>
              </div>
              <h3 className="font-bold text-primary">{guide.steps[4].title}</h3>
            </div>
            <p className="text-on-surface-variant text-sm pl-11">{guide.steps[4].content}</p>
          </div>
          <MailCheck size={40} className="text-outline/30 hidden sm:block" />
        </div>
      </div>
    </section>
  );
};
