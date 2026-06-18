import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  Heart,
  Plus,
  Minus,
  ChevronDown,
  ShieldCheck,
  RefreshCw,
  Truck,
  Star,
  ZoomIn,
  ArrowLeft,
  Sparkles,
  BadgeCheck,
  Package,
  ChevronLeft,
  ChevronRight,
  Camera,
  X,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useShop } from '../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { useProduct, useProducts } from '../hooks/useProducts';
import { useProductReviews, useCreateReview, useMyReviewStatus } from '../hooks/useReviews';
import { useAuthStore } from '../store/useAuthStore';
import { uploadImage } from '../lib/api';
import { CustomerReviewsCarousel, resolveReviewItems } from '../components/product/ProductReviews';
import { ProductDetailSkeleton, Skeleton } from '../components/ui/skeleton';
import { formatINR } from '../lib/formatCurrency';
import { useToast } from '../hooks/useToast';
import { useLanguage } from '../context/LanguageContext';
import { translateDynamic } from '../locales/dynamicTranslations';

/* ─── helpers ──────────────────────────────────────────────────────── */
function pct(price: number, mrp: number) {
  return Math.round(((mrp - price) / mrp) * 100);
}

/* ─── Component ─────────────────────────────────────────────────────── */
export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, toggleWishlist, isInWishlist } = useShop();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const { data: product, isLoading, isError } = useProduct(id);
  const { data: apiReviews, isLoading: reviewsLoading } = useProductReviews(id);
  const { data: myReviewStatus } = useMyReviewStatus(id);
  const { data: allProducts } = useProducts({ limit: 200 });

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<'desc' | 'care' | 'shipping' | null>('desc');
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated } = useAuthStore();
  const createReviewMutation = useCreateReview(id);

  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [searchParams] = useSearchParams();
  const writeReviewParam = searchParams.get('writeReview');

  useEffect(() => {
    if (writeReviewParam === 'true' && isAuthenticated) {
      setIsReviewFormOpen(true);
      setSubmitSuccess(false);
      setTimeout(() => {
        const el = document.getElementById('review-form-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [writeReviewParam, isAuthenticated]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadImage(file);
        if (res && res.url) {
          urls.push(res.url);
        }
      }
      setReviewImages((prev) => [...prev, ...urls]);
      showToast(language === 'ar' ? 'تم رفع الصور بنجاح ✦' : 'Image(s) uploaded successfully ✦', 'success');
    } catch (err) {
      console.error(err);
      showToast(language === 'ar' ? 'فشل رفع الصور.' : 'Failed to upload image.', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeUploadedImage = (index: number) => {
    setReviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast(language === 'ar' ? 'يرجى تسجيل الدخول لكتابة مراجعة.' : 'Please sign in to write a review.', 'error');
      return;
    }
    if (reviewRating < 1 || reviewRating > 5) {
      showToast(language === 'ar' ? 'يرجى تحديد التقييم.' : 'Please select a rating.', 'error');
      return;
    }
    if (!reviewBody.trim()) {
      showToast(language === 'ar' ? 'يرجى كتابة تعليق المراجعة.' : 'Please write a review comment.', 'error');
      return;
    }

    try {
      await createReviewMutation.mutateAsync({
        productId: id!,
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        review: reviewBody.trim(),
        images: reviewImages.length > 0 ? reviewImages : null,
      });

      showToast(language === 'ar' ? 'تم تقديم المراجعة بنجاح بانتظار المراجعة ✦' : 'Review submitted successfully for moderation ✦', 'success');
      setSubmitSuccess(true);
      setIsReviewFormOpen(false);
      // Reset form
      setReviewRating(5);
      setReviewTitle('');
      setReviewBody('');
      setReviewImages([]);
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || (language === 'ar' ? 'فشل إرسال المراجعة.' : 'Failed to submit review.'), 'error');
    }
  };

  const reviewItems = useMemo(() => resolveReviewItems(apiReviews), [apiReviews]);

  const avgRating = useMemo(() => {
    if (reviewItems.length === 0) return 0;
    const sum = reviewItems.reduce((s, r) => s + r.stars, 0);
    return Math.round((sum / reviewItems.length) * 10) / 10;
  }, [reviewItems]);

  const starBreakdown = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (reviewItems.length === 0) {
      return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, total: 0 };
    }
    let validCount = 0;
    reviewItems.forEach((r) => {
      const stars = Math.round(r.stars) as 5 | 4 | 3 | 2 | 1;
      if (counts[stars] !== undefined) {
        counts[stars]++;
        validCount++;
      }
    });
    const total = validCount || 1;
    return {
      5: Math.round((counts[5] / total) * 100),
      4: Math.round((counts[4] / total) * 100),
      3: Math.round((counts[3] / total) * 100),
      2: Math.round((counts[2] / total) * 100),
      1: Math.round((counts[1] / total) * 100),
      total: reviewItems.length,
    };
  }, [reviewItems]);

  const recommendations = useMemo(() => {
    if (!product) return [];
    const others = (allProducts ?? []).filter((p) => p.id !== product.id);
    const sameCategory = others.filter((p) => p.category === product.category);
    const pool = sameCategory.length >= 2 ? sameCategory : others;
    return pool.slice(0, 4);
  }, [allProducts, product]);

  useEffect(() => {
    if (product) {
      setActiveImageIdx(0);
      setSelectedSize('');
      setSelectedColor(null);
      setQuantity(1);
      setSizeError(false);
      setColorError(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product]);

  /* scroll active thumb into view */
  useEffect(() => {
    if (!thumbsRef.current) return;
    const btn = thumbsRef.current.children[activeImageIdx] as HTMLElement | undefined;
    btn?.scrollIntoView({ inline: 'nearest', behavior: 'smooth' });
  }, [activeImageIdx]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - left) / width) * 100,
      y: ((e.clientY - top) / height) * 100,
    });
  };

  const prevImage = useCallback(() => {
    if (!product) return;
    setActiveImageIdx((i) => (i === 0 ? product.images.length - 1 : i - 1));
  }, [product]);

  const nextImage = useCallback(() => {
    if (!product) return;
    setActiveImageIdx((i) => (i === product.images.length - 1 ? 0 : i + 1));
  }, [product]);

  if (isLoading) return <ProductDetailSkeleton />;

  if (isError || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-4 font-display text-center">
        <div className="w-16 h-16 rounded-full bg-[#8b1a2a]/10 flex items-center justify-center">
          <Package size={28} className="text-[#8b1a2a]" />
        </div>
        <h2 className="font-display text-2xl text-brand-charcoal font-extrabold uppercase tracking-tight">
          {language === 'ar' ? 'لم يتم العثور على المنتج' : 'Product Not Found'}
        </h2>
        <p className="text-sm text-brand-text-muted max-w-xs text-center">
          {language === 'ar' ? 'هذا المنتج لم يعد متوفراً في كتالوجنا. تصفح مجموعتنا الكاملة أدناه.' : 'This item is no longer in our catalog. Browse our full collection below.'}
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-[#8b1a2a] text-white hover:bg-[#6b1420] px-8 py-3 text-xs tracking-widest uppercase font-bold rounded-full shadow-lg transition-all"
        >
          <ArrowLeft size={14} className="rtl:rotate-180" />
          {language === 'ar' ? 'العودة إلى المتجر' : 'Return to Shop'}
        </Link>
      </div>
    );
  }

  const isFavorite = isInWishlist(product.id);
  const displaySizes = product.sizes?.length > 0 ? product.sizes : ['S', 'M', 'L'];
  const mrp = product.mrp && product.mrp > product.price ? product.mrp : null;
  const discount = mrp ? pct(product.price, mrp) : null;
  const hasMultipleImages = product.images.length > 1;

  const handleAddToCart = () => {
    const missingSize = !selectedSize;
    const missingColor = !selectedColor;
    if (missingSize || missingColor) {
      setSizeError(missingSize);
      setColorError(missingColor);
      showToast(
        missingSize && missingColor
          ? (language === 'ar' ? 'يرجى اختيار المقاس واللون.' : 'Please select a size and colour.')
          : missingSize
            ? (language === 'ar' ? 'يرجى اختيار المقاس.' : 'Please select a size.')
            : (language === 'ar' ? 'يرجى اختيار اللون.' : 'Please select a colour.'),
        'error',
      );
      document.getElementById('size-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSizeError(false);
    setColorError(false);
    addToCart(product, quantity, selectedSize, selectedColor, { mode: 'set' });
    showToast(language === 'ar' ? 'تمت الإضافة إلى السلة ✦' : 'Added to your basket ✦', 'success');
  };

  const toggleAccordion = (section: 'desc' | 'care' | 'shipping') =>
    setActiveAccordion((prev) => (prev === section ? null : section));

  return (
    <div className="w-full bg-brand-cream min-h-screen font-display">

      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3">
        <nav className="flex items-center gap-1.5 text-[10px] sm:text-xs uppercase tracking-widest text-brand-text-muted font-semibold">
          <Link to="/" className="hover:text-[#8b1a2a] transition-colors">{language === 'ar' ? 'الرئيسية' : 'Home'}</Link>
          <span className="text-[#d4af37] text-[8px] rtl:rotate-180">▸</span>
          <Link to="/shop" className="hover:text-[#8b1a2a] transition-colors">{language === 'ar' ? 'المتجر' : 'Shop'}</Link>
          <span className="text-[#d4af37] text-[8px] rtl:rotate-180">▸</span>
          <span className="text-brand-charcoal truncate max-w-[140px] sm:max-w-xs">{product.name}</span>
        </nav>
      </div>

      {/* ── Hero Grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* ══════════════════════════════════════
              LEFT: Image Gallery — redesigned
          ══════════════════════════════════════ */}
          <div className="flex flex-col gap-4">

            {/* ── Main Image ── */}
            <div className="relative rounded-3xl overflow-hidden bg-white shadow-xl shadow-black/8 group">

              {/* Discount badge */}
              {discount && (
                <div className="absolute top-4 left-4 z-20">
                  <span className="bg-[#8b1a2a] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg shadow-[#8b1a2a]/40">
                    {language === 'ar' ? `خصم −${discount}%` : `−${discount}% OFF`}
                  </span>
                </div>
              )}

              {/* Image counter pill */}
              {hasMultipleImages && (
                <div className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full tabular-nums">
                  {activeImageIdx + 1} / {product.images.length}
                </div>
              )}

              {/* Wishlist btn */}
              <motion.button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                whileTap={{ scale: 0.88 }}
                className="absolute bottom-4 right-4 z-20 w-11 h-11 rounded-full bg-white/95 backdrop-blur-sm shadow-lg border border-white/60 flex items-center justify-center hover:scale-110 transition-transform"
                aria-label="Wishlist"
              >
                <Heart
                  size={18}
                  className={isFavorite ? 'fill-[#d4af37] text-[#d4af37]' : 'text-brand-charcoal'}
                />
              </motion.button>

              {/* Prev / Next arrows — only when multiple images */}
              {hasMultipleImages && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md border border-white/60 flex items-center justify-center text-brand-charcoal hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    aria-label="Next image"
                    className="absolute right-14 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md border border-white/60 flex items-center justify-center text-brand-charcoal hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight size={16} strokeWidth={2.5} />
                  </button>
                </>
              )}

              {/* Zoom area */}
              <div
                ref={imageRef}
                className="relative overflow-hidden cursor-zoom-in"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImageIdx}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <div
                      className="transition-transform duration-200 ease-out"
                      style={
                        isZoomed
                          ? { transform: 'scale(1.12)', transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                          : undefined
                      }
                    >
                      <ImagePlaceholder
                        aspectRatio="aspect-[4/5]"
                        src={product.images[activeImageIdx]}
                        alt={product.name}
                        clean
                        loading="eager"
                        fetchPriority="high"
                        imageWidth={720}
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Zoom hint */}
                <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white text-[9px] font-semibold px-2.5 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <ZoomIn size={10} />
                  {language === 'ar' ? 'مرر للتكبير' : 'Hover to zoom'}
                </div>
              </div>
            </div>

            {/* ── Thumbnail Strip (below main image) ── */}
            {hasMultipleImages && (
              <div
                ref={thumbsRef}
                className="flex gap-2.5 overflow-x-auto pb-0.5 scrollbar-none snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none' }}
              >
                {product.images.map((img, idx) => (
                  <motion.button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.94 }}
                    className={`
                      relative shrink-0 snap-start rounded-2xl overflow-hidden transition-all duration-200
                      w-[72px] sm:w-[84px] aspect-[4/5]
                      ${activeImageIdx === idx
                        ? 'ring-2 ring-[#d4af37] ring-offset-2 ring-offset-brand-cream opacity-100 shadow-md shadow-[#d4af37]/20'
                        : 'ring-1 ring-brand-border/30 opacity-50 hover:opacity-80 hover:ring-brand-border/60'
                      }
                    `}
                    aria-label={`View image ${idx + 1}`}
                    aria-pressed={activeImageIdx === idx}
                  >
                    <ImagePlaceholder
                      aspectRatio="aspect-[4/5]"
                      src={img}
                      alt={`${product.name} — view ${idx + 1}`}
                      clean
                      imageWidth={160}
                    />
                    {/* Active overlay shimmer */}
                    {activeImageIdx === idx && (
                      <div className="absolute inset-0 bg-[#d4af37]/10 rounded-2xl" />
                    )}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Dot indicators — for many images on mobile */}
            {hasMultipleImages && product.images.length <= 8 && (
              <div className="flex items-center justify-center gap-1.5 sm:hidden">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`rounded-full transition-all duration-200 ${activeImageIdx === idx
                      ? 'w-5 h-1.5 bg-[#8b1a2a]'
                      : 'w-1.5 h-1.5 bg-brand-border/50 hover:bg-brand-border'
                      }`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Trust strip — desktop */}
            <div className="hidden lg:grid grid-cols-3 gap-3 mt-1">
              {[
                { icon: Truck, label: language === 'ar' ? 'شحن مجاني' : 'Free Shipping', sub: language === 'ar' ? 'للطلبات فوق OMR 50' : 'Orders above OMR 50' },
                { icon: RefreshCw, label: language === 'ar' ? 'إرجاع خلال ٧ أيام' : '7-Day Returns', sub: language === 'ar' ? 'سياسة إرجاع سهلة' : 'Hassle-free policy' },
                { icon: ShieldCheck, label: language === 'ar' ? 'دفع آمن ١٠٠٪' : 'Secure Payment', sub: language === 'ar' ? 'مشفر بالكامل' : '100% encrypted' },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 text-center p-3.5 rounded-2xl bg-white border border-brand-border/20 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
                    <Icon size={15} className="text-[#d4af37]" />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wide text-brand-charcoal leading-tight">{label}</span>
                  <span className="text-[10px] text-brand-text-muted">{sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ══════════════════════════════════════
              RIGHT: Product Info
          ══════════════════════════════════════ */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1 scrollbar-thin">

            {/* Category + Name */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#d4af37] font-extrabold">
                  {translateDynamic(product.category, language)}
                </span>
                <span className="w-1 h-1 rounded-full bg-[#d4af37]" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-brand-text-muted font-semibold flex items-center gap-1">
                  <Sparkles size={9} className="text-[#d4af37]" />
                  {language === 'ar' ? 'وصل حديثاً' : 'New Arrival'}
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl xl:text-4xl font-extrabold text-brand-charcoal uppercase leading-tight tracking-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating row */}
            <div className="flex items-center gap-3 flex-wrap">
              {reviewItems.length > 0 ? (
                <div className="flex items-center gap-1.5 bg-[#d4af37]/10 border border-[#d4af37]/30 px-3 py-1.5 rounded-full">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < Math.round(avgRating) ? 'fill-[#d4af37] text-[#d4af37]' : 'text-neutral-300'}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-black text-brand-charcoal">{avgRating}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-neutral-100 border border-neutral-200 px-3 py-1.5 rounded-full">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className="text-neutral-300" />
                  ))}
                </div>
              )}
              <span className="text-xs text-brand-text-muted">
                <span className="font-bold text-brand-charcoal">{reviewItems.length}</span>{' '}
                {reviewItems.length === 1 
                  ? (language === 'ar' ? 'تقييم' : 'review') 
                  : (language === 'ar' ? 'تقييمات' : 'reviews')
                }
              </span>
              {product.stock !== undefined && product.stock <= 10 && product.stock > 0 && (
                <span className="text-[10px] font-black uppercase tracking-widest text-[#8b1a2a] bg-[#8b1a2a]/8 px-2.5 py-1 rounded-full animate-pulse">
                  {language === 'ar' ? `تبقت ${product.stock} قطع فقط!` : `Only ${product.stock} left!`}
                </span>
              )}
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-display text-3xl sm:text-4xl font-black text-[#8b1a2a] tracking-tight">
                {formatINR(product.price)}
              </span>
              {mrp && (
                <>
                  <span className="text-lg text-neutral-400 line-through font-medium">
                    {formatINR(mrp)}
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-2.5 py-1 rounded-full border border-emerald-200">
                    {language === 'ar' ? `وفر ${formatINR(mrp - product.price)}` : `Save ${formatINR(mrp - product.price)}`}
                  </span>
                </>
              )}
            </div>

            {/* Short description */}
            <p className="text-sm sm:text-[15px] text-brand-text-muted leading-relaxed border-l-2 border-[#d4af37] pl-3.5 rtl:pl-0 rtl:pr-3.5 rtl:border-l-0 rtl:border-r-2 text-left rtl:text-right">
              {product.description}
            </p>

            <div className="h-px bg-gradient-to-r from-[#d4af37]/40 via-[#8b1a2a]/20 to-transparent" />

            {/* Color Selector */}
            <div className="space-y-3 text-left rtl:text-right" id="color-selector">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] font-extrabold text-brand-charcoal">
                  {language === 'ar' ? 'اللون' : 'Colour'}
                  {selectedColor && (
                    <span className="text-[#d4af37] font-semibold ml-2 rtl:ml-0 rtl:mr-2 normal-case tracking-normal">
                      · {translateDynamic(selectedColor.name, language)}
                    </span>
                  )}
                </span>
                {colorError && (
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-wide animate-pulse whitespace-nowrap">
                    {language === 'ar' ? 'مطلوب ←' : 'Required ←'}
                  </span>
                )}
              </div>
              <div className={`flex flex-wrap gap-2 p-2.5 rounded-xl ${colorError ? 'border-2 border-red-300' : ''}`}>
                {product.colors.map((color) => (
                  <motion.button
                    key={color.name}
                    type="button"
                    onClick={() => { setSelectedColor(color); setColorError(false); }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={translateDynamic(color.name, language)}
                    className={`relative w-10 h-10 rounded-full p-1 transition-all shadow-sm m-1 ${selectedColor?.name === color.name
                      ? 'shadow-[#d4af37]/50 shadow-md'
                      : ''
                      }`}
                  >
                    <span
                      className="block w-full h-full rounded-full border border-black/10"
                      style={{ backgroundColor: color.hex }}
                    />
                    {selectedColor?.name === color.name && (
                      <motion.span
                        layoutId="color-ring"
                        className="absolute -inset-1 rounded-full ring-2 ring-[#d4af37]"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div id="size-selector" className="space-y-3 scroll-mt-24 text-left rtl:text-right">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] font-extrabold text-brand-charcoal">
                  {language === 'ar' ? 'المقاس' : 'Size'}
                  {selectedSize && (
                    <span className="text-[#d4af37] font-semibold ml-2 rtl:ml-0 rtl:mr-2 normal-case tracking-normal">
                      · {selectedSize}
                    </span>
                  )}
                </span>
                {sizeError && (
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-wide animate-pulse">
                    {language === 'ar' ? 'مطلوب ←' : 'Required ←'}
                  </span>
                )}
              </div>
              <div className={`flex flex-wrap gap-2 p-2 rounded-xl ${sizeError ? 'border-2 border-red-300' : ''}`}>
                {displaySizes.map((size) => (
                  <motion.button
                    key={size}
                    type="button"
                    onClick={() => { setSelectedSize(size); setSizeError(false); }}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative min-w-[3rem] h-12 px-4 rounded-xl border-2 text-sm font-extrabold uppercase tracking-wide transition-all ${selectedSize === size
                      ? 'border-[#8b1a2a] bg-[#8b1a2a] text-white shadow-lg shadow-[#8b1a2a]/30'
                      : 'border-brand-border/50 bg-white text-brand-charcoal hover:border-[#8b1a2a]/60 hover:bg-[#8b1a2a]/5'
                      }`}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 text-left rtl:text-right">
              <span className="text-xs uppercase tracking-[0.2em] font-extrabold text-brand-charcoal w-8">
                {language === 'ar' ? 'الكمية' : 'Qty'}
              </span>
              <div className="flex items-center border-2 border-brand-border/40 rounded-xl bg-white overflow-hidden shadow-sm">
                <motion.button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  whileTap={{ scale: 0.85 }}
                  className="w-11 h-11 flex items-center justify-center text-brand-charcoal hover:bg-[#8b1a2a]/5 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus size={14} strokeWidth={2.5} />
                </motion.button>
                <span className="w-12 text-center text-sm font-extrabold text-brand-charcoal select-none">
                  {quantity}
                </span>
                <motion.button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  whileTap={{ scale: 0.85 }}
                  className="w-11 h-11 flex items-center justify-center text-brand-charcoal hover:bg-[#8b1a2a]/5 transition-colors"
                >
                  <Plus size={14} strokeWidth={2.5} />
                </motion.button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 pt-1">
              <motion.button
                type="button"
                onClick={handleAddToCart}
                whileHover={{ scale: 1.015, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 relative overflow-hidden bg-[#8b1a2a] text-white py-4 text-sm font-extrabold uppercase tracking-widest rounded-2xl shadow-lg shadow-[#8b1a2a]/25 transition-all hover:shadow-[#8b1a2a]/40 hover:shadow-xl cursor-pointer"
              >
                <span className="relative z-10">{language === 'ar' ? 'أضف إلى السلة' : 'Add to Cart'}</span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
              </motion.button>

              <motion.button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.92 }}
                className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all shadow-sm cursor-pointer ${isFavorite
                  ? 'border-[#d4af37] bg-[#d4af37]/10 shadow-[#d4af37]/20'
                  : 'border-brand-border/50 bg-white hover:border-[#d4af37]/60'
                  }`}
                aria-label={isFavorite 
                  ? (language === 'ar' ? 'إزالة من المفضلة' : 'Remove from wishlist') 
                  : (language === 'ar' ? 'إضافة إلى المفضلة' : 'Add to wishlist')
                }
              >
                <Heart
                  size={20}
                  className={isFavorite ? 'fill-[#d4af37] text-[#d4af37]' : 'text-brand-charcoal'}
                />
              </motion.button>
            </div>

            {/* Trust strip — mobile */}
            <div className="grid grid-cols-3 gap-2 lg:hidden mt-1">
              {[
                { icon: Truck, label: language === 'ar' ? 'شحن مجاني' : 'Free Shipping', sub: language === 'ar' ? 'OMR 50+' : 'OMR 50+' },
                { icon: RefreshCw, label: language === 'ar' ? 'إرجاع ٧ أيام' : '7-Day Returns', sub: language === 'ar' ? 'سهل ومرن' : 'Easy policy' },
                { icon: ShieldCheck, label: language === 'ar' ? 'دفع آمن' : 'Secure Pay', sub: language === 'ar' ? 'مشفر' : 'Encrypted' },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 text-center p-2.5 rounded-xl bg-white border border-brand-border/20 shadow-sm"
                >
                  <Icon size={14} className="text-[#d4af37]" />
                  <span className="text-[9px] font-extrabold uppercase tracking-wide text-brand-charcoal leading-tight">{label}</span>
                  <span className="text-[9px] text-brand-text-muted">{sub}</span>
                </div>
              ))}
            </div>

            {/* Badge row */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-left rtl:text-right">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#8b1a2a] bg-[#8b1a2a]/6 px-3 py-1.5 rounded-full border border-[#8b1a2a]/15">
                <BadgeCheck size={12} />
                {language === 'ar' ? 'منتج أصلي ١٠٠٪' : 'Authentic Product'}
              </span>
              {product.sku && (
                <span className="text-[10px] text-brand-text-muted font-mono bg-neutral-100 px-2.5 py-1 rounded-full">
                  SKU: {product.sku}
                </span>
              )}
              {product.stock !== undefined && product.stock > 0 && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {language === 'ar' ? `متوفر · ${product.stock} قطعة` : `In Stock · ${product.stock} units`}
                </span>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── Product Details + Accordion ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">

          {/* Specs */}
          <div className="lg:col-span-2 rounded-3xl border border-brand-border/25 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 bg-[#8b1a2a] rounded-full" />
              <h2 className="font-display font-extrabold text-base sm:text-lg text-brand-charcoal uppercase tracking-tight">
                {language === 'ar' ? 'مواصفات المنتج' : 'Product Specs'}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-5 text-left rtl:text-right">
              {[
                product.sku && { label: language === 'ar' ? 'رمز المنتج' : 'SKU', value: product.sku, mono: true },
                { label: language === 'ar' ? 'الفئة' : 'Category', value: translateDynamic(product.category, language) },
                product.stock !== undefined && {
                  label: language === 'ar' ? 'التوفر' : 'Availability',
                  value: product.stock > 0 
                    ? (language === 'ar' ? `متوفر في المخزون (${product.stock})` : `${product.stock} in stock`) 
                    : (language === 'ar' ? 'نفذت الكمية' : 'Out of stock'),
                  color: product.stock > 0 ? 'text-emerald-600' : 'text-red-500',
                },
                { label: language === 'ar' ? 'المقاسات المتاحة' : 'Sizes', value: displaySizes.join(', ') },
              ]
                .filter(Boolean)
                .map((item: any) => (
                  <div key={item.label}>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 font-extrabold mb-1">
                      {item.label}
                    </p>
                    <p className={`text-sm font-bold capitalize ${item.mono ? 'font-mono text-xs' : ''} ${item.color ?? 'text-brand-charcoal'}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
            </div>

            {product.details.filter(Boolean).length > 0 && (
              <div className="mt-5 pt-4 border-t border-neutral-100 space-y-2.5 text-left rtl:text-right">
                {product.details.filter(Boolean).map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-brand-text-muted">
                    <span className="text-[#d4af37] mt-0.5 shrink-0 text-xs">✦</span>
                    {detail}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Accordions */}
          <div className="lg:col-span-3 rounded-3xl border border-brand-border/25 bg-white p-6 shadow-sm space-y-1">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 bg-[#d4af37] rounded-full" />
              <h2 className="font-display font-extrabold text-base sm:text-lg text-brand-charcoal uppercase tracking-tight">
                {language === 'ar' ? 'مزيد من المعلومات' : 'More Information'}
              </h2>
            </div>
            {(
              [
                { 
                  key: 'desc' as const, 
                  label: language === 'ar' ? 'الوصف' : 'Description', 
                  content: product.description 
                },
                { 
                  key: 'care' as const, 
                  label: language === 'ar' ? 'تعليمات العناية' : 'Care Instructions', 
                  content: language === 'ar' 
                    ? 'يُغسل يدوياً بماء بارد وبمنظف لطيف. لا تستخدم المبيض. يُجفف بشكل مسطح بعيداً عن أشعة الشمس المباشرة. يُكوى على درجة حرارة منخفضة إذا لزم الأمر.' 
                    : 'Hand wash cold in mild detergent. Do not bleach. Air dry flat away from direct sunlight. Iron on low heat if needed.' 
                },
                { 
                  key: 'shipping' as const, 
                  label: language === 'ar' ? 'الشحن والمرتجعات' : 'Shipping & Returns', 
                  content: language === 'ar' 
                    ? 'شحن مجاني للطلبات التي تزيد عن OMR 50. التوصيل القياسي في غضون ٣-٥ أيام عمل. التوصيل السريع متاح عند الدفع. إرجاع سهل خلال ٧ أيام للملابس غير الملبوسة مع إبقاء البطاقات الأصلية.' 
                    : 'Free shipping on orders above OMR 50. Standard delivery in 3–5 business days. Express delivery available at checkout. Easy 7-day returns for unworn items with tags.' 
                },
              ] as const
            ).map(({ key, label, content }) => (
              <div key={key} className="border-b border-neutral-100 last:border-0 text-left rtl:text-right">
                <button
                  type="button"
                  onClick={() => toggleAccordion(key)}
                  className="w-full flex items-center justify-between py-4 text-left rtl:text-right group/acc"
                >
                  <span className="text-xs sm:text-sm uppercase tracking-widest font-extrabold text-brand-charcoal group-hover/acc:text-[#8b1a2a] transition-colors">
                    {label}
                  </span>
                  <motion.div
                    animate={{ rotate: activeAccordion === key ? 180 : 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    <ChevronDown
                      size={15}
                      className={activeAccordion === key ? 'text-[#d4af37]' : 'text-neutral-400'}
                    />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {activeAccordion === key && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-brand-text-muted leading-relaxed pb-4">
                        {content}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Customer Reviews ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6 overflow-hidden">
        <div className="text-center mb-10">
          <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#8b1a2a] font-extrabold">
            {language === 'ar' ? 'آراء العملاء' : 'Customer Feedback'}
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-charcoal mt-1.5 uppercase tracking-tight">
            {language === 'ar' ? 'ماذا يقولون' : 'What They Say'}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="h-px w-12 bg-[#d4af37]/60" />
            <span className="text-[#d4af37] text-xs">✦</span>
            <div className="h-px w-12 bg-[#d4af37]/60" />
          </div>
        </div>

        {/* Breakdown Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12 bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/20 shadow-sm max-w-5xl mx-auto">
          {/* Rating aggregate summary */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left rtl:text-right gap-4 lg:pr-8 lg:border-r rtl:lg:border-r-0 rtl:lg:border-l border-neutral-100 w-full">
            <h3 className="text-xs uppercase tracking-widest font-extrabold text-brand-charcoal">
              {language === 'ar' ? 'التقييم العام' : 'Overall Rating'}
            </h3>
            <div className="flex items-baseline gap-2.5">
              <span className="text-5xl sm:text-6xl font-black text-brand-charcoal leading-none">
                {starBreakdown.total > 0 ? avgRating : '—'}
              </span>
              {starBreakdown.total > 0 && <span className="text-sm text-neutral-400 font-bold">/ 5</span>}
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  className={starBreakdown.total > 0 && i < Math.round(avgRating) ? 'fill-[#d4af37] text-[#d4af37]' : 'text-neutral-200'}
                />
              ))}
            </div>
            <p className="text-xs text-brand-text-muted">
              {starBreakdown.total > 0
                ? (language === 'ar' 
                    ? <>بناءً على <span className="font-bold text-brand-charcoal">{starBreakdown.total}</span> تقييمات موثقة</>
                    : <>Based on <span className="font-bold text-brand-charcoal">{starBreakdown.total}</span> verified reviews</>
                  )
                : (language === 'ar' ? 'لا توجد تقييمات بعد — كن أول من يكتب تقييماً!' : 'No reviews yet — be the first!')}
            </p>

            {/* Write Review CTA — smart state */}
            {isAuthenticated && myReviewStatus?.hasReviewed ? (
              // Already reviewed
              <div className="mt-2 w-full text-left rtl:text-right">
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-2.5 rounded-xl">
                  <BadgeCheck size={14} className="text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-extrabold uppercase tracking-wide">{language === 'ar' ? 'تم تقديم المراجعة' : 'Review Submitted'}</p>
                    <p className="text-emerald-700/80 font-normal normal-case tracking-normal">
                      {myReviewStatus.existingReview?.status === 'APPROVED'
                        ? (language === 'ar' ? 'تقييمك منشور الآن.' : 'Your review is live.')
                        : (language === 'ar' ? 'بانتظار موافقة الإدارة.' : 'Pending moderation approval.')}
                    </p>
                  </div>
                </div>
                {/* Show their submitted rating */}
                {myReviewStatus.existingReview && (
                  <div className="mt-2.5 pl-1 space-y-1.5 bg-white border border-brand-border/20 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">{language === 'ar' ? 'تقييمك:' : 'Your rating:'}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < (myReviewStatus.existingReview?.rating ?? 0) ? 'fill-[#d4af37] text-[#d4af37]' : 'text-neutral-200'}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-black text-brand-charcoal">{myReviewStatus.existingReview.rating}/5</span>
                    </div>
                    {myReviewStatus.existingReview.title && (
                      <p className="text-xs font-extrabold text-brand-charcoal mt-1">
                        {myReviewStatus.existingReview.title}
                      </p>
                    )}
                    {myReviewStatus.existingReview.review && (
                      <p className="text-xs text-brand-text-muted italic leading-relaxed">
                        "{myReviewStatus.existingReview.review}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : isAuthenticated && myReviewStatus && !myReviewStatus.isEligible ? (
              // Logged in but no delivered order
              <div className="mt-2 w-full">
                <div className="flex items-start gap-2 bg-neutral-50 border border-neutral-200 text-neutral-600 text-xs px-4 py-2.5 rounded-xl text-left rtl:text-right">
                  <Package size={13} className="shrink-0 mt-0.5 text-neutral-400" />
                  <p className="leading-relaxed">
                    {language === 'ar' 
                      ? <>فقط العملاء الذين لديهم <span className="font-bold text-neutral-800">طلب تم تسليمه</span> يمكنهم كتابة مراجعة.</>
                      : <>Only customers with a <span className="font-bold text-neutral-800">delivered order</span> can leave a review.</>}
                  </p>
                </div>
              </div>
            ) : (
              // Not reviewed yet (eligible or not logged in)
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    showToast(language === 'ar' ? 'يرجى تسجيل الدخول لكتابة مراجعة.' : 'Please sign in to write a review.', 'error');
                    return;
                  }
                  setIsReviewFormOpen((prev) => !prev);
                  setSubmitSuccess(false);
                }}
                className="mt-2 w-full lg:w-auto inline-flex items-center justify-center bg-[#8b1a2a] text-white hover:bg-[#701420] text-xs font-extrabold uppercase tracking-widest px-6 py-3 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                {language === 'ar' ? 'اكتب مراجعة' : 'Write A Review'}
              </button>
            )}
          </div>

          {/* Star breakdown details */}
          <div className="lg:col-span-8 w-full flex flex-col gap-3">
            <h3 className="text-xs uppercase tracking-widest font-extrabold text-brand-charcoal text-center lg:text-left rtl:lg:text-right mb-1">
              {language === 'ar' ? 'توزيع التقييمات' : 'Rating Distribution'}
            </h3>
            {([5, 4, 3, 2, 1] as const).map((stars) => {
              const pctValue = starBreakdown[stars] || 0;
              return (
                <div key={stars} className="flex items-center gap-3 w-full">
                  <span className="text-xs font-bold text-brand-charcoal min-w-[2.5rem] flex items-center gap-1 justify-end">
                    {stars} <Star size={11} className="fill-[#d4af37] text-[#d4af37]" />
                  </span>
                  <div className="flex-1 h-3 rounded-full bg-neutral-100 overflow-hidden border border-neutral-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pctValue}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-[#d4af37] to-[#bca030] rounded-full"
                    />
                  </div>
                  <span className="text-xs text-brand-text-muted min-w-[2.5rem] font-bold text-right">
                    {pctValue}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Review Form collapse panel */}
        <div id="review-form-section">
          <AnimatePresence>
            {isReviewFormOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="overflow-hidden max-w-xl mx-auto mb-10"
              >
                <form
                  onSubmit={handleReviewSubmit}
                  className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#8b1a2a]/20 shadow-lg space-y-5 text-left rtl:text-right"
                >
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-brand-charcoal">
                      {language === 'ar' ? 'اكتب مراجعتك' : 'Write Your Review'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsReviewFormOpen(false)}
                      className="p-1 rounded-full text-neutral-400 hover:text-brand-charcoal hover:bg-neutral-100 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Stars selector */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
                      {language === 'ar' ? 'تقييمك *' : 'Your Rating *'}
                    </label>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const ratingVal = i + 1;
                        const active = ratingVal <= (reviewHoverRating || reviewRating);
                        return (
                          <button
                            key={i}
                            type="button"
                            onMouseEnter={() => setReviewHoverRating(ratingVal)}
                            onMouseLeave={() => setReviewHoverRating(0)}
                            onClick={() => setReviewRating(ratingVal)}
                            className="p-1 -ml-1 transition-transform hover:scale-110 cursor-pointer"
                          >
                            <Star
                              size={28}
                              className={`transition-colors ${active ? 'fill-[#d4af37] text-[#d4af37]' : 'text-neutral-200'}`}
                            />
                          </button>
                        );
                      })}
                      <span className="text-xs font-black text-brand-charcoal ml-2 rtl:ml-0 rtl:mr-2">
                        {reviewRating} {reviewRating === 1 
                          ? (language === 'ar' ? 'نجمة' : 'Star') 
                          : (language === 'ar' ? 'نجوم' : 'Stars')
                        }
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
                      {language === 'ar' ? 'عنوان المراجعة (اختياري)' : 'Review Title (Optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'ar' ? 'مثال: قماش ناعم، يناسب تماماً!' : 'Example: Soft fabric, fits perfectly!'}
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-[#8b1a2a] focus:ring-4 focus:ring-[#8b1a2a]/8 transition-all"
                    />
                  </div>

                  {/* Review Body */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
                      {language === 'ar' ? 'وصف المراجعة *' : 'Review Description *'}
                    </label>
                    <textarea
                      rows={4}
                      placeholder={language === 'ar' ? 'شاركنا بتعليقاتك بالتفصيل حول تصميم المنتج، والراحة، والمقاس، والجودة الإجمالية...' : 'Share your detailed feedback on the product design, comfort, sizing, and overall quality...'}
                      value={reviewBody}
                      onChange={(e) => setReviewBody(e.target.value)}
                      required
                      className="w-full px-4 py-3 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-[#8b1a2a] focus:ring-4 focus:ring-[#8b1a2a]/8 transition-all resize-y"
                    />
                  </div>

                  {/* Image upload */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
                      {language === 'ar' ? 'صور المنتج (اختياري)' : 'Product Images (Optional)'}
                    </label>
                    <div className="flex flex-wrap gap-3 items-center">
                      {/* Add Image Button */}
                      <label className="size-16 rounded-xl border border-dashed border-neutral-300 hover:border-[#8b1a2a] flex flex-col items-center justify-center text-neutral-400 hover:text-[#8b1a2a] cursor-pointer transition-colors shadow-sm">
                        <Camera size={18} />
                        <span className="text-[9px] font-bold mt-1 uppercase">{language === 'ar' ? 'إضافة' : 'Add'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={isUploadingImage}
                        />
                      </label>

                      {/* Image Previews */}
                      {reviewImages.map((url, idx) => (
                        <div key={idx} className="relative size-16 rounded-xl overflow-hidden border border-neutral-200 shadow-sm group">
                          <img src={url} alt="Review upload" className="size-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeUploadedImage(idx)}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <X size={14} className="text-white" />
                          </button>
                        </div>
                      ))}

                      {isUploadingImage && (
                        <div className="size-16 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-center">
                          <span className="w-4 h-4 border-2 border-t-transparent border-[#8b1a2a] rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={createReviewMutation.isPending || isUploadingImage}
                    className="w-full flex items-center justify-center gap-2.5 bg-[#8b1a2a] hover:bg-[#7a1624] text-white text-xs font-extrabold uppercase tracking-widest py-3.5 rounded-xl transition-all disabled:opacity-50 active:scale-[0.99] shadow-md hover:shadow-lg cursor-pointer"
                  >
                    {createReviewMutation.isPending 
                      ? (language === 'ar' ? 'جاري الإرسال...' : 'Submitting…') 
                      : (language === 'ar' ? 'إرسال المراجعة' : 'Submit Review')
                    }
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit success alert */}
          {submitSuccess && (
            <div className="max-w-xl mx-auto mb-10 bg-emerald-50 border border-emerald-200 rounded-3xl p-5 flex items-start gap-3.5 shadow-sm text-left rtl:text-right">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div>
                <h4 className="text-xs uppercase tracking-widest font-extrabold text-emerald-800">
                  {language === 'ar' ? 'تم تقديم المراجعة بنجاح' : 'Review Submitted Successfully'}
                </h4>
                <p className="text-xs text-emerald-700/90 leading-relaxed mt-1">
                  {language === 'ar' 
                    ? 'شكراً لك! تعليقك قيد المراجعة الإدارية وسوف يظهر على هذه الصفحة بمجرد موافقة فريقنا عليه.' 
                    : 'Thank you! Your feedback is pending administrative approval. It will appear on this page as soon as it is approved by our moderation team.'}
                </p>
              </div>
            </div>
          )}
        </div>{/* end review-form-section */}
        {/* Reviews Carousel */}
        {reviewsLoading ? (
          <div className="flex gap-4 overflow-hidden px-4 justify-center">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-[280px] shrink-0 rounded-2xl animate-pulse bg-neutral-200" />
            ))}
          </div>
        ) : (
          <CustomerReviewsCarousel items={reviewItems} />
        )}
      </section>

      {/* ── You May Also Like ── */}
      {recommendations.length > 0 && (
        <section className="bg-white border-t border-brand-border/20 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#8b1a2a] font-extrabold">
                {language === 'ar' ? 'اكتشف المزيد' : 'Discover More'}
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-charcoal mt-1.5 uppercase tracking-tight">
                {language === 'ar' ? 'قد يعجبك أيضاً' : 'You May Also Like'}
              </h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="h-px w-12 bg-[#d4af37]/60" />
                <span className="text-[#d4af37] text-xs">✦</span>
                <div className="h-px w-12 bg-[#d4af37]/60" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
              {recommendations.map((rec) => (
                <ProductCard key={rec.id} product={rec} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Floating Mobile CTA ── */}
      <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-white/95 backdrop-blur-md border-t border-brand-border/30 px-4 py-3 shadow-2xl shadow-black/10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="flex flex-col justify-center min-w-0 text-left rtl:text-right">
            <span className="text-[10px] uppercase tracking-widest text-brand-text-muted font-semibold truncate">
              {product.name}
            </span>
            <span className="font-black text-[#8b1a2a] text-lg leading-none">
              {formatINR(product.price)}
            </span>
          </div>
          <motion.button
            type="button"
            onClick={handleAddToCart}
            whileTap={{ scale: 0.96 }}
            className="flex-1 bg-[#8b1a2a] text-white py-3.5 text-xs font-extrabold uppercase tracking-widest rounded-xl shadow-md shadow-[#8b1a2a]/30 transition-all active:scale-95 cursor-pointer"
          >
            {language === 'ar' ? 'أضف إلى السلة' : 'Add to Cart'}
          </motion.button>
          <motion.button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            whileTap={{ scale: 0.9 }}
            className={`shrink-0 w-12 h-12 rounded-xl border-2 flex items-center justify-center ${isFavorite ? 'border-[#d4af37] bg-[#d4af37]/10' : 'border-brand-border/50'
              }`}
            aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={18} className={isFavorite ? 'fill-[#d4af37] text-[#d4af37]' : ''} />
          </motion.button>
        </div>
      </div>

      {/* Bottom spacer for mobile CTA */}
      <div className="h-20 lg:hidden" />
    </div>
  );
};