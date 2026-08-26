/**
 * Time-boxed promotions (mock).
 * `endsAt` is computed relative to load time so the countdown always has
 * something meaningful to show in a demo; a real API returns absolute ISO dates.
 */

import offerSofa from '@/assets/mockup/offer-sofa.webp'
import offerCarpet from '@/assets/images/offer-carpet-bundle.svg'
import offerDeep from '@/assets/images/offer-deep-home.svg'

const hoursFromNow = (h) => new Date(Date.now() + h * 3600_000).toISOString()

export const offers = [
  {
    id: 'offer-sofa-9',
    serviceId: 'sofa',
    title: 'تنظيف كنب حتى 9 أشخاص',
    subtitle: 'تنظيف عميق ومتخصص بالبخار مع تعطير',
    image: offerSofa,
    oldPrice: 490,
    price: 245,
    discountLabel: 'خصم 50٪',
    discountPercent: 50,
    endsAt: hoursFromNow(38),
    highlights: ['يشمل المساند', 'تعقيم ضد العث', 'تجفيف صناعي'],
    remaining: 12,
  },
  {
    id: 'offer-carpet-bundle',
    serviceId: 'carpet',
    title: 'سجاد وموكيت حتى 40 متر',
    subtitle: 'غسيل عميق وتجفيف في نفس اليوم',
    image: offerCarpet,
    oldPrice: 420,
    price: 290,
    discountLabel: 'خصم 31٪',
    discountPercent: 31,
    endsAt: hoursFromNow(76),
    highlights: ['غسيل داخل المنزل', 'آمن على الألوان', 'تمشيط الوبر'],
    remaining: 25,
  },
  {
    id: 'offer-deep-home',
    serviceId: 'apartment',
    title: 'تنظيف عميق لشقة 3 غرف',
    subtitle: 'من السقف للأرضية قبل انتقالك',
    image: offerDeep,
    oldPrice: 999,
    price: 749,
    discountLabel: 'خصم 25٪',
    discountPercent: 25,
    endsAt: hoursFromNow(19),
    highlights: ['فريق 4 فنيين', 'يشمل الزجاج', 'جلي الأرضيات'],
    remaining: 6,
  },
]
