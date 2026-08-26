/**
 * Service catalogue (mock).
 *
 * Shape mirrors the planned Laravel `GET /api/v1/services` payload so that
 * `src/utils/api.js` can be repointed at the real endpoint without touching
 * any component. Prices are in SAR, excluding VAT.
 *
 * Every bookable service carries a `config` descriptor that tells the booking
 * step which configurator to render and how to price it. Five kinds exist:
 *
 *   capacity  — tiered by "how many seats/people", with a per-unit overflow rate
 *   units     — several countable unit types, optional add-on group, optional
 *               free-form custom sizes priced per m²
 *   area      — priced per square metre
 *   choice    — pick exactly one variant
 *   property  — the rehabilitation flow: condition → area band → room counts
 *
 * Adding a service means adding data here; no component changes.
 */

import catRehab from '@/assets/images/cat-rehab.svg'
import catFurniture from '@/assets/images/cat-furniture.svg'
import catPools from '@/assets/images/cat-pools.svg'
import catCars from '@/assets/images/cat-cars.svg'
import catPest from '@/assets/images/cat-pest.svg'
/* Photography from the mobile design, for the three headline categories. */
import photoFurniture from '@/assets/mockup/service-sofa.webp'
import photoRehab from '@/assets/mockup/service-deep.webp'
import photoPest from '@/assets/mockup/service-pest.webp'
import catMosque from '@/assets/images/cat-mosque.svg'
import catCommercial from '@/assets/images/cat-commercial.svg'

import mosqueImg from '@/assets/images/service-mosque.svg'
import officeImg from '@/assets/images/service-office.svg'
import shopImg from '@/assets/images/service-shop.svg'
import tankImg from '@/assets/images/service-tank.svg'
import poolImg from '@/assets/images/service-pool.svg'
import carImg from '@/assets/images/service-car.svg'

import sofa from '@/assets/images/service-sofa.svg'
import carpet from '@/assets/images/service-carpet.svg'
import curtains from '@/assets/images/service-curtains.svg'
import mattress from '@/assets/images/service-mattress.svg'
import deep from '@/assets/images/service-deep.svg'
import pest from '@/assets/images/service-pest.svg'
import majlis from '@/assets/images/service-majlis.svg'

/** Top-level category rail shown at the start of the booking flow. */
export const categories = [
  {
    id: 'rehab',
    name: 'النظافة التأهيلية',
    short: 'تأهيلية',
    icon: 'building',
    image: catRehab,
    photo: photoRehab,
    headline: 'النظافة التأهيلية',
    hint: 'اختر نوع العقار وأدخل التفاصيل للحصول على السعر',
  },
  {
    id: 'furniture',
    name: 'أثاث منزلي',
    short: 'أثاث',
    icon: 'sofa',
    image: catFurniture,
    photo: photoFurniture,
    headline: 'خدمات أثاث منزلي',
    hint: 'اختر ما يناسبك من الخدمات التالية',
  },
  {
    id: 'pools',
    name: 'المسابح والخزانات',
    short: 'مسابح',
    icon: 'pool',
    image: catPools,
    headline: 'نظافة المسابح والخزانات',
    hint: 'اختر نوع وحجم المسبح أو الخزان',
  },
  {
    id: 'mosques',
    name: 'تنظيف المساجد',
    short: 'مساجد',
    icon: 'mosque',
    image: catMosque,
    headline: 'تنظيف المساجد',
    hint: 'خدمة تُنفّذ بعناية واحترام لبيوت الله',
  },
  {
    id: 'commercial',
    name: 'مكاتب ومحلات',
    short: 'تجاري',
    icon: 'desk',
    image: catCommercial,
    headline: 'تنظيف المكاتب التجارية والمحلات',
    hint: 'خدمة مرة واحدة أو عقد دوري يناسب منشأتك',
  },
  {
    id: 'cars',
    name: 'نظافة سيارات',
    short: 'سيارات',
    icon: 'car-seat',
    image: catCars,
    headline: 'نظافة السيارات',
    hint: 'تنظيف داخلي وخارجي وتعقيم شامل',
  },
  {
    id: 'pest',
    name: 'مكافحة الحشرات',
    short: 'حشرات',
    icon: 'pest',
    image: catPest,
    photo: photoPest,
    headline: 'مكافحة الحشرات',
    hint: 'معاينة مجانية ومبيدات مرخّصة وآمنة',
  },
]

/* ------------------------------------------------------------------ */
/* Rehabilitation cleaning — five property types share one shape       */
/* ------------------------------------------------------------------ */

/**
 * Area bands differ by condition, and so do the bands themselves: a
 * post-finishing job starts one step higher because construction dust turns
 * even a small unit into a full day's work.
 */
