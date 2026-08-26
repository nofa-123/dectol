/**
 * Bundled packages (mock).
 * `items` reference service ids so a package can be expanded into a booking
 * with the same code path as a single service.
 */

import pkgFresh from '@/assets/mockup/package-room.webp'
import pkgFull from '@/assets/images/package-full-care.svg'
import pkgSeason from '@/assets/images/package-seasonal.svg'

export const packages = [
  {
    id: 'fresh-home',
    name: 'باقة البيت المنعش',
    tagline: 'الأساسيات الثلاثة في زيارة واحدة',
    image: pkgFresh,
    price: 799,
    oldPrice: 1250,
    saving: 451,
    duration: 'زيارة واحدة — 5 ساعات تقريباً',
    popular: true,
    items: [
      { serviceId: 'sofa', label: 'تنظيف كنب حتى 7 مقاعد' },
      { serviceId: 'carpet', label: 'سجاد حتى 40 متر مربع' },
      { serviceId: 'curtains', label: 'ستائر حتى 6 قطع' },
    ],
    perks: ['فريق واحد يزورك مرة واحدة', 'ضمان 24 ساعة', 'تعطير مجاني لكل القطع'],
  },
  {
    id: 'full-care',
    name: 'باقة العناية الكاملة',
    tagline: 'كل ما يحتاجه البيت قبل موسم جديد',
    image: pkgFull,
    price: 1390,
    oldPrice: 2080,
    saving: 690,
    duration: 'زيارتان — يومان متتاليان',
    items: [
      { serviceId: 'apartment', label: 'تنظيف عميق لشقة 3 غرف' },
      { serviceId: 'sofa', label: 'تنظيف كنب حتى 9 مقاعد' },
      { serviceId: 'mattress', label: 'تنظيف مرتبتين كينج' },
      { serviceId: 'carpet', label: 'سجاد حتى 40 متر مربع' },
    ],
    perks: ['أولوية في الجدولة', 'ضمان 24 ساعة', 'خصم 15٪ على أي خدمة إضافية'],
  },
  {
    id: 'seasonal',
    name: 'باقة استقبال الضيوف',
    tagline: 'جهّز المجلس والستائر قبل المناسبة',
    image: pkgSeason,
    price: 649,
    oldPrice: 890,
    saving: 241,
    duration: 'زيارة واحدة — 4 ساعات تقريباً',
    items: [
      { serviceId: 'majlis', label: 'مجلس متوسط حتى 16 جلسة' },
      { serviceId: 'curtains', label: 'ستائر حتى 3 قطع' },
    ],
    perks: ['مواعيد مسائية متاحة', 'تعطير خاص للمناسبات', 'ضمان 24 ساعة'],
  },
]
