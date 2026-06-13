import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useShop } from '../context/ShopContext';
import { useProducts } from '../hooks/useProducts';
import { PageHeader } from '../components/PageHeader';
import { PageShell } from '../components/PageShell';
import { ProductGridSkeleton } from '../components/ui/skeleton';
import { useLanguage } from '../context/LanguageContext';

export const Wishlist: React.FC = () => {
  const { wishlist } = useShop();
  const { language } = useLanguage();
  const { data: allProducts, isLoading } = useProducts({ limit: 200 });

  const wishlistProducts = (allProducts ?? []).filter((p) => wishlist.includes(p.id));

  return (
    <PageShell>
      <PageHeader
        eyebrow={language === 'ar' ? 'مجموعتي المفضلة' : 'Personal Curation'}
        title={language === 'ar' ? 'المفضلة لدي' : 'My Favorites'}
        subtitle={
          language === 'ar'
            ? `${wishlistProducts.length} ${wishlistProducts.length === 1 ? 'تصميم محفوظ' : 'تصاميم محفوظة'}`
            : `${wishlistProducts.length} saved ${wishlistProducts.length === 1 ? 'design' : 'designs'}`
        }
      />

      {isLoading ? (
        <ProductGridSkeleton count={wishlist.length || 4} cols="grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
      ) : wishlistProducts.length === 0 ? (
        <div className="py-16 sm:py-24 text-center max-w-md mx-auto space-y-6 px-4">
          <div className="w-16 h-16 rounded-full border border-brand-border/40 flex items-center justify-center text-brand-charcoal/30 mx-auto">
            <Heart size={24} />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-brand-charcoal uppercase">
              {language === 'ar' ? 'نسق خزانة ملابسك' : 'Curate Your Capsule'}
            </h2>
            <p className="text-sm text-brand-text-muted leading-relaxed font-light">
              {language === 'ar'
                ? 'احفظ الملابس التي تحبها في قائمة المفضلة لتنسيق مجموعتك المثالية لكل موسم.'
                : 'Save garments you adore to your wishlist and assemble your perfect seasonal collections.'}
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-[#8b1a2a] text-white hover:bg-[#6b1420] px-8 py-4 text-xs font-bold uppercase tracking-widest transition-colors rounded-full"
          >
            {language === 'ar' ? 'استكشف المتجر' : 'Explore Shop'} <ArrowRight size={14} className="rtl:rotate-180" />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlistProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center border-t border-brand-border/40 pt-8 space-y-4">
            <h3 className="font-display text-base sm:text-lg font-extrabold text-brand-charcoal uppercase">
              {language === 'ar' ? 'هل انتهيت من اختيار مفضلاتك؟' : 'Finished curating your selections?'}
            </h3>
            <Link
              to="/shop"
              className="inline-block bg-brand-charcoal text-brand-cream hover:bg-[#8b1a2a] px-8 py-4 text-xs font-bold uppercase tracking-widest transition-colors rounded-full"
            >
              {language === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
            </Link>
          </div>
        </div>
      )}
    </PageShell>
  );
};
