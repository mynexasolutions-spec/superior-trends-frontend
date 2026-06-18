import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Star,
  Heart,
  Landmark,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Truck,
  RefreshCcw,
  Lock,
  Diamond,
} from "lucide-react";
import {
  motion,
  useInView,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { ImagePlaceholder } from "../components/ImagePlaceholder";
import { useShop } from "../context/ShopContext";
import { useLanguage } from "../context/LanguageContext";
import { translateDynamic } from "../locales/dynamicTranslations";
import {
  useSections,
  mapDbProduct,
  type HomepageSection,
} from "../hooks/useProducts";
import { useBanners } from "../hooks/useBanners";
import {
  HomeSectionSkeleton,
  HomeSplitSkeleton,
} from "../components/ui/skeleton";
import type { Product } from "../data/products";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { CenteredScrollRow } from "../components/CenteredScrollRow";
import { CustomerReviewsCarousel } from "../components/product/ProductReviews";

/* ─── Reusable animation helpers ──────────────────────────── */
const EASE = [0.22, 1, 0.36, 1] as const;

/* ─── Animated Counter ────────────────────────────────────── */
const Counter: React.FC<{ value: string }> = ({ value }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  // Extract digits and decimal point
  const numString = value.replace(/[^\d.]/g, "");
  const target = parseFloat(numString) || 0;
  const isDecimal = value.includes(".");
  const hasPlus = value.includes("+");
  const isRating = value.includes("/");

  useEffect(() => {
    if (!inView) return;
    let startTimestamp: number | null = null;
    const duration = 2000; // 2 seconds

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentCount = progress * target;
      setCount(currentCount);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [inView, target]);

  const displayValue = () => {
    if (isRating) {
      return `${count.toFixed(1)} / 5`;
    }
    const suffix = hasPlus ? "+" : "";
    if (isDecimal) {
      return `${count.toFixed(1)}${suffix}`;
    }
    return `${Math.floor(count).toLocaleString()}${suffix}`;
  };

  return <span ref={ref}>{displayValue()}</span>;
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const stagger = (delay = 0) => ({
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE, delay } },
});

/** Wrapper that triggers animation when the section scrolls into view */
function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={fadeUp}
    >
      {children}
    </motion.section>
  );
}

const getCategoryLabel = (category: string) =>
  category === "women"
    ? "Ethnic Wear"
    : category === "men"
      ? "Men's Wear"
      : "Accessories";

