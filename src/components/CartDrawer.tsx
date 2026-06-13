import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, Tag, ArrowRight, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductImageUrl } from '../lib/optimizeImage';
import { useLanguage } from '../context/LanguageContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    cartTotal,
    discount,
    promoCode,
    applyPromo,
  } = useShop();

  const { language } = useLanguage();
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const navigate = useNavigate();

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const success = applyPromo(promoInput);
    if (success) {
      setPromoInput('');
    } else {
      setPromoError(language === 'ar' ? 'رمز ترويجي غير صالح. جرب "WELCOME20".' : 'Invalid promo code. Try "WELCOME20".');
    }
  };

  const finalDiscount = cartTotal * discount;
  const grandTotal = cartTotal - finalDiscount;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 z-50 bg-brand-charcoal/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: language === 'ar' ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: language === 'ar' ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 200 }}
            className={`fixed ${language === 'ar' ? 'left-0 border-r' : 'right-0 border-l'} top-0 bottom-0 z-50 w-full sm:max-w-[28rem] bg-brand-cream border-brand-border/20 shadow-2xl flex flex-col h-dvh font-display text-left rtl:text-right`}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-brand-border/15 flex items-center justify-between bg-white shrink-0">
              <div className="text-left rtl:text-right">
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#d4af37] font-bold">
                  {language === 'ar' ? 'سوبريور تريندز' : 'Superior Trends'}
                </span>
                <h2 className="font-display text-2xl font-extrabold text-brand-charcoal uppercase tracking-tight mt-0.5">
                  {language === 'ar' ? 'سلة المشتريات' : 'My Basket'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="group text-brand-charcoal/40 hover:text-[#8b1a2a] p-2.5 rounded-full hover:bg-brand-cream transition-all duration-300"
                aria-label="Close Cart"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Scrollable Cart Items */}
            <div className="flex-1 overflow-y-auto bg-brand-cream/30">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12">
                  <div className="w-20 h-20 rounded-full bg-white shadow-sm border border-brand-border/10 flex items-center justify-center text-[#d4af37] mb-6">
                    <ShoppingBag size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-brand-charcoal uppercase tracking-wide">
                    {language === 'ar' ? 'سلة المشتريات فارغة' : 'Your basket is empty'}
                  </h3>
                  <p className="text-sm text-brand-text-muted max-w-[250px] mx-auto mt-3 leading-relaxed font-light">
                    {language === 'ar' ? 'استكشف مجموعاتنا الحصرية وأضف قطعك المفضلة.' : 'Explore our exclusive collections and add your favorite pieces.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/shop');
                    }}
                    className="mt-8 bg-[#8b1a2a] text-white hover:bg-brand-charcoal px-8 py-3.5 text-[11px] tracking-widest uppercase font-bold rounded-full transition-colors duration-300 shadow-md"
                  >
                    {language === 'ar' ? 'اكتشف المتجر' : 'Discover the Shop'}
                  </button>
                </div>
              ) : (
                <div className="px-5 py-2 sm:px-6 divide-y divide-brand-border/15">
                  {cart.map((item, idx) => {
                    const imageUrl = getProductImageUrl(item.product.images, 300);
                    return (
                      <div
                        key={`${item.product.id}-${item.selectedSize}-${item.selectedColor.name}-${idx}`}
                        className="py-6 flex gap-5 group"
                      >
                        {/* Product Image */}
                        <div className="w-24 aspect-[3/4] shrink-0 overflow-hidden rounded-xl border border-brand-border/20 bg-white relative isolate">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.product.name}
                              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-50">
                              <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">
                                {language === 'ar' ? 'لا توجد صورة' : 'No image'}
                              </span>
                            </div>
                          )}
                          <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-xl pointer-events-none" />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                          <div>
                            <div className="flex justify-between items-start gap-3">
                              <h4 className="text-[15px] text-brand-charcoal font-bold uppercase tracking-wide line-clamp-2 leading-snug">
                                {item.product.name}
                              </h4>
                              <span className="text-sm text-[#8b1a2a] font-black shrink-0 tracking-tight">
                                ﷼{Number(item.product.price).toLocaleString('en-OM')}
                              </span>
                            </div>
                            
                            {/* Variants (Size & Color Pills) */}
                            <div className="flex flex-wrap items-center gap-2 mt-2.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white border border-brand-border/20 text-brand-text-muted">
                                {language === 'ar' ? 'المقاس' : 'Size'} {item.selectedSize}
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white border border-brand-border/20 text-brand-text-muted">
                                <span
                                  className="w-2 h-2 rounded-full ring-1 ring-black/10"
                                  style={{ backgroundColor: item.selectedColor.hex }}
                                />
                                {item.selectedColor.name}
                              </span>
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="flex justify-between items-end mt-4">
                            {/* Quantity Selector */}
                            <div className="flex items-center bg-white border border-brand-border/20 rounded-full p-0.5 shadow-sm">
                              <button
                                type="button"
                                onClick={() =>
                                  updateCartQuantity(
                                    item.product.id,
                                    item.selectedSize,
                                    item.selectedColor.name,
                                    item.quantity - 1
                                  )
                                }
                                className="w-7 h-7 flex items-center justify-center rounded-full text-brand-charcoal/50 hover:text-[#8b1a2a] hover:bg-brand-cream transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={12} strokeWidth={2.5} />
                              </button>
                              <span className="w-6 text-center text-xs font-black text-brand-charcoal">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateCartQuantity(
                                    item.product.id,
                                    item.selectedSize,
                                    item.selectedColor.name,
                                    item.quantity + 1
                                  )
                                }
                                className="w-7 h-7 flex items-center justify-center rounded-full text-brand-charcoal/50 hover:text-[#8b1a2a] hover:bg-brand-cream transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus size={12} strokeWidth={2.5} />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={() =>
                                removeFromCart(
                                  item.product.id,
                                  item.selectedSize,
                                  item.selectedColor.name
                                )
                              }
                              className="text-brand-text-muted/50 hover:text-red-500 transition-colors p-1.5"
                              aria-label="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sticky Footer Area */}
            {cart.length > 0 && (
              <div className="bg-white border-t border-brand-border/15 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                <div className="p-5 sm:p-6 space-y-6">
                  
                  {/* Promo Code - Integrated Input */}
                  <div>
                    <form onSubmit={handleApplyPromo} className="relative flex items-center w-full border border-brand-border/30 rounded-xl overflow-hidden focus-within:border-[#d4af37] focus-within:ring-1 focus-within:ring-[#d4af37] transition-all bg-brand-cream/20">
                      <div className="pl-4 rtl:pl-0 rtl:pr-4 text-[#d4af37]">
                        <Tag size={15} />
                      </div>
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder={promoCode ? (language === 'ar' ? `تم التطبيق: ${promoCode}` : `Applied: ${promoCode}`) : (language === 'ar' ? 'رمز الترويجي' : 'Promo code')}
                        className="flex-1 bg-transparent py-3 pl-3 pr-2 rtl:pl-2 rtl:pr-3 text-xs uppercase tracking-wider text-brand-charcoal placeholder-brand-text-muted focus:outline-none font-bold"
                      />
                      <button
                        type="submit"
                        className="px-5 py-3 text-[11px] font-black tracking-widest uppercase text-brand-charcoal hover:text-[#8b1a2a] transition-colors border-l rtl:border-l-0 rtl:border-r border-brand-border/20"
                      >
                        {language === 'ar' ? 'تطبيق' : 'Apply'}
                      </button>
                    </form>
                    {promoError && <p className="text-red-500 text-[11px] font-bold mt-2 ml-1 rtl:mr-1">{promoError}</p>}
                    {promoCode && (
                      <p className="text-emerald-600 text-[11px] font-bold mt-2 ml-1 rtl:mr-1">
                        {language === 'ar' ? `تم تطبيق الرمز الترويجي "${promoCode}" بنجاح.` : `Promo "${promoCode}" applied successfully.`}
                      </p>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-brand-text-muted">
                      <span className="font-light">{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                      <span className="font-medium text-brand-charcoal">
                        ﷼{Number(cartTotal).toLocaleString('en-OM')}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span className="font-light">{language === 'ar' ? 'الخصم' : 'Discount'} ({discount * 100}%)</span>
                        <span className="font-medium">-﷼{Number(finalDiscount).toLocaleString('en-OM')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-brand-text-muted pb-3 border-b border-brand-border/15">
                      <span className="font-light">{language === 'ar' ? 'الشحن' : 'Shipping'}</span>
                      <span className="font-medium text-brand-charcoal">{language === 'ar' ? 'مجاني' : 'Complimentary'}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="font-display text-lg font-bold text-brand-charcoal uppercase">{language === 'ar' ? 'المجموع الكلي' : 'Total'}</span>
                      <span className="font-display text-2xl font-black text-[#8b1a2a] tracking-tight">
                        ﷼{Number(grandTotal).toLocaleString('en-OM')}
                      </span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    type="button"
                    onClick={handleCheckoutClick}
                    className="group w-full bg-[#8b1a2a] text-white hover:bg-brand-charcoal py-4 flex items-center justify-center gap-2.5 tracking-[0.2em] text-[11px] uppercase font-black rounded-full transition-all duration-300 hover:shadow-[0_10px_20px_rgba(139,26,42,0.2)] hover:-translate-y-0.5"
                  >
                    {language === 'ar' ? 'الانتقال إلى الدفع' : 'Proceed to Checkout'}
                    <ArrowRight size={15} className="transform group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5 transition-transform duration-300 ease-out rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};