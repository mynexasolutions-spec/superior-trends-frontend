import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search, Heart, ShoppingBag, Menu, X, User,
  Truck, ChevronDown, Home, Compass, ArrowRight,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useCategories } from '../hooks/useProducts';
import { FREE_SHIPPING_MIN_INR } from '../lib/formatCurrency';

// ─── tiny helpers ────────────────────────────────────────────────────────────

/** Safe badge count — caps at 99 */
const badgeCount = (n: number) => (n > 99 ? '99+' : n);

/** Shared badge bubble */
const Badge: React.FC<{ count: number; gold?: boolean }> = ({ count, gold }) =>
  count > 0 ? (
    <span
      className={`
        absolute -top-1 -right-1 min-w-[18px] h-[18px] px-0.5
        rounded-full flex items-center justify-center
        text-[9px] font-black leading-none border border-white
        ${gold ? 'bg-[#d4af37] text-[#2a1a0e]' : 'bg-[#8b1a2a] text-white'}
      `}
    >
      {badgeCount(count)}
    </span>
  ) : null;

// ─── component ───────────────────────────────────────────────────────────────

export const Navbar: React.FC = () => {
  const { wishlist, cartCount, setIsCartOpen } = useShop();
  const { user, logout } = useAuthStore();
  const { data: categories } = useCategories();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [shopExpanded, setShopExpanded] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const megaMenuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  // ── close everything on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShopExpanded(false);
    setIsMobileSearchOpen(false);
    setIsMegaMenuOpen(false);
  }, [location.pathname]);

  // ── lock body scroll while mobile menu is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : prev;
    return () => { document.body.style.overflow = prev; };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setShopExpanded(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/shop?search=${encodeURIComponent(q)}`);
    setSearchQuery('');
    setIsMobileSearchOpen(false);
    closeMobileMenu();
  };

  // ── mega-menu mouse helpers (prevents flicker on gap crossing)
  const openMega = () => { if (megaMenuTimeout.current) clearTimeout(megaMenuTimeout.current); setIsMegaMenuOpen(true); };
  const closeMega = () => { megaMenuTimeout.current = setTimeout(() => setIsMegaMenuOpen(false), 120); };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Blogs', path: '/blogs' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const isActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Fixed top wrapper ─────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-40 w-full">

        {/* Announcement bar */}
        <div className="bg-gradient-to-r from-[#8b1a2a] via-[#a22033] to-[#8b1a2a] text-white py-2 px-4 flex items-center justify-center gap-2 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest select-none border-b border-[#d4af37]/20 shadow-sm">
          <Truck size={11} className="shrink-0 hidden sm:block opacity-85 text-[#d4af37]" />
          <span>Free shipping over ﷼{FREE_SHIPPING_MIN_INR.toLocaleString('en-OM')}</span>
          <span className="opacity-40 hidden sm:inline">·</span>
          <Link
            to="/shop"
            className="hidden sm:inline underline underline-offset-2 hover:text-[#d4af37] transition-colors"
          >
            Shop Now
          </Link>
        </div>

        {/* Main header */}
        <header className="w-full bg-white/80 backdrop-blur-md border-b border-brand-border/15 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-[76px] gap-3">

              {/* ── Logo ── */}
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="flex items-center gap-2.5 shrink-0 group"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#8b1a2a] via-[#b5223a] to-[#d4af37] flex items-center justify-center shadow-lg shadow-[#8b1a2a]/15 shrink-0 ring-1 ring-[#8b1a2a]/10 transform group-hover:scale-105 transition-transform duration-300">
                  <span className="font-display text-white font-black text-sm sm:text-[15px] tracking-tight">ST</span>
                </div>
                <div className="flex flex-col leading-none min-w-0">
                  <span className="font-display font-black text-sm sm:text-lg tracking-tight text-brand-charcoal group-hover:text-[#8b1a2a] uppercase truncate transition-colors duration-200">
                    Superior Trends
                  </span>
                  <span className="hidden sm:block text-[9px] font-black uppercase tracking-[0.22em] text-[#d4af37] truncate mt-0.5">
                    Al Alisha Collection
                  </span>
                </div>
              </Link>

              {/* ── Desktop nav ── */}
              <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
                {navLinks.map((link) => {
                  const active = isActive(link.path);

                  if (link.name === 'Shop') {
                    return (
                      <div
                        key="shop"
                        className="relative"
                        onMouseEnter={openMega}
                        onMouseLeave={closeMega}
                      >
                        <Link
                          to="/shop"
                          className={`
                            flex items-center gap-0.5 text-[11px] font-black uppercase tracking-widest
                            py-3 transition-colors
                            ${active ? 'text-[#8b1a2a]' : 'text-neutral-600 hover:text-[#8b1a2a]'}
                          `}
                        >
                          Shop
                          <ChevronDown
                            size={12}
                            className={`transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180 text-[#d4af37]' : ''}`}
                          />
                        </Link>

                        {active && (
                          <motion.div
                            layoutId="desktop-underline"
                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#8b1a2a] rounded-full"
                            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                          />
                        )}

                        {/* Mega menu */}
                        <AnimatePresence>
                          {isMegaMenuOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 8 }}
                              transition={{ duration: 0.18, ease: 'easeOut' }}
                              onMouseEnter={openMega}
                              onMouseLeave={closeMega}
                              className="
                                absolute left-1/2 -translate-x-1/2 top-[calc(100%+8px)]
                                bg-white/95 backdrop-blur-md border border-brand-border/20
                                shadow-[0_20px_50px_rgba(0,0,0,0.1)]
                                rounded-2xl z-50 w-[720px] p-7
                              "
                            >
                              {/* top bridge — fills the gap so mouse doesn't drop focus */}
                              <div className="absolute -top-3 left-0 right-0 h-3" />

                              <div className="grid grid-cols-3 gap-8">
                                {categories?.map((cat) => (
                                  <div key={cat.id} className="space-y-3">
                                    <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#8b1a2a] font-black border-b border-[#8b1a2a]/15 pb-2">
                                      {cat.name}
                                    </h4>
                                    <div className="flex flex-col gap-1.5">
                                      {cat.children && cat.children.length > 0 ? (
                                        cat.children.map((child) => (
                                          <Link
                                            key={child.id}
                                            to={`/shop?category=${child.slug}`}
                                            className="text-[11px] text-neutral-500 hover:text-[#8b1a2a] tracking-wide transition-colors font-semibold leading-relaxed"
                                          >
                                            {child.name}
                                          </Link>
                                        ))
                                      ) : (
                                        <Link
                                          to={`/shop?category=${cat.slug}`}
                                          className="text-[11px] text-neutral-500 hover:text-[#8b1a2a] tracking-wide transition-colors font-semibold"
                                        >
                                          All {cat.name}
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-6 pt-4 border-t border-brand-border/20 flex justify-between items-center">
                                <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-extrabold">
                                  Superior Trends · Al Alisha Collection
                                </span>
                                <Link
                                  to="/shop"
                                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#8b1a2a] hover:text-[#d4af37] transition-colors"
                                >
                                  Explore All <ArrowRight size={11} />
                                </Link>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`
                        relative text-[11px] font-black uppercase tracking-widest
                        py-3 transition-colors
                        ${active ? 'text-[#8b1a2a]' : 'text-neutral-600 hover:text-[#8b1a2a]'}
                      `}
                    >
                      {link.name}
                      {active && (
                        <motion.div
                          layoutId="desktop-underline"
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#8b1a2a] rounded-full"
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* ── Right actions ── */}
              <div className="flex items-center gap-1 shrink-0">

                {/* Desktop search */}
                <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative mr-1 group/search">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products…"
                    className="
                      bg-neutral-50/80 border border-brand-border/30 rounded-xl
                      pl-4 pr-9 py-2 text-[11px] text-brand-charcoal
                      placeholder-neutral-400
                      focus:outline-none focus:border-[#8b1a2a] focus:bg-white
                      w-44 xl:w-52 transition-all duration-200 focus:shadow-md focus:shadow-[#8b1a2a]/5
                    "
                  />
                  <button
                    type="submit"
                    aria-label="Search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-450 hover:text-[#8b1a2a] transition-colors"
                  >
                    <Search size={13} />
                  </button>
                </form>

                {/* User — desktop */}
                {user ? (
                  <div className="hidden md:flex items-center gap-1">
                    <Link
                      to="/orders"
                      className="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-[#8b1a2a] px-2 py-1.5 transition-colors"
                    >
                      Orders
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        className="
                          text-[10px] font-black uppercase tracking-widest
                          text-[#8b1a2a] hover:bg-[#8b1a2a] hover:text-white
                          px-2.5 py-1.5 border-2 border-[#8b1a2a]/30 rounded-xl
                          transition-all duration-150 shadow-sm
                        "
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={() => logout()}
                      className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-red-650 px-2 py-1.5 transition-colors cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    aria-label="Sign in"
                    className="hidden md:flex text-neutral-600 hover:text-[#8b1a2a] p-2 transition-colors rounded-xl hover:bg-neutral-50"
                  >
                    <User size={17} />
                  </Link>
                )}

                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  aria-label="Wishlist"
                  className="relative text-neutral-600 hover:text-[#8b1a2a] p-2 transition-colors rounded-xl hover:bg-neutral-50"
                >
                  <Heart
                    size={17}
                    className={wishlist.length > 0 ? 'fill-[#8b1a2a] text-[#8b1a2a]' : ''}
                  />
                  <Badge count={wishlist.length} />
                </Link>

                {/* Cart */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  aria-label="Open cart"
                  className="relative text-neutral-600 hover:text-[#8b1a2a] p-2 transition-colors rounded-xl hover:bg-neutral-50 cursor-pointer"
                >
                  <ShoppingBag size={17} />
                  <Badge count={cartCount} gold />
                </button>

                {/* Hamburger — mobile only */}
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open menu"
                  className="md:hidden text-[#8b1a2a] p-2 rounded-xl hover:bg-[#8b1a2a]/5 transition-colors ml-0.5"
                >
                  <Menu size={21} />
                </button>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* ── Mobile bottom tab bar ──────────────────────────────────── */}
      <nav
        aria-label="Mobile navigation"
        className="
          md:hidden fixed bottom-0 left-0 right-0 z-40
          bg-white/95 backdrop-blur-md
          border-t border-neutral-100
          shadow-[0_-2px_20px_rgba(0,0,0,0.06)]
          py-2 px-4 flex items-center justify-around
          safe-area-inset-bottom
        "
        style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
      >
        {[
          { to: '/', icon: Home, label: 'Home', match: (p: string) => p === '/' },
          { to: '/shop', icon: Compass, label: 'Shop', match: (p: string) => p.startsWith('/shop') },
          { to: '/wishlist', icon: Heart, label: 'Wishlist', match: (p: string) => p === '/wishlist' },
        ].map(({ to, icon: Icon, label, match }) => {
          const active = match(location.pathname);
          const isWishlist = label === 'Wishlist';
          return (
            <Link
              key={to}
              to={to}
              className={`
                flex flex-col items-center gap-0.5 min-w-[44px]
                transition-colors
                ${active ? 'text-[#8b1a2a]' : 'text-neutral-500'}
              `}
            >
              <div className="relative">
                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={isWishlist && wishlist.length > 0 ? 'fill-[#8b1a2a] text-[#8b1a2a]' : ''}
                />
                {isWishlist && <Badge count={wishlist.length} />}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
            </Link>
          );
        })}

        {/* Search toggle */}
        <button
          onClick={() => setIsMobileSearchOpen((p) => !p)}
          className={`
            flex flex-col items-center gap-0.5 min-w-[44px] transition-colors cursor-pointer
            ${isMobileSearchOpen ? 'text-[#8b1a2a]' : 'text-neutral-500'}
          `}
        >
          <Search size={20} strokeWidth={isMobileSearchOpen ? 2.5 : 1.8} />
          <span className="text-[9px] font-bold uppercase tracking-wider">Search</span>
        </button>

        {/* Cart */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center gap-0.5 min-w-[44px] text-neutral-500 hover:text-[#8b1a2a] transition-colors cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag size={20} strokeWidth={1.8} />
            <Badge count={cartCount} gold />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider">Cart</span>
        </button>
      </nav>

      {/* ── Mobile search overlay ─────────────────────────────────── */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
            className="
              md:hidden fixed z-40
              left-3 right-3
              bg-white border border-neutral-200
              shadow-[0_8px_32px_rgba(0,0,0,0.12)]
              rounded-2xl p-3
            "
            style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)' }}
          >
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="search"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type and search products…"
                className="
                  w-full bg-neutral-50 border border-neutral-200 rounded-full
                  pl-4 pr-12 py-3 text-sm text-neutral-800
                  focus:outline-none focus:border-[#8b1a2a] focus:bg-white
                  transition-all
                "
              />
              <button
                type="submit"
                aria-label="Search"
                className="
                  absolute right-2 top-1/2 -translate-y-1/2
                  bg-[#8b1a2a] text-white p-2 rounded-full
                  hover:bg-[#6b1420] transition-colors cursor-pointer
                "
              >
                <Search size={13} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile drawer ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden"
              onClick={closeMobileMenu}
              aria-hidden="true"
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 340 }}
              className="
                fixed top-0 right-0 bottom-0 z-[61]
                w-[min(100%,22rem)] bg-white
                shadow-[-8px_0_40px_rgba(0,0,0,0.12)]
                flex flex-col md:hidden
              "
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#8b1a2a] to-[#d4af37] flex items-center justify-center">
                    <span className="text-white text-[10px] font-black">ST</span>
                  </div>
                  <span className="font-display font-black text-sm uppercase text-[#8b1a2a] tracking-wide">
                    Menu
                  </span>
                </div>
                <button
                  type="button"
                  onClick={closeMobileMenu}
                  aria-label="Close menu"
                  className="p-1.5 text-neutral-500 hover:text-[#8b1a2a] rounded-full hover:bg-neutral-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer search */}
              <div className="px-5 py-3 border-b border-neutral-50 shrink-0">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products…"
                    className="
                      w-full bg-neutral-50 border border-neutral-200 rounded-full
                      pl-4 pr-10 py-2.5 text-sm text-neutral-800
                      focus:outline-none focus:border-[#8b1a2a] focus:bg-white
                      transition-all
                    "
                  />
                  <button
                    type="submit"
                    aria-label="Search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#8b1a2a] transition-colors cursor-pointer"
                  >
                    <Search size={15} />
                  </button>
                </form>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto overscroll-contain px-5 py-2">
                {navLinks.map((link) => {
                  if (link.name === 'Shop') {
                    const shopActive = location.pathname.startsWith('/shop');
                    return (
                      <div key="shop-mobile" className="border-b border-neutral-50">
                        <button
                          type="button"
                          onClick={() => setShopExpanded((o) => !o)}
                          className={`
                            w-full flex items-center justify-between py-4
                            text-[13px] font-black uppercase tracking-widest
                            ${shopActive ? 'text-[#8b1a2a]' : 'text-neutral-800'}
                          `}
                        >
                          Shop
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${shopExpanded ? 'rotate-180 text-[#d4af37]' : 'text-neutral-400'}`}
                          />
                        </button>

                        <AnimatePresence initial={false}>
                          {shopExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22 }}
                              className="overflow-hidden pb-4"
                            >
                              <div className="pl-4 border-l-2 border-[#d4af37]/50 space-y-3">
                                <Link
                                  to="/shop"
                                  onClick={closeMobileMenu}
                                  className="block text-[11px] font-black uppercase tracking-widest text-[#8b1a2a] py-1"
                                >
                                  All Garments
                                </Link>
                                {categories?.map((cat) => (
                                  <div key={cat.id}>
                                    <Link
                                      to={`/shop?category=${cat.slug}`}
                                      onClick={closeMobileMenu}
                                      className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 py-1 hover:text-[#8b1a2a] transition-colors"
                                    >
                                      {cat.name}
                                    </Link>
                                    {cat.children && cat.children.length > 0 && (
                                      <div className="mt-1 space-y-1 pl-3">
                                        {cat.children.map((child) => (
                                          <Link
                                            key={child.id}
                                            to={`/shop?category=${child.slug}`}
                                            onClick={closeMobileMenu}
                                            className="block text-[11px] text-neutral-500 hover:text-[#8b1a2a] py-0.5 transition-colors"
                                          >
                                            {child.name}
                                          </Link>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={closeMobileMenu}
                      className={`
                        block py-4 text-[13px] font-black uppercase tracking-widest
                        border-b border-neutral-50 transition-colors
                        ${active ? 'text-[#8b1a2a]' : 'text-neutral-800 hover:text-[#8b1a2a]'}
                      `}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer footer */}
              <div className="shrink-0 px-5 py-5 border-t border-neutral-100 space-y-2.5 bg-[#faf8f5]">
                {user ? (
                  <>
                    <Link
                      to="/orders"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-neutral-700 py-2 hover:text-[#8b1a2a] transition-colors"
                    >
                      My Orders
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={closeMobileMenu}
                        className="
                          block text-center text-[11px] font-black uppercase tracking-widest
                          text-[#8b1a2a] py-2.5
                          border border-[#8b1a2a]/40 rounded-xl
                          hover:bg-[#8b1a2a] hover:text-white transition-all
                        "
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => { logout(); closeMobileMenu(); }}
                      className="block w-full text-center text-[11px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 py-2 transition-colors cursor-pointer"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-neutral-700 py-2.5 hover:text-[#8b1a2a] transition-colors"
                  >
                    <User size={15} /> Sign In
                  </Link>
                )}

                <Link
                  to="/shop"
                  onClick={closeMobileMenu}
                  className="
                    flex items-center justify-center gap-2
                    w-full bg-[#8b1a2a] text-white
                    text-[11px] font-black uppercase tracking-widest
                    py-3.5 rounded-xl
                    hover:bg-[#6b1420] active:scale-[0.98]
                    transition-all duration-150
                  "
                >
                  Shop Now <ArrowRight size={13} />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};