import React from 'react';
import { Mail, Phone, RotateCcw, PackageCheck, Ban, Clock3 } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { PageShell } from '../components/PageShell';
import { useLanguage } from '../context/LanguageContext';

export const RefundPolicy: React.FC = () => {
  const { language, isRtl } = useLanguage();

  const sections = [
    {
      icon: Clock3,
      title: language === 'ar' ? 'نافذة الإرجاع' : 'Return Window',
      body:
        language === 'ar'
          ? 'يمكنك طلب إرجاع أو استبدال خلال 7 أيام من تاريخ استلام طلبك. يجب أن تكون القطعة غير مستخدمة، وبحالتها الأصلية، وبكامل الوسوم والتغليف.'
          : 'You may request a return or exchange within 7 days of the delivery date. Items must be unused, unwashed, and in their original condition with all tags and packaging intact.',
    },
    {
      icon: Ban,
      title: language === 'ar' ? 'استثناءات' : 'Non-Returnable Items',
      body:
        language === 'ar'
          ? 'العناصر المخفضة نهائياً (كليرانس)، والإكسسوارات، والقطع المخصصة حسب الطلب غير قابلة للإرجاع أو الاسترداد، ما لم تصل تالفة أو معيبة.'
          : 'Final-sale/clearance items, accessories, and made-to-order pieces are not eligible for return or refund, unless they arrive damaged or defective.',
    },
    {
      icon: PackageCheck,
      title: language === 'ar' ? 'كيفية طلب الإرجاع' : 'How to Request a Return',
      body:
        language === 'ar'
          ? 'تواصل معنا عبر البريد الإلكتروني أو الهاتف مع ذكر رقم الطلب. سيقوم فريقنا بمراجعة الطلب وترتيب الاستلام أو تزويدك بتعليمات الشحن خلال 24-48 ساعة.'
          : 'Contact our support team with your order number via email or phone. We will review your request and arrange pickup or share return-shipping instructions within 24–48 hours.',
    },
    {
      icon: RotateCcw,
      title: language === 'ar' ? 'طريقة ووقت الاسترداد' : 'Refund Method & Timeline',
      body:
        language === 'ar'
          ? 'بعد فحص القطعة المرتجعة والموافقة عليها، يتم رد المبلغ إلى وسيلة الدفع الأصلية المستخدمة عبر بوابة الدفع Thawani خلال 5-7 أيام عمل.'
          : 'Once the returned item is inspected and approved, the refund is issued to the original payment method used at checkout via Thawani within 5–7 business days.',
    },
  ];

  return (
    <PageShell className="bg-brand-cream text-brand-charcoal font-sans" narrow>
      <PageHeader
        eyebrow={language === 'ar' ? 'سياستنا' : 'Our Policy'}
        title={language === 'ar' ? 'سياسة الإرجاع والاسترداد' : 'Refund & Returns Policy'}
        subtitle={
          language === 'ar'
            ? 'نريدك أن تكون راضياً تماماً عن مشترياتك. إليك كيفية عمل الإرجاع والاسترداد لدى سوبريور تريندز.'
            : "We want you to be fully satisfied with your purchase. Here's how returns and refunds work at Superior Trends."
        }
      />

      <div className="space-y-5 pb-24 text-left rtl:text-right">
        {sections.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="bg-white border border-brand-border/20 rounded-2xl p-6 sm:p-7 flex gap-5 items-start shadow-sm"
          >
            <div className="w-11 h-11 rounded-xl bg-[#8b1a2a]/6 border border-[#8b1a2a]/10 flex items-center justify-center text-[#8b1a2a] shrink-0">
              <Icon size={19} />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-black uppercase tracking-tight text-brand-charcoal mb-1.5">
                {title}
              </h2>
              <p className="text-[13px] sm:text-sm text-brand-text-muted leading-relaxed font-medium">{body}</p>
            </div>
          </div>
        ))}

        <div className="bg-[#8b1a2a] rounded-2xl p-7 sm:p-8 text-white/90">
          <h2 className="font-display text-base sm:text-lg font-black uppercase tracking-tight text-white mb-4">
            {language === 'ar' ? 'تحتاج مساعدة؟' : 'Need Help?'}
          </h2>
          <div className={`flex flex-col sm:flex-row gap-4 text-sm font-semibold ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
            <a href="mailto:support@superiortrends.com" className="flex items-center gap-2.5 hover:text-[#d4af37] transition-colors">
              <Mail size={16} /> support@superiortrends.com
            </a>
            <a href="tel:+96898765432" className="flex items-center gap-2.5 hover:text-[#d4af37] transition-colors">
              <Phone size={16} /> +968 9876 5432
            </a>
          </div>
        </div>
      </div>
    </PageShell>
  );
};
