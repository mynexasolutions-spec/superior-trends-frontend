import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import type { Product } from '../data/products';
import { useShop } from '../context/ShopContext';
import { ImagePlaceholder } from './ImagePlaceholder';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { formatINR } from '../lib/formatCurrency';
import { useLanguage } from '../context/LanguageContext';
import { translateDynamic } from '../locales/dynamicTranslations';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toggleWishlist, isInWishlist, addToCart } = useShop();
  const { language } = useLanguage();
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
      className="group relative flex flex-col font-display bg-white p-2.5 sm:p-4 border border-[#e8e4dd] rounded-xl sm:rounded-2xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(139,26,42,0.06),0_1px_5px_rgba(0,0,0,0.03)] hover:border-[#d4af37]/40"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Frame */}
      <div className="relative aspect-[3/4.1] w-full overflow-hidden bg-brand-cream border border-brand-border/10 rounded-xl transition-all duration-500 group-hover:rounded-lg">
        {/* Badges */}
        <div className="absolute left-2 top-2 sm:left-3 sm:top-3 z-10 flex flex-col gap-1 sm:gap-1.5 pointer-events-none">
          {product.isNew && (
            <span className="bg-gradient-to-r from-[#8b1a2a] via-[#a82436] to-[#8b1a2a] text-white text-[8px] sm:text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-md border border-white/10">
              {language === 'ar' ? 'وصل حديثاً' : 'New In'}
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-gradient-to-r from-[#d4af37] to-[#b5932d] text-white text-[8px] sm:text-[9.5px] font-black uppercase tracking-widest px-2 py-0.5 sm:px-3 sm:py-1 rounded-md shadow-md border border-white/10">
              {language === 'ar' ? 'الأكثر مبيعاً' : 'Bestseller'}
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
          className="absolute right-2 top-2 sm:right-3 sm:top-3 z-10 p-2 sm:p-2.5 bg-white/90 backdrop-blur-md rounded-full text-brand-charcoal shadow-sm border border-brand-border/40 hover:bg-[#8b1a2a] hover:text-white hover:border-[#8b1a2a] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          aria-label={language === 'ar' ? 'إضافة إلى المفضلة' : 'Add to Wishlist'}
        >
          <motion.div
            animate={isHovered ? { scale: [1, 1.2, 0.95, 1.1, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <Heart
              size={13}
              className={`${isFavorite ? 'fill-[#d4af37] text-[#d4af37]' : 'text-brand-charcoal'} sm:w-[14px] sm:h-[14px]`}
            />
          </motion.div>
        </button>

        {/* Image */}
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <ImagePlaceholder
            aspectRatio="aspect-[3/4.1]"
            src={product.images?.[0]}
            alt={product.name}
            imageWidth={400}
            loading="lazy"
            label="Superior Trends"
            subLabel={product.name}
            className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
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
              className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-md py-4 px-4 hidden md:flex flex-col items-center justify-center space-y-2.5 z-20 border-t border-brand-border/20 shadow-lg"
            >
              <span className="text-[9px] tracking-[0.2em] uppercase font-black text-[#8b1a2a]">
                {addedSize
                  ? (language === 'ar' ? `تم إضافة مقاس ${addedSize}!` : `Added Size ${addedSize}!`)
                  : (language === 'ar' ? 'أضف بسرعة' : 'Quick Add')}
              </span>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={(e) => handleQuickAdd(e, size)}
                    className="min-w-[2.2rem] h-8 px-2 rounded-lg border border-brand-border/60 text-[10px] font-bold text-brand-charcoal hover:bg-[#8b1a2a] hover:text-white hover:border-[#8b1a2a] bg-white transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
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
      <div className="mt-2.5 sm:mt-3.5 flex flex-col flex-1 justify-between">
        <div>
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#d4af37] leading-none">
            {translateDynamic(product.category, language)}
          </span>
          <h3 className="mt-1 sm:mt-1.5 font-display text-[12.5px] sm:text-[14px] font-bold text-brand-charcoal line-clamp-2 leading-snug hover:text-[#8b1a2a] transition-colors duration-200">
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
        </div>

        {/* Pricing & Rating Summary */}
        <div className="mt-2.5 sm:mt-3 flex items-center justify-between gap-1 sm:gap-2 border-t border-brand-border/10 pt-2 sm:pt-2.5">
          {/* Price block */}
          <div className="flex flex-col text-left min-w-0 flex-1">
            <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-xs sm:text-[15px] font-black text-[#8b1a2a] whitespace-nowrap">
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
          <span className="text-[10px] sm:text-xs text-brand-text-muted font-bold flex items-center gap-0.5 sm:gap-1 bg-[#d4af37]/5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg border border-[#d4af37]/25 shadow-sm flex-shrink-0 whitespace-nowrap">
            <span className={(product.reviews ?? 0) > 0 ? "text-[#d4af37]" : "text-neutral-300"}>★</span>
            <span className="text-[#1a0e10]">{product.rating ?? 0}</span>
            <span className="opacity-50 font-normal hidden sm:inline text-brand-text-muted">({product.reviews ?? 0})</span>
            <span className="opacity-50 font-normal sm:hidden text-brand-text-muted">·{product.reviews ?? 0}</span>
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
            className={`w-full py-2 sm:py-3 rounded-lg sm:rounded-xl border transition-all duration-300 cursor-pointer shadow-sm text-[10px] sm:text-xs font-bold uppercase tracking-widest ${showMobileSizes
                ? 'bg-[#8b1a2a] text-white border-[#8b1a2a]'
                : 'bg-white text-[#8b1a2a] border-[#8b1a2a]/20 hover:bg-[#8b1a2a]/5'
              }`}
          >
            {showMobileSizes
              ? (language === 'ar' ? 'إخفاء المقاسات' : 'Hide Sizes')
              : (language === 'ar' ? 'أضف بسرعة' : 'Quick Add')}
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
                    {language === 'ar' ? `تم إضافة مقاس ${addedSize}!` : `Added size ${addedSize}!`}
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