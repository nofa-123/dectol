/**
 * Editorial, FAQ, trust and before/after content (mock).
 */

import baSofaBefore from '@/assets/mockup/sofa-before.webp'
import baSofaAfter from '@/assets/mockup/sofa-after.webp'
import baCarpetBefore from '@/assets/mockup/rug-before.webp'
import baCarpetAfter from '@/assets/mockup/rug-after.webp'
import baMattressBefore from '@/assets/images/ba-mattress-before.svg'
import baMattressAfter from '@/assets/images/ba-mattress-after.svg'
import baKitchenBefore from '@/assets/images/ba-kitchen-before.svg'
import baKitchenAfter from '@/assets/images/ba-kitchen-after.svg'


export const beforeAfterCases = [
  {
    id: 'ba-sofa',
    label: 'كنب قماش — الرياض',
    serviceId: 'sofa',
    note: 'بقع قهوة وأتربة متراكمة على مدى سنتين',
    before: baSofaBefore,
    after: baSofaAfter,
  },
  {
    id: 'ba-carpet',
    label: 'سجاد صالة — جدة',
    serviceId: 'carpet',
    note: 'باهت اللون بسبب الغبار العالق في الألياف',
    before: baCarpetBefore,
    after: baCarpetAfter,
  },
  {
    id: 'ba-mattress',
    label: 'مرتبة كينج — الدمام',
    serviceId: 'mattress',
    note: 'آثار عرق وعث غبار قبل التعقيم بالبخار',
    before: baMattressBefore,
    after: baMattressAfter,
  },
  {
    id: 'ba-kitchen',
    label: 'مطبخ بعد التشطيب — الخبر',
    serviceId: 'apartment',
    note: 'دهون متراكمة وغبار أعمال البناء',
    before: baKitchenBefore,
    after: baKitchenAfter,
  },
]

export const trustFeatures = [
  {
    id: 'guarantee',
    icon: 'shield',
    title: 'ضمان 24 ساعة',
    text: 'ما كنت راضي عن النتيجة؟ نرجع ونصلحها مجاناً خلال 24 ساعة.',
  },
  {
    id: 'team',
    icon: 'team',
    title: 'فريق متخصص',
    text: 'فنيون مدربون ومصرّح لهم، يصلونك بزي موحد وهوية واضحة.',
  },
  {
    id: 'materials',
    icon: 'leaf',
    title: 'مواد آمنة',
    text: 'منظفات معتمدة آمنة على الأطفال والحيوانات الأليفة وخالية من الروائح النفاذة.',
  },
  {
    id: 'onsite',
    icon: 'pin',
    title: 'خدمة في موقعك',
    text: 'نجي لك بالمعدات كاملة، ما تحتاج تنقل أي شيء من بيتك.',
  },
]

export const stats = [
  { id: 'jobs', value: 10000, prefix: '+', label: 'خدمة مكتملة' },
  { id: 'reviews', value: 2356, prefix: '+', label: 'تقييم موثّق' },
  { id: 'rating', value: 4.9, decimals: 1, suffix: ' / 5', label: 'متوسط التقييم' },
  { id: 'satisfaction', value: 98, suffix: '٪', label: 'عملاء راضون' },
]

export const experienceSteps = [
  {
    id: 'step-1',
    number: '01',
    icon: 'grid',
    title: 'اختر خدمتك',
    text: 'تصفح الخدمات وشوف السعر واضح من البداية بدون مفاجآت.',
  },
  {
    id: 'step-2',
    number: '02',
    icon: 'pin',
    title: 'حدد موقعك وموعدك',
    text: 'اختر الحي والتاريخ والوقت اللي يناسبك، حتى في نفس اليوم.',
  },
  {
    id: 'step-3',
    number: '03',
    icon: 'headset',
    title: 'تابع وصول الفريق',
    text: 'نتواصل معك لتأكيد الطلب، وتوصلك إشعارات بحالة الفريق.',
  },
  {
    id: 'step-4',
    number: '04',
    icon: 'sparkle',
    title: 'استمتع بمنزل أنظف',
    text: 'نسلّمك العمل ونتأكد من رضاك، مع ضمان 24 ساعة على الخدمة.',
  },
]

/** المقالات تعيش الآن في ملفها الخاص مع نصها الكامل؛ يُعاد تصديرها هنا
 * حتى تبقى نقطة الاستيراد الواحدة كما هي لبقية التطبيق. */
export { articles, articleBySlug, articleCategories, articleSlugs } from './articles'

