import React from 'react';
import { IndianRupee, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { useAdminStats } from '../../hooks/useAdminStats';
import { formatINR } from '../../lib/formatCurrency';

/** Live sales snapshot shown on every admin sidebar page */
export const AdminSidebarSales: React.FC = () => {
  const { data, isLoading, isError } = useAdminStats();
  const stats = data?.stats;

  return (
    <div className="mx-2 sm:mx-3 mb-3 rounded-xl border border-neutral-800 bg-neutral-800/60 p-3 space-y-2.5">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#d4af37] px-1">
        Sales Snapshot
      </p>

      {isLoading ? (
        <div className="space-y-2">
          <div className="h-8 rounded bg-neutral-700/80 animate-pulse" />
          <div className="h-8 rounded bg-neutral-700/80 animate-pulse" />
          <div className="h-10 rounded bg-neutral-700/80 animate-pulse" />
        </div>
      ) : isError ? (
        <p className="text-[10px] text-neutral-500 px-1">Could not load sales data</p>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2 px-1">
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              <ShoppingCart size={14} className="text-neutral-500 shrink-0" />
              Orders
            </span>
            <span className="text-sm font-black text-white tabular-nums">{stats?.totalOrders ?? 0}</span>
          </div>

          <div className="flex items-center justify-between gap-2 px-1">
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              <CheckCircle2 size={14} className="text-emerald-500/80 shrink-0" />
              Paid
            </span>
            <span className="text-sm font-black text-emerald-400 tabular-nums">{stats?.paidOrders ?? 0}</span>
          </div>

          <div className="rounded-lg bg-[#8b1a2a]/20 border border-[#8b1a2a]/30 px-3 py-2.5">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
              <IndianRupee size={14} />
              Total Revenue
            </div>
            <p className="text-lg font-black text-white mt-1 tabular-nums leading-none">
              {formatINR(stats?.totalRevenue ?? 0)}
            </p>
            <p className="text-[9px] text-neutral-500 mt-1">From successful payments</p>
          </div>
        </>
      )}
    </div>
  );
};
