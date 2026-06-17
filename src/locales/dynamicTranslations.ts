import type { Language } from './translations';

const dynamicTranslations: Record<string, Record<string, string>> = {
  ar: {
    // Categories
    'women': 'ملابس تقليدية',
    'women\'s wear': 'ملابس تقليدية',
    'ethnic wear': 'ملابس تقليدية',
    'ethnicwear': 'ملابس تقليدية',
    'men': 'ملابس رجالية',
    'men\'s wear': 'ملابس رجالية',
    'menswear': 'ملابس رجالية',
    'accessories': 'الإكسسوارات',

    // Sections / Collections
    'new arrivals': 'وصل حديثاً',
    'best sellers': 'الأكثر مبيعاً',
    'bestseller': 'الأكثر مبيعاً',
    'trending': 'الأكثر مبيعاً',
    'featured picks': 'المميزة',
    'featured': 'المميزة',
    'curated picks': 'خيارات مختارة',
    'summer collection': 'مجموعة الصيف',
    'winter collection': 'مجموعة الشتاء',
    'sale': 'تخفيضات',
    'clearance': 'تصفية',
    'all collections': 'جميع المجموعات',

    // Colors
    'black': 'أسود',
    'white': 'أبيض',
    'blue': 'أزرق',
    'navy': 'أزرق داكن',
    'navy blue': 'أزرق داكن',
    'red': 'أحمر',
    'crimson': 'قرمزي',
    'maroon': 'مارون',
    'green': 'أخضر',
    'olive': 'زيتوني',
    'olive green': 'زيتوني',
    'beige': 'بيج',
    'cream': 'كريمي',
    'pink': 'وردي',
    'gold': 'ذهبي',
    'golden': 'ذهبي',
    'silver': 'فضي',
    'grey': 'رمادي',
    'gray': 'رمادي',
    'brown': 'بني',
    'yellow': 'أصفر',
    'orange': 'برتقالي',
    'teal': 'تيل',
    'mustard': 'خردلي',
    'peach': 'خوخي',
    'burgundy': 'بورغندي',
    'lavender': 'خزامي',
    'khaki': 'كاكي',
    'tan': 'تان',
    'charcoal': 'فحمي',
    'sage': 'سماوي',
    'emerald': 'زمردي',
    'indigo': 'نيلي',
    'sand': 'رملي',
    'default': 'افتراضي',
  }
};

export function translateDynamic(text: string, language: Language): string {
  if (language === 'en') return text;
  const lower = text.toLowerCase().trim();
  const dict = dynamicTranslations[language];
  if (dict && dict[lower]) {
    return dict[lower];
  }
  return text;
}