export const faqs = [
  {
    id: 'f1',
    icon: 'clock',
    question: 'كم تستغرق خدمة تنظيف الكنب؟',
    answer:
      'من 90 إلى 120 دقيقة لطقم من 5 إلى 7 مقاعد، وتشمل الشفط والغسيل بالبخار والتعقيم والتجفيف. الأطقم الأكبر أو الأقمشة التي تحتاج معالجة بقع قد تستغرق وقتاً أطول قليلاً، ونخبرك بذلك قبل البدء.',
  },
  {
    id: 'f2',
    icon: 'sofa',
    question: 'هل يتم نقل الأثاث أثناء التنظيف؟',
    answer:
      'نعم، الفريق ينقل القطع الخفيفة ويعيدها لمكانها بعد الانتهاء بدون أي رسوم إضافية. القطع الثقيلة جداً مثل خزائن الحائط أو البيانو نتركها مكانها وننظف حولها حفاظاً على سلامتها وسلامة الفريق.',
  },
  {
    id: 'f3',
    icon: 'shield',
    question: 'هل المنظفات المستخدمة آمنة للأطفال والحيوانات؟',
    answer:
      'كل المواد التي نستخدمها معتمدة وآمنة، خالية من الكلور والروائح النفاذة. بعد التجفيف الكامل يصبح المكان جاهزاً للاستخدام مباشرة. وإذا كان في المنزل شخص لديه حساسية، أخبرنا عند الحجز ونستخدم تركيبة مخصصة.',
  },
  {
    id: 'f4',
    icon: 'sparkle',
    question: 'هل تشمل الخدمة إزالة البقع الصعبة؟',
    answer:
      'نعم، معالجة البقع جزء أساسي من الخدمة ولا نحتسب عليها رسوماً إضافية. البقع القديمة جداً أو التي سبق التعامل معها بمواد كيميائية قد لا تزول بنسبة 100٪، وفي هذه الحالة يخبرك الفني بالنتيجة المتوقعة قبل أن يبدأ.',
  },
  {
    id: 'f5',
    icon: 'pin',
    question: 'ما المناطق التي تغطيها دكتول؟',
    answer:
      'نغطي حالياً الرياض، جدة، مكة المكرمة، الدمام، الخبر، الظهران والطائف، مع توسّع مستمر لمدن جديدة. اختر مدينتك عند الحجز وستظهر لك الأحياء والمواعيد المتاحة فوراً.',
  },
  {
    id: 'f6',
    icon: 'card',
    question: 'ما طرق الدفع المتاحة؟',
    answer:
      'تقدر تدفع بمدى أو Apple Pay أو STC Pay أو البطاقات الائتمانية، أو تقسّط عبر تابي وتمارا. الدفع يتم بعد تأكيد الحجز، ويمكنك أيضاً الدفع كاش للفريق عند إتمام الخدمة.',
  },
]

/** Coverage — drives the location step in the booking flow. */
export const cities = [
  {
    id: 'riyadh',
    name: 'الرياض',
    districts: ['الملقا', 'حطين', 'النرجس', 'الياسمين', 'العليا', 'الروضة', 'قرطبة', 'المونسية'],
  },
  {
    id: 'jeddah',
    name: 'جدة',
    districts: ['الحمدانية', 'الروضة', 'الشاطئ', 'السلامة', 'النعيم', 'أبحر الشمالية', 'الصفا'],
  },
  { id: 'makkah', name: 'مكة المكرمة', districts: ['العزيزية', 'الشوقية', 'النسيم', 'الزاهر'] },
  { id: 'dammam', name: 'الدمام', districts: ['الشاطئ', 'الفيصلية', 'الجلوية', 'النور'] },
  { id: 'khobar', name: 'الخبر', districts: ['العقربية', 'الراكة', 'الثقبة', 'اليرموك'] },
  { id: 'dhahran', name: 'الظهران', districts: ['الدوحة', 'القشلة', 'تلال الظهران'] },
  { id: 'taif', name: 'الطائف', districts: ['الشفا', 'الحوية', 'الفيصلية'] },
]

export const paymentMethods = [
  { id: 'mada', label: 'مدى', hint: 'بطاقة مدى البنكية' },
  { id: 'applepay', label: 'Apple Pay', hint: 'دفع سريع بلمسة واحدة' },
  { id: 'stcpay', label: 'STC Pay', hint: 'محفظة إس تي سي' },
  { id: 'tabby', label: 'تابي', hint: 'قسّمها على 4 دفعات بدون فوائد' },
  { id: 'tamara', label: 'تمارا', hint: 'ادفع بعد 30 يوم' },
  { id: 'cash', label: 'كاش عند الفني', hint: 'الدفع بعد إتمام الخدمة' },
]

export const contactInfo = {
  phone: '920015210',
  phoneDisplay: '920015210',
  whatsapp: '966920015210',
  email: 'Info@doctol.com.sa',
  workingHours: 'السبت – الخميس، 09:00 صباحاً حتى 09:00 مساءً',
  tagline: 'لا تشيل هم، دكتول يهتم',
}

/** The three contact channels shown as cards on the contact page. */
export const contactChannels = [
  {
    id: 'call',
    icon: 'phone',
    title: 'اتصل بنا',
    hint: 'السبت – الخميس، 09:00 ص – 09:00 م',
    value: '920015210',
    display: '920015210',
    href: 'tel:920015210',
    action: 'اتصل الآن',
    numeric: true,
  },
  {
    id: 'visit',
    icon: 'pin',
    title: 'زيارتنا',
    hint: 'قم بالزيارة في مقرنا',
    value: 'جدة - حي الصفاء',
    display: 'جدة - حي الصفاء',
    href: 'https://maps.google.com/?q=21.536441,39.208463',
    action: 'افتح في الخرائط',
    external: true,
  },
  {
    id: 'support',
    icon: 'mail',
    title: 'التواصل مع الدعم',
    hint: 'نحن هنا للمساعدة',
    value: 'Info@doctol.com.sa',
    display: 'Info@doctol.com.sa',
    href: 'mailto:Info@doctol.com.sa',
    action: 'راسلنا',
  },
]

/** Branch network — the map is centred on the first entry. */
export const branches = [
  {
    id: 'hq',
    name: 'المقر الرئيسي',
    hours: 'السبت – الخميس من 09 ص – 09 م',
    address: 'جدة - حي مشرفة',
    lat: 21.536441,
    lng: 39.208463,
  },
]

export const mapCentre = { lat: 21.536441, lng: 39.208463, zoom: 12 }

/** Live DOCTOL accounts. */
export const socialLinks = [
  { name: 'snapchat', label: 'سناب شات', href: 'https://www.snapchat.com/add/doctol_sa' },
  { name: 'tiktok', label: 'تيك توك', href: 'https://www.tiktok.com/@doctol_sa' },
  { name: 'instagram', label: 'إنستقرام', href: 'https://www.instagram.com/doctol.sa' },
  { name: 'x', label: 'إكس', href: 'https://x.com/doctol_sa' },
]
