import React from 'react';

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
}

export const PageShell: React.FC<PageShellProps> = ({
  children,
  className = '',
  narrow = false,
}) => {
  return (
    <div className="relative ">
      {/* Decorative Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#8b1a2a]/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#d4af37]/5 blur-[140px] rounded-full" />
      </div>

      <div
        className={`
          relative
          w-full
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          py-8
          sm:py-12
          min-h-[60vh]
          font-display
          text-left
      
          ${narrow ? 'max-w-3xl' : 'max-w-7xl'}
          ${className}
        `}
      >
        {children}
      </div>
    </div>
  );
};