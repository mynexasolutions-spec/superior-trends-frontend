import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search, Heart, ShoppingBag, Menu, X, User,
  Truck, ChevronDown, Home, Compass, ArrowRight, Globe,
  BookOpen, Info, Phone, LogOut, ClipboardList,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useCategories } from '../hooks/useProducts';
import { FREE_SHIPPING_MIN_INR } from '../lib/formatCurrency';
import { useLanguage } from '../context/LanguageContext';
import logo from '../assets/logo.png';

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
  const { language, setLanguage, t } = useLanguage();

  const rootCategories = React.useMemo(() => {
    if (!categories) return [];
    const roots = categories.filter(c => !c.parentId);
    return roots.map(root => ({
      ...root,
      children: root.children && root.children.length > 0
        ? root.children
        : categories.filter(c => c.parentId === root.id)
    }));
  }, [categories]);

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

  // ── lock body scroll while mobile menu is open (works on iOS Safari too)
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const scrollY = window.scrollY;
    const body = document.body;
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.overflow = 'hidden';
    return () => {
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.overflow = '';
      window.scrollTo({ top: scrollY, behavior: 'instant' as ScrollBehavior });
    };
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
    { name: t('common.home'), path: '/' },
    { name: t('common.shop'), path: '/shop' },
    { name: t('common.blogs'), path: '/blogs' },
    { name: t('common.aboutUs'), path: '/about' },
    { name: t('common.contactUs'), path: '/contact' },
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
        <div className={`bg-gradient-to-r from-[#8b1a2a] via-[#a22033] to-[#8b1a2a] text-white py-1.5 px-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 font-extrabold uppercase select-none border-b border-[#d4af37]/20 shadow-sm text-center ${language === 'ar' ? 'text-[11px] sm:text-[13px] tracking-normal' : 'text-[9px] sm:text-[11px] tracking-widest'}`}>
          <Truck size={11} className="shrink-0 opacity-85 text-[#d4af37]" />
          <span>{t('common.freeShipping')}{FREE_SHIPPING_MIN_INR.toLocaleString('en-OM')}</span>
          <span className="opacity-40">·</span>
          <Link
            to="/shop"
            className="underline underline-offset-2 hover:text-[#d4af37] transition-colors"
          >
            {t('common.shopNow')}
          </Link>
        </div>

        {/* Main header */}
        <header className="w-full bg-white/80 backdrop-blur-md border-b border-brand-border/15 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
          <div className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-6">
            <div className="flex items-center justify-between h-16 sm:h-[76px] gap-2">

              {/* ── Logo ── */}
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="flex items-center gap-1 shrink-0 group ml-4 sm:ml-8"
              >
                <img
                  src={logo}
                  alt="Superior Trends"
                  className="h-[40px] sm:h-[48px] w-auto object-contain block transform group-hover:scale-105 transition-transform duration-300"
                />
                <div className="flex flex-col leading-none min-w-0">
                  {language === 'ar' ? (
                    <>
                      <span className="font-serif font-bold text-neutral-900 group-hover:text-[#8b1a2a] uppercase text-base sm:text-lg tracking-wide transition-colors duration-200">
                        سوبريور تريندز
                      </span>
                      <span className="hidden sm:block font-serif font-medium uppercase text-[#d4af37] text-[10.5px] tracking-widest mt-0.5">
                        مجموعة العليشة
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="font-serif font-bold text-neutral-900 group-hover:text-[#8b1a2a] uppercase text-[14px] sm:text-[17px] tracking-[0.2em] transition-colors duration-200">
                        SUPERIOR
                      </span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="h-[1px] w-2.5 bg-[#d4af37] shrink-0" />
                        <span className="font-serif font-bold uppercase text-[#d4af37] text-[9.5px] sm:text-[11px] tracking-[0.25em]">
                          TRENDS
                        </span>
                        <span className="h-[1px] w-2.5 bg-[#d4af37] shrink-0" />
                      </div>
                    </>
                  )}
                </div>
              </Link>

              {/* ── Desktop nav ── */}
              <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
                {navLinks.map((link) => {
                  const active = isActive(link.path);

                  if (link.path === '/shop') {
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
                            flex items-center gap-0.5 font-black uppercase py-3 transition-colors
                            ${language === 'ar' ? 'text-[14px] tracking-normal' : 'text-[11px] tracking-widest'}
                            ${active ? 'text-[#8b1a2a]' : 'text-neutral-600 hover:text-[#8b1a2a]'}
                          `}
                        >
                          {link.name}
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
                                bg-white/95 backdrop-blur-md border border-[#d4af37]/20
                                shadow-[0_25px_60px_rgba(139,26,42,0.08)]
                                rounded-2xl z-50 w-[840px] p-7
                              "
                            >
                              {/* top bridge — fills the gap so mouse doesn't drop focus */}
                              <div className="absolute -top-3 left-0 right-0 h-3" />

                              <div className="grid grid-cols-4 gap-8">
                                <div className="col-span-3 grid grid-cols-3 gap-8">
                                  {rootCategories?.map((cat) => (
                                    <div key={cat.id} className="space-y-3">
                                      <h4 className={`font-black border-b border-[#8b1a2a]/15 pb-2 ${language === 'ar' ? 'text-[12px] tracking-normal' : 'text-[10px] uppercase tracking-[0.2em] text-[#8b1a2a]'}`}>
                                        {cat.name}
                                      </h4>
                                      <div className="flex flex-col gap-2">
                                        {cat.children && cat.children.length > 0 ? (
                                          cat.children.map((child) => (
                                            <Link
                                              key={child.id}
                                              to={`/shop?category=${child.slug}`}
                                              className={`group/link flex items-center gap-1.5 text-neutral-500 hover:text-[#8b1a2a] transition-all font-semibold leading-relaxed ${language === 'ar' ? 'text-[13px] tracking-normal' : 'text-[11px] tracking-wide'}`}
                                            >
                                              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] opacity-0 group-hover/link:opacity-100 transition-opacity duration-200 shrink-0" />
                                              <span className="group-hover/link:translate-x-0.5 transition-transform duration-200">{child.name}</span>
                                            </Link>
                                          ))
                                        ) : (
                                          <Link
                                            to={`/shop?category=${cat.slug}`}
                                            className={`group/link flex items-center gap-1.5 text-neutral-500 hover:text-[#8b1a2a] transition-all font-semibold ${language === 'ar' ? 'text-[13px] tracking-normal' : 'text-[11px] tracking-wide'}`}
                                          >
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] opacity-0 group-hover/link:opacity-100 transition-opacity duration-200 shrink-0" />
                                            <span className="group-hover/link:translate-x-0.5 transition-transform duration-200">{t('common.viewAll')} {cat.name}</span>
                                          </Link>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Curated Promo Card Column */}
                                <div className="col-span-1 bg-gradient-to-br from-[#8b1a2a] to-[#5c101b] rounded-xl p-4.5 flex flex-col justify-between text-white relative overflow-hidden shadow-md group/promo border border-[#d4af37]/15">
                                  <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover/promo:scale-125 transition-transform duration-500" />
                                  <div className="absolute -left-4 -top-4 w-20 h-20 bg-[#d4af37]/10 rounded-full blur-xl" />

                                  <div className="relative z-10">
                                    <span className="text-[8px] font-black uppercase tracking-[0.25em] text-[#d4af37] block mb-1">
                                      {language === 'ar' ? 'تشكيلة جديدة' : 'New Collection'}
                                    </span>
                                    <h5 className="font-display font-black text-[13px] uppercase tracking-wide leading-tight mb-2 text-white">
                                      {language === 'ar' ? 'فخامة مطلقة' : 'Premium Couture'}
                                    </h5>
                                    <p className="text-[10px] text-neutral-200 font-medium leading-relaxed">
                                      {language === 'ar' ? 'اكتشف أرقى خطوط الموضة الملكية المصممة بعناية.' : 'Curated Royal styles crafted for exceptional look.'}
                                    </p>
                                  </div>

                                  <Link
                                    to="/shop"
                                    className="relative z-10 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#d4af37] hover:text-white transition-colors mt-5 self-start group-hover/promo:translate-x-1 transition-transform duration-200"
                                  >
                                    {language === 'ar' ? 'تسوق الآن' : 'Shop Now'} <ArrowRight size={10} />
                                  </Link>
                                </div>
                              </div>

                              <div className="mt-6 pt-4 border-t border-brand-border/20 flex justify-between items-center">
                                <span className={`text-neutral-400 font-extrabold ${language === 'ar' ? 'text-[11px] tracking-normal' : 'text-[9px] uppercase tracking-widest'}`}>
                                  {t('common.superiorTrends')} · {t('common.alAlishaCollection')}
                                </span>
                                <Link
                                  to="/shop"
                                  className={`flex items-center gap-1.5 font-black uppercase text-[#8b1a2a] hover:text-[#d4af37] transition-colors ${language === 'ar' ? 'text-[12px] tracking-normal' : 'text-[10px] tracking-widest'}`}
                                >
                                  {t('common.viewAll')} <ArrowRight size={11} className="rtl:rotate-180" />
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
                        relative font-black uppercase py-3 transition-colors
                        ${language === 'ar' ? 'text-[14px] tracking-normal' : 'text-[11px] tracking-widest'}
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

                {/* Language Switcher */}
                <button
                  type="button"
                  onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                  className={`hidden md:flex items-center gap-1.5 text-neutral-650 hover:text-[#8b1a2a] p-2 transition-colors rounded-xl hover:bg-neutral-50 cursor-pointer font-black uppercase ${language === 'ar' ? 'text-[12px] tracking-normal' : 'text-[10px] tracking-widest'}`}
                  title={language === 'en' ? 'العربية' : 'English'}
                >
                  <Globe size={14} className="text-[#d4af37]" />
                  <span>{language === 'en' ? 'العربية' : 'EN'}</span>
                </button>

                {/* Desktop search */}
                <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative mr-1 group/search">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('common.searchPlaceholder')}
                    className={`
                      bg-neutral-50/80 border border-brand-border/30 rounded-xl
                      pl-4 pr-9 py-2 text-brand-charcoal
                      placeholder-neutral-400
                      focus:outline-none focus:border-[#8b1a2a] focus:bg-white
                      w-44 xl:w-52 transition-all duration-200 focus:shadow-md focus:shadow-[#8b1a2a]/5
                      ${language === 'ar' ? 'text-[13px]' : 'text-[11px]'}
                    `}
                  />
                  <button
                    type="submit"
                    aria-label="Search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-455 hover:text-[#8b1a2a] transition-colors"
                  >
                    <Search size={13} />
                  </button>
                </form>

                {/* User — desktop */}
                {user ? (
                  <div className="hidden md:flex items-center gap-1">
                    <Link
                      to="/orders"
                      className={`font-black uppercase text-neutral-500 hover:text-[#8b1a2a] px-2 py-1.5 transition-colors ${language === 'ar' ? 'text-[12px] tracking-normal' : 'text-[10px] tracking-widest'}`}
                    >
                      {t('common.orders')}
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        className={`
                          font-black uppercase
                          text-[#8b1a2a] hover:bg-[#8b1a2a] hover:text-white
                          px-2.5 py-1.5 border-2 border-[#8b1a2a]/30 rounded-xl
                          transition-all duration-150 shadow-sm
                          ${language === 'ar' ? 'text-[12px] tracking-normal' : 'text-[10px] tracking-widest'}
                        `}
                      >
                        {t('common.admin')}
                      </Link>
                    )}
                    <button
                      onClick={() => logout()}
                      className={`font-black uppercase text-neutral-400 hover:text-red-600 px-2 py-1.5 transition-colors cursor-pointer ${language === 'ar' ? 'text-[12px] tracking-normal' : 'text-[10px] tracking-widest'}`}
                    >
                      {t('common.logout')}
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
          { to: '/', icon: Home, label: t('common.home'), match: (p: string) => p === '/' },
          { to: '/shop', icon: Compass, label: t('common.shop'), match: (p: string) => p.startsWith('/shop') },
          { to: '/wishlist', icon: Heart, label: t('common.wishlist'), match: (p: string) => p === '/wishlist' },
        ].map(({ to, icon: Icon, label, match }) => {
          const active = match(location.pathname);
          const isWishlist = label === t('common.wishlist');
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
              <span className={`font-bold uppercase ${language === 'ar' ? 'text-[11px] tracking-normal' : 'text-[9px] tracking-wider'}`}>{label}</span>
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
          <span className={`font-bold uppercase ${language === 'ar' ? 'text-[11px] tracking-normal' : 'text-[9px] tracking-wider'}`}>{t('common.search')}</span>
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
          <span className={`font-bold uppercase ${language === 'ar' ? 'text-[11px] tracking-normal' : 'text-[9px] tracking-wider'}`}>{t('common.cart')}</span>
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
                placeholder={t('common.typeSearchPlaceholder')}
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
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm md:hidden"
              onClick={closeMobileMenu}
              aria-hidden="true"
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: language === 'ar' ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: language === 'ar' ? '-100%' : '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className={`
                fixed top-0 bottom-0 z-[61]
                w-[min(100%,22rem)] bg-white
                shadow-[-8px_0_40px_rgba(0,0,0,0.15)]
                overflow-y-auto overscroll-contain md:hidden
                ${language === 'ar' ? 'left-0' : 'right-0'}
              `}
            >
              {/* Drawer header — sticky at top */}
              <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-5 py-3 border-b border-neutral-100">
                <div className="flex items-center gap-1">
                  <img
                    src={logo}
                    alt="Superior Trends"
                    className="h-[40px] w-auto object-contain block"
                  />
                  <div className="flex flex-col leading-none min-w-0 text-left">
                    {language === 'ar' ? (
                      <>
                        <span className="font-serif font-bold text-neutral-900 uppercase text-base tracking-wide">
                          سوبريور تريندز
                        </span>
                        <span className="hidden sm:block font-serif font-medium uppercase text-[#d4af37] text-[10.5px] tracking-widest mt-0.5">
                          مجموعة العليشة
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-serif font-bold text-neutral-900 uppercase text-[14px] tracking-[0.2em]">
                          SUPERIOR
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="h-[1px] w-2.5 bg-[#d4af37] shrink-0" />
                          <span className="font-serif font-bold uppercase text-[#d4af37] text-[9.5px] tracking-[0.25em]">
                            TRENDS
                          </span>
                          <span className="h-[1px] w-2.5 bg-[#d4af37] shrink-0" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeMobileMenu}
                  aria-label="Close menu"
                  className="p-1.5 text-neutral-500 hover:text-[#8b1a2a] rounded-full hover:bg-neutral-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Premium User Profile Card Section */}
              <div>
                {user ? (
                  <div className="mx-5 mt-3 p-3 rounded-xl bg-gradient-to-br from-[#8b1a2a] via-[#9c1e30] to-[#5c101b] text-white border border-[#d4af37]/25 relative overflow-hidden shadow-lg shadow-[#8b1a2a]/10">
                    <div className="absolute -right-8 -bottom-8 w-20 h-20 bg-white/5 rounded-full blur-xl" />
                    <div className="relative z-10 flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-white/10 border border-[#d4af37]/30 flex items-center justify-center text-white font-black text-xs shrink-0">
                        {user.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs truncate max-w-[110px]">{user.name}</h4>
                          {user.role === 'ADMIN' && (
                            <span className="text-[7px] font-black uppercase bg-[#d4af37] text-[#2a1a0e] px-1.5 py-0.5 rounded-full tracking-wide shrink-0">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-200/80 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mx-5 mt-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400">
                        <User size={16} />
                      </div>
                      <div>
                        <h4 className="font-black text-[10px] uppercase tracking-wider text-neutral-800 leading-tight">
                          {language === 'ar' ? 'مرحبا بك' : 'Welcome'}
                        </h4>
                        <p className="text-[9px] text-neutral-400 font-semibold">
                          {language === 'ar' ? 'سجل دخولك' : 'Sign in for better experience'}
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/auth"
                      onClick={closeMobileMenu}
                      className="bg-[#8b1a2a] hover:bg-[#6b1420] text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors"
                    >
                      {t('common.signIn')}
                    </Link>
                  </div>
                )}
              </div>

              {/* Drawer search */}
              <div className="px-5 py-2.5 border-b border-neutral-100">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('common.searchPlaceholder')}
                    className="
                      w-full bg-neutral-50 border border-neutral-200 rounded-xl
                      pl-4 pr-10 py-2.5 text-sm text-neutral-800
                      placeholder-neutral-400
                      focus:outline-none focus:border-[#8b1a2a] focus:bg-white
                      transition-all
                    "
                  />
                  <button
                    type="submit"
                    aria-label="Search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#8b1a2a] transition-colors cursor-pointer"
                  >
                    <Search size={14} />
                  </button>
                </form>
              </div>

              {/* Nav links */}
              <nav className="px-5 py-2 space-y-1">
                {navLinks.map((link) => {
                  const active = isActive(link.path);

                  // Map appropriate icons
                  let LinkIcon = Home;
                  if (link.path === '/shop') LinkIcon = Compass;
                  else if (link.path === '/blogs') LinkIcon = BookOpen;
                  else if (link.path === '/about') LinkIcon = Info;
                  else if (link.path === '/contact') LinkIcon = Phone;

                  if (link.path === '/shop') {
                    const shopActive = location.pathname.startsWith('/shop');
                    return (
                      <div key="shop-mobile" className="rounded-xl overflow-hidden border border-neutral-100 bg-neutral-50/50">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShopExpanded((o) => !o);
                          }}
                          className={`
                            w-full flex items-center justify-between px-4 py-2.5
                            font-black uppercase transition-colors
                            ${language === 'ar' ? 'text-[13px] tracking-normal' : 'text-[11px] tracking-wider'}
                            ${shopActive ? 'text-[#8b1a2a]' : 'text-neutral-700'}
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <LinkIcon size={16} className={shopActive ? 'text-[#8b1a2a]' : 'text-neutral-400'} />
                            <span>{link.name}</span>
                          </div>
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
                              className="bg-white border-t border-neutral-100 overflow-hidden"
                            >
                              <div className={`py-3 px-4 space-y-2.5 ${language === 'ar' ? 'border-r-2' : 'border-l-2'} border-[#d4af37]/60`}>
                                <Link
                                  to="/shop"
                                  onClick={closeMobileMenu}
                                  className={`block font-black uppercase text-[#8b1a2a] py-1 ${language === 'ar' ? 'text-[12px] tracking-normal' : 'text-[10px] tracking-widest'}`}
                                >
                                  {t('common.allGarments')}
                                </Link>
                                {rootCategories?.map((cat) => (
                                  <div key={cat.id} className="space-y-1">
                                    <Link
                                      to={`/shop?category=${cat.slug}`}
                                      onClick={closeMobileMenu}
                                      className={`block font-bold uppercase text-neutral-700 py-1 hover:text-[#8b1a2a] transition-colors ${language === 'ar' ? 'text-[12px] tracking-normal' : 'text-[10px] tracking-wider'}`}
                                    >
                                      {cat.name}
                                    </Link>
                                    {cat.children && cat.children.length > 0 && (
                                      <div className={`mt-0.5 space-y-1 ${language === 'ar' ? 'pr-3 border-r border-neutral-100' : 'pl-3 border-l border-neutral-100'}`}>
                                        {cat.children.map((child) => (
                                          <Link
                                            key={child.id}
                                            to={`/shop?category=${child.slug}`}
                                            onClick={closeMobileMenu}
                                            className={`block text-neutral-500 hover:text-[#8b1a2a] py-1 transition-colors ${language === 'ar' ? 'text-[12px]' : 'text-[10px]'}`}
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

                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={closeMobileMenu}
                      className={`
                        flex items-center gap-3 px-4 py-2.5 font-black uppercase rounded-xl transition-all duration-200
                        ${language === 'ar' ? 'text-[13px] tracking-normal' : 'text-[11px] tracking-wider'}
                        ${active
                          ? 'bg-[#8b1a2a]/5 text-[#8b1a2a] font-black'
                          : 'text-neutral-700 hover:bg-neutral-50'
                        }
                      `}
                    >
                      <LinkIcon size={16} className={active ? 'text-[#8b1a2a]' : 'text-neutral-400'} />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer footer */}
              <div className="shrink-0 px-5 py-3 border-t border-neutral-100 space-y-2 bg-[#faf8f5] rounded-b-[2rem]">
                {/* Mobile Language Switcher */}
                <button
                  type="button"
                  onClick={() => { setLanguage(language === 'en' ? 'ar' : 'en'); closeMobileMenu(); }}
                  className={`flex items-center justify-center gap-2 w-full border border-neutral-200 text-neutral-700 font-black uppercase py-2.5 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all cursor-pointer bg-white ${language === 'ar' ? 'text-[12px] tracking-normal' : 'text-[10px] tracking-widest'}`}
                >
                  <Globe size={13} className="text-[#d4af37]" />
                  <span>{language === 'en' ? 'العربية' : 'English'}</span>
                </button>

                {user && (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/orders"
                      onClick={closeMobileMenu}
                      className={`flex items-center justify-center gap-1.5 border border-neutral-200 bg-white font-bold uppercase text-neutral-700 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors ${language === 'ar' ? 'text-[11px] tracking-normal' : 'text-[10px] tracking-wider'}`}
                    >
                      <ClipboardList size={13} className="text-neutral-450" />
                      <span>{t('common.orders')}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => { logout(); closeMobileMenu(); }}
                      className={`flex items-center justify-center gap-1.5 border border-red-200 bg-red-50/60 font-bold uppercase text-red-600 py-2.5 rounded-xl hover:bg-red-50 transition-colors cursor-pointer ${language === 'ar' ? 'text-[11px] tracking-normal' : 'text-[10px] tracking-wider'}`}
                    >
                      <LogOut size={13} />
                      <span>{t('common.logout')}</span>
                    </button>
                  </div>
                )}

                {user && user.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    onClick={closeMobileMenu}
                    className={`
                      block text-center font-black uppercase
                      text-[#8b1a2a] py-2.5
                      border border-[#8b1a2a]/30 bg-white rounded-xl
                      hover:bg-[#8b1a2a] hover:text-white transition-all
                      ${language === 'ar' ? 'text-[11px] tracking-normal' : 'text-[10px] tracking-widest'}
                    `}
                  >
                    {t('common.adminPanel')}
                  </Link>
                )}

                <Link
                  to="/shop"
                  onClick={closeMobileMenu}
                  className={`
                    flex items-center justify-center gap-2
                    w-full bg-[#8b1a2a] text-white
                    font-black uppercase
                    py-3 rounded-xl
                    hover:bg-[#6b1420] active:scale-[0.98]
                    shadow-md shadow-[#8b1a2a]/15
                    transition-all duration-150
                    ${language === 'ar' ? 'text-[12px] tracking-normal' : 'text-[10px] tracking-widest'}
                  `}
                >
                  {t('common.shopNow')} <ArrowRight size={13} className="rtl:rotate-180" />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};