/* ─── Carousel / grid product card (reference layout) ──────── */
function CarouselProductCard({
  product,
  delay = 0,
  variant = "carousel",
}: {
  product: Product;
  delay?: number;
  variant?: "carousel" | "grid";
}) {
  const { wishlist, toggleWishlist, addToCart } = useShop();
  const { language } = useLanguage();
  const isWishlisted = wishlist.includes(product.id);
  const categoryLabel = translateDynamic(getCategoryLabel(product.category), language);
  const subCategory = product.name.split(" ").slice(0, 2).join(" ");
  const priceOMR = Number(product.price).toLocaleString("en-OM");
  const mrpOMR = Number(
    product.mrp || Math.round(product.price * 1.2),
  ).toLocaleString("en-OM");

  const isCarousel = variant === "carousel";

  return (
    <motion.div
      variants={stagger(delay)}
      className={
        isCarousel
          ? "w-[calc((100vw-32px-20px)/2)] sm:w-[calc((100vw-48px-48px)/3)] lg:w-[calc((100vw-140px)/4)] shrink-0 snap-start flex flex-col rounded-2xl bg-white border border-brand-border/25 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
          : "w-full flex flex-col rounded-2xl bg-white border border-brand-border/25 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
      }
    >
      <div className="relative overflow-hidden bg-brand-cream">
        <Link to={`/product/${product.id}`} className="block">
          <ImagePlaceholder
            aspectRatio="aspect-[3/4.1]"
            src={product.images?.[0]}
            alt={product.name}
            label={product.name}
            subLabel={categoryLabel}
            className="transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {product.isNew ? (
          <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-[#8b1a2a] via-[#a82436] to-[#8b1a2a] text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-md tracking-widest shadow border border-white/10">
            {language === 'ar' ? 'جديد' : 'New'}
          </span>
        ) : product.isBestSeller ? (
          <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-[#d4af37] via-[#f3d06c] to-[#d4af37] text-neutral-950 text-[9px] font-black uppercase px-2.5 py-1 rounded-md tracking-widest shadow border border-white/10">
            {language === 'ar' ? 'فاخر' : 'Premium'}
          </span>
        ) : null}

        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          className="absolute top-3 right-3 z-10 rounded-full bg-white border border-gray-100 p-2 shadow-sm hover:scale-110 transition-transform cursor-pointer"
          aria-label={language === 'ar' ? 'إضافة إلى المفضلة' : 'Add to wishlist'}
        >
          <Heart
            className={`h-4 w-4 ${isWishlisted ? "fill-[#8b1a2a] stroke-[#8b1a2a]" : "stroke-brand-charcoal"}`}
          />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-2.5 flex-1 text-left rtl:text-right">
        <span className="text-[10.5px] sm:text-xs font-bold uppercase tracking-[0.15em] text-brand-text-muted leading-snug">
          {categoryLabel} / {subCategory}
        </span>
        <h4 className="font-display text-[14px] sm:text-[17px] font-black text-brand-charcoal line-clamp-2 leading-snug min-h-[2.5rem] sm:min-h-[3rem]">
          <Link
            to={`/product/${product.id}`}
            className="hover:text-[#8b1a2a] transition-colors"
          >
            {product.name}
          </Link>
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-[14.5px] sm:text-base font-black text-[#8b1a2a]">
            OMR {priceOMR}
          </span>
          <span className="text-[11px] sm:text-xs text-brand-text-muted line-through">
            OMR {mrpOMR}
          </span>
        </div>
        <button
          type="button"
          onClick={() =>
            addToCart(
              product,
              1,
              product.sizes[0] || "OS",
              product.colors[0] || { name: "Default", hex: "#000000" },
            )
          }
          className="mt-auto w-full border border-[#8b1a2a] text-[#8b1a2a] hover:bg-[#8b1a2a] hover:text-white text-[10.5px] sm:text-xs font-bold py-2 sm:py-2.5 rounded-lg tracking-widest uppercase transition-all duration-300 bg-white cursor-pointer"
        >
          {language === 'ar' ? 'أضف إلى السلة' : 'Add to Cart'}
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Section header with chevrons (reference style) ───────── */
function CarouselHeader({
  title,
  onLeft,
  onRight,
}: {
  title: string;
  onLeft?: () => void;
  onRight?: () => void;
}) {
  return (
    <div className="mb-10">

      {/* ── Full-width rule with gold center dot ── */}
      <div className="flex items-center gap-3 mb-7">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-neutral-200" />
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-[#d4af37]/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
          <div className="w-1 h-1 rounded-full bg-[#d4af37]/40" />
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-neutral-200" />
      </div>

      {/* ── Main row ── */}
      <div className="flex items-center justify-between gap-4">

        {/* Left nav */}
        <button
          type="button"
          onClick={onLeft}
          aria-label="Scroll left"
          disabled={!onLeft}
          className="
            shrink-0 w-10 h-10 rounded-full
            border border-neutral-200 bg-white
            flex items-center justify-center text-neutral-400
            hover:border-[#8b1a2a] hover:text-white hover:bg-[#8b1a2a]
            disabled:opacity-0 disabled:pointer-events-none
            active:scale-95 transition-all duration-200 shadow-sm
          "
        >
          <ChevronLeft size={16} strokeWidth={2} className="rtl:rotate-180" />
        </button>

        {/* Center */}
        <div className="flex flex-col items-center gap-2.5 text-center min-w-0">
          <span className="text-[10px] font-black uppercase tracking-[0.35em] text-[#d4af37]">
            Superior Trends
          </span>
          <h2 className="font-display font-black text-[1.5rem] xs:text-[1.8rem] sm:text-4xl md:text-5xl uppercase tracking-tight leading-tight text-[#1a0d0f]">
            {title.split(' ').map((word, i) => (
              <span key={i}>
                {i === 0
                  ? <span className="text-[#8b1a2a]">{word}</span>
                  : <span> {word}</span>
                }
              </span>
            ))}
          </h2>
          <svg className="w-24 sm:w-32" viewBox="0 0 80 6" fill="none">
            <path
              d="M2 4 C20 1, 60 1, 78 4"
              stroke="#d4af37"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>
        </div>

        {/* Right nav */}
        <button
          type="button"
          onClick={onRight}
          aria-label="Scroll right"
          disabled={!onRight}
          className="
            shrink-0 w-10 h-10 rounded-full
            border border-neutral-200 bg-white
            flex items-center justify-center text-neutral-400
            hover:border-[#8b1a2a] hover:text-white hover:bg-[#8b1a2a]
            disabled:opacity-0 disabled:pointer-events-none
            active:scale-95 transition-all duration-200 shadow-sm
          "
        >
          <ChevronRight size={16} strokeWidth={2} className="rtl:rotate-180" />
        </button>

      </div>
    </div>
  );
}

const normalizeSectionType = (type?: string) => {
  if (!type || type === "GRID") return "CAROUSEL";
  if (["CAROUSEL", "COLLECTIONS", "SPLIT", "DEPARTMENTS"].includes(type))
    return type;
  return "CAROUSEL";
};

/** Type 2 — Our Collections style: small horizontal cards */
function SectionCollections({ section }: { section: HomepageSection }) {
  const { language } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) =>
    scrollRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  const products = (section.products ?? []).map((p) => mapDbProduct(p));
  const linkUrl = section.linkUrl || `/shop?section=${section.slug}`;

  return (
    <Section className="px-4 sm:px-6 lg:px-8 mb-16">
      <CarouselHeader title={translateDynamic(section.title, language)} onLeft={() => scroll(-1)} onRight={() => scroll(1)} />
      <CenteredScrollRow onScrollRef={(el) => { (scrollRef as any).current = el; }} gapClass="gap-4">
        {products.map((product: Product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="relative flex flex-col w-[calc((100vw-32px-16px)/2)] sm:w-[calc((100vw-48px-48px)/4)] lg:w-[calc((100vw-165px)/7)] shrink-0 snap-start rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 group border border-[#e8e4dd] hover:border-[#d4af37]/40"
          >
            {/* Image with hover zoom + dark overlay */}
            <div className="relative overflow-hidden">
              <ImagePlaceholder
                aspectRatio="aspect-[3/4.1]"
                src={product.images?.[0]}
                alt={product.name}
                label={product.name}
                subLabel={translateDynamic(getCategoryLabel(product.category), language)}
                className="transition-transform duration-500 group-hover:scale-[1.07]"
              />
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Hover: Quick view pill */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/95 text-[#8b1a2a] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow-lg">
                {language === 'ar' ? 'عرض سريع' : 'View Product'}
              </div>
            </div>

            {/* Card footer */}
            <div className="px-3 pt-2.5 pb-3 text-center flex flex-col gap-1">
              <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-[#d4af37]">
                {translateDynamic(getCategoryLabel(product.category), language)}
              </span>
              <h4 className="font-display font-bold text-[13px] md:text-[14px] text-brand-charcoal group-hover:text-[#8b1a2a] leading-snug transition-colors duration-200">
                {product.name}
              </h4>
            </div>

            {/* Bottom gold accent bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
        ))}
      </CenteredScrollRow>
      <div className="flex justify-center mt-8 px-4">
        <Link to={linkUrl} className="px-10 py-3 rounded-full bg-[#8b1a2a] text-white text-[11px] font-black uppercase tracking-[0.25em] hover:bg-[#d4af37] hover:text-[#1a0d0f] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-[#d4af37]/20">
          {language === 'ar' ? 'عرض الكل' : 'View All'}
        </Link>
      </div>
    </Section>
  );
}

/** Desktop — horizontal image + text card (original layout) */
function SplitPromoBox({
  imageLeft,
  imageSrc,
  subtitle,
  title,
  titleAccent,       // NEW: second line rendered in gold
  description,
  buttonText,
  linkUrl,
  backgroundColor,
  watermark,         // NEW: large bg watermark word e.g. "ARRIVALS"
  delay = 0,
}: {
  imageLeft: boolean;
  imageSrc?: string;
  subtitle?: string;
  title: string;
  titleAccent?: string;
  description?: string;
  buttonText?: string;
  linkUrl?: string;
  backgroundColor: string;
  watermark?: string;
  delay?: number;
}) {
  const navigate = useNavigate();

  return (
    <motion.div
      className={`
        group relative flex flex-col overflow-hidden rounded-[24px] cursor-pointer
        min-h-[390px] md:min-h-[460px]
        shadow-[0_2px_0_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.08)]
        hover:shadow-[0_2px_0_rgba(0,0,0,0.04),0_20px_52px_rgba(0,0,0,0.14)]
        hover:-translate-y-1
        transition-all duration-300 ease-out
        ${imageLeft ? "md:flex-row" : "md:flex-row-reverse"}
      `}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, ease: EASE, delay }}
      onClick={() => navigate(linkUrl || "/shop")}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(linkUrl || "/shop")}
    >
      {/* ── Image pane ── */}
      <div className="w-full md:w-1/2 min-h-[290px] md:min-h-full relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-black/10 z-[1] group-hover:bg-black/05 transition-colors duration-300" />
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <ImagePlaceholder
            aspectRatio="h-full min-h-[290px] md:min-h-[470px]"
            src={imageSrc}
            alt={title}
            clean
          />
        )}
      </div>

      {/* ── Content pane ── */}
      <div
        className="w-full md:w-1/2 flex flex-col justify-center items-start p-9 lg:p-11 relative overflow-hidden"
        style={{ backgroundColor }}
      >
        {/* Ambient gold glow */}
        <div className="absolute top-0 right-0 w-56 h-56 pointer-events-none bg-[radial-gradient(circle,rgba(212,175,55,0.12)_0%,transparent_70%)]" />

        {/* Gold top-center hairline */}
        <div className="absolute top-0 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />

        {/* Watermark */}
        {watermark && (
          <span className="absolute bottom-[-12px] right-[-4px] text-[72px] font-black uppercase tracking-[0.05em] text-white/[0.055] pointer-events-none select-none leading-none whitespace-nowrap">
            {watermark}
          </span>
        )}

        {/* Subtitle with leading rule */}
        {subtitle && (
          <div className="flex items-center gap-2 mb-3">
            <span className="block w-5 h-[1.5px] rounded-full bg-[#D4AF37]" />
            <span className="text-[9px] md:text-[9.5px] lg:text-[10px] font-black uppercase tracking-[0.25em] text-[#D4AF37]">
              {subtitle}
            </span>
          </div>
        )}

        {/* Title — two-line with optional gold accent */}
        <h3 className="font-display font-black text-[22px] md:text-[24px] lg:text-[28px] xl:text-[30px] leading-[1.1] tracking-tight uppercase text-white mb-3">
          {title}
          {titleAccent && (
            <>
              <br />
              <span className="text-[#D4AF37]">{titleAccent}</span>
            </>
          )}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-[12.5px] md:text-[13px] lg:text-[13.5px] text-white/60 leading-[1.7] max-w-[280px] lg:max-w-[300px] mb-6">
            {description}
          </p>
        )}

        {/* CTA button */}
        <button
          className="
            inline-flex items-center gap-2
            bg-white/10 hover:bg-[#D4AF37]
            border border-white/20 hover:border-[#D4AF37]
            text-white hover:text-[#1a0e00]
            text-[9.5px] md:text-[9.5px] lg:text-[10px] font-black uppercase tracking-[0.18em]
            px-[22px] py-[11px] rounded-full
            backdrop-blur-sm
            transition-all duration-250
            group/btn
          "
          onClick={(e) => { e.stopPropagation(); navigate(linkUrl || "/shop") }}
        >
          {buttonText || "Shop Now"}
          <span className="text-[13px] transition-transform duration-250 group-hover/btn:translate-x-0.5">
            →
          </span>
        </button>
      </div>
    </motion.div>
  );
}

/** Mobile — image cell for staggered 2×2 grid */
function SplitGridImage({
  imageSrc,
  title,
  linkUrl,
  className = "",
  delay = 0,
}: {
  imageSrc?: string;
  title: string;
  linkUrl?: string;
  className?: string;
  delay?: number;
}) {
  const navigate = useNavigate();

  return (
    <motion.div
      className={`relative min-h-[140px] sm:min-h-[200px] rounded-xl sm:rounded-2xl overflow-hidden shadow-sm cursor-pointer group ${className}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: EASE, delay }}
      onClick={() => navigate(linkUrl || "/shop")}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(linkUrl || "/shop")}
    >
      <ImagePlaceholder
        aspectRatio="h-full min-h-[140px] sm:min-h-[200px]"
        src={imageSrc}
        alt={title}
        clean
        className="absolute inset-0 w-full h-full [&_img]:object-cover [&_img]:object-center group-hover:scale-[1.02] transition-transform duration-700"
      />
    </motion.div>
  );
}

/** Text cell for staggered split grid */
function SplitGridText({
  subtitle,
  title,
  description,
  buttonText,
  linkUrl,
  backgroundColor,
  className = "",
  delay = 0,
}: {
  subtitle?: string;
  title: string;
  description?: string;
  buttonText?: string;
  linkUrl?: string;
  backgroundColor: string;
  className?: string;
  delay?: number;
}) {
  const navigate = useNavigate();

  return (
    <motion.div
      className={`flex flex-col justify-center items-center text-center gap-2.5 sm:gap-3 p-4 sm:p-6 min-h-[140px] sm:min-h-[190px] rounded-xl sm:rounded-2xl overflow-hidden shadow-sm cursor-pointer ${className}`}
      style={{ backgroundColor }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: EASE, delay }}
      onClick={() => navigate(linkUrl || "/shop")}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(linkUrl || "/shop")}
    >
      {subtitle && (
        <span className="text-[10px] sm:text-xs tracking-[0.22em] uppercase font-bold text-[#d4af37] w-full leading-tight">
          {subtitle}
        </span>
      )}
      <h3 className="font-display text-sm sm:text-base lg:text-lg font-extrabold leading-tight uppercase text-white w-full">
        {title}
      </h3>
      {description && (
        <p className="hidden sm:block text-xs text-white/85 leading-relaxed w-full line-clamp-2">
          {description}
        </p>
      )}
      <span
        className="inline-flex items-center justify-center bg-white hover:bg-neutral-100 px-3 py-1.5 sm:px-6 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest shadow-md mt-1 sm:mt-2 shrink-0"
        style={{ color: backgroundColor }}
      >
        {buttonText || "Shop Now"}
      </span>
    </motion.div>
  );
}

/**
 * Type 3 — Split banners
 * Mobile: 2×2 staggered grid | Desktop: two horizontal image+text cards
 */
function SectionSplit({ section }: { section: HomepageSection }) {
  const { language } = useLanguage();
  const p0 = section.products?.[0] ? mapDbProduct(section.products[0]) : null;
  const p1 = section.products?.[1] ? mapDbProduct(section.products[1]) : null;

  const leftImage = section.bannerImage || p0?.images?.[0] || undefined;
  const rightImage = section.bannerImageRight || p1?.images?.[0] || undefined;
  const maroon = section.backgroundColor || "#8b1a2a";
  const mauve = section.backgroundColorRight || "#9c8485";

  return (
    <Section className="px-4 sm:px-6 lg:px-8 mb-16">
      {/* Mobile — 2×2 split grid */}
      <div className="md:hidden grid grid-cols-2 grid-rows-2 gap-2 sm:gap-4 w-full">
        <SplitGridImage
          className="col-start-1 row-start-1"
          imageSrc={leftImage}
          title={translateDynamic(section.title || "Ethnic Collection", language)}
          linkUrl={section.linkUrl || (p0 ? `/product/${p0.id}` : "/shop")}
          delay={0}
        />
        <SplitGridText
          className="col-start-2 row-start-1"
          subtitle={translateDynamic(section.subtitleRight || "Western Trend", language)}
          title={translateDynamic(section.titleRight || p1?.name || "New Season", language)}
          description={translateDynamic(section.descriptionRight || p1?.description || "", language)}
          buttonText={translateDynamic(section.buttonTextRight || "Shop Western", language)}
          linkUrl={section.linkUrlRight || (p1 ? `/product/${p1.id}` : "/shop")}
          backgroundColor={mauve}
          delay={0.06}
        />
        <SplitGridText
          className="col-start-1 row-start-2"
          subtitle={translateDynamic(section.subtitle || "Ethnic Collection", language)}
          title={translateDynamic(section.title || p0?.name || "Shop Collection", language)}
          description={translateDynamic(section.description || p0?.description || "", language)}
          buttonText={translateDynamic(section.buttonText || "Shop Ethnic", language)}
          linkUrl={section.linkUrl || (p0 ? `/product/${p0.id}` : "/shop")}
          backgroundColor={maroon}
          delay={0.1}
        />
        <SplitGridImage
          className="col-start-2 row-start-2"
          imageSrc={rightImage}
          title={translateDynamic(section.titleRight || "Western Trend", language)}
          linkUrl={section.linkUrlRight || (p1 ? `/product/${p1.id}` : "/shop")}
          delay={0.14}
        />
      </div>

      {/* Desktop — original side-by-side promo cards */}
      <div className="hidden md:grid md:grid-cols-2 gap-6 w-full">
        <SplitPromoBox
          imageLeft
          imageSrc={leftImage}
          subtitle={translateDynamic(section.subtitle || "Ethnic Collection", language)}
          title={translateDynamic(section.title || p0?.name || "Shop Collection", language)}
          description={translateDynamic(section.description || p0?.description || "", language)}
          buttonText={section.buttonText ? translateDynamic(section.buttonText, language) : undefined}
          linkUrl={section.linkUrl ?? (p0 ? `/product/${p0.id}` : "/shop")}
          backgroundColor={maroon}
          delay={0}
        />
        <SplitPromoBox
          imageLeft={false}
          imageSrc={rightImage}
          subtitle={translateDynamic(section.subtitleRight || "Western Trend", language)}
          title={translateDynamic(section.titleRight || p1?.name || "New Season", language)}
          description={translateDynamic(section.descriptionRight || p1?.description || "", language)}
          buttonText={section.buttonTextRight ? translateDynamic(section.buttonTextRight, language) : undefined}
          linkUrl={section.linkUrlRight ?? (p1 ? `/product/${p1.id}` : "/shop")}
          backgroundColor={mauve}
          delay={0.1}
        />
      </div>
    </Section>
  );
}

/** Type 4 — Shop by Department: large vertical category cards (now horizontal carousel) */
function SectionDepartments({ section }: { section: HomepageSection }) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) =>
    scrollRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  const products = (section.products ?? []).map((p) => mapDbProduct(p));
  const linkUrl = section.linkUrl || `/shop?section=${section.slug}`;

  return (
    <Section className="px-4 sm:px-6 lg:px-8 mb-16">
      <CarouselHeader title={translateDynamic(section.title, language)} onLeft={() => scroll(-1)} onRight={() => scroll(1)} />

      <CenteredScrollRow onScrollRef={(el) => { (scrollRef as any).current = el; }} gapClass="gap-4 sm:gap-6">


        {products.map((product: Product, i: number) => (
          <motion.div
            key={product.id}
            className="relative w-[calc((100vw-48px)/2)] sm:w-[calc((100vw-48px-48px)/3)] lg:w-[calc((100vw-140px)/4)] h-[260px] sm:h-[350px] md:h-[420px] lg:h-[480px] shrink-0 snap-start rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl border border-brand-border/20"
            onClick={() => navigate(`/product/${product.id}`)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
          >
            <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-700">
              <ImagePlaceholder aspectRatio="h-full" src={product.images?.[0]} alt={product.name} clean />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5 lg:p-6 flex flex-col items-center text-center gap-1.5 sm:gap-2.5">
              <span className="text-[9.5px] sm:text-xs tracking-[0.22em] uppercase font-bold text-[#d4af37]">{translateDynamic(getCategoryLabel(product.category), language)}</span>
              <h3 className="font-display font-extrabold text-[13px] sm:text-base lg:text-lg text-white uppercase tracking-wide leading-tight">{product.name}</h3>
              <p className="text-[10.5px] sm:text-xs text-white/70 max-w-[140px] sm:max-w-[240px]">{product.description}</p>
              <span className="mt-1 bg-white text-brand-charcoal px-3.5 py-1.5 sm:px-6 sm:py-2.5 rounded-full text-[9px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest transition-colors duration-300 group-hover:bg-[#8b1a2a] group-hover:text-white">
                {language === 'ar' ? 'اكتشف المجموعة' : 'Explore'}
              </span>
            </div>
          </motion.div>
        ))}
      </CenteredScrollRow>
      <div className="flex justify-center mt-8 px-4">
        <Link to={linkUrl} className="px-10 py-3 rounded-full bg-[#8b1a2a] text-white text-[11px] font-black uppercase tracking-[0.25em] hover:bg-[#d4af37] hover:text-[#1a0d0f] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-[#d4af37]/20">
          {language === 'ar' ? 'عرض الكل' : 'View All'}
        </Link>
      </div>
    </Section>
  );
}

/** Type 1 — Product carousel (horizontal scroll, reference site) */
function SectionCarousel({ section }: { section: HomepageSection }) {
  const { language } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) =>
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  const products = (section.products ?? []).map((p) => mapDbProduct(p));
  const linkUrl = section.linkUrl || `/shop?section=${section.slug}`;

  return (
    <Section className="px-4 sm:px-6 lg:px-8 mb-16">
      <CarouselHeader title={translateDynamic(section.title, language)} onLeft={() => scroll(-1)} onRight={() => scroll(1)} />
      <CenteredScrollRow onScrollRef={(el) => { (scrollRef as any).current = el; }} gapClass="gap-5 sm:gap-6">
        {products.map((uiProduct: Product, i: number) => (
          <CarouselProductCard key={uiProduct.id} product={uiProduct} delay={i * 0.05} variant="carousel" />
        ))}
      </CenteredScrollRow>
      <div className="flex justify-center mt-8 px-4">
        <Link to={linkUrl} className="px-10 py-3 rounded-full bg-[#8b1a2a] text-white text-[11px] font-black uppercase tracking-[0.25em] hover:bg-[#d4af37] hover:text-[#1a0d0f] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-[#d4af37]/20">
          {language === 'ar' ? 'عرض الكل' : 'View All'}
        </Link>
      </div>
    </Section>
  );
}

/* ─── Dynamic Section Wrapper (4 layout types from admin) ─── */
function DynamicSection({ section }: { section: HomepageSection }) {
  const layoutType = normalizeSectionType(section.type);
  const hasProducts = (section.products?.length ?? 0) > 0;

  if (layoutType === "SPLIT") {
    return <SectionSplit section={section} />;
  }
  if (!hasProducts) return null; // CAROUSEL, COLLECTIONS, DEPARTMENTS need products

  switch (layoutType) {
    case "COLLECTIONS":
      return <SectionCollections section={section} />;
    case "DEPARTMENTS":
      return <SectionDepartments section={section} />;
    case "CAROUSEL":
    default:
      return <SectionCarousel section={section} />;
  }
}


const variantMap: Record<number, string> = {
  0: "maroon",
  1: "gold",
  2: "charcoal",
  3: "bronze",
};

const accentStyles: Record<string, {
  icon: string; value: string; badge: string; bar: string;
}> = {
  maroon: {
    icon: "bg-[#8b1a2a]/10 text-[#8b1a2a]",
    value: "text-[#8b1a2a]",
    badge: "bg-[#8b1a2a]/10 text-[#8b1a2a]",
    bar: "bg-[#8b1a2a]",
  },
  gold: {
    icon: "bg-[#d4af37]/10 text-[#d4af37]",
    value: "text-[#d4af37]",
    badge: "bg-[#d4af37]/10 text-[#d4af37]",
    bar: "bg-[#d4af37]",
  },
  charcoal: {
    icon: "bg-[#1c1c2e]/10 text-[#1c1c2e]",
    value: "text-[#1c1c2e]",
    badge: "bg-[#1c1c2e]/10 text-[#1c1c2e]",
    bar: "bg-[#1c1c2e]",
  },
  bronze: {
    icon: "bg-[#c5a059]/10 text-[#c5a059]",
    value: "text-[#c5a059]",
    badge: "bg-[#c5a059]/10 text-[#c5a059]",
    bar: "bg-[#c5a059]",
  },
};
/* ═══════════════════════════════════════════════════════════ */
export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const {
    data: dynamicSections,
    isLoading: sectionsLoading,
    isError: sectionsError,
  } = useSections();

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const opacityText = useTransform(scrollYProgress, [0, 1], [1, 0]);

  const { data: dbBanners } = useBanners();

  const defaultBanners = [

    { imageUrl: "/images/bae39700-ac7c-49cc-b745-9050993c6514.png" },
    { imageUrl: "/images/9a9cedce-13c6-437e-918d-a30172c25429.png" },
     { imageUrl: "/images/f6578e7b-716c-4045-a016-458a3a5d9078.png" },
    { imageUrl: "/images/b26b5cad-7d0c-4ca6-91cb-e0be2b83dc0a.png" }
   
   
  ];

  const heroBanners = dbBanners && dbBanners.length > 0 ? dbBanners : defaultBanners;

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    if (heroBanners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroBanners.length);
    }, 4500); // Rotate Hero images every 4.5 seconds
    return () => clearInterval(interval);
  }, [heroBanners.length]);

  /* ── Interactive Brand Story State ── */
  const [activeStoryTab, setActiveStoryTab] = useState(0);
  const [isHoveredStory, setIsHoveredStory] = useState(false);

  useEffect(() => {
    if (isHoveredStory) return;
    const interval = setInterval(() => {
      setActiveStoryTab((prev) => (prev + 1) % 3);
    }, 6000); // Auto rotate every 6 seconds
    return () => clearInterval(interval);
  }, [isHoveredStory]);

  const features = [
    {
      icon: <Truck className="w-6 h-6" strokeWidth={1.5} />,
      title: language === 'ar' ? "شحن مجاني" : "Free Shipping",
      desc: language === 'ar' ? "على جميع الطلبات التي تزيد عن OMR 50. توصيل سريع." : "On all orders above OMR 50. Worldwide delivery.",
    },
    {
      icon: <RefreshCcw className="w-6 h-6" strokeWidth={1.5} />,
      title: language === 'ar' ? "إرجاع سهل" : "Easy Returns",
      desc: language === 'ar' ? "سياسة إرجاع مريحة خلال ٧ أيام." : "Hassle-free 7-day return policy.",
    },
    {
      icon: <Lock className="w-6 h-6" strokeWidth={1.5} />,
      title: language === 'ar' ? "دفع آمن" : "Secure Payment",
      desc: language === 'ar' ? "مدفوعات آمنة ومحمية بنسبة ١٠٠٪." : "100% secure payments.",
    },
    {
      icon: <Diamond className="w-6 h-6" strokeWidth={1.5} />,
      title: language === 'ar' ? "جودة ممتازة" : "Premium Quality",
      desc: language === 'ar' ? "منتجات منتقاة بعناية ومضمونة الجودة." : "Handpicked & quality-checked products.",
    },
  ];

  const brandStats = [
    {
      label: language === 'ar' ? "العملاء السعداء" : "Happy Customers",
      value: "5,000+",
      icon: <ShieldCheck className="h-5 w-5" />,
      bg: "bg-[#8b1a2a]/10 text-[#8b1a2a]",
      color: "text-[#8b1a2a]",
    },
    {
      label: language === 'ar' ? "التصاميم الحصرية" : "Curated Designs",
      value: "100+",
      icon: <TrendingUp className="h-5 w-5" />,
      bg: "bg-emerald-500/10 text-emerald-500",
      color: "text-emerald-600",
    },
    {
      label: language === 'ar' ? "المدن المغطاة" : "Cities Reached",
      value: "150+",
      icon: <Landmark className="h-5 w-5" />,
      bg: "bg-blue-500/10 text-blue-500",
      color: "text-blue-600",
    },
    {
      label: language === 'ar' ? "متوسط التقييم" : "Average Rating",
      value: "4.9 / 5",
      icon: <Star className="h-5 w-5 fill-[#d4af37] stroke-[#d4af37]" />,
      bg: "bg-amber-500/10 text-amber-500",
      color: "text-amber-600",
    },
  ];

  const testimonials = [
    {
      stars: 5,
      text: language === 'ar' ? "جودة الأقمشة ممتازة جداً. الخياطة والتفصيل مناسبان تماماً، وتصل الشحنة في وقتها المحدد." : "The fabric quality on the satin set is incredible. Tailoring fits perfectly, and shipment arrived on time.",
      name: language === 'ar' ? "أنجالي ك." : "Anjali K.",
      verified: true,
    },
    {
      stars: 5,
      text: language === 'ar' ? "سوبريور تريندز هو متجري المفضل دائماً. ملابسه تملك تصاميم ونقوش مذهلة وأصلية." : "Superior Trends is my go-to boutique. The kurta pajamas have stunning handloom work. Truly authentic.",
      name: language === 'ar' ? "ميرا ر." : "Meera R.",
      verified: true,
    },
    {
      stars: 5,
      text: language === 'ar' ? "قصات وتفاصيل رائعة للغاية. خيارات الخياطة والمقاسات المخصصة مفيدة جداً. سأكرر التجربة بالتأكيد." : "Absolutely gorgeous silhouettes. The custom sizing options are a lifesaver. Will definitely shop again.",
      name: language === 'ar' ? "سيمران س." : "Simran S.",
      verified: true,
    },
    {
      stars: 5,
      text: language === 'ar' ? "تصميم استثنائي وجودة عالية. طقم الكورد أنيق ومريح جداً. أنصح به بشدة!" : "Exceptional design and quality. The cord sets are extremely chic and comfortable. Highly recommend!",
      name: language === 'ar' ? "بريا ت." : "Priya T.",
      verified: true,
    },
    {
      stars: 5,
      text: language === 'ar' ? "كل قطعة تشعرك وكأنها تحفة فنية. فريق الدعم كان مفيداً جداً في اختيار المقاسات." : "Every piece feels like a masterpiece. The support team was incredibly helpful with sizing guidance.",
      name: language === 'ar' ? "كاجال ب." : "Kajal P.",
      verified: true,
    },
    {
      stars: 5,
      text: language === 'ar' ? "التطريز يدوي الصنع رائع والقماش ناعم جداً. أسرع توصيل تلقيته في حياتي!" : "The hand embroidery is stunning and the fabric is so soft. Fastest delivery I've ever received!",
      name: language === 'ar' ? "ريا م." : "Riya M.",
      verified: true,
    },
    {
      stars: 5,
      text: language === 'ar' ? "اشتريت الكورتا الحرير وأُذهلت بالجودة. المواد الخام فاخرة وتستحق كل ريال." : "Bought the silk kurta pajama and was blown away by the quality. Premium materials — worth every penny.",
      name: language === 'ar' ? "شيريا ن." : "Shreya N.",
      verified: true,
    },
    {
      stars: 5,
      text: language === 'ar' ? "المجموعة الحصرية فعلاً مذهلة. الألوان نابضة بالحياة والتصاميم عصرية. خدمة ممتازة." : "The exclusive collection is truly breathtaking. Vibrant colors and modern designs. Excellent service.",
      name: language === 'ar' ? "نيها ك." : "Neha K.",
      verified: true,
    },
  ];

  return (
    <div className="pb-20 bg-brand-cream text-brand-charcoal ">
      {/* ── 1. HERO ───────────────────────────────────────────── */}
      <Section className="px-4 sm:px-6 lg:px-8 pt-6 mb-16">
        <div
          ref={heroRef}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[1.32/1] sm:aspect-[16/9] md:aspect-auto md:min-h-[60vh] lg:min-h-[70vh] flex flex-col justify-end"
        >
          {/* ── Background image with crossfade slideshow ── */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentHeroIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img
                src={heroBanners[currentHeroIndex]?.imageUrl || ''}
                alt="Banner"
                className="absolute inset-0 w-full h-full object-cover object-[center_25%]"
                style={{
                  filter: 'brightness(0.98)',
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* ── Layered gradients for depth ── */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-black/90 via-black/35 to-transparent pointer-events-none" />

          {/* ── Gold top accent line ── */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37]/70 to-transparent" />

          {/* ── Corner monogram ── */}
          <div className="absolute top-5 right-6 sm:top-7 sm:right-8 flex items-center gap-2 opacity-60">
            <div className="w-7 h-7 rounded-full border border-[#d4af37]/50 flex items-center justify-center">
              <span className="text-[#d4af37] text-[9px] font-black tracking-tight">ST</span>
            </div>
            <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/50 hidden sm:block">
              {t('common.alAlishaCollection')}
            </span>
          </div>

          {/* ── Content ── */}
          <motion.div
            style={{ y: yText, opacity: opacityText }}
            className="relative z-10 px-5 sm:px-10 md:px-14 pb-8 sm:pb-12 md:pb-20 lg:pb-28 max-w-3xl text-left rtl:text-right"
          >
            <motion.div
              className="space-y-3 sm:space-y-5"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: EASE }}
            >
              {/* Eyebrow */}
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-[#d4af37]/70" />
                <span className={`font-black uppercase text-[#d4af37] ${language === 'ar' ? 'text-[11px] tracking-normal' : 'text-[9px] tracking-[0.35em]'}`}>
                  {language === 'ar' ? 'موسم جديد · ٢٠٢٦' : 'New Season · 2026'}
                </span>
              </div>

              {/* Headline */}
              <h1 className={`font-display font-black leading-[1.05] tracking-tight uppercase text-white ${language === 'ar' ? 'text-[1.72rem] xs:text-[2.1rem] sm:text-6xl md:text-7xl' : 'text-[1.42rem] xs:text-[1.72rem] sm:text-5xl md:text-6xl'}`}>
                {language === 'ar' ? (
                  <>
                    اكتشف
                    <br />
                    <span className="relative inline-block mt-1">
                      <span className="text-[#d4af37]">أسلوبك</span>
                      {' الخاص'}
                      <svg
                        className="absolute -bottom-1.5 left-0 w-[60%]"
                        viewBox="0 0 160 8"
                        preserveAspectRatio="none"
                        fill="none"
                      >
                        <path
                          d="M2 6 C40 2, 120 2, 158 6"
                          stroke="#d4af37"
                          strokeWidth="2"
                          strokeLinecap="round"
                          opacity="0.6"
                        />
                      </svg>
                    </span>
                  </>
                ) : (
                  <>
                    Discover Your
                    <br />
                    <span className="relative inline-block mt-1">
                      <span className="text-[#d4af37]">Signature</span>
                      {' Style'}
                      <svg
                        className="absolute -bottom-1.5 left-0 w-[60%]"
                        viewBox="0 0 160 8"
                        preserveAspectRatio="none"
                        fill="none"
                      >
                        <path
                          d="M2 6 C40 2, 120 2, 158 6"
                          stroke="#d4af37"
                          strokeWidth="2"
                          strokeLinecap="round"
                          opacity="0.6"
                        />
                      </svg>
                    </span>
                  </>
                )}
              </h1>

              {/* Body */}
              <p className={`hidden sm:block text-white/65 leading-relaxed font-light max-w-sm ${language === 'ar' ? 'text-[17px] sm:text-lg' : 'text-[15px] sm:text-base'}`}>
                {language === 'ar'
                  ? "حرفة يدوية إبداعية منسوجة في تصاميم عصرية مميزة تناسب ذوقك الرفيع وأناقتك الدائمة."
                  : "Artisan craftsmanship woven into contemporary silhouettes. Custom designs built for effortless, enduring sophistication."}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/shop')}
                  className={`
                    group flex items-center gap-2
                    bg-[#8b1a2a] hover:bg-[#d4af37] text-white hover:text-[#1a0d0f]
                    px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-full
                    font-black uppercase
                    shadow-lg shadow-[#8b1a2a]/30 hover:shadow-[#d4af37]/30
                    transition-all duration-300 active:scale-[0.97]
                    ${language === 'ar' ? 'text-[12px] sm:text-[13px] tracking-normal' : 'text-[10px] sm:text-[11px] tracking-widest'}
                  `}
                >
                  {t('common.shopNow')}
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform rtl:rotate-180" />
                </button>
                <button
                  onClick={() => navigate('/shop')}
                  className={`
                    flex items-center gap-2
                    border border-white/25 text-white/80
                    hover:border-white/60 hover:text-white hover:bg-white/8
                    px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-full
                    font-black uppercase
                    transition-all duration-300 backdrop-blur-sm
                    ${language === 'ar' ? 'text-[12px] sm:text-[13px] tracking-normal' : 'text-[10px] sm:text-[11px] tracking-widest'}
                  `}
                >
                  {language === 'ar' ? "عرض المجموعات" : "View Collections"}
                </button>
              </div>

              {/* Social proof strip */}
              <div className="hidden sm:flex items-center gap-4 pt-1">
                <div className="flex -space-x-2">
                  {[
                    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=48&h=48&fit=crop&crop=face',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face',
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=48&h=48&fit=crop&crop=face',
                  ].map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="Customer"
                      className="w-6 h-6 rounded-full border-2 border-black/40 object-cover"
                    />
                  ))}
                </div>
                <p className={`hidden sm:block text-white/45 font-medium ${language === 'ar' ? 'text-[12px]' : 'text-[10px]'}`}>
                  <span className="text-white/70 font-bold">2,400+</span> {language === 'ar' ? 'عميل هذا الموسم' : 'customers this season'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Section>

      {/* ── 2. ADMIN HOMEPAGE SECTIONS ── */}
      {sectionsLoading && (
        <>
          <HomeSplitSkeleton />
          <HomeSectionSkeleton />
          <HomeSectionSkeleton />
        </>
      )}
      {sectionsError && !sectionsLoading && (
        <Section className="px-4 sm:px-6 lg:px-8 mb-16 text-center">
          <p className="text-sm text-neutral-500 font-medium py-12">
            {language === 'ar' ? 'عذراً، تعذر تحميل المجموعات. تحقق من اتصالك بالإنترنت.' : 'Collections could not load. Check your connection and refresh.'}
          </p>
        </Section>
      )}
      {!sectionsLoading &&
        !sectionsError &&
        dynamicSections?.map((section) => (
          <DynamicSection key={section.id} section={section} />
        ))}

      {/* ── 3. STATS ──────────────────────────────────────────── */}
      <Section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-b from-[#FAFAF8] via-white to-[#FAFAF8] border-y border-[#E8E4DD]">
        {/* Ambient glows — brand colors */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#8b1a2a]/[0.04] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#d4af37]/[0.04] blur-3xl" />

        <div className="relative w-full space-y-10">
          {/* Header */}
          <div className="text-center">
            <p className="text-[10.5px] lg:text-[13px] font-bold tracking-[0.2em] uppercase text-[#8b1a2a] mb-2">
              {language === 'ar' ? 'لماذا سوبريور تريندز' : 'Why Superior Trends'}
            </p>
            <h2 className="font-display font-black text-2xl sm:text-[26px] lg:text-[38px] text-[#1c1c2e] tracking-tight">
              {language === 'ar' ? 'تميزنا يكمن في التفاصيل' : 'Built Different'}
            </h2>
            <p className="text-sm lg:text-[16px] text-[#999] mt-1.5">
              {language === 'ar' ? 'تجربة تسوق متميزة وشفافة — بالأرقام والنتائج.' : 'A premium, transparent shopping experience — by the numbers.'}
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {brandStats.map((c, i) => {
              const v = accentStyles[variantMap[i]];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, ease: EASE, delay: i * 0.08 }}
                >
                  <div className="group relative bg-white border border-[#EDEAE3] rounded-2xl p-5 sm:p-6 overflow-hidden
                            transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(0,0,0,0.06)]
                            hover:border-[#d4af37]/30 cursor-default">

                    {/* Top accent bar — reveals on hover */}
                    <div className={`absolute top-0 inset-x-0 h-[3.5px] rounded-t-2xl ${v.bar}
                              opacity-0 group-hover:opacity-100 transition-opacity duration-250`} />

                    {/* Label + Icon */}
                    <div className="flex items-start justify-between mb-3.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#aaa] leading-snug flex-1 mr-2 rtl:ml-2">
                        {c.label}
                      </span>
                      <div className={`size-9 flex items-center justify-center rounded-[11px] ${v.icon}
                                 transition-transform duration-250 group-hover:scale-110 group-hover:-rotate-3 shrink-0`}>
                        {c.icon}
                      </div>
                    </div>

                    {/* Value */}
                    <p className={`text-[34px] font-black leading-none tracking-[-0.035em] ${v.value}`}>
                      <Counter value={c.value} />
                    </p>

                    {/* Badge */}
                    <div className={`inline-flex items-center gap-1 mt-3 text-[10.5px] font-semibold
                               px-2.5 py-1 rounded-full ${v.badge}`}>
                      {language === 'ar' ? 'موثق' : 'Verified'}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ── 8. TESTIMONIALS ── */}
      <Section className="mb-12 sm:mb-16 overflow-hidden bg-[#FAFAF8]">
        <div className="w-full">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10 px-4 sm:px-6 lg:px-8">
            <span className="text-[9.5px] lg:text-[12px] font-bold tracking-[0.22em] uppercase text-[#8b1a2a]">
              {language === 'ar' ? 'آراء العملاء' : 'Feedback'}
            </span>
            <h2 className="font-display font-black text-xl sm:text-[26px] lg:text-[32px] text-[#1c1c2e] mt-2 mb-2.5 tracking-tight uppercase">
              {language === 'ar' ? 'ماذا يقول عملاؤنا عنّا' : 'What Our Customers Say'}
            </h2>
            <div className="w-9 h-[2.5px] bg-[#8b1a2a] mx-auto rounded-full mb-3" />
            <p className="text-[11px] sm:text-[13px] lg:text-[15px] text-brand-text-muted max-w-xs lg:max-w-md mx-auto">
              {language === 'ar' ? 'تقييمات حقيقية من متسوقين حقيقيين — تصفح الآن.' : 'Real reviews from real shoppers — swipe or use arrows to browse.'}
            </p>
          </div>

          <CustomerReviewsCarousel
            items={testimonials.map((r, idx) => ({
              id: `home-t-${idx}`,
              stars: r.stars,
              text: r.text,
              name: r.name,
              verified: r.verified,
            }))}
          />
        </div>
      </Section>

      {/* ── 8.25. BRAND PHILOSOPHY / INTERACTIVE STORY SHOWCASE (CEO HIGHLIGHT) ── */}
      <section
        className="w-full bg-[#0D0D0D] text-white my-20 flex flex-col md:flex-row items-stretch relative overflow-hidden"
        onMouseEnter={() => setIsHoveredStory(true)}
        onMouseLeave={() => setIsHoveredStory(false)}
      >
        {/* Background Watermark Lettering */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden select-none">
          <span className="text-white/[0.015] font-black tracking-[0.4em] uppercase text-[12vw] font-display">
            SUPERIOR
          </span>
        </div>

        {/* Left: Dynamic Cinematic Image (Framer Motion Crossfade) */}
        <div className="w-full md:w-1/2 h-auto md:h-[650px] relative overflow-hidden group z-10 bg-[#0D0D0D]">
          {/* Invisible spacer image to set natural container height on mobile */}
          <img
            src={
              activeStoryTab === 0
                ? "/images/41923b59-8c5b-4348-b499-36a800f5536c.png"
                : activeStoryTab === 1
                  ? "/images/4902b9e9-3e5a-4fd6-8767-8f524c08fd23.png"
                  : "/images/fb554f35-a4eb-4f6f-b2df-ee6f09f289f7.png"
            }
            alt=""
            className="w-full h-auto opacity-0 pointer-events-none block md:hidden"
          />
          <AnimatePresence mode="wait">
            <motion.img
              key={activeStoryTab}
              initial={{ opacity: 0, scale: 1.12 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 1.0, ease: EASE }}
              src={
                activeStoryTab === 0
                  ? "/images/41923b59-8c5b-4348-b499-36a800f5536c.png"
                  : activeStoryTab === 1
                    ? "/images/4902b9e9-3e5a-4fd6-8767-8f524c08fd23.png"
                    : "/images/fb554f35-a4eb-4f6f-b2df-ee6f09f289f7.png"
              }
              alt="Superior Trends Editorial"
              className="w-full h-full object-cover object-top absolute inset-0"
            />
          </AnimatePresence>

          {/* Floating Chapter Pill */}
          <div className="absolute bottom-6 left-6 z-20 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]">
              {language === 'ar' ? 'الفصل' : 'Chapter'} 0{activeStoryTab + 1}
            </span>
          </div>
        </div>

        {/* Right: Interactive Text Content Area */}
        <div className="w-full md:w-1/2 px-5 py-10 sm:p-12 md:p-16 lg:p-24 flex flex-col justify-center space-y-6 sm:space-y-8 relative z-10 bg-[#0D0D0D] text-left rtl:text-right">
          {/* Top subtle glow */}
          <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Brand Heading */}
          <div className="space-y-1.5 text-center md:text-left rtl:md:text-right max-w-md mx-auto md:max-w-none w-full">
            <span className="text-xs tracking-[0.35em] text-[#D4AF37] font-extrabold uppercase block">
              {t('common.superiorTrends')}
            </span>
            <span className="text-xs tracking-[0.2em] text-gray-400 font-bold uppercase block">
              {t('common.alAlishaCollection')}
            </span>
          </div>

          {/* Interactive Navigation Tabs */}
          <div
            className="flex items-center justify-between md:justify-start border-b border-white/10 pb-3 gap-2 sm:gap-10 overflow-x-auto whitespace-nowrap max-w-md mx-auto md:max-w-none w-full"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
          >
            {[
              { label: language === 'ar' ? 'فلسفة التصميم' : "Design Philosophy", id: 0 },
              { label: language === 'ar' ? 'التراث اليدوي' : "Artisan Heritage", id: 1 },
              { label: language === 'ar' ? 'خياطة خاصة' : "Bespoke Studio", id: 2 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveStoryTab(tab.id)}
                className={`relative pb-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors duration-300 cursor-pointer shrink-0 ${activeStoryTab === tab.id
                  ? "text-[#D4AF37]"
                  : "text-gray-500 hover:text-gray-300"
                  }`}
              >
                {tab.label}
                {activeStoryTab === tab.id && (
                  <motion.div
                    layoutId="activeStoryIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Chapter Content Details */}
          <div className="min-h-0 md:min-h-[220px] flex flex-col justify-between max-w-md mx-auto md:max-w-none w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStoryTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.55, ease: EASE }}
                className="space-y-4 flex flex-col items-center md:items-start rtl:md:items-end text-center md:text-left rtl:md:text-right"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl font-display font-extrabold text-[#D4AF37]">
                    0{activeStoryTab + 1}.
                  </span>
                  <span className="text-xs uppercase font-extrabold tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-full">
                    {activeStoryTab === 0
                      ? (language === 'ar' ? 'التميز في التفصيل' : "Sartorial Excellence")
                      : activeStoryTab === 1
                        ? (language === 'ar' ? 'الإرث التقليدي' : "Artisanal Legacy")
                        : (language === 'ar' ? 'جودة لا تضاهى' : "Uncompromised Quality")}
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-xl sm:text-3xl lg:text-4xl tracking-tight leading-[1.15]">
                  {activeStoryTab === 0 ? (
                    language === 'ar' ? (
                      <>
                        تفصيل مثالي. <br />
                        جرأة ورقي.
                      </>
                    ) : (
                      <>
                        Tailored Perfection. <br />
                        Bold & Sophisticated.
                      </>
                    )
                  ) : activeStoryTab === 1 ? (
                    language === 'ar' ? (
                      <>
                        إرث النول اليدوي. <br />
                        كورتا بيجاما مصنوعة يدوياً.
                      </>
                    ) : (
                      <>
                        Handloom Heritage. <br />
                        Artisan Kurta Pajamas.
                      </>
                    )
                  ) : (
                    language === 'ar' ? (
                      <>
                        مقاسات خاصة. <br />
                        تفصيل مخصص لأجلك.
                      </>
                    ) : (
                      <>
                        Bespoke Fitting. <br />
                        Custom Tailored For You.
                      </>
                    )
                  )}
                </h3>

                <p className="text-[13px] sm:text-sm text-gray-300 leading-relaxed font-light">
                  {activeStoryTab === 0
                    ? (language === 'ar' ? "تمثل دار التصميم لدينا نقطة التقاء بين الحرفية الفاخرة والعملية الحديثة. نحن نصمم قطعاً مميزة تمكنك من التعبير عن نفسك بجرأة وثقة." : "Our design house represents the intersection of luxury craftsmanship and modern utility. We design statement pieces—from oversized blazers to flowing satin coordinates—that empower individual expression and stand out in any setting.")
                    : activeStoryTab === 1
                      ? (language === 'ar' ? "احتفاءً بالتراث الهندي الأصيل، تتعاون مجموعة العليشة المميزة لدينا مباشرة مع نساجي الأنوال اليدوية التقليديين في مختلف المدن." : "Celebrating authentic Indian heritage, our signature Al Alisha range collaborates directly with traditional handloom weavers. We integrate rich fabrics, pure thread embroidery, and classic Banarasi motifs into modern fits.")
                      : (language === 'ar' ? "كل عميل لدينا هو حالة خاصة. يقدم الاستوديو الخاص بنا خيارات مخصصة للمقاسات والتفصيل مباشرة من خلال المنصة لضمان مظهر مثالي وخياطة تليق بك." : "Every individual is unique. Our studio offers customized sizing and tailoring options directly through the platform. By custom-crafting pieces specifically to your dimensions, we minimize textile waste and guarantee a flawless drape.")}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Footer Seal */}
            <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-center md:justify-start gap-4">
              <div className="size-11 rounded-full border border-[#D4AF37]/30 flex items-center justify-center shrink-0 bg-[#D4AF37]/5">
                <Sparkles size={16} className="text-[#D4AF37]" />
              </div>
              <div className="text-left rtl:text-right">
                <p className="text-[10px] text-white font-bold uppercase tracking-widest">
                  {language === 'ar' ? 'بيت سوبريور تريندز' : 'The House of Superior Trends'}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {language === 'ar' ? 'تأسس ٢٠٢٤ • مجموعة العليشة' : 'Est. 2024 • Al Alisha Collection'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8.5. BRAND PROMISES (CEO SECTION) ── */}
      <Section className="px-4 sm:px-6 lg:px-8 mb-16">
        <div className="w-full relative bg-[#FCF8F8] rounded-[24px] overflow-hidden border border-[#8b1a2a]/10">

          {/* Soft gloss wash */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/55 to-transparent pointer-events-none z-0" />

          {/* Grid */}
          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className={`
            group relative flex flex-col items-center justify-center gap-3.5
            px-5 py-8 sm:py-10 text-center cursor-default
            overflow-hidden
            transition-colors duration-200 hover:bg-white/70
            ${i < 2 ? 'border-b lg:border-b-0' : ''}
            ${i % 2 === 0 ? 'border-r' : ''}
            ${i === 1 ? 'lg:border-r' : ''}
            ${i === 2 ? 'lg:border-r' : ''}
            border-[#8b1a2a]/08
          `}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }}
              >
                {/* Bottom underline reveal */}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2.5px] w-0 rounded-full bg-[#8b1a2a] group-hover:w-12 transition-all duration-[350ms] ease-out" />

                {/* Icon pill */}
                <div className="
            size-14 rounded-2xl
            bg-[#8b1a2a]/[0.07] text-[#8b1a2a]
            flex items-center justify-center
            transition-all duration-[350ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]
            group-hover:-translate-y-1 group-hover:scale-[1.08] group-hover:bg-[#8b1a2a]/[0.12]
          ">
                  {f.icon}
                </div>

                {/* Text */}
                <div className="space-y-1.5">
                  <h3 className="text-[11.5px] font-black uppercase tracking-[0.13em] text-brand-charcoal leading-tight">
                    {f.title}
                  </h3>
                  <p className="text-[12.5px] text-brand-text-muted leading-[1.55] max-w-[140px] mx-auto">
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>


      {/* ── 9. NEWSLETTER ─────────────────────────────────────── */}
      <Section className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto text-center space-y-8">
          <div className="space-y-3">
            <span className="text-xs tracking-[0.3em] uppercase text-[#8b1a2a] font-bold">
              {language === 'ar' ? 'انضم إلى عائلتنا' : 'Join the Circle'}
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-charcoal tracking-tight uppercase">
              {language === 'ar' ? 'اشترك للحصول على وصول حصري' : 'Subscribe For Exclusive Access'}
            </h2>
            <p className="text-sm sm:text-base text-brand-text-muted leading-relaxed">
              {language === 'ar'
                ? 'احصل على إشعارات خاصة عند إطلاق المجموعات الجديدة، والكميات المحدودة، والعروض الخاصة.'
                : 'Receive private notifications for new collection releases, limited batch runs, and special offers.'}
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert(language === 'ar' ? 'شكراً لاشتراكك!' : 'Thank you for subscribing!');
            }}
            className="flex gap-2"
          >
            <Input
              type="email"
              placeholder={language === 'ar' ? 'أدخل عنوان بريدك الإلكتروني' : 'Enter your email address'}
              className="bg-white border-brand-border h-11 text-sm rounded-xl shadow-xs"
              required
            />
            <Button
              type="submit"
              className="bg-[#8b1a2a] hover:bg-brand-charcoal text-white h-11 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 shrink-0"
            >
              {language === 'ar' ? 'اشترك' : 'Subscribe'}
            </Button>
          </form>
        </div>
      </Section>
    </div>
  );
};