function areaBands(base) {
  return {
    before: [
      { id: 'lt100', label: 'أقل من 100م²', price: base },
      { id: '100-150', label: '100 – 150م²', price: base + 150 },
      { id: '151-200', label: '151 – 200م²', price: base + 300 },
      { id: 'gt200', label: 'أكثر من 200م²', price: base + 450 },
    ],
    after: [
      { id: 'lte150', label: 'حتى 150م²', price: base + 150 },
      { id: '151-200', label: '151 – 200م²', price: base + 300 },
      { id: '201-300', label: '201 – 300م²', price: base + 500 },
      { id: 'gt300', label: 'أكثر من 300م²', price: base + 750 },
    ],
  }
}

const ROOM_COUNTERS = [
  { id: 'rooms', label: 'الغرف', icon: 'bed-double', default: 2, min: 0, max: 12 },
  { id: 'halls', label: 'الصالات', icon: 'sofa', default: 1, min: 0, max: 8 },
  { id: 'baths', label: 'دورات المياه', icon: 'toilet', default: 3, min: 1, max: 10 },
  { id: 'kitchens', label: 'المطابخ', icon: 'kitchen', default: 1, min: 0, max: 5 },
]

function buildRehabServices() {
  const types = [
    {
      id: 'apartment',
      name: 'شقة',
      icon: 'building',
      base: 449,
      slug: 'apartment-deep-cleaning',
      unitLabel: 'لشقة حتى 150م²',
    },
    { id: 'villa', name: 'فيلا', icon: 'villa', base: 899, slug: 'villa-deep-cleaning', unitLabel: 'للفيلا' },
    {
      id: 'chalet',
      name: 'استراحة / شاليه',
      icon: 'palm',
      base: 899,
      slug: 'chalet-deep-cleaning',
      unitLabel: 'للاستراحة',
    },
    { id: 'office', name: 'مكتب', icon: 'desk', base: 349, slug: 'office-deep-cleaning', unitLabel: 'للمكتب' },
    { id: 'shop', name: 'محل تجاري', icon: 'store', base: 349, slug: 'shop-deep-cleaning', unitLabel: 'للمحل' },
  ]

  return types.map((type) => ({
    id: type.id,
    categoryId: 'rehab',
    slug: type.slug,
    name: `التنظيف التأهيلي — ${type.name}`,
    shortName: type.name,
    tagline: 'من السقف للأرضية قبل ما تسكن',
    summary: 'تنظيف شامل قبل السكن أو بعد التشطيب، يشمل المطبخ والحمامات والزجاج والأرضيات.',
    description:
      'خدمة شاملة تغطي المطبخ والحمامات والغرف والنوافذ والأرضيات والأسطح العالية. مناسبة قبل الانتقال لمنزل جديد، أو بعد أعمال الترميم والتشطيب.',
    icon: type.icon,
    image: deep,
    startingPrice: type.base,
    priceUnit: 'يبدأ من',
    unitLabel: type.unitLabel,
    duration: '4 – 8 ساعات',
    rating: 4.9,
    reviewsCount: 356,
    featured: type.id === 'apartment',
    popular: type.id === 'apartment',
    badge: type.id === 'apartment' ? 'الأعلى تقييماً' : '',
    tags: ['قبل السكن', 'بعد التشطيب', 'تسليم مفاتيح'],
    includes: [
      'تنظيف المطبخ داخلياً وخارجياً وإزالة الدهون',
      'تعقيم الحمامات وإزالة الترسبات',
      'تنظيف النوافذ والزجاج والمرايا',
      'إزالة الغبار من الأسطح العالية والمكيفات',
      'جلي وتلميع الأرضيات',
    ],
    config: {
      kind: 'property',
      noun: type.name,
      states: [
        { id: 'before', label: 'قبل السكن', icon: 'home' },
        { id: 'after', label: 'بعد التشطيب', icon: 'roller' },
      ],
      stateLabel: `حالة ${type.name}`,
      areaLabel: `مساحة ${type.name}`,
      detailsLabel: `تفاصيل ${type.name}`,
      areaOptions: areaBands(type.base),
      counters: ROOM_COUNTERS,
      // Informational only — it changes how the crew is briefed, not the price.
      kitchenCabinet: { label: 'دولاب المطبخ', question: 'هل يوجد دولاب مطبخ؟' },
      finishingNotes: [
        { id: 'cement', label: 'بقايا أسمنت' },
        { id: 'paint', label: 'بقايا دهان' },
        { id: 'dust', label: 'أتربة متراكمة' },
      ],
      upload: {
        title: 'أضف صورة أو فيديو (اختياري)',
        hint: 'لمساعدتنا في فهم الحالة بشكل أدق',
        cta: 'إضافة صورة أو فيديو (اختياري)',
        accept: 'image/jpeg,image/png,video/mp4',
        limits: 'JPG، PNG، MP4 · حتى 20 ميجابايت',
        maxBytes: 20 * 1024 * 1024,
      },
      warning: 'لا تشمل الخدمة رفع أو نقل مخلفات البناء.',
      beforeNote: 'يمكنك تعديل هذه المعلومات لاحقاً قبل تأكيد الطلب',
    },
  }))
}

export const services = [
  /* ------------------------------------------------------------------ */
  /* أثاث منزلي                                                          */
  /* ------------------------------------------------------------------ */
  {
    id: 'sofa',
    categoryId: 'furniture',
    slug: 'sofa-cleaning',
    name: 'تنظيف الكنب',
    tagline: 'كنب نظيف ومعطّر من الداخل قبل الخارج',
    summary: 'غسيل عميق بالبخار للأقمشة والجلود مع إزالة البقع والروائح.',
    description:
      'نستخدم مكائن استخلاص بالبخار تصل إلى عمق الحشوة وتسحب الأتربة والعث والبقع المتراكمة، ثم نعقّم القماش بمواد آمنة معتمدة ونجففه بمراوح صناعية حتى يصبح جاهزاً للاستخدام خلال ساعات.',
    icon: 'sofa',
    image: sofa,
    startingPrice: 199,
    priceUnit: 'يبدأ من',
    unitLabel: 'لطقم 7 أشخاص',
    duration: '90 – 120 دقيقة',
    rating: 4.9,
    reviewsCount: 812,
    badge: 'الأكثر طلباً',
    popular: true,
    featured: true,
    tags: ['قماش', 'جلد', 'مجالس أرضية'],
    includes: [
      'شفط جاف عميق لجميع الأسطح والزوايا',
      'غسيل بالبخار الساخن واستخلاص الأوساخ',
      'معالجة البقع الصعبة بمواد متخصصة',
      'تعقيم ضد العث والبكتيريا',
      'تعطير نهائي وتجفيف صناعي',
    ],
    config: {
      kind: 'capacity',
      title: 'اختر حجم الكنب',
      counterLabel: 'حدد عدد الأشخاص',
      unitNoun: ['شخص', 'أشخاص'],
      tiers: [
        { id: 'p7', label: '7 أشخاص', seats: 7, price: 199 },
        { id: 'p12', label: '12 شخص', seats: 12, price: 299 },
      ],
      extraPerUnit: 35,
      extraAfter: 12,
      extraNote: '+ 35 ر.س لكل شخص إضافي بعد 12 شخص',
      note: '* الأسعار شاملة الغسيل والتجفيف والتعطير',
    },
  },

  {
    id: 'curtains',
    categoryId: 'furniture',
    slug: 'curtain-cleaning',
    name: 'تنظيف الستائر',
    tagline: 'ننظفها بدون فك ولا فوضى',
    summary: 'تنظيف بالبخار للستائر المعلقة، أو فك وغسيل وكي وإعادة تركيب.',
    description:
      'أغلب الستائر لا تحتاج فك. نستخدم البخار الجاف الذي يعقّم القماش ويزيل الغبار والروائح وهي معلقة. وإذا احتاجت غسيلاً كاملاً، نفكها ونغسلها ونكويها ونعيد تركيبها في نفس اليوم.',
    icon: 'curtains',
    image: curtains,
    startingPrice: 80,
    priceUnit: 'يبدأ من',
    unitLabel: 'لستارة الشباك',
    duration: '60 – 120 دقيقة',
    rating: 4.8,
    reviewsCount: 291,
    featured: true,
    tags: ['بدون فك', 'فك وتركيب', 'بلاك أوت'],
    includes: [
      'شفط الغبار من القماش والسكك',
      'تنظيف بالبخار الجاف وهي معلقة',
      'معالجة البقع الظاهرة',
      'تعقيم وتعطير',
      'خيار الفك والغسيل والكي عند الحاجة',
    ],
    config: {
      kind: 'units',
      title: 'اختر نوع وعدد الستائر',
      unitNoun: ['ستارة', 'ستائر'],
      units: [
        { id: 'window', name: 'ستارة شباك', desc: 'ستارة شباك قياسية', price: 80, icon: 'window' },
        { id: 'wall', name: 'ستارة جدار', desc: 'ستارة جدار / كاملة', price: 120, icon: 'curtains' },
      ],
      custom: {
        title: 'حجم مخصص',
        desc: 'أدخل مقاسات الستارة والعدد',
        icon: 'ruler',
        // Tuned so a typical 3م × 2.5م panel lands on the wall-curtain price.
        pricePerSqm: 16,
        defaults: { width: 3, height: 2.5, count: 1 },
      },
      note: 'يتم احتساب السعر بعد إضافة جميع الستائر والمقاسات',
    },
  },

  {
    id: 'mattress',
    categoryId: 'furniture',
    slug: 'mattress-cleaning',
    name: 'تنظيف المراتب',
    tagline: 'نوم صحي يبدأ من مرتبة نظيفة',
    summary: 'تعقيم عميق ضد عث الغبار وإزالة البقع والروائح من المراتب.',
    description:
      'المرتبة تجمع خلايا الجلد والعرق وعث الغبار مع الوقت. ننظفها بالبخار الساخن ثم نعقّمها بالأشعة فوق البنفسجية ونجففها بالكامل، مع معالجة خاصة لمن يعانون من الحساسية.',
    icon: 'mattress',
    image: mattress,
    startingPrice: 130,
    priceUnit: 'يبدأ من',
    unitLabel: 'للمرتبة المفردة',
    duration: '45 – 90 دقيقة',
    rating: 4.9,
    reviewsCount: 407,
    featured: true,
    tags: ['مضاد للحساسية', 'تعقيم UV'],
    includes: [
      'شفط عميق لسطح المرتبة والجوانب',
      'غسيل بالبخار الساخن',
      'تعقيم بالأشعة فوق البنفسجية',
      'معالجة بقع العرق والسوائل',
      'تجفيف كامل قبل المغادرة',
    ],
    config: {
      kind: 'units',
      title: 'اختر نوع وعدد المراتب',
      unitNoun: ['قطعة', 'قطع'],
      units: [
        { id: 'single', name: 'مرتبة مفردة', desc: 'مرتبة مقاس مفرد', price: 130, icon: 'bed-single' },
        { id: 'double', name: 'مرتبة مزدوجة', desc: 'مرتبة مقاس مزدوج', price: 180, icon: 'bed-double' },
      ],
      addonGroup: {
        title: 'إضافة رأس سرير',
        items: [
          { id: 'hb-single', name: 'رأس سرير مفرد', desc: 'لمقاس المفرد', price: 99, icon: 'headboard' },
          { id: 'hb-double', name: 'رأس سرير مزدوج', desc: 'لمقاس المزدوج', price: 130, icon: 'headboard-wide' },
        ],
      },
      note: 'يتم احتساب السعر بعد إضافة جميع المراتب وإضافات رؤوس الأسرة',
    },
  },

  {
    id: 'carpet',
    categoryId: 'furniture',
    slug: 'carpet-cleaning',
    name: 'تنظيف السجاد',
    tagline: 'ألوان ترجع كما كانت أول يوم',
    summary: 'غسيل وتجفيف احترافي للسجاد داخل منزلك أو في مغسلتنا.',
    description:
      'نفحص نوع الألياف أولاً، ثم نختار المنظف المناسب لكل سجادة حتى لا تتأثر الألوان. الغسيل يتم بمكائن استخلاص عالية الضغط تليها مرحلة تجفيف كاملة تمنع الرطوبة والروائح.',
    icon: 'carpet',
    image: carpet,
    startingPrice: 10,
    priceUnit: 'يبدأ من',
    unitLabel: 'للمتر المربع',
    duration: '60 – 180 دقيقة',
    rating: 4.8,
    reviewsCount: 634,
    popular: true,
    featured: true,
    tags: ['سجاد', 'سجاد عجمي', 'صوف'],
    includes: [
      'قياس المساحة وتحديد نوع الألياف',
      'شفط عميق وإزالة الشعر والأتربة',
      'غسيل بالمنظفات المناسبة لكل نوع',
      'استخلاص الماء وتجفيف صناعي',
      'تمشيط الوبر وإعادة التركيب',
    ],
    config: {
      kind: 'area',
      title: 'أدخل مساحة السجاد',
      pricePerSqm: 10,
      minArea: 6,
      unitSuffix: 'ر.س / م²',
      presets: [
        { id: 'a10', label: '10 م²', area: 10 },
        { id: 'a20', label: '20 م²', area: 20 },
        { id: 'a40', label: '40 م²', area: 40 },
      ],
      note: `الحد الأدنى 6 م² — يمكن للفني إعادة القياس عند الوصول`,
    },
  },

  {
    id: 'moquette',
    categoryId: 'furniture',
    slug: 'moquette-cleaning',
    name: 'تنظيف الموكيت',
    tagline: 'موكيت نظيف بدون رطوبة ولا روائح',
    summary: 'غسيل واستخلاص للموكيت المثبّت مع تجفيف سريع.',
    description:
      'الموكيت المثبّت لا يمكن رفعه، لذلك نستخدم مكائن استخلاص تسحب الماء والأوساخ في نفس الوقت، ثم نجففه بمراوح صناعية حتى لا تبقى رطوبة تسبب الروائح.',
    icon: 'moquette',
    image: carpet,
    startingPrice: 10,
    priceUnit: 'يبدأ من',
    unitLabel: 'للمتر المربع',
    duration: '60 – 180 دقيقة',
    rating: 4.7,
    reviewsCount: 188,
    tags: ['موكيت مثبّت', 'مكاتب', 'غرف'],
    includes: [
      'شفط جاف عميق قبل الغسيل',
      'رش المنظف ومعالجة البقع',
      'استخلاص بالضغط العالي',
      'تجفيف صناعي سريع',
    ],
    config: {
      kind: 'area',
      title: 'أدخل مساحة الموكيت',
      pricePerSqm: 10,
      minArea: 10,
      unitSuffix: 'ر.س / م²',
      presets: [
        { id: 'm20', label: '20 م²', area: 20 },
        { id: 'm50', label: '50 م²', area: 50 },
        { id: 'm100', label: '100 م²', area: 100 },
      ],
      note: 'الحد الأدنى 10 م²',
    },
  },

  {
    id: 'chairs',
    categoryId: 'furniture',
    slug: 'chair-cleaning',
    name: 'تنظيف الكراسي',
    tagline: 'كراسي السفرة والمكتب كالجديدة',
    summary: 'تنظيف بالبخار لكراسي السفرة والمكاتب المنجّدة.',
    description:
      'نظّف كراسي السفرة أو كراسي المكتب المنجّدة بالبخار الساخن مع معالجة بقع الطعام والمشروبات، وتجفيف كامل قبل المغادرة.',
    icon: 'chair',
    image: majlis,
    startingPrice: 49,
    priceUnit: 'يبدأ من',
    unitLabel: 'للكرسي الواحد',
    duration: '30 – 90 دقيقة',
    rating: 4.7,
    reviewsCount: 96,
    tags: ['سفرة', 'مكتب', 'منجّد'],
    includes: ['شفط عميق للقماش', 'غسيل بالبخار', 'معالجة البقع', 'تعطير وتجفيف'],
    config: {
      kind: 'simple',
      title: 'عدد الكراسي',
      price: 49,
      unitNoun: ['كرسي', 'كراسي'],
      min: 2,
      note: 'الحد الأدنى كرسيان',
    },
  },

  {
    id: 'majlis',
    categoryId: 'furniture',
    slug: 'majlis-cleaning',
    name: 'تنظيف المجالس',
    tagline: 'مجلسك جاهز لاستقبال ضيوفك',
    summary: 'تنظيف متكامل للمجالس الأرضية بالجلسات والمساند والسجاد.',
    description:
      'المجلس الأرضي يحتاج عناية مختلفة عن الكنب. ننظف الجلسات والمساند والمداخل والسجاد كوحدة واحدة، مع تعطير نهائي يجعل المجلس جاهزاً لاستقبال الضيوف في نفس اليوم.',
    icon: 'majlis',
    image: majlis,
    startingPrice: 299,
    priceUnit: 'يبدأ من',
    unitLabel: 'للمجلس المتوسط',
    duration: '120 – 240 دقيقة',
    rating: 4.8,
    reviewsCount: 274,
    tags: ['جلسات أرضية', 'مساند', 'سجاد المجلس'],
    includes: [
      'شفط عميق للجلسات والمساند',
      'غسيل بالبخار لكامل الأقمشة',
      'تنظيف سجاد المجلس',
      'معالجة بقع القهوة والشاي',
      'تعطير وتجفيف كامل',
    ],
    config: {
      kind: 'choice',
      title: 'اختر حجم المجلس',
      variants: [
        { id: 'small', label: 'مجلس صغير', desc: 'حتى 10 جلسات', price: 299 },
        { id: 'medium', label: 'مجلس متوسط', desc: 'حتى 16 جلسة', price: 429 },
        { id: 'large', label: 'مجلس كبير', desc: 'أكثر من 16 جلسة', price: 589 },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  /* النظافة التأهيلية                                                   */
  /* ------------------------------------------------------------------ */
  ...buildRehabServices(),

  /* ------------------------------------------------------------------ */
  /* مسابح · سيارات · حشرات                                              */
  /* ------------------------------------------------------------------ */
  {
    id: 'mosque',
    categoryId: 'mosques',
    slug: 'mosque-cleaning',
    name: 'تنظيف المساجد',
    tagline: 'نظافة بيوت الله بعناية واحترام',
    summary: 'غسيل السجاد وتنظيف المصليات والمرافق ودورات المياه مع تعقيم كامل.',
    description:
      'خدمة متكاملة للمساجد تشمل غسيل السجاد والموكيت، وتنظيف المصليات والمداخل والأبواب والزجاج، ودورات المياه ومواضع الوضوء، مع تعقيم وإزالة الغبار. تُنفَّذ في أوقات لا تتعارض مع الصلاة، ومتاحة كبرنامج دوري.',
    icon: 'mosque',
    image: mosqueImg,
    startingPrice: 899,
    priceUnit: 'يبدأ من',
    unitLabel: 'للمسجد الصغير',
    duration: '4 – 10 ساعات',
    rating: 4.9,
    reviewsCount: 64,
    tags: ['سجاد المصلى', 'دورات المياه', 'برنامج دوري'],
    includes: [
      'غسيل السجاد والموكيت بالبخار',
      'تنظيف المصليات والأرضيات والمداخل',
      'تنظيف الأبواب والنوافذ والزجاج',
      'تنظيف دورات المياه ومواضع الوضوء',
      'إزالة الغبار والتعقيم حسب الحاجة',
    ],
    config: {
      kind: 'choice',
      title: 'اختر حجم المسجد',
      variants: [
        { id: 'small', label: 'مسجد صغير', desc: 'حتى 200 م²', price: 899 },
        { id: 'medium', label: 'مسجد متوسط', desc: '201 – 500 م²', price: 1490 },
        { id: 'large', label: 'جامع كبير', desc: 'أكثر من 500 م²', price: 2290 },
      ],
    },
  },

  {
    id: 'office-cleaning',
    categoryId: 'commercial',
    slug: 'office-cleaning',
    name: 'تنظيف المكاتب',
    tagline: 'مكان عمل نظيف من أول زيارة',
    summary: 'تنظيف المكاتب والطاولات والكراسي والزجاج والمرافق المشتركة.',
    description:
      'نغطي المكاتب والطاولات والكراسي والأرضيات والزجاج والمداخل والاستقبال ودورات المياه والمساحات المشتركة، مع إزالة الغبار من كل الأسطح. تُنفَّذ بعد الدوام أو في العطلة حتى لا تتوقف أعمالك.',
    icon: 'desk',
    image: officeImg,
    startingPrice: 449,
    priceUnit: 'يبدأ من',
    unitLabel: 'لمكتب حتى 100 م²',
    duration: '3 – 8 ساعات',
    rating: 4.8,
    reviewsCount: 112,
    tags: ['بعد الدوام', 'استقبال', 'مساحات مشتركة'],
    includes: [
      'تنظيف المكاتب والطاولات والكراسي',
      'تنظيف الأرضيات والزجاج',
      'تنظيف المداخل والاستقبال',
      'تنظيف دورات المياه',
      'إزالة الغبار من الأسطح والمساحات المشتركة',
    ],
    config: {
      kind: 'choice',
      title: 'اختر حجم المكتب',
      variants: [
        { id: 'small', label: 'مكتب صغير', desc: 'حتى 100 م²', price: 449 },
        { id: 'medium', label: 'مكتب متوسط', desc: '101 – 300 م²', price: 849 },
        { id: 'large', label: 'مقر كبير', desc: 'أكثر من 300 م²', price: 1390 },
      ],
    },
  },

  {
    id: 'shop-cleaning',
    categoryId: 'commercial',
    slug: 'shop-cleaning',
    name: 'تنظيف المحلات والمعارض',
    tagline: 'واجهة نظيفة تبيع قبل أن تتكلم',
    summary: 'تنظيف الأرضيات والواجهات والأرفف ومناطق العرض والمستودعات.',
    description:
      'تنظيف كامل للمحل أو المعرض: الأرضيات والواجهات والزجاج والأرفف والأسطح ومناطق العرض والمستودعات والمرافق. متاحة قبل الافتتاح أو بعد التجديد والترميم.',
    icon: 'store',
    image: shopImg,
    startingPrice: 399,
    priceUnit: 'يبدأ من',
    unitLabel: 'لمحل حتى 100 م²',
    duration: '3 – 7 ساعات',
    rating: 4.8,
    reviewsCount: 87,
    tags: ['قبل الافتتاح', 'واجهات زجاجية', 'مستودعات'],
    includes: [
      'تنظيف أرضيات المحل',
      'تنظيف الواجهات والزجاج',
      'تنظيف الأرفف والأسطح ومناطق العرض',
      'تنظيف المستودعات والمرافق',
      'تنظيف قبل الافتتاح أو بعد التجديد',
    ],
    config: {
      kind: 'choice',
      title: 'اختر حجم المحل',
      variants: [
        { id: 'small', label: 'محل صغير', desc: 'حتى 100 م²', price: 399 },
        { id: 'medium', label: 'محل متوسط', desc: '101 – 300 م²', price: 749 },
        { id: 'showroom', label: 'معرض كبير', desc: 'أكثر من 300 م²', price: 1290 },
      ],
    },
  },

  {
    id: 'contract',
    categoryId: 'commercial',
    slug: 'cleaning-contract',
    name: 'عقود التنظيف الدورية',
    tagline: 'نظافة مستمرة بدون ما تتابع',
    summary: 'عقود شهرية أو سنوية بزيارات مجدولة وفريق ثابت لمنشأتك.',
    description:
      'برنامج تنظيف دوري لمنشأتك بزيارات مجدولة وفريق ثابت يعرف المكان. يشمل تنظيفاً دورياً وعقوداً شهرية وسنوية وخدمات حسب الطلب، مع تقرير بعد كل زيارة.',
    icon: 'refresh',
    image: officeImg,
    startingPrice: 1490,
    priceUnit: 'يبدأ من',
    unitLabel: 'للعقد الشهري',
    duration: 'زيارات مجدولة',
    rating: 4.9,
    reviewsCount: 41,
    tags: ['شهري', 'سنوي', 'فريق ثابت'],
    includes: [
      'زيارات مجدولة حسب العقد',
      'فريق ثابت يعرف منشأتك',
      'تقرير بعد كل زيارة',
      'أولوية في الجدولة',
      'أسعار تفضيلية على الخدمات الإضافية',
    ],
    config: {
      kind: 'choice',
      title: 'اختر نوع العقد',
      variants: [
        { id: 'monthly', label: 'عقد شهري', desc: '4 زيارات شهرياً', price: 1490 },
        { id: 'quarterly', label: 'عقد ربع سنوي', desc: '12 زيارة', price: 4190 },
        { id: 'yearly', label: 'عقد سنوي', desc: '48 زيارة + أولوية', price: 15900 },
        { id: 'onDemand', label: 'حسب الطلب', desc: 'نحدد بعد المعاينة', price: 449 },
      ],
    },
  },

  {
    id: 'tank',
    categoryId: 'pools',
    slug: 'water-tank-cleaning',
    name: 'تنظيف الخزانات',
    tagline: 'نظافة المياه تبدأ من المكان الذي يحتفظ بها',
    summary: 'تنظيف الخزانات الأرضية والعلوية وإزالة الرواسب مع التعقيم.',
    description:
      'تفريغ الخزان وإزالة الرواسب والأوساخ، وتنظيف الجدران والأرضيات الداخلية ومكونات الخزان، ثم تعقيمه وشطفه وإعادة تعبئته. تشمل الخزانات الأرضية والعلوية.',
    icon: 'tank',
    image: tankImg,
    startingPrice: 349,
    priceUnit: 'يبدأ من',
    unitLabel: 'للخزان الأرضي',
    duration: '90 – 180 دقيقة',
    rating: 4.8,
    reviewsCount: 158,
    tags: ['أرضي', 'علوي', 'تعقيم'],
    includes: [
      'تفريغ الخزان وإزالة الرواسب',
      'تنظيف الجدران والأرضيات الداخلية',
      'تنظيف مكونات الخزان حسب الحاجة',
      'تعقيم الخزان وشطفه',
      'إعادة التعبئة والتأكد من الإغلاق',
    ],
    config: {
      kind: 'choice',
      title: 'اختر نوع الخزان',
      variants: [
        { id: 'ground', label: 'خزان أرضي', desc: 'حتى 5 أمتار مكعبة', price: 349 },
        { id: 'roof', label: 'خزان علوي', desc: 'حتى 2 متر مكعب', price: 249 },
        { id: 'both', label: 'أرضي + علوي', desc: 'الخزانان معاً', price: 549 },
        { id: 'large', label: 'خزان كبير', desc: 'أكثر من 5 أمتار مكعبة', price: 749 },
      ],
    },
  },

  {
    id: 'pool',
    categoryId: 'pools',
    slug: 'pool-cleaning',
    name: 'نظافة المسابح',
    tagline: 'ماء صافي ومتوازن كيميائياً',
    summary: 'تنظيف الجدران والأرضية، وفلترة وموازنة كيميائية للمياه.',
    description:
      'نكشط الجدران والأرضية ونزيل الطحالب، ننظف الفلاتر والسلال، ثم نضبط توازن الكلور والحموضة ونسلّمك تقريراً بقراءات المياه.',
    icon: 'pool',
    image: poolImg,
    startingPrice: 349,
    priceUnit: 'يبدأ من',
    unitLabel: 'للمسبح الصغير',
    duration: '120 – 240 دقيقة',
    rating: 4.7,
    reviewsCount: 132,
    tags: ['طحالب', 'فلاتر', 'موازنة كيميائية'],
    includes: [
      'كشط الجدران والأرضية',
      'شفط القاع وإزالة الرواسب',
      'تنظيف السلال والفلاتر',
      'موازنة الكلور والحموضة',
      'تقرير بقراءات المياه',
    ],
    config: {
      kind: 'choice',
      title: 'اختر حجم المسبح',
      variants: [
        { id: 'small', label: 'مسبح صغير', desc: 'حتى 20 م²', price: 349 },
        { id: 'medium', label: 'مسبح متوسط', desc: '21 – 50 م²', price: 549 },
        { id: 'large', label: 'مسبح كبير', desc: 'أكثر من 50 م²', price: 899 },
      ],
    },
  },

  {
    id: 'car',
    categoryId: 'cars',
    slug: 'car-cleaning',
    name: 'نظافة السيارات',
    tagline: 'تنظيف داخلي وخارجي وتعقيم شامل',
    summary: 'غسيل المقاعد والفرش بالبخار مع تلميع خارجي وتعقيم المقصورة.',
    description:
      'نغسل المقاعد والفرش والسقف بالبخار، ننظف لوحة القيادة والفتحات، ونعقّم المقصورة بالأوزون لإزالة الروائح، مع تلميع خارجي كامل.',
    icon: 'car-seat',
    image: carImg,
    startingPrice: 149,
    priceUnit: 'يبدأ من',
    unitLabel: 'للسيارة الصغيرة',
    duration: '90 – 180 دقيقة',
    rating: 4.8,
    reviewsCount: 221,
    tags: ['بخار', 'تعقيم أوزون', 'تلميع'],
    includes: [
      'غسيل المقاعد والفرش بالبخار',
      'تنظيف لوحة القيادة والفتحات',
      'تعقيم المقصورة بالأوزون',
      'تنظيف الزجاج من الداخل والخارج',
      'تلميع خارجي',
    ],
    config: {
      kind: 'choice',
      title: 'اختر نوع السيارة',
      variants: [
        { id: 'sedan', label: 'سيارة صغيرة', desc: 'سيدان', price: 149 },
        { id: 'suv', label: 'سيارة متوسطة', desc: 'كروس أوفر', price: 199 },
        { id: 'large', label: 'سيارة كبيرة', desc: 'دفع رباعي / فان', price: 249 },
      ],
    },
  },

  {
    id: 'pest',
    categoryId: 'pest',
    slug: 'pest-control',
    name: 'مكافحة الحشرات',
    tagline: 'حلول آمنة ونتائج مضمونة',
    summary: 'مكافحة الصراصير والنمل والبق والقوارض بمبيدات مرخّصة وآمنة.',
    description:
      'نبدأ بمعاينة مجانية لتحديد نوع الإصابة ومصدرها، ثم نطبق برنامج مكافحة مناسب بمبيدات مرخّصة من وزارة البيئة، عديمة الرائحة وآمنة على الأطفال بعد ساعتين من التطبيق. تشمل الخدمة زيارة متابعة مجانية.',
    icon: 'pest',
    image: pest,
    startingPrice: 249,
    priceUnit: 'يبدأ من',
    unitLabel: 'للشقة',
    duration: '60 – 120 دقيقة',
    rating: 4.7,
    reviewsCount: 218,
    featured: true,
    tags: ['صراصير', 'بق الفراش', 'نمل', 'قوارض'],
    includes: [
      'معاينة مجانية وتحديد نوع الإصابة',
      'مبيدات مرخّصة عديمة الرائحة',
      'رش الشقوق والمصادر ومناطق التكاثر',
      'وضع طُعوم آمنة بعيداً عن متناول الأطفال',
      'زيارة متابعة مجانية خلال 30 يوم',
    ],
    config: {
      kind: 'choice',
      title: 'اختر نوع المكان',
      variants: [
        { id: 'apt', label: 'شقة سكنية', desc: 'حتى 4 غرف', price: 249 },
        { id: 'villa', label: 'فيلا', desc: 'دورين وحديقة', price: 449 },
        { id: 'bedbugs', label: 'برنامج بق الفراش', desc: 'برنامج مكثّف بزيارتين', price: 599 },
        { id: 'commercial', label: 'محل أو مكتب', desc: 'منشأة تجارية', price: 549 },
      ],
    },
  },
]

/** Discovery quiz — maps a felt need to a recommended service. */
export const discoveryOptions = [
  { id: 'd-sofa', emoji: '🛋️', label: 'الكنب يحتاج تنظيف', serviceId: 'sofa' },
  { id: 'd-carpet', emoji: '🧼', label: 'السجاد يحتاج تنظيف عميق', serviceId: 'carpet' },
  { id: 'd-curtains', emoji: '🪟', label: 'الستائر تحتاج تنظيف', serviceId: 'curtains' },
  { id: 'd-mattress', emoji: '🛏️', label: 'المرتبة تحتاج تنظيف', serviceId: 'mattress' },
  { id: 'd-deep', emoji: '🏠', label: 'أحتاج تنظيف شامل', serviceId: 'apartment' },
  { id: 'd-pest', emoji: '🐜', label: 'أحتاج مكافحة حشرات', serviceId: 'pest' },
]

export const serviceCategories = [
  { id: 'all', label: 'كل الخدمات' },
  { id: 'furniture', label: 'الأثاث والمفروشات' },
  { id: 'rehab', label: 'تنظيف تأهيلي' },
  { id: 'other', label: 'مسابح وسيارات وحشرات' },
]
