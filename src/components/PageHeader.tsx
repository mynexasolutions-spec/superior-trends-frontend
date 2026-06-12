import React from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
}

/** Compact responsive page title — matches Home / Shop typography */
export const PageHeader: React.FC<PageHeaderProps> = ({ eyebrow, title, subtitle, trailing }) => {
  return (
    <div className="border-b border-brand-border/30 pb-4 mb-5 space-y-4 sm:space-y-0">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1">
          <span className="text-xs tracking-[0.3em] uppercase font-bold text-[#d4af37]">{eyebrow}</span>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-charcoal mt-1 tracking-tight uppercase leading-tight break-words">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base sm:text-lg text-brand-text-muted mt-2 max-w-xl leading-relaxed">{subtitle}</p>
          )}
        </div>
        {trailing && (
          <div className="w-full lg:w-auto">
            {trailing}
          </div>
        )}
      </div>
    </div>
  );
};
