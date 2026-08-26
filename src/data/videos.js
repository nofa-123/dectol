/**
 * Customer video album.
 *
 * IMPORTANT — these are **placeholders, not real testimonials**. No customer
 * names, quotes or ratings are invented here: every entry describes what the
 * clip will show and carries `src: null`, which makes the player render a
 * clearly-labelled "coming soon" state instead of a broken video.
 *
 * To publish a real clip, fill in `src` (and optionally `customer`, `quote`,
 * `rating`, `duration`) — the gallery and modal need no code changes. Posters
 * can point at a real still; today they reuse the matching service artwork.
 *
 * `src` may be an MP4/WebM URL or an embed URL; `kind` tells the player which.
 */

import mosque from '@/assets/images/service-mosque.svg'
import office from '@/assets/images/service-office.svg'
import shop from '@/assets/images/service-shop.svg'
import tank from '@/assets/images/service-tank.svg'
import pool from '@/assets/images/service-pool.svg'
import car from '@/assets/images/service-car.svg'
import sofa from '@/assets/images/service-sofa.svg'
import carpet from '@/assets/images/service-carpet.svg'
import curtains from '@/assets/images/service-curtains.svg'
import deep from '@/assets/images/service-deep.svg'
import pest from '@/assets/images/service-pest.svg'
import mattress from '@/assets/images/service-mattress.svg'

/**
 * @typedef {Object} DoctolVideo
 * @property {string}  id
 * @property {string}  landing      slug of the landing page it belongs to
 * @property {string}  serviceName  chip label in the gallery
 * @property {string}  title        what the clip shows
 * @property {string}  poster
 * @property {string?} src          null until a real clip is uploaded
 * @property {'file'|'embed'} kind
 * @property {string?} duration
 * @property {string?} customer     only when we have consent to publish
 * @property {string?} quote
 * @property {number?} rating
 */

const placeholder = (v) => ({
  src: null,
  kind: 'file',
  duration: null,
  customer: null,
  quote: null,
  rating: null,
  ...v,
})

export const videos = [
  /* --- الخدمات التأهيلية --- */
  placeholder({
    id: 'v-rehab-1',
    landing: 'rehabilitation',
    serviceName: 'الخدمات التأهيلية',
    title: 'تأهيل شقة بعد التشطيب — من الغبار إلى التسليم',
    poster: deep,
  }),
  placeholder({
    id: 'v-rehab-2',
    landing: 'rehabilitation',
    serviceName: 'الخدمات التأهيلية',
    title: 'تجهيز فيلا قبل السكن في يوم واحد',
    poster: deep,
  }),

  /* --- تنظيف الأثاث --- */
  placeholder({
    id: 'v-furniture-1',
    landing: 'furniture-cleaning',
    serviceName: 'تنظيف الأثاث',
    title: 'غسيل كنب بالبخار وإزالة بقع القهوة',
    poster: sofa,
  }),
  placeholder({
    id: 'v-furniture-2',
    landing: 'furniture-cleaning',
    serviceName: 'تنظيف الأثاث',
    title: 'استخلاص السجاد — ما الذي يخرج من الألياف فعلاً',
    poster: carpet,
  }),
  placeholder({
    id: 'v-furniture-3',
    landing: 'furniture-cleaning',
    serviceName: 'تنظيف الأثاث',
    title: 'تنظيف الستائر بالبخار بدون فك',
    poster: curtains,
  }),
  placeholder({
    id: 'v-furniture-4',
    landing: 'furniture-cleaning',
    serviceName: 'تنظيف الأثاث',
    title: 'تعقيم المراتب بالبخار والأشعة',
    poster: mattress,
  }),

  /* --- المسابح والخزانات --- */
  placeholder({
    id: 'v-pools-1',
    landing: 'pools-tanks-cleaning',
    serviceName: 'المسابح والخزانات',
    title: 'تنظيف مسبح من الطحالب حتى صفاء الماء',
    poster: pool,
  }),
  placeholder({
    id: 'v-pools-2',
    landing: 'pools-tanks-cleaning',
    serviceName: 'المسابح والخزانات',
    title: 'داخل خزان أرضي — إزالة الرواسب والتعقيم',
    poster: tank,
  }),

  /* --- المساجد --- */
  placeholder({
    id: 'v-mosque-1',
    landing: 'mosque-cleaning',
    serviceName: 'تنظيف المساجد',
    title: 'غسيل سجاد مصلى بين الصلوات',
    poster: mosque,
  }),
  placeholder({
    id: 'v-mosque-2',
    landing: 'mosque-cleaning',
    serviceName: 'تنظيف المساجد',
    title: 'تنظيف دورات المياه ومواضع الوضوء',
    poster: mosque,
  }),

  /* --- السيارات --- */
  placeholder({
    id: 'v-car-1',
    landing: 'car-cleaning',
    serviceName: 'تنظيف السيارات',
    title: 'تنظيف مقصورة سيارة بالبخار وتعطيرها',
    poster: car,
  }),
  placeholder({
    id: 'v-car-2',
    landing: 'car-cleaning',
    serviceName: 'تنظيف السيارات',
    title: 'غسيل المقاعد والفرش وإزالة البقع',
    poster: car,
  }),

  /* --- المكاتب والمحلات --- */
  placeholder({
    id: 'v-commercial-1',
    landing: 'offices-shops-cleaning',
    serviceName: 'المكاتب والمحلات',
    title: 'تنظيف مكتب بعد الدوام — جاهز قبل الصباح',
    poster: office,
  }),
  placeholder({
    id: 'v-commercial-2',
    landing: 'offices-shops-cleaning',
    serviceName: 'المكاتب والمحلات',
    title: 'تجهيز محل تجاري قبل الافتتاح',
    poster: shop,
  }),

  /* --- مكافحة الحشرات --- */
  placeholder({
    id: 'v-pest-1',
    landing: 'pest-control',
    serviceName: 'مكافحة الحشرات',
    title: 'معاينة وتحديد مصدر الإصابة قبل الرش',
    poster: pest,
  }),
  placeholder({
    id: 'v-pest-2',
    landing: 'pest-control',
    serviceName: 'مكافحة الحشرات',
    title: 'برنامج بق الفراش — خطوة بخطوة',
    poster: pest,
  }),
]

/** Videos for one landing page. */
export const videosFor = (landing) => videos.filter((v) => v.landing === landing)

/** Chips for the home album — "الكل" plus one per service that has clips. */
export function videoFilters() {
  const seen = new Map()
  videos.forEach((v) => {
    if (!seen.has(v.landing)) seen.set(v.landing, v.serviceName)
  })
  return [{ id: 'all', label: 'كل الخدمات' }, ...[...seen].map(([id, label]) => ({ id, label }))]
}
