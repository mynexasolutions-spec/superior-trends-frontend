import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import type { Product } from '../data/products';
import { useShop } from '../context/ShopContext';
import { ImagePlaceholder } from './ImagePlaceholder';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { formatINR } from '../lib/formatCurrency';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toggleWishlist, isInWishlist, addToCart } = useShop();
  const [isHovered, setIsHovered] = useState(false);
  const [showMobileSizes, setShowMobileSizes] = useState(false);
  const [addedSize, setAddedSize] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '80px' });

  const sizes = product.sizes?.length > 0 ? product.sizes : ['S', 'M', 'L'];
  const isFavorite = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultColor = product.colors[0];
    addToCart(product, 1, size, defaultColor);

    setAddedSize(size);
    setTimeout(() => setAddedSize(null), 2000);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ duration: 0.35 }}
      className="group relative flex flex-col font-display bg-white p-2.5 sm:p-4 border border-brand-border/30 rounded-xl sm:rounded-2xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(139,26,42,0.06),0_1px_3px_rgba(0,0,0,0.05),0_0_0_1px_rgba(212,175,55,0.12)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Frame */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-cream border border-brand-border/20 rounded-xl">
        {/* Badges */}
        <div className="absolute left-2 top-2 sm:left-3 sm:top-3 z-10 flex flex-col gap-1 sm:gap-1.5 pointer-events-none">
          {product.isNew && (
            <span className="bg-gradient-to-r from-[#8b1a2a] to-[#b22234] text-[#F8F5F2] text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.18em] px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg shadow-md border border-white/10">
              New In
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-gradient-to-r from-[#d4af37] to-[#b5932d] text-brand-charcoal text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.18em] px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg shadow-md border border-white/20">
              Bestseller
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute right-2 top-2 sm:right-3 sm:top-3 z-10 p-2 sm:p-3 bg-white/95 backdrop-blur-sm rounded-full text-brand-charcoal shadow-sm border border-brand-border/40 hover:bg-[#8b1a2a] hover:text-white hover:border-[#8b1a2a] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
          aria-label="Add to Wishlist"
        >
          <motion.div
            animate={isHovered ? { scale: [1, 1.3, 0.9, 1.15, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <Heart
              size={13}
              className={`${isFavorite ? 'fill-[#d4af37] text-[#d4af37]' : 'text-brand-charcoal'} sm:w-[15px] sm:h-[15px]`}
            />
          </motion.div>
        </button>

        {/* Image */}
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <ImagePlaceholder
            aspectRatio="aspect-[3/4]"
            src={product.images?.[0]}
            alt={product.name}
            imageWidth={400}
            loading="lazy"
            label="Superior Trends"
            subLabel={product.name}
          />
        </Link>

        {/* Quick Add Overlay — desktop hover only */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-md py-5 px-4 hidden md:flex flex-col items-center justify-center space-y-3 z-20 border-t border-brand-border/40 shadow-lg"
            >
              <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-brand-gold">
                {addedSize ? `Added Size ${addedSize}!` : 'Quick Add'}
              </span>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={(e) => handleQuickAdd(e, size)}
                    className="min-w-[2.5rem] h-9 px-2.5 rounded-xl border border-brand-border text-[11px] font-bold text-brand-charcoal hover:bg-[#8b1a2a] hover:text-white hover:border-[#8b1a2a] bg-white transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                    disabled={!!addedSize}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info Section */}
      <div className="mt-2.5 sm:mt-4 flex flex-col flex-1 justify-between">
        <div>
          <span className="text-[9px] sm:text-xs font-bold uppercase tracking-[0.22em] text-[#d4af37] leading-none">
            {product.category}
          </span>
          <h3 className="mt-1 sm:mt-2 font-display text-[12px] sm:text-[15px] md:text-base font-bold text-brand-charcoal line-clamp-2 leading-tight sm:leading-snug hover:text-[#8b1a2a] transition-colors duration-200">
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
        </div>

        {/* Pricing & Rating Summary */}
        <div className="mt-2.5 sm:mt-4 flex items-center justify-between gap-1 sm:gap-2 border-t border-brand-border/30 pt-2 sm:pt-3">
          {/* Price block */}
          <div className="flex flex-col text-left min-w-0 flex-1">
            <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-xs sm:text-base md:text-lg font-extrabold text-[#8b1a2a] whitespace-nowrap">
                {formatINR(product.price)}
              </span>
              {product.mrp && product.mrp > product.price && (
                <span className="text-[9px] sm:text-xs text-brand-text-muted line-through font-medium opacity-65 whitespace-nowrap">
                  {formatINR(product.mrp)}
                </span>
              )}
            </div>
          </div>

          {/* Rating chip — shown for all products (0 if no reviews) */}
          <span className="text-[10px] sm:text-xs text-brand-text-muted font-bold flex items-center gap-0.5 sm:gap-1 bg-brand-cream px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg border border-brand-border/40 shadow-sm flex-shrink-0 whitespace-nowrap">
            <span className={(product.reviews ?? 0) > 0 ? "text-[#d4af37]" : "text-neutral-300"}>★</span>
            <span>{product.rating ?? 0}</span>
            <span className="opacity-50 font-normal hidden sm:inline">({product.reviews ?? 0})</span>
            <span className="opacity-50 font-normal sm:hidden">·{product.reviews ?? 0}</span>
          </span>
        </div>

        {/* Mobile: tap to show sizes */}
        <div className="mt-2.5 sm:mt-3 md:hidden border-t border-brand-border/30 pt-2 sm:pt-3">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMobileSizes((v) => !v);
            }}
            className={`w-full py-2 sm:py-3 rounded-lg sm:rounded-xl border transition-all duration-300 cursor-pointer shadow-sm text-[10px] sm:text-xs font-bold uppercase tracking-widest ${
              showMobileSizes
                ? 'bg-[#8b1a2a] text-white border-[#8b1a2a]'
                : 'bg-white text-[#8b1a2a] border-[#8b1a2a]/20 hover:bg-[#8b1a2a]/5'
            }`}
          >
            {showMobileSizes ? 'Hide Sizes' : 'Quick Add'}
          </button>
          <AnimatePresence>
            {showMobileSizes && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center pt-2.5 pb-1">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={(e) => {
                        handleQuickAdd(e, size);
                        setShowMobileSizes(false);
                      }}
                      className="min-w-[2.4rem] min-h-[2.2rem] sm:min-w-[2.75rem] sm:min-h-[2.75rem] px-2 sm:px-3 border border-brand-border/60 text-[10px] sm:text-xs font-bold uppercase rounded-lg sm:rounded-xl hover:bg-neutral-50 active:bg-[#8b1a2a] active:text-white active:border-[#8b1a2a] transition-all duration-200 cursor-pointer shadow-sm"
                      disabled={!!addedSize}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {addedSize && (
                  <p className="text-center text-[10px] sm:text-xs font-bold text-emerald-600 pt-1">
                    Added size {addedSize}!
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};