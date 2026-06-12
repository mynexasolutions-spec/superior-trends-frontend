import React from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  FolderTree,
  LayoutGrid,
  Package,
  Banknote,
  TrendingUp,
  Plus,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { useAdminStats } from "../../hooks/useAdminStats";
import { StatCard } from "../../components/admin/StatCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { formatINR } from "../../lib/formatCurrency";

export const AdminDashboard: React.FC = () => {
  const { data, isLoading, isError } = useAdminStats();
  const stats = data?.stats;
  const recentProducts = data?.recentProducts ?? [];

  const quickActions = [
    {
      title: "Add New Product",
      desc: "Upload images, set prices, assign category",
      to: "/admin/products",
      cta: "Open Products",
      icon: <ShoppingBag size={16} strokeWidth={2} />,
    },
    {
      title: "Manage Categories",
      desc: "Women, Men, Accessories & subcategories",
      to: "/admin/categories",
      cta: "Open Categories",
      icon: <FolderTree size={16} strokeWidth={2} />,
    },
    {
      title: "Homepage Sections",
      desc: "Carousel, collections, split banners",
      to: "/admin/sections",
      cta: "Edit Sections",
      icon: <LayoutGrid size={16} strokeWidth={2} />,
    },
    {
      title: "View Storefront",
      desc: "See how customers view your shop",
      to: "/shop",
      cta: "Go to Shop",
      icon: <ArrowRight size={16} strokeWidth={2} />,
    },
  ];

  const statSkeleton = (
    <div className="h-[108px] rounded-2xl border border-[#e8e2db] bg-[#f0ece6]/60 animate-pulse" />
  );

  return (
    <div className="w-full space-y-8 font-display bg-[#faf9f7] min-h-screen px-0">

      {/* ── Masthead ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 pb-6 border-b border-[#e8e2db]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b1a2a] mb-1">
            Admin Console
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1a1a1a] uppercase tracking-tight leading-none">
            Dashboard
          </h1>
        </div>
        <p className="text-xs text-[#9a8f87] font-medium tabular-nums">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {isError && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          <AlertTriangle size={14} />
          Could not load live stats — start the backend and refresh.
        </div>
      )}

      {/* ── Row 1: primary stats ── */}
      <section className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a8f87]">
          Catalog Overview
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 w-full">
          {isLoading ? (
            <>{statSkeleton}{statSkeleton}{statSkeleton}{statSkeleton}</>
          ) : (
            <>
              <StatCard
                label="Total Products"
                value={stats?.totalProducts ?? 0}
                icon={<ShoppingBag size={18} strokeWidth={2.5} />}
                link="/admin/products"
                linkLabel="Manage products"
              />
              <StatCard
                label="Active Products"
                value={stats?.activeProducts ?? 0}
                icon={<Package size={18} strokeWidth={2.5} />}
                iconClassName="bg-emerald-500/10 text-emerald-600 border-emerald-500/10"
                trend={
                  stats?.inactiveProducts
                    ? `${stats.inactiveProducts} hidden from shop`
                    : "All live on storefront"
                }
              />
              <StatCard
                label="Categories"
                value={stats?.totalCategories ?? 0}
                icon={<FolderTree size={18} strokeWidth={2.5} />}
                iconClassName="bg-amber-500/10 text-amber-600 border-amber-500/10"
                link="/admin/categories"
                linkLabel="Manage categories"
              />
              <StatCard
                label="Homepage Sections"
                value={stats?.homepageSections ?? 0}
                icon={<LayoutGrid size={18} strokeWidth={2.5} />}
                iconClassName="bg-violet-500/10 text-violet-600 border-violet-500/10"
                link="/admin/sections"
                linkLabel="Edit homepage"
              />
            </>
          )}
        </div>
      </section>

      {/* ── Row 2: business stats ── */}
      <section className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a8f87]">
          Inventory & Revenue
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
          {isLoading ? (
            <>{statSkeleton}{statSkeleton}{statSkeleton}</>
          ) : (
            <>
              <StatCard
                label="Total Stock Units"
                value={(stats?.totalStock ?? 0).toLocaleString("en-IN")}
                icon={<TrendingUp size={18} strokeWidth={2.5} />}
                iconClassName="bg-blue-500/10 text-blue-600 border-blue-500/10"
              />
              <StatCard
                label="Total Revenue"
                value={formatINR(stats?.totalRevenue ?? 0)}
                icon={<Banknote size={18} strokeWidth={2.5} />}
                trend={`${stats?.paidOrders ?? 0} paid orders`}
              />
              <StatCard
                label="Low Stock (≤ 5 units)"
                value={stats?.lowStockCount ?? 0}
                icon={<AlertTriangle size={18} strokeWidth={2.5} />}
                iconClassName="bg-orange-500/10 text-orange-600 border-orange-500/10"
                link="/admin/products"
                linkLabel="Review inventory"
              />
            </>
          )}
        </div>
      </section>

      {/* ── Bottom two-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 w-full">

        {/* Quick actions — 2 cols */}
        <div className="lg:col-span-2 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a8f87]">
            Quick Actions
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 h-fit">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.to}
                className="group flex items-center justify-between gap-3 p-4 rounded-2xl border border-[#e8e2db] bg-white hover:border-[#8b1a2a]/40 hover:shadow-[0_2px_12px_rgba(139,26,42,0.08)] transition-all duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-8 shrink-0 rounded-xl bg-[#8b1a2a]/8 text-[#8b1a2a] flex items-center justify-center border border-[#8b1a2a]/12">
                    {action.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-wider text-[#1a1a1a] truncate">
                      {action.title}
                    </p>
                    <p className="text-[10px] text-[#9a8f87] font-medium mt-0.5 truncate">
                      {action.desc}
                    </p>
                  </div>
                </div>
                <ArrowRight
                  size={14}
                  className="shrink-0 text-[#8b1a2a] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent products — 3 cols */}
        <div className="lg:col-span-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a8f87]">
              Recent Products
            </p>
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#8b1a2a] hover:underline"
            >
              View all <ArrowRight size={10} />
            </Link>
          </div>

          <div className="rounded-2xl border border-[#e8e2db] bg-white overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#e8e2db] bg-[#f0ece6]/50">
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9a8f87]">
                    Product
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9a8f87] hidden sm:table-cell">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9a8f87] text-right">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece6]">
                {recentProducts.map(
                  (p: {
                    id: string;
                    name: string;
                    sku?: string;
                    salePrice: number;
                  }) => (
                    <tr
                      key={p.id}
                      className="hover:bg-[#faf9f7] transition-colors duration-100"
                    >
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-semibold text-[#1a1a1a] line-clamp-1">
                          {p.name}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className="text-[11px] font-mono text-[#9a8f87] bg-[#f0ece6] px-2 py-0.5 rounded-md">
                          {p.sku || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-xs font-black text-[#8b1a2a]">
                          {formatINR(Number(p.salePrice))}
                        </span>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>

            {!isLoading && recentProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <div className="size-10 rounded-full bg-[#f0ece6] flex items-center justify-center mb-3">
                  <ShoppingBag size={18} className="text-[#9a8f87]" />
                </div>
                <p className="text-sm font-semibold text-[#1a1a1a]">
                  No products yet
                </p>
                <p className="text-xs text-[#9a8f87] mt-1">
                  Add your first product to see it here.
                </p>
                <Link
                  to="/admin/products"
                  className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#8b1a2a] hover:underline"
                >
                  <Plus size={11} /> Add Product
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};