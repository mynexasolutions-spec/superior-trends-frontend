import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import logo from '../assets/logo.png';

// ── Social icons ──────────────────────────────────────────────────────────────

const InstagramIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const socials = [
  { label: 'Instagram', href: '#', icon: <InstagramIcon /> },
  { label: 'Facebook',  href: '#', icon: <FacebookIcon /> },
  { label: 'X',         href: '#', icon: <XIcon /> },
];

// ─────────────────────────────────────────────────────────────────────────────

export const Footer: React.FC = () => {
  const [email, setEmail]         = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const currentYear               = new Date().getFullYear();
  const { language, t }           = useLanguage();

  const shopLinks = [
    { label: language === 'ar' ? "ملابس نسائية" : "Women's Wear", to: '/shop?category=women' },
    { label: language === 'ar' ? "ملابس رجالية" : "Men's Wear", to: '/shop?category=men' },
    { label: language === 'ar' ? "إكسسوارات" : "Accessories", to: '/shop?category=accessories' },
    { label: language === 'ar' ? "جميع المجموعات" : "All Collections", to: '/shop' },
    { label: language === 'ar' ? "مجلة الأناقة" : "Style Journal", to: '/blogs' },
  ];

  const careLinks = [
    { label: language === 'ar' ? "الشحن والإرجاع" : "Shipping & Returns", href: '#' },
    { label: language === 'ar' ? "دليل المقاسات" : "Sizing Guide", href: '#' },
    { label: language === 'ar' ? "سياسة الاستدامة" : "Sustainability Policy", href: '#' },
    { label: t('common.aboutUs'), to: '/about' },
    { label: language === 'ar' ? "دعم العملاء" : "Contact Support", to: '/contact' },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <footer className="bg-[#1a0d0f] text-white/50 text-sm">

      {/* ── Top gold accent line ── */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent" />

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-14">

          {/* Brand column — wider */}
          <div className="md:col-span-4 space-y-7 text-left">
            <Link
              to="/"
              className="flex items-center gap-1.5 shrink-0 group"
            >
              <img
                src={logo}
                alt="Superior Trends"
                className="h-[40px] sm:h-[48px] w-auto object-contain block transform group-hover:scale-105 transition-transform duration-300"
              />
              <div className="flex flex-col leading-none min-w-0">
                {language === 'ar' ? (
                  <>
                    <span className="font-serif font-bold text-white group-hover:text-[#d4af37] uppercase text-base sm:text-lg tracking-wide transition-colors duration-200">
                      سوبريور تريندز
                    </span>
                    <span className="hidden sm:block font-serif font-medium uppercase text-[#d4af37] text-[10.5px] tracking-widest mt-0.5">
                      مجموعة العليشة
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-serif font-bold text-white group-hover:text-[#d4af37] uppercase text-[14px] sm:text-[17px] tracking-[0.2em] transition-colors duration-200">
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

            <p className="text-white/35 leading-relaxed text-[13px] max-w-[260px]">
              {t('footer.tagline')}
            </p>

            {/* Socials */}
            <div className="flex items-center gap-3">
              {socials.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="
                    w-8 h-8 rounded-full border border-white/10
                    flex items-center justify-center
                    text-white/40 hover:text-[#d4af37] hover:border-[#d4af37]/50
                    transition-all duration-200 hover:scale-110
                  "
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop column */}
          <div className="md:col-span-2 text-left">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-white mb-5">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-3">
              {shopLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-[13px] text-white/40 hover:text-[#d4af37] transition-colors duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer care column */}
          <div className="md:col-span-2 text-left">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-white mb-5">
              {t('footer.customerCare')}
            </h3>
            <ul className="space-y-3">
              {careLinks.map(({ label, href, to }) => (
                <li key={label}>
                  {to ? (
                    <Link
                      to={to}
                      className="text-[13px] text-white/40 hover:text-[#d4af37] transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  ) : (
                    <a
                      href={href}
                      className="text-[13px] text-white/40 hover:text-[#d4af37] transition-colors duration-150"
                    >
                      {label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter column */}
          <div className="md:col-span-4 text-left">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-white mb-5">
              {t('footer.newsletter')}
            </h3>
            <p className="text-[13px] text-white/35 leading-relaxed mb-6 max-w-[240px]">
              {t('footer.newsletterDesc')}
            </p>

            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.newsletterPlaceholder')}
                  required
                  className="
                    w-full bg-white/5 border border-white/10
                    rounded-xl px-4 py-3 pr-12
                    text-[13px] text-white placeholder-white/25
                    focus:outline-none focus:border-[#d4af37]/50 focus:bg-white/8
                    transition-all duration-200
                  "
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="
                    absolute right-2 top-1/2 -translate-y-1/2
                    w-8 h-8 rounded-lg
                    bg-[#8b1a2a] hover:bg-[#d4af37]
                    flex items-center justify-center
                    text-white transition-all duration-200
                    hover:scale-105 active:scale-95 cursor-pointer
                  "
                >
                  {subscribed ? <Check size={13} strokeWidth={2.5} /> : <ArrowRight size={13} className="rtl:rotate-180" />}
                </button>
              </div>

              {subscribed && (
                <p className="text-[#d4af37] text-[11px] font-semibold tracking-wider flex items-center gap-1.5">
                  <Check size={11} /> {t('footer.subscribed')}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent mb-8" />

        {/* ── Legal bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/20">
          <p className="tracking-wider">
            &copy; {currentYear} {t('common.superiorTrends')} · {t('common.alAlishaCollection')}. {t('footer.allRightsReserved')}
          </p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-[#d4af37] transition-colors duration-150">{t('footer.privacyPolicy')}</a>
            <span className="opacity-30">·</span>
            <a href="#" className="hover:text-[#d4af37] transition-colors duration-150">{t('footer.termsOfService')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};