import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  Package,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  Loader2,
  FileText,
  Mail,
  Settings,
  Ticket,
  Star,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { AdminSidebarSales } from './AdminSidebarSales';
 
export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const { isAdmin, authReady } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
 
  useEffect(() => {
    if (authReady && !isAdmin) {
      const redirect = encodeURIComponent(location.pathname);
      navigate(`/auth?mode=login&redirect=${redirect}`, { replace: true });
    }
  }, [authReady, isAdmin, location.pathname, navigate]);
 
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
 
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/admin/products', label: 'Products', icon: <ShoppingBag size={18} /> },
    { path: '/admin/categories', label: 'Categories', icon: <FolderTree size={18} /> },
    { path: '/admin/sections', label: 'Homepage Sections', icon: <LayoutDashboard size={18} /> },
    { path: '/admin/orders', label: 'Orders', icon: <Package size={18} /> },
    { path: '/admin/reviews', label: 'Reviews', icon: <Star size={18} /> },
    { path: '/admin/blogs', label: 'Blog', icon: <FileText size={18} /> },
    { path: '/admin/blogs/categories', label: 'Blog Categories', icon: <FolderTree size={18} /> },
    { path: '/admin/coupons', label: 'Coupons', icon: <Ticket size={18} /> },
    { path: '/admin/settings', label: 'Settings', icon: <Settings size={18} /> },
    { path: '/admin/contact', label: 'Contact', icon: <Mail size={18} /> },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  const SidebarContent = () => (
    <>
      <div className="h-14 sm:h-16 flex items-center px-4 sm:px-6 border-b border-neutral-800 gap-2 shrink-0">
        <div className="size-8 rounded bg-[#8b1a2a] flex items-center justify-center text-white font-serif font-black text-lg">
          S
        </div>
        <div className="min-w-0">
          <h1 className="font-serif font-bold text-sm tracking-widest text-white uppercase truncate">
            Superior Admin
          </h1>
          <p className="text-[10px] text-neutral-400">Control Panel</p>
        </div>
        <button
          type="button"
          onClick={closeSidebar}
          className="lg:hidden ml-auto p-2 text-neutral-400 hover:text-white"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav data-lenis-prevent className="flex-1 min-h-0 px-3 sm:px-4 py-4 sm:py-6 space-y-1 overflow-y-auto overscroll-contain">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                isActive
                  ? 'bg-[#8b1a2a] text-white'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <AdminSidebarSales />

      <div className="p-3 sm:p-4 border-t border-neutral-800 space-y-2 shrink-0">
        <div className="flex items-center gap-3 px-2 sm:px-4 py-2">
          <div className="size-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
            {user?.name?.slice(0, 2) || 'AD'}
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
            <p className="text-[10px] text-neutral-400 truncate">{user?.email || 'admin@superiortrends.com'}</p>
          </div>
        </div>

        <Link
          to="/"
          onClick={closeSidebar}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Store
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-neutral-400 hover:bg-neutral-800 hover:text-red-400 transition-colors text-left"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </>
  );

  if (!authReady || !isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center gap-3 font-display">
        <Loader2 className="animate-spin text-[#8b1a2a]" size={32} />
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          {authReady ? 'Redirecting to sign in…' : 'Restoring session…'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-neutral-50 text-neutral-800 overflow-x-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[min(100%,16rem)] sm:w-64 bg-neutral-900 text-neutral-200 flex flex-col min-h-0 border-r border-neutral-800 shrink-0 transform transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen min-w-0 w-full">
        <header className="h-14 sm:h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 text-neutral-600 hover:text-[#8b1a2a] shrink-0"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-neutral-500 truncate">
              {navItems.find((item) => item.path === location.pathname)?.label || 'Admin Panel'}
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 hidden sm:inline">
              Backend Live
            </span>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-x-hidden flex justify-center">
          <div className="w-full max-w-7xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
