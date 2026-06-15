import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Leaf, Award, Globe, ShieldCheck, TrendingUp, ChevronRight, ChevronLeft } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { PageShell } from '../components/PageShell';
import { useLanguage } from '../context/LanguageContext';

export const About: React.FC = () => {
  const { language, isRtl } = useLanguage();

  const values = [
    {
      icon: Sparkles,
      title: language === 'ar' ? 'جودة منسقة' : 'Curated Quality',
      desc: language === 'ar' ? 'يتم اختيار كل قطعة بعناية من حيث القماش والقصة واللمسات النهائية — للملابس اليومية والمناسبات.' : 'Every piece is selected for fabric, fit, and finish — from everyday wear to festive collections.',
    },
    {
      icon: Heart,
      title: language === 'ar' ? 'مجموعة العليشة' : 'Al Alisha Collection',
      desc: language === 'ar' ? 'تمزج مجموعتنا المميزة بين التصاميم المعاصرة والحرفية التقليدية المذهلة.' : 'Our signature line blends contemporary silhouettes with timeless South Asian craftsmanship.',
    },
    {
      icon: Leaf,
      title: language === 'ar' ? 'مصادر مدروسة' : 'Thoughtful Sourcing',
      desc: language === 'ar' ? 'نحن نتشارك مع صناع موثوقين يشاركوننا التزامنا بالإنتاج الأخلاقي والأسلوب المستدام.' : 'We partner with trusted makers who share our commitment to ethical production and lasting style.',
    },
    {
      icon: Award,
      title: language === 'ar' ? 'خدمة متميزة' : 'Superior Service',
      desc: language === 'ar' ? 'توصيل سريع، دفع آمن، ودعم مخصص لكل طلب.' : 'Pan-India delivery, secure checkout, and dedicated support for every order.',
    },
  ];

  const perks = [
    language === 'ar' ? 'ملابس النساء والرجال والإكسسوارات في وجهة واحدة فاخرة' : 'Women, Men & Accessories under one premium destination',
    language === 'ar' ? 'دفع آمن، تتبع الطلبات ودعم مخصص' : 'Secure checkout, order tracking & dedicated support',
    language === 'ar' ? 'وصل حديثاً ومجموعات حصرية لكل موسم' : 'New arrivals and festive edits every season',
    language === 'ar' ? 'شحن مجاني للطلبات التي تزيد عن ﷼٥٠ في جميع أنحاء سلطنة عمان' : 'Free shipping on orders over ﷼50 across Oman',
  ];

  return (
    <PageShell className="bg-brand-cream text-brand-charcoal font-sans overflow-hidden">

      {/* ── Page Header ─────────────────────────────────── */}
      <PageHeader
        eyebrow={language === 'ar' ? 'قصتنا' : 'Our Story'}
        title={language === 'ar' ? 'عن سوبريور تريندز' : 'About Superior Trends'}
        subtitle={language === 'ar' ? 'تقدم سوبريور تريندز — مجموعة العليشة ملابس تقليدية وغربية فاخرة للنساء والرجال، بالإضافة إلى الإكسسوارات التي تكمل كل إطلالة.' : 'Superior Trends — Al Alisha Collection brings premium ethnic and western wear for women and men, with accessories that complete every look.'}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-16 sm:space-y-28">

        {/* ── Hero row: brand panel + who we are ─────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center text-left rtl:text-right">

          {/* Left: crimson brand card */}
          <div className="lg:col-span-5 relative min-h-[380px] sm:min-h-[460px] lg:min-h-[540px] rounded-3xl overflow-hidden shadow-2xl shadow-[#8b1a2a]/20 border border-[#d4af37]/30 group">
            {/* Elegant luxury gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#8b1a2a] via-[#6d131f] to-[#480a13]" />
            
            {/* Subtle premium gold weave pattern */}
            <svg aria-hidden="true" className="absolute inset-0 w-full h-full opacity-[0.09] pointer-events-none transition-transform duration-700 group-hover:scale-105">
              <defs>
                <pattern id="weave" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M0 12h24M12 0v24" stroke="#d4af37" strokeWidth="0.75" fill="none" />
                  <rect x="10" y="10" width="4" height="4" fill="#d4af37" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#weave)" />
            </svg>

            {/* Glowing background highlights */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/15 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 sm:px-12 py-12 relative z-10">
              <span className="text-[10px] tracking-[0.4em] uppercase text-[#d4af37] font-black mb-6 block drop-shadow-sm">
                {language === 'ar' ? 'سوبريور تريندز' : 'Est. Superior Trends'}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.6rem] font-black uppercase leading-tight text-white max-w-sm tracking-tight">
                {language === 'ar' ? 'أزياء تمنحك الثقة' : 'Fashion That Earns Confidence'}
              </h2>
              <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mt-8 mb-6" />
              <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-[290px] font-medium">
                {language === 'ar' ? 'مجموعات منسقة، أسعار شفافة بالريال العماني، وتجربة تسوق بوتيك مميزة.' : 'Curated collections, transparent pricing in OMR, and a boutique experience at scale.'}
              </p>
            </div>
          </div>

          {/* Right: who we are */}
          <div className="lg:col-span-7 flex flex-col justify-center gap-7">
            <div className="space-y-2.5">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#8b1a2a] font-extrabold block">
                {language === 'ar' ? 'الإرث والرؤية' : 'Heritage & Vision'}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-black uppercase text-brand-charcoal tracking-tight">
                {language === 'ar' ? 'من نحن' : 'Who We Are'}
              </h2>
              <div className="w-16 h-[3px] bg-gradient-to-r from-[#8b1a2a] to-[#d4af37] rounded-full" />
            </div>

            <div className="space-y-5 text-sm sm:text-[15px] text-brand-text-muted leading-relaxed font-medium">
              <p>
                {language === 'ar' ? 'تأسست سوبريور تريندز برؤية تهدف إلى جعل الأزياء الراقية والنوعية في متناول الجميع، حيث نقدم تشكيلة مختارة بعناية — من الملابس التقليدية إلى العصرية والإكسسوارات التي تكمل مظهرك بالكامل.' : 'Founded with a vision to make quality fashion accessible, Superior Trends offers a carefully edited catalog — from kurtas and sarees to denim, dresses, and jewellery. Each season we refresh our collections while keeping the craftsmanship our customers trust.'}
              </p>
              <p>
                {language === 'ar' ? 'سواء كنت تتسوق للراحة اليومية أو للمناسبات الخاصة والاحتفالات، فإننا نركز على الأقمشة المريحة، والقصات المناسبة، والأسعار بالريال العماني التي تناسب ميزانيتك تماماً.' : 'Whether you shop for daily comfort or celebration wear, we focus on fabrics that feel good, fits that flatter, and prices in OMR that respect your budget.'}
              </p>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              {[
                { number: '10K+', label: language === 'ar' ? 'العملاء السعداء' : 'Happy Customers' },
                { number: '50+', label: language === 'ar' ? 'حرفي ماهر' : 'Skilled Artisans' },
                { number: '100%', label: language === 'ar' ? 'نسيج أخلاقي' : 'Ethical Weaves' },
              ].map(({ number, label }) => (
                <div key={label} className="bg-white border border-brand-border/20 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-all duration-300">
                  <p className="font-display text-xl sm:text-2xl font-black text-[#8b1a2a]">{number}</p>
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold text-neutral-400 mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Core Trust Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-brand-border/20">
              {[
                { icon: Globe, label: language === 'ar' ? 'تغطية شاملة' : 'Global Reach' },
                { icon: ShieldCheck, label: language === 'ar' ? 'دفع آمن' : 'Secure Checkout' },
                { icon: TrendingUp, label: language === 'ar' ? 'نمو هادف ومستمر' : 'Growing with Purpose' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="group flex items-center gap-3 text-sm font-extrabold text-brand-charcoal"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#8b1a2a]/6 border border-[#8b1a2a]/10 flex items-center justify-center text-[#8b1a2a] shrink-0 group-hover:bg-[#8b1a2a] group-hover:text-white group-hover:border-[#8b1a2a] transition-all duration-250 shadow-sm">
                    <Icon size={18} />
                  </div>
                  <span className="tracking-wide leading-snug">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Why us + CTA cards ──────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch text-left rtl:text-right">

          {/* Why shop with us */}
          <div className="bg-white border border-brand-border/20 rounded-3xl p-8 sm:p-10 flex flex-col gap-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-[#8b1a2a]">
                {language === 'ar' ? 'لماذا تتسوق معنا' : 'Why Shop With Us'}
              </h2>
              <div className="w-12 h-[2.5px] bg-[#d4af37] mt-3.5 rounded-full" />
            </div>

            <ul className="space-y-4">
              {perks.map((text) => (
                <li key={text} className="flex gap-3 items-start">
                  <span className="mt-[3px] w-[18px] h-[18px] rounded-full bg-[#8b1a2a]/8 border border-[#8b1a2a]/20 flex items-center justify-center shrink-0 shadow-sm">
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path d="M1.5 4.5l2 2 4-4" stroke="#8b1a2a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-[14px] sm:text-[15px] text-brand-charcoal leading-relaxed font-semibold">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA card */}
          <div className="relative bg-[#8b1a2a] border border-[#8b1a2a] rounded-3xl p-8 sm:p-10 flex flex-col justify-between overflow-hidden shadow-lg shadow-[#8b1a2a]/15 group">
            {/* Same weave — visual continuity with brand card above */}
            <svg aria-hidden="true" className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none transition-transform duration-700 group-hover:scale-105">
              <defs>
                <pattern id="weave2" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M0 12h24M12 0v24" stroke="#d4af37" strokeWidth="0.75" fill="none" />
                  <rect x="10" y="10" width="4" height="4" fill="#d4af37" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#weave2)" />
            </svg>

            {/* Soft gold glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#d4af37]/15 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10">
              <p className="text-base sm:text-[17px] text-white/85 leading-relaxed font-semibold max-w-sm">
                {language === 'ar' ? 'اكتشف كتالوج الاستوديو الكامل الخاص بنا — قم بالتصفية حسب الفئة والمقاس واللون للعثور على قطعتك المفضلة التالية.' : 'Explore our full studio catalog — filter by category, size, and colour to find your next favorite high-craftsmanship statement piece.'}
              </p>
            </div>

            <Link
              to="/shop"
              className="relative z-10 mt-10 self-start inline-flex items-center gap-2.5 bg-[#d4af37] text-brand-charcoal px-8 py-4 text-[11px] font-black uppercase tracking-[0.22em] rounded-xl hover:bg-[#ebd056] hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-lg shadow-black/15 cursor-pointer"
            >
              {language === 'ar' ? 'استكشف المتجر' : 'Explore the Shop'}
              {isRtl ? <ChevronLeft size={14} className="shrink-0" /> : <ChevronRight size={14} className="shrink-0" />}
            </Link>
          </div>
        </div>

        {/* ── Pillars ─────────────────────────────────────── */}
        <section className="space-y-10">
          <div className="text-center">
            <span className="text-[10px] tracking-[0.38em] uppercase text-[#8b1a2a] font-black block mb-3">
              {language === 'ar' ? 'أركاننا' : 'Our Pillars'}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black uppercase text-brand-charcoal tracking-tight">
              {language === 'ar' ? 'ما يميزنا' : 'What Sets Us Apart'}
            </h2>
            <div className="w-16 h-[3px] bg-gradient-to-r from-[#8b1a2a] to-[#d4af37] mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6 text-left rtl:text-right">
            {values.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group bg-white border border-brand-border/20 rounded-2xl p-7 flex flex-col gap-5 hover:border-[#8b1a2a]/20 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-[#8b1a2a]/6 border border-[#8b1a2a]/10 flex items-center justify-center text-[#8b1a2a] shrink-0 group-hover:bg-[#8b1a2a] group-hover:text-white group-hover:border-[#8b1a2a] transition-all duration-300 shadow-sm">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="font-display text-[13px] font-black uppercase tracking-wider text-[#1a1208] mb-2">
                    {title}
                  </h3>
                  <p className="text-[13px] sm:text-sm text-brand-text-muted leading-relaxed group-hover:text-brand-charcoal transition-colors duration-300 font-medium">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Blockquote ──────────────────────────────────── */}
        <blockquote className="relative text-center px-6 sm:px-14 md:px-20 py-16 sm:py-20 rounded-3xl bg-white border border-brand-border/25 overflow-hidden shadow-sm">
          {/* Decorative quotes background glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-cream/20 to-transparent pointer-events-none" />
          
          <span
            aria-hidden="true"
            className="absolute top-4 left-1/2 -translate-x-1/2 font-display text-[11rem] leading-none text-[#d4af37]/8 select-none pointer-events-none"
          >
            “
          </span>

          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <p className="text-lg sm:text-xl md:text-2xl text-brand-charcoal font-display font-black leading-snug tracking-tight uppercase">
              {language === 'ar' ? (
                '«نحن لا نبيع الملابس فحسب — بل نبني علامة تجارية يثق بها عملائنا للجودة والاتساق والاهتمام في كل طلب.»'
              ) : (
                '“We are not just selling clothes — we are building a brand customers trust for quality, consistency, and care on every order.”'
              )}
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-8 bg-[#8b1a2a]/25" />
              <footer className="not-italic text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[#8b1a2a] font-black">
                {language === 'ar' ? 'إدارة سوبريور تريندز' : 'Superior Trends Leadership'}
              </footer>
              <div className="h-px w-8 bg-[#8b1a2a]/25" />
            </div>
          </div>
        </blockquote>

      </div>
    </PageShell>
  );
};