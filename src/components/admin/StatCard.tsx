import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Card } from '../ui/card';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  link?: string;
  linkLabel?: string;
  iconClassName?: string;
  trend?: string;
  className?: string;
}

/** Shadcn-style stat card (reference: school-management dashboard) */
export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  link,
  linkLabel = 'View details',
  iconClassName = 'bg-[#8b1a2a]/10 text-[#8b1a2a] border-[#8b1a2a]/10',
  trend,
  className,
}) => {
  return (
    <Card className={cn('!py-5 !gap-0 hover:shadow-md h-full', className)}>
      <div className="flex items-start justify-between gap-3 px-6">
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{label}</span>
          <p className="text-3xl font-black text-neutral-900 leading-none tabular-nums">{value}</p>
          {trend && <p className="text-[10px] font-bold text-emerald-600">{trend}</p>}
          {link && (
            <Link
              to={link}
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#8b1a2a] hover:underline mt-1"
            >
              {linkLabel} <ArrowUpRight size={12} />
            </Link>
          )}
        </div>
        <div
          className={cn(
            'size-10 shrink-0 flex items-center justify-center rounded-xl border',
            iconClassName
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};
