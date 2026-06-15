import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid2x2, Grid3x3, LayoutGrid, SlidersHorizontal, X, ArrowUpDown, ChevronDown, RefreshCw, SearchX } from 'lucide-react';
import type { Product } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { formatINR } from '../lib/formatCurrency';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useProducts,
  useCategories,
  useSections,
  type DBCategory,
  type HomepageSection,
} from '../hooks/useProducts';
import { PageHeader } from '../components/PageHeader';
import { PageShell } from '../components/PageShell';
import { ProductGridSkeleton, ShopFiltersSkeleton } from '../components/ui/skeleton';
import { useLanguage } from '../context/LanguageContext';
import { translateDynamic } from '../locales/dynamicTranslations';

type SortOption = 'featured' | 'price-low' | 'price-high' | 'rating';

interface ShopFiltersPanelProps {
  dbCategories?: DBCategory[];
  dbSections?: HomepageSection[];
  selectedCategory: string;
  selectedSection: string;
  selectedSizes: string[];
  selectedColors: string[];
  allSizes: string[];
  allColors: string[];
  activeProducts: Product[];
  maxPrice: number;
  priceRange: number;
  onCategoryChange: (slug: string) => void;
  onSectionChange: (slug: string) => void;
  onToggleSize: (size: string) => void;
  onToggleColor: (color: string) => void;
  onPriceRangeChange: (value: number) => void;
}

function ShopFiltersPanel({
  dbCategories,
  dbSections,
  selectedCategory,
  selectedSection,
  selectedSizes,
  selectedColors,
  allSizes,
  allColors,
  activeProducts,
  maxPrice,
  priceRange,
  onCategoryChange,
  onSectionChange,
  onToggleSize,
  onToggleColor,
  onPriceRangeChange,
}: ShopFiltersPanelProps) {
  const { language, t } = useLanguage();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: true,
    sections: false,
    sizes: true,
    colors: true,
    price: true,
  });

  const getDefaultExpandedParents = () => {
    const result: Record<string, boolean> = {};
    dbCategories?.forEach((parent) => {
      const hasActiveChild = parent.children?.some((c) => c.slug === selectedCategory);
      result[parent.slug] = !!hasActiveChild;
    });
    return result;
  };
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>(
    () => getDefaultExpandedParents()
  );

  const toggleParent = (slug: string) =>
    setExpandedParents((prev) => ({ ...prev, [slug]: !prev[slug] }));

  const toggleSection = (section: string) =>
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));

  // ── Shared accordion header ──────────────────────────────────────────────
  const FilterHeader = ({
    id,
    label,
    count,
  }: {
    id: string;
    label: string;
    count?: number;
  }) => (
    <button
      type="button"
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between py-3.5 group text-left rtl:text-right border-b border-neutral-100/60"
    >
      <span className="flex items-center gap-2">
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-800 group-hover:text-[#8b1a2a] transition-all duration-200">
          {label}
        </span>
        {count !== undefined && count > 0 && (
          <span className="text-[9px] font-black bg-[#8b1a2a] text-white px-2 py-0.5 rounded-full shadow-sm shadow-[#8b1a2a]/20">
            {count}
          </span>
        )}
      </span>
      <div className="w-5 h-5 rounded-full bg-neutral-50 flex items-center justify-center group-hover:bg-[#8b1a2a]/5 transition-colors">
        <ChevronDown
          size={11}
          className={`transition-transform duration-300 text-neutral-400 group-hover:text-[#8b1a2a] ${
            openSections[id] ? 'rotate-180' : ''
          }`}
        />
      </div>
    </button>
  );

  return (
    <div className="space-y-4">

      {/* ── Categories ──────────────────────────────────────────────────── */}
      <div className="bg-neutral-50/40 rounded-xl p-3.5 border border-neutral-100/60">
        <FilterHeader
          id="categories"
          label={language === 'ar' ? 'الفئات' : 'Category'}
          count={selectedCategory !== 'all' ? 1 : undefined}
        />
        <AnimatePresence initial={false}>
          {openSections.categories && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="pt-3 pb-1 space-y-1">
                {/* All Products */}
                <CategoryBtn
                  label={t('common.allGarments')}
                  active={selectedCategory === 'all'}
                  onClick={() => onCategoryChange('all')}
                />

                {dbCategories?.map((parent) => (
                  <div key={parent.id} className="space-y-0.5">
                    <div className="flex items-center gap-1">
                      <CategoryBtn
                        label={translateDynamic(parent.name, language)}
                        active={selectedCategory === parent.slug}
                        onClick={() => onCategoryChange(parent.slug)}
                        className="flex-1"
                      />
                      {parent.children && parent.children.length > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleParent(parent.slug)}
                          className="p-2 rounded-lg text-neutral-400 hover:text-[#8b1a2a] hover:bg-[#8b1a2a]/5 transition-colors shrink-0"
                        >
                          <ChevronDown
                            size={11}
                            className={`transition-transform duration-200 ${
                              expandedParents[parent.slug] ? 'rotate-180 text-[#8b1a2a]' : ''
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {parent.children && parent.children.length > 0 && (
                      <AnimatePresence initial={false}>
                        {expandedParents[parent.slug] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className="overflow-hidden"
                          >
                            <div className="ml-4 rtl:ml-0 rtl:mr-4 pl-3.5 rtl:pl-0 rtl:pr-3.5 border-l-2 rtl:border-l-0 rtl:border-r-2 border-[#d4af37]/20 mt-1 mb-2 space-y-1">
                              {parent.children.map((child) => (
                                <CategoryBtn
                                  key={child.id}
                                  label={translateDynamic(child.name, language)}
                                  active={selectedCategory === child.slug}
                                  onClick={() => onCategoryChange(child.slug)}
                                  sub
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Sections ────────────────────────────────────────────────────── */}
      <div className="bg-neutral-50/40 rounded-xl p-3.5 border border-neutral-100/60">
        <FilterHeader
          id="sections"
          label={language === 'ar' ? 'المجموعات' : 'Collection'}
          count={selectedSection !== 'all' ? 1 : undefined}
        />
        <AnimatePresence initial={false}>
          {openSections.sections && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="pt-3 pb-1 space-y-1">
                <CategoryBtn
                  label={language === 'ar' ? 'جميع المجموعات' : 'All Collections'}
                  active={selectedSection === 'all'}
                  onClick={() => onSectionChange('all')}
                />
                {dbSections?.map((sec) => (
                  <CategoryBtn
                    key={sec.id}
                    label={translateDynamic(sec.title, language)}
                    active={selectedSection === sec.slug}
                    onClick={() => onSectionChange(sec.slug)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Sizes ───────────────────────────────────────────────────────── */}
      <div className="bg-neutral-50/40 rounded-xl p-3.5 border border-neutral-100/60">
        <FilterHeader
          id="sizes"
          label={language === 'ar' ? 'المقاس' : 'Size'}
          count={selectedSizes.length || undefined}
        />
        <AnimatePresence initial={false}>
          {openSections.sizes && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 pt-3 pb-1">
                {allSizes.map((size) => {
                  const active = selectedSizes.includes(size);
                  return (
                    <motion.button
                      key={size}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onToggleSize(size)}
                      className={`min-w-[42px] px-3.5 py-2.5 text-[11px] font-black uppercase tracking-wider rounded-xl border-2 transition-all duration-200 cursor-pointer shadow-sm ${
                        active
                          ? 'bg-[#8b1a2a] border-[#8b1a2a] text-white shadow-md shadow-[#8b1a2a]/20 scale-105'
                          : 'border-brand-border/40 text-brand-charcoal bg-white hover:border-[#8b1a2a]/60 hover:text-[#8b1a2a]'
                      }`}
                    >
                      {size}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Colors ──────────────────────────────────────────────────────── */}
      <div className="bg-neutral-50/40 rounded-xl p-3.5 border border-neutral-100/60">
        <FilterHeader
          id="colors"
          label={language === 'ar' ? 'اللون' : 'Color'}
          count={selectedColors.length || undefined}
        />
        <AnimatePresence initial={false}>
          {openSections.colors && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 pt-3 pb-2.5 px-1">
                {allColors.map((colorName) => {
                  const colorObj = activeProducts
                    .flatMap((p) => p.colors)
                    .find((c) => c.name === colorName);
                  const hex = colorObj?.hex || '#CCCCCC';
                  const isSelected = selectedColors.includes(colorName);

                  return (
                    <motion.button
                      key={colorName}
                      type="button"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onToggleColor(colorName)}
                      title={translateDynamic(colorName, language)}
                      className={`size-8 rounded-full border-2 transition-all duration-200 relative cursor-pointer shadow-sm m-0.5 ${
                        isSelected
                          ? 'border-[#8b1a2a] scale-110 shadow-md shadow-[#8b1a2a]/20'
                          : 'border-white/90 ring-1 ring-neutral-200'
                      }`}
                      style={{ backgroundColor: hex }}
                    >
                      {isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Price ───────────────────────────────────────────────────────── */}
      <div className="bg-neutral-50/40 rounded-xl p-3.5 border border-neutral-100/60">
        <FilterHeader id="price" label={language === 'ar' ? 'الحد الأقصى للسعر' : 'Max Price'} />
        <AnimatePresence initial={false}>
          {openSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="pt-3 pb-2 space-y-4">
                {/* Current value callout */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                    {language === 'ar' ? 'الميزانية' : 'Budget Cap'}
                  </span>
                  <span className="bg-[#8b1a2a]/8 border border-[#8b1a2a]/20 px-3 py-1 rounded-full text-xs font-black text-[#8b1a2a] shadow-sm tabular-nums">
                    {formatINR(priceRange > maxPrice ? maxPrice : priceRange)}
                  </span>
                </div>

                {/* Range input */}
                <input
                  type="range"
                  min="10"
                  max={maxPrice}
                  step="10"
                  value={priceRange > maxPrice ? maxPrice : priceRange}
                  onChange={(e) => onPriceRangeChange(Number(e.target.value))}
                  className="w-full accent-[#8b1a2a] h-1.5 rounded-full cursor-pointer bg-neutral-200"
                />

                {/* Min / Max labels */}
                <div className="flex justify-between text-[10px] text-neutral-400 font-bold">
                  <span>{formatINR(10)}</span>
                  <span>{formatINR(maxPrice)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

// ── Small helper: reusable category/section button ───────────────────────────
function CategoryBtn({
  label,
  active,
  onClick,
  sub = false,
  className = '',
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  sub?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rtl:text-right flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group border cursor-pointer ${className} ${
        active
          ? 'bg-[#8b1a2a]/5 border-[#8b1a2a]/15 text-[#8b1a2a] shadow-sm shadow-[#8b1a2a]/5'
          : 'text-neutral-600 hover:bg-neutral-100/60 hover:text-neutral-900 border-transparent'
      }`}
    >
      <span className="flex items-center gap-2.5">
        <span
          className={`shrink-0 rounded-full transition-all duration-200 ${
            active
              ? 'size-1.5 bg-[#8b1a2a] shadow-sm shadow-[#8b1a2a]/50'
              : 'size-1.5 bg-neutral-300 group-hover:bg-neutral-500'
          }`}
        />
        <span
          className={`${sub ? 'text-[11px]' : 'text-xs'} font-${active ? 'black' : 'extrabold'} uppercase tracking-widest leading-none`}
        >
          {label}
        </span>
      </span>
      {active && (
        <span className="text-[10px] font-black text-[#8b1a2a]">✦</span>
      )}
    </button>
  );
}

export const Shop: React.FC = () => {
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchCategory = searchParams.get('category');
  const searchKeyword = searchParams.get('search');
  const searchSection = searchParams.get('section');

  const selectedCategory = searchCategory || 'all';
  const selectedSection = searchSection || 'all';
  const searchTerm = searchKeyword || '';

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceCap, setPriceCap] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [gridCols, setGridCols] = useState<1 | 2 | 3 | 4>(3);

  const {
    data: dbProducts,
    isLoading: productsLoading,
    isError: productsError,
    isFetching: productsFetching,
  } = useProducts({
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    search: searchTerm || undefined,
    section: selectedSection !== 'all' ? selectedSection : undefined,
    limit: 200,
  });

  const { data: dbCategories, isLoading: categoriesLoading } = useCategories();
  const { data: dbSections } = useSections();

  const activeProducts: Product[] = useMemo(() => dbProducts ?? [], [dbProducts]);

  const maxPrice = useMemo(
    () => (activeProducts.length > 0 ? Math.max(...activeProducts.map((p) => p.price)) : 1000),
    [activeProducts]
  );

  const priceRange = priceCap === null ? maxPrice : Math.min(priceCap, maxPrice);

  const allSizes = useMemo(
    () => Array.from(new Set(activeProducts.flatMap((p) => p.sizes))),
    [activeProducts]
  );

  const allColors = useMemo(
    () => Array.from(new Set(activeProducts.flatMap((p) => p.colors.map((c) => c.name)))),
    [activeProducts]
  );

  const setCategoryParam = (slug: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (slug === 'all') next.delete('category');
      else next.set('category', slug);
      return next;
    });
  };

  const setSectionParam = (slug: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (slug === 'all') next.delete('section');
      else next.set('section', slug);
      return next;
    });
  };

  const toggleSizeFilter = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColorFilter = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const resetFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceCap(null);
    setSortBy('featured');
    setSearchParams({});
  };

  const filteredProducts = useMemo(() => {
    return activeProducts.filter((product) => {
      if (selectedCategory !== 'all') {
        const isDirectMatch = product.category === selectedCategory;
        const parentCat = dbCategories?.find((p) =>
          p.children?.some((child) => child.slug === product.category)
        );
        const isSubMatch = parentCat && parentCat.slug === selectedCategory;
        if (!isDirectMatch && !isSubMatch) return false;
      }
      if (selectedSizes.length > 0 && !product.sizes.some((size) => selectedSizes.includes(size))) {
        return false;
      }
      if (
        selectedColors.length > 0 &&
        !product.colors.some((color) => selectedColors.includes(color.name))
      ) {
        return false;
      }
      if (product.price > priceRange) return false;
      if (
        searchTerm.trim() &&
        !product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !product.description.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [
    activeProducts,
    selectedCategory,
    selectedSizes,
    selectedColors,
    priceRange,
    searchTerm,
    dbCategories,
  ]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [filteredProducts, sortBy]);

  const getGridClass = () => {
    if (gridCols === 1) return 'grid-cols-1 md:grid-cols-3';
    if (gridCols === 2) return 'grid-cols-2';
    if (gridCols === 4) return 'grid-cols-2 md:grid-cols-4';
    return 'grid-cols-2 md:grid-cols-3';
  };

  const isCatalogLoading = productsLoading || (productsFetching && !dbProducts);
  const filtersLoading = categoriesLoading && !dbCategories;

  const filterPanelProps: ShopFiltersPanelProps = {
    dbCategories,
    dbSections,
    selectedCategory,
    selectedSection,
    selectedSizes,
    selectedColors,
    allSizes,
    allColors,
    activeProducts,
    maxPrice,
    priceRange,
    onCategoryChange: setCategoryParam,
    onSectionChange: setSectionParam,
    onToggleSize: toggleSizeFilter,
    onToggleColor: toggleColorFilter,
    onPriceRangeChange: setPriceCap,
  };

  const shopToolbar = (
    <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-5 lg:w-auto">

      {/* Left: Designs count and Clear button */}
      <div className="flex items-center justify-between w-full md:w-auto gap-6">
        <div className="flex items-center gap-3">
          {/* Luxury Pulsing Live Indicator */}
          <div className="relative flex items-center justify-center w-2.5 h-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#d4af37]" />
          </div>
          <p className="text-[11px] sm:text-xs tracking-[0.2em] text-brand-charcoal font-black uppercase mt-0.5">
            {isCatalogLoading 
              ? (language === 'ar' ? 'جاري التنسيق...' : 'Curating…') 
              : (language === 'ar' 
                  ? `${sortedProducts.length} من ${activeProducts.length} تصاميم` 
                  : `${sortedProducts.length} of ${activeProducts.length} Designs`
                )
            }
          </p>
        </div>

        {(selectedCategory !== 'all' ||
          selectedSection !== 'all' ||
          selectedSizes.length > 0 ||
          selectedColors.length > 0 ||
          searchTerm.trim()) && (
            <button
              type="button"
              onClick={resetFilters}
              className="group flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#8b1a2a]/20 bg-[#8b1a2a]/5 hover:bg-[#8b1a2a] text-[#8b1a2a] hover:text-white transition-all duration-300 text-[10px] uppercase tracking-[0.2em] font-extrabold shadow-sm hover:shadow-md cursor-pointer"
            >
              {language === 'ar' ? 'مسح الكل' : 'Clear'}
              <X size={12} className="transform group-hover:rotate-90 transition-transform duration-300" />
            </button>
          )}
      </div>

      {/* Right: Control buttons group */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto sm:flex-nowrap">

        {/* --- MOBILE TOOLBAR (Visible < md) --- */}
        <div className="flex items-center gap-2 w-full md:hidden">
          <button
            type="button"
            onClick={() => setIsFilterPanelOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-brand-border/40 hover:border-[#d4af37] px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.12em] text-brand-charcoal hover:text-[#d4af37] transition-all rounded-full shadow-sm hover:shadow-md cursor-pointer"
          >
            <SlidersHorizontal size={12} strokeWidth={2.5} />
            {language === 'ar' ? 'التصفية' : 'Filters'}
            {selectedSizes.length + selectedColors.length > 0 && (
              <span className="bg-[#8b1a2a] text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] -ml-0.5 shrink-0">
                {selectedSizes.length + selectedColors.length}
              </span>
            )}
          </button>

          {/* Custom Mobile Select */}
          <div className="relative flex-1 group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full appearance-none bg-white border border-brand-border/40 text-[10px] font-black uppercase tracking-[0.12em] text-brand-charcoal pl-3 pr-8 py-2.5 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] rounded-full shadow-sm cursor-pointer hover:border-[#d4af37] transition-all duration-300"
            >
              <option value="featured">{language === 'ar' ? 'ترتيب حسب' : 'Sort By'}</option>
              <option value="price-low">{language === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low-High'}</option>
              <option value="price-high">{language === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High-Low'}</option>
              <option value="rating">{language === 'ar' ? 'الأعلى تقييماً' : 'Top Rated'}</option>
            </select>
            <ChevronDown size={12} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-text-muted pointer-events-none group-hover:text-[#d4af37] transition-colors duration-300" />
          </div>

          {/* Mobile Grid Toggle - Physical Switch Style */}
          <div className="flex items-center p-0.5 bg-neutral-100/80 border border-brand-border/30 rounded-full shadow-inner shrink-0">
            <button
              type="button"
              onClick={() => setGridCols(1)}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer ${gridCols === 1 ? 'bg-white text-[#d4af37] shadow-[0_4px_10px_rgba(0,0,0,0.08)] scale-100' : 'text-neutral-400 hover:text-brand-charcoal scale-95'}`}
              aria-label="1 Column Mobile"
            >
              <LayoutGrid size={13} className="rotate-90" strokeWidth={gridCols === 1 ? 2.5 : 2} />
            </button>
            <button
              type="button"
              onClick={() => setGridCols(2)}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer ${gridCols === 2 ? 'bg-white text-[#d4af37] shadow-[0_4px_10px_rgba(0,0,0,0.08)] scale-100' : 'text-neutral-400 hover:text-brand-charcoal scale-95'}`}
              aria-label="2 Columns Mobile"
            >
              <Grid2x2 size={13} strokeWidth={gridCols === 2 ? 2.5 : 2} />
            </button>
          </div>
        </div>

        {/* --- DESKTOP TOOLBAR (Visible >= md) --- */}
        <div className="hidden md:flex items-center gap-4 w-full sm:w-auto">

          {/* Custom Desktop Select */}
          <div className="relative group flex items-center">
            <div className="absolute left-4 z-10 pointer-events-none text-brand-text-muted group-hover:text-[#d4af37] transition-colors duration-300">
              <ArrowUpDown size={13} strokeWidth={2.5} />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none bg-white border border-brand-border/40 text-[11px] font-black uppercase tracking-[0.15em] text-brand-charcoal pl-10 pr-12 py-3 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] rounded-full shadow-sm cursor-pointer hover:border-[#d4af37] transition-all duration-300"
            >
              <option value="featured">{language === 'ar' ? 'المميزة' : 'Featured Picks'}</option>
              <option value="price-low">{language === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
              <option value="price-high">{language === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
              <option value="rating">{language === 'ar' ? 'الأعلى تقييماً' : 'Top Rated'}</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text-muted pointer-events-none group-hover:text-[#d4af37] transition-colors duration-300" />
          </div>

          {/* Desktop Grid Toggle - Physical Switch Style */}
          <div className="flex items-center p-1 bg-neutral-100/80 border border-brand-border/30 rounded-full shadow-inner shrink-0">
            <button
              type="button"
              onClick={() => setGridCols(2)}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 ${gridCols === 2 ? 'bg-white text-[#d4af37] shadow-[0_4px_10px_rgba(0,0,0,0.08)] scale-100' : 'text-neutral-400 hover:text-brand-charcoal scale-95'}`}
              aria-label="2 Columns"
            >
              <Grid2x2 size={16} strokeWidth={gridCols === 2 ? 2.5 : 2} />
            </button>
            <button
              type="button"
              onClick={() => setGridCols(3)}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 ${gridCols === 3 ? 'bg-white text-[#d4af37] shadow-[0_4px_10px_rgba(0,0,0,0.08)] scale-100' : 'text-neutral-400 hover:text-brand-charcoal scale-95'}`}
              aria-label="3 Columns"
            >
              <Grid3x3 size={16} strokeWidth={gridCols === 3 ? 2.5 : 2} />
            </button>
            <button
              type="button"
              onClick={() => setGridCols(4)}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 ${gridCols === 4 ? 'bg-white text-[#d4af37] shadow-[0_4px_10px_rgba(0,0,0,0.08)] scale-100' : 'text-neutral-400 hover:text-brand-charcoal scale-95'}`}
              aria-label="4 Columns"
            >
              <LayoutGrid size={16} strokeWidth={gridCols === 4 ? 2.5 : 2} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  const renderProductArea = () => {
    if (isCatalogLoading) {
      return <ProductGridSkeleton count={9} cols={getGridClass()} />;
    }

    if (productsError && activeProducts.length === 0) {
      return (
        <div className="py-24 text-center space-y-4">
          <h3 className="font-display text-xl font-extrabold text-brand-charcoal uppercase">
            {language === 'ar' ? 'تعذر تحميل المنتجات' : 'Could Not Load Products'}
          </h3>
          <p className="text-sm text-brand-text-muted max-w-sm mx-auto">
            {language === 'ar' ? 'يرجى التحقق من تشغيل الخادم الخلفي، ثم تحديث الصفحة.' : 'Please check that the backend is running, then refresh the page.'}
          </p>
        </div>
      );
    }

    if (sortedProducts.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl mx-auto my-12 py-20 sm:py-24 px-8 sm:px-16 flex flex-col items-center text-center bg-white border border-brand-border/20 rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] overflow-hidden isolate"
        >
          {/* Ambient Glows */}
          <div className="absolute top-0 left-1/2 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#8b1a2a]/5 rounded-full blur-[100px] translate-y-1/2 translate-x-1/3 pointer-events-none z-0" />

          {/* Layered Glass Icon */}
          <div className="relative z-10 flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#8b1a2a]/10 to-transparent ring-1 ring-inset ring-[#8b1a2a]/20 shadow-inner mb-8">
            <SearchX size={32} className="text-[#8b1a2a]" strokeWidth={1.5} />
          </div>

          {/* Eyebrow Label */}
          <span className="relative z-10 text-[10px] tracking-[0.25em] uppercase text-[#d4af37] font-extrabold mb-3">
            {language === 'ar' ? 'لا توجد نتائج تطابق خياراتك' : 'Zero Matches'}
          </span>

          {/* Heading */}
          <h3 className="relative z-10 font-display text-3xl sm:text-4xl font-black text-brand-charcoal uppercase tracking-tight mb-4">
            {language === 'ar' ? 'لم يتم العثور على ملابس' : 'No Garments Found'}
          </h3>

          {/* Subtitle */}
          <p className="relative z-10 text-[15px] text-brand-text-muted max-w-md mx-auto font-light leading-relaxed">
            {language === 'ar' 
              ? 'لم نتمكن من العثور على أي تصاميم تطابق معاييرك المحددة. امسح الفلاتر لعرض المجموعة الكاملة.'
              : 'We couldn\'t find any designs fitting your exact criteria. Clear your active filters to reveal the full curated collection.'}
          </p>

          {/* Massive Glowing CTA */}
          <button
            type="button"
            onClick={resetFilters}
            className="group relative z-10 mt-10 flex items-center justify-center gap-3 bg-gradient-to-r from-[#8b1a2a] to-[#5a0e19] text-white px-10 py-4.5 rounded-full text-[12px] font-black uppercase tracking-[0.2em] shadow-[0_15px_30px_-5px_rgba(139,26,42,0.35)] hover:shadow-[0_20px_40px_-5px_rgba(139,26,42,0.45)] hover:-translate-y-1 transition-all duration-500 cursor-pointer"
          >
            {language === 'ar' ? 'إعادة تعيين الفلاتر' : 'Reset Filters'}
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
              <RefreshCw size={13} className="transform group-hover:rotate-180 transition-transform duration-500 ease-out" />
            </div>
          </button>
        </motion.div>
      );
    }

    return (
      <motion.div
        layout
        className={`grid gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-12 transition-all duration-500 ${getGridClass()}`}
      >
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </motion.div>
    );
  };

  return (
    <PageShell>
      <PageHeader 
        eyebrow={language === 'ar' ? 'كتالوج مخصص' : 'Studio Catalog'} 
        title={language === 'ar' ? 'جميع الملابس' : 'All Garments'} 
        trailing={shopToolbar} 
      />

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        <aside
          data-lenis-prevent
          className="hidden md:block w-60 lg:w-68 shrink-0 sticky top-32 max-h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain pb-4 select-none [scrollbar-gutter:stable]"
        >
          <div className="bg-white/70 backdrop-blur-md border border-brand-border/40 p-6 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] space-y-6">
            {filtersLoading ? <ShopFiltersSkeleton /> : <ShopFiltersPanel {...filterPanelProps} />}
          </div>
        </aside>

        <div className="flex-1 w-full space-y-4">
          {/* Active Filter Chips */}
          <AnimatePresence>
            {(selectedCategory !== 'all' ||
              selectedSection !== 'all' ||
              selectedSizes.length > 0 ||
              selectedColors.length > 0 ||
              (priceCap !== null && priceCap < maxPrice)) && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-wrap gap-2 items-center text-left rtl:text-right"
                >
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-text-muted shrink-0">
                    {language === 'ar' ? 'النشط:' : 'Active:'}
                  </span>

                  {/* Category chip */}
                  {selectedCategory !== 'all' && (() => {
                    const allCats = dbCategories?.flatMap((p) => [p, ...(p.children ?? [])]) ?? [];
                    const catLabel = translateDynamic(allCats.find((c) => c.slug === selectedCategory)?.name ?? selectedCategory, language);
                    return (
                      <motion.button
                        key={`chip-cat-${selectedCategory}`}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                        type="button"
                        onClick={() => setCategoryParam('all')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8b1a2a]/8 border border-[#8b1a2a]/25 text-[#8b1a2a] text-[11px] font-bold uppercase tracking-wider rounded-full hover:bg-[#8b1a2a] hover:text-white transition-all duration-200 cursor-pointer shadow-sm group"
                      >
                        {catLabel}
                        <X size={10} className="opacity-60 group-hover:opacity-100 group-hover:rotate-90 transition-all duration-200" />
                      </motion.button>
                    );
                  })()}

                  {/* Section chip */}
                  {selectedSection !== 'all' && (() => {
                    const secLabel = translateDynamic(dbSections?.find((s) => s.slug === selectedSection)?.title ?? selectedSection, language);
                    return (
                      <motion.button
                        key={`chip-sec-${selectedSection}`}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                        type="button"
                        onClick={() => setSectionParam('all')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8b1a2a]/8 border border-[#8b1a2a]/25 text-[#8b1a2a] text-[11px] font-bold uppercase tracking-wider rounded-full hover:bg-[#8b1a2a] hover:text-white transition-all duration-200 cursor-pointer shadow-sm group"
                      >
                        {secLabel}
                        <X size={10} className="opacity-60 group-hover:opacity-100 group-hover:rotate-90 transition-all duration-200" />
                      </motion.button>
                    );
                  })()}

                  {/* Size chips */}
                  {selectedSizes.map((size) => (
                    <motion.button
                      key={`chip-size-${size}`}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                      type="button"
                      onClick={() => toggleSizeFilter(size)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d4af37]/10 border border-[#d4af37]/40 text-brand-charcoal text-[11px] font-bold uppercase tracking-wider rounded-full hover:bg-[#d4af37] hover:text-white transition-all duration-200 cursor-pointer shadow-sm group"
                    >
                      {language === 'ar' ? 'مقاس' : 'Size'} {size}
                      <X size={10} className="opacity-60 group-hover:opacity-100 group-hover:rotate-90 transition-all duration-200" />
                    </motion.button>
                  ))}

                  {/* Color chips */}
                  {selectedColors.map((colorName) => {
                    const colorObj = activeProducts
                      .flatMap((p) => p.colors)
                      .find((c) => c.name === colorName);
                    const hex = colorObj?.hex || '#CCCCCC';

                    return (
                      <motion.button
                        key={`chip-color-${colorName}`}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                        type="button"
                        onClick={() => toggleColorFilter(colorName)}
                        className="group flex items-center gap-2 px-3 py-1.5 bg-white border border-brand-border/40 hover:border-[#8b1a2a]/40 hover:bg-[#8b1a2a]/5 text-brand-charcoal hover:text-[#8b1a2a] text-[10px] font-black uppercase tracking-[0.15em] rounded-full transition-all duration-300 shadow-[0_4px_10px_-4px_rgba(0,0,0,0.05)] cursor-pointer"
                      >

                        <span
                          className="w-3.5 h-3.5 rounded-full ring-1 ring-inset ring-black/10 shadow-inner flex-shrink-0"
                          style={{ backgroundColor: hex }}
                        />

                        {/* Safely constrain text size */}
                        <span className="truncate max-w-[100px] sm:max-w-[150px]">
                          {translateDynamic(colorName, language)}
                        </span>

                        {/* Luxury close icon housing */}
                        <div className="w-4 h-4 rounded-full bg-neutral-100 group-hover:bg-[#8b1a2a]/10 flex items-center justify-center transition-colors duration-300 ml-0.5 shrink-0">
                          <X
                            size={10}
                            className="text-brand-text-muted group-hover:text-[#8b1a2a] transform group-hover:rotate-90 transition-all duration-300"
                            strokeWidth={2.5}
                          />
                        </div>
                      </motion.button>
                    );
                  })}

                  {/* Price cap chip */}
                  {priceCap !== null && priceCap < maxPrice && (
                    <motion.button
                      key="chip-price"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                      type="button"
                      onClick={() => setPriceCap(null)}
                      className="group flex items-center gap-2 px-3 py-1.5 bg-white border border-brand-border/40 hover:border-[#8b1a2a]/40 hover:bg-[#8b1a2a]/5 text-brand-charcoal hover:text-[#8b1a2a] text-[10px] font-black uppercase tracking-[0.15em] rounded-full transition-all duration-300 shadow-[0_4px_10px_-4px_rgba(0,0,0,0.05)] cursor-pointer"
                    >
                      <span className="truncate max-w-[120px]">
                        {language === 'ar' ? 'الحد الأقصى' : 'Max'} {formatINR(priceCap)}
                      </span>

                      {/* Luxury close icon housing */}
                      <div className="w-4 h-4 rounded-full bg-neutral-100 group-hover:bg-[#8b1a2a]/10 flex items-center justify-center transition-colors duration-300 ml-0.5 shrink-0">
                        <X
                          size={10}
                          className="text-brand-text-muted group-hover:text-[#8b1a2a] transform group-hover:rotate-90 transition-all duration-300"
                          strokeWidth={2.5}
                        />
                      </div>
                    </motion.button>
                  )}
                </motion.div>
              )}
          </AnimatePresence>

          <AnimatePresence mode="popLayout">{renderProductArea()}</AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isFilterPanelOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterPanelOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              data-lenis-prevent
              className="relative w-80 bg-white/90 backdrop-blur-lg h-full overflow-y-auto overscroll-contain p-6 shadow-2xl flex flex-col space-y-6 text-left rtl:text-right border-l border-brand-border/30"
            >
              <div className="flex items-center justify-between border-b border-brand-border/40 pb-4">
                <h3 className="font-display text-lg font-bold text-[#8b1a2a] uppercase tracking-wider">
                  {language === 'ar' ? 'التصفية' : 'Filters'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFilterPanelOpen(false)}
                  className="text-brand-charcoal hover:text-[#8b1a2a] p-1.5 hover:bg-[#8b1a2a]/10 rounded-full transition-colors duration-200"
                >
                  <X size={20} />
                </button>
              </div>
              {filtersLoading ? <ShopFiltersSkeleton /> : <ShopFiltersPanel {...filterPanelProps} />}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageShell>
  );
};
