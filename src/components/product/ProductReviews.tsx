import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../ui/card';
import type { ProductReview } from '../../lib/api';

export type ReviewCardItem = {
  id: string;
  stars: number;
  text: string;
  name: string;
  title?: string;
  verified?: boolean;
  date?: string;
};

/*
const FALLBACK_REVIEWS: ReviewCardItem[] = [
  {
    id: 'fb-1',
    stars: 5,
    text: 'The fabric quality is incredible. Tailoring fits perfectly, and delivery arrived on time.',
    name: 'Anjali K.',
    verified: true,
  },
  {
    id: 'fb-2',
    stars: 5,
    text: 'Superior Trends is my go-to boutique. Stunning handloom work — truly authentic.',
    name: 'Meera R.',
    verified: true,
  },
  {
    id: 'fb-3',
    stars: 5,
    text: 'Gorgeous silhouettes and comfortable fits. Will definitely shop again.',
    name: 'Simran S.',
    verified: true,
  },
  {
    id: 'fb-4',
    stars: 5,
    text: 'Exceptional design and quality. The cord sets are extremely chic.',
    name: 'Priyah T.',
    verified: true,
  },
  {
    id: 'fb-5',
    stars: 5,
    text: 'Every piece feels like a masterpiece. Support was helpful with sizing.',
    name: 'Kajal P.',
    verified: true,
  },
];
*/



/** Derive initials from a name string */
function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function mapApiReviews(reviews: ProductReview[]): ReviewCardItem[] {
  return reviews.map((r) => ({
    id: r.id,
    stars: r.rating,
    text: r.review || r.title || 'Great product!',
    name: r.user?.name || 'Customer',
    title: r.title ?? undefined,
    verified: true,
    date: r.createdAt
      ? new Date(r.createdAt).toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric',
      })
      : undefined,
  }));
}

// ─── Star Row ─────────────────────────────────────────────────────────────────

function ReviewStars({ count, size = 13 }: { count: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          className={i < count ? 'fill-[#d4af37]' : 'fill-neutral-200'}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Single Review Card ────────────────────────────────────────────────────────

function ReviewCard({ item }: { item: ReviewCardItem }) {
  return (
    <Card
      className="
        group relative
        w-[calc(100vw-48px)] sm:w-[252px] md:w-[268px]
        h-full flex flex-col
        shrink-0 snap-center
        rounded-[18px] border border-[#EDEAE3] bg-white
        p-4 sm:p-5
        shadow-sm hover:shadow-[0_8px_28px_rgba(0,0,0,0.07)]
        hover:-translate-y-0.5
        transition-all duration-200
        overflow-hidden
        cursor-default
      "
    >
      {/* Top accent bar — brand red, revealed on hover */}
      <div className="absolute top-0 inset-x-0 h-[3px] rounded-t-[18px] bg-[#8b1a2a] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Decorative quote glyph */}
      <span
        className="block font-serif text-[40px] leading-none text-[#f0dde0] select-none -mt-1 -mb-2"
        aria-hidden="true"
      >
        &ldquo;
      </span>

      {/* Stars */}
      <ReviewStars count={item.stars} size={13} />

      {/* Optional title */}
      {item.title && (
        <p className="mt-2 text-[11px] font-black uppercase tracking-widest text-[#8b1a2a]">
          {item.title}
        </p>
      )}

      {/* Review body */}
      <p className="mt-2.5 text-xs sm:text-[13px] text-brand-text-muted leading-[1.65] line-clamp-4 italic flex-1">
        {item.text}
      </p>

      {/* Footer */}
      <div className="mt-3.5 pt-2.5 border-t border-[#f0ede6] flex items-center gap-2.5 min-w-0">
        {/* Initials avatar */}
        <div className="size-[32px] sm:size-[34px] rounded-full bg-[#f5e8ea] flex items-center justify-center text-[10px] sm:text-[11px] font-black text-[#8b1a2a] shrink-0 select-none">
          {initials(item.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] sm:text-[13px] font-bold text-brand-charcoal truncate leading-tight">
            {item.name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {item.verified && (
              <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-black uppercase text-[#2d9e6b]">
                <BadgeCheck size={10} className="shrink-0" />
                Verified
              </span>
            )}
            {item.date && (
              <span className="text-[9px] sm:text-[10px] text-neutral-400">{item.date}</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Nav Button ───────────────────────────────────────────────────────────────

function NavBtn({
  dir,
  onClick,
  label,
}: {
  dir: 'left' | 'right';
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      // onPointerDown fires BEFORE the scroll container captures touch events
      // This makes the arrows work reliably on mobile (iOS + Android)
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      className={`
        absolute top-1/2 -translate-y-1/2 z-[30]
        flex
        w-8 h-8 sm:w-11 sm:h-11
        rounded-full
        bg-white border border-[#EDEAE3] text-neutral-400
        items-center justify-center
        shadow-sm
        hover:border-[#8b1a2a] hover:text-white hover:bg-[#8b1a2a] hover:scale-105
        active:scale-95
        transition-all touch-manipulation select-none
        ${dir === 'left' ? 'left-1 sm:left-4 lg:left-8' : 'right-1 sm:right-4 lg:right-8'}
      `}
    >
      {dir === 'left' ? (
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 rtl:rotate-180" strokeWidth={2.5} />
      ) : (
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 rtl:rotate-180" strokeWidth={2.5} />
      )}
    </button>
  );
}

// ─── Main Carousel ────────────────────────────────────────────────────────────

export function CustomerReviewsCarousel({ items }: { items: ReviewCardItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Duplicate the reviews list to make it look like a long loop
  const loopItems = useMemo(() => {
    if (items.length === 0) return [];
    // Repeat the items list 5 times so there's always plenty of cards to swipe
    return Array(5).fill(items).flat();
  }, [items]);

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      const firstChild = scrollRef.current.firstElementChild as HTMLElement;
      const cardWidth = firstChild?.getBoundingClientRect().width || 280;
      scrollRef.current.scrollBy({
        left: dir * (cardWidth + 16),
        behavior: 'smooth',
      });
    }
  };

  // Auto-scroll loop
  useEffect(() => {
    if (loopItems.length === 0) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const firstChild = scrollRef.current.firstElementChild as HTMLElement;
        const cardWidth = firstChild?.getBoundingClientRect().width || 280;
        const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;

        if (scrollRef.current.scrollLeft >= maxScroll - 10) {
          // If we reached the end of our cloned cards, scroll back to start
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({
            left: cardWidth + 16,
            behavior: 'smooth',
          });
        }
      }
    }, 3500); // Swipes automatically every 3.5 seconds

    return () => clearInterval(interval);
  }, [loopItems.length]);

  if (items.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <p className="text-sm text-brand-text-muted font-medium">
          No approved reviews yet.
        </p>
        <p className="text-xs text-neutral-400 mt-1">
          Be the first to share your experience after your order is delivered.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full min-w-0 py-6">
      {/* Edge fade masks */}
      <div className="pointer-events-none absolute left-0 inset-y-0 w-6 sm:w-12 lg:w-20 bg-gradient-to-r from-[#FAFAF8] via-[#FAFAF8]/80 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 inset-y-0 w-6 sm:w-12 lg:w-20 bg-gradient-to-l from-[#FAFAF8] via-[#FAFAF8]/80 to-transparent z-10" />

      <NavBtn dir="left" onClick={() => scroll(-1)} label="Previous reviews" />
      <NavBtn dir="right" onClick={() => scroll(1)} label="Next reviews" />

      <div
        ref={scrollRef}
        className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none px-6 sm:px-16 lg:px-24 py-4"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {loopItems.map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="snap-center shrink-0 flex">
            <ReviewCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section Header (use in your page) ────────────────────────────────────────
//
//  <Section className="mb-12 sm:mb-16 overflow-hidden bg-[#FAFAF8]">
//    <div className="text-center mb-8 sm:mb-10 px-4">
//      <span className="text-[10.5px] font-bold tracking-[0.22em] uppercase text-[#8b1a2a]">
//        Feedback
//      </span>
//      <h2 className="font-display font-black text-2xl sm:text-[26px] text-brand-charcoal
//                     mt-2 mb-2.5 tracking-tight uppercase">
//        What Our Customers Say
//      </h2>
//      <div className="w-9 h-[2.5px] bg-[#8b1a2a] mx-auto rounded-full mb-3" />
//      <p className="text-xs sm:text-[13px] text-brand-text-muted max-w-xs mx-auto">
//        Real reviews from real shoppers — swipe or use arrows to browse.
//      </p>
//    </div>
//    <CustomerReviewsCarousel items={...} />
//  </Section>

// ─── Marquee (legacy) ─────────────────────────────────────────────────────────

export function CustomerReviewsMarquee({ items }: { items: ReviewCardItem[] }) {
  const loop = useMemo(() => [...items, ...items], [items]);
  if (items.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden py-2">
      <div className="absolute left-0 inset-y-0 w-16 sm:w-24 bg-gradient-to-r from-[#FAFAF8] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 inset-y-0 w-16 sm:w-24 bg-gradient-to-l from-[#FAFAF8] to-transparent z-10 pointer-events-none" />
      <motion.div
        className="flex gap-3 sm:gap-4 w-max"
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          ease: 'linear',
          duration: Math.max(20, items.length * 5),
          repeat: Infinity,
        }}
      >
        {loop.map((r, idx) => (
          <ReviewCard key={`${r.id}-${idx}`} item={r} />
        ))}
      </motion.div>
    </div>
  );
}

// ─── Static Grid ──────────────────────────────────────────────────────────────

export function CustomerReviewsGrid({ items }: { items: ReviewCardItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-base text-brand-text-muted text-center py-8 font-medium">
        No reviews yet. Be the first to share your experience after purchase.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {items.map((item) => (
        <ReviewCard key={item.id} item={item} />
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function resolveReviewItems(apiReviews?: ProductReview[]): ReviewCardItem[] {
  if (apiReviews && apiReviews.length > 0) {
    return mapApiReviews(apiReviews);
  }
  // Return empty — ProductDetail handles the empty state UI
  return [];
}