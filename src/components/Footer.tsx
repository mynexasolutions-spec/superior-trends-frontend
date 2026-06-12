import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

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

// ── Link columns ──────────────────────────────────────────────────────────────

const shopLinks = [
  { label: "Women's Wear",    to: '/shop?category=women' },
  { label: "Men's Wear",      to: '/shop?category=men' },
  { label: 'Accessories',     to: '/shop?category=accessories' },
  { label: 'All Collections', to: '/shop' },
  { label: 'Style Journal',   to: '/blogs' },
];

const careLinks = [
  { label: 'Shipping & Returns',   href: '#' },
  { label: 'Sizing Guide',         href: '#' },
  { label: 'Sustainability Policy', href: '#' },
  { label: 'About Us',             to: '/about' },
  { label: 'Contact Support',      to: '/contact' },
];

// ─────────────────────────────────────────────────────────────────────────────

export const Footer: React.FC = () => {
  const [email, setEmail]         = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const currentYear               = new Date().getFullYear();

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
          <div className="md:col-span-4 space-y-7">
            <Link to="/" className="inline-block group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8b1a2a] to-[#d4af37] flex items-center justify-center shadow-lg shrink-0">
                  <span className="text-white font-black text-sm tracking-tight">ST</span>
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-display font-black text-white text-base uppercase tracking-[0.18em] group-hover:text-[#d4af37] transition-colors duration-200">
                    Superior Trends
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#d4af37]/70 mt-0.5">
                    Al Alisha Collection
                  </span>
                </div>
              </div>
            </Link>

            <p className="text-white/35 leading-relaxed text-[13px] max-w-[260px]">
              Meticulously crafted wardrobe essentials — premium, sustainable textiles curated to withstand the test of time.
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
          <div className="md:col-span-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-white mb-5">
              Shop
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
          <div className="md:col-span-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-white mb-5">
              Support
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
          <div className="md:col-span-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-white mb-5">
              Newsletter
            </h3>
            <p className="text-[13px] text-white/35 leading-relaxed mb-6 max-w-[240px]">
              Early collection access, editorial updates, and members-only offers — direct to your inbox.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
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
                  {subscribed ? <Check size={13} strokeWidth={2.5} /> : <ArrowRight size={13} />}
                </button>
              </div>

              {subscribed && (
                <p className="text-[#d4af37] text-[11px] font-semibold tracking-wider flex items-center gap-1.5">
                  <Check size={11} /> Added to our exclusive list.
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
            &copy; {currentYear} Superior Trends · Al Alisha Collection. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-[#d4af37] transition-colors duration-150">Privacy Policy</a>
            <span className="opacity-30">·</span>
            <a href="#" className="hover:text-[#d4af37] transition-colors duration-150">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};