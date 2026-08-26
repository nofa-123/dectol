# دكتول — DOCTOL Frontend

واجهة أمامية إنتاجية لمنصة **دكتول** لخدمات التنظيف المنزلي في السعودية.
مبنية بـ Vue 3 (Composition API + `<script setup>`) و Vite و Pinia و Vue Router، بتصميم
**RTL-first** وعربي بالكامل.

---

## التشغيل

```bash
npm install
```

```bash
npm run dev
```

| الأمر | الوظيفة |
| --- | --- |
| `npm run dev` | خادم التطوير على `http://localhost:5173` |
| `npm run build` | بناء الإنتاج إلى `dist/` |
| `npm run preview` | معاينة نسخة الإنتاج |
| `npm run gen:assets` | إعادة توليد رسومات SVG في `src/assets/images` |

المتطلبات: Node.js ‏`^20.19` أو `>=22.12` (متطلب Vite 8).

### تجربة Laravel API محليًا

المشروع مضبوط ليمرّر طلبات `/backend-api` عبر Vite إلى عنوان خادم الاختبار
`http://195.250.26.84` مع إرسال `Host: jstaging.system-11.net`. هذا يتجاوز
مشكلة فشل DNS المحلي المتقطعة، ويظل الطلب موجّهًا لنفس Laravel staging.
يعمل هذا الإعداد أثناء `npm run dev` فقط:

```bash
npm install
npm run dev
```

في بيئة الإنتاج استخدم الدومين المباشر كما هو موضح في `.env.example`:
`VITE_API_BASE_URL=http://jstaging.system-11.net`.

### الرفع على Vercel

المشروع مجهز بملف `vercel.json`. يمرر Vercel طلبات `/backend-api` من جهة
الخادم إلى Laravel على `http://jstaging.system-11.net`، ولذلك لا يتصل المتصفح
مباشرة بخادم HTTP ولا تظهر مشكلة Mixed Content. كما يتضمن إعدادًا لإرجاع
`index.html` لمسارات Vue Router مثل `/booking` و`/account`.

ارفع المشروع كاملًا إلى GitHub ثم استورده داخل Vercel باستخدام:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

لا تضف `VITE_API_BASE_URL` يدويًا داخل Vercel؛ ملف `.env.production` مضبوط
مسبقًا على `/backend-api`.

### الرفع على cPanel داخل دومين فرعي

ملفا `public/.htaccess` و`public/backend-api/index.php` يُنسخان تلقائيًا إلى
`dist` أثناء البناء. الأول يحافظ على مسارات Vue Router، والثاني يعمل كبوابة
ثابتة وآمنة بين موقع HTTPS وLaravel الحالي الذي يعمل عبر HTTP. البوابة لا
تقبل إلا مسارات `/api/v1` ولا تسمح بتحويل الطلبات إلى أي خادم آخر.

أنشئ دومينًا فرعيًا مستقلًا مثل `doctol.system-11.net`، ثم ارفع **محتويات**
مجلد `dist` إلى Document Root الخاص به. تأكد من تفعيل PHP cURL في cPanel.

عميل HTTP المشترك في `src/services/http.js`، ومسارات Doctol المأخوذة
من Postman في `src/services/doctolApi.js`. لم يتم استبدال بيانات التصميم
التجريبية حتى يتم التحقق من شكل Responses الحقيقية وإضافة محوّلاتها.

مثال اختبار من Console المتصفح:

```js
import('/src/services/doctolApi.js')
  .then(({ doctolApi }) => doctolApi.services())
  .then(console.log)
  .catch(console.error)
```

### إذا لم يكن Node مثبّتاً

المشروع يعمل أيضاً بدون `npm` عبر [`scripts/dev.sh`](scripts/dev.sh)، وهو سكربت
يبحث عن Node بنفسه (نسخة النظام ← `$DOCTOL_NODE` ← المسارات الشائعة) ثم يشغّل
Vite مباشرة:

```bash
sh scripts/dev.sh
```

`.claude/launch.json` يستدعي هذا السكربت عبر `/bin/sh` بدل `npm`، لأن استدعاء
`npm` غير الموجود يُفشل تشغيل الخادم بخطأ `No such file or directory` قبل أن
تصل الأمور إلى Vite أصلاً. الحل الدائم يبقى تثبيت Node:

```bash
brew install node
```

> **تنبيه بيئة macOS:** إبقاء المشروع داخل `~/Downloads` أو `~/Desktop` أو
> `~/Documents` يجعله رهينة صلاحيات TCC — وقد تُسحب الصلاحية فجأة فتفشل كل
> عمليات القراءة والكتابة بـ `Operation not permitted` بينما يبدو الخطأ وكأنه
> عطل برمجي. ضع المشروع في مجلد عادي مثل `~/projects/doctol`.

---

## البنية

```
src/
├── assets/images/      رسومات SVG مولّدة (بدائل جاهزة للاستبدال بصور حقيقية)
├── components/
│   ├── common/         BaseButton · BaseModal · BaseField · DoctolIcon · ToastHost …
│   ├── header/         AppHeader · LogoMark · NotificationBell
│   ├── navigation/     MobileNav (شريط سفلي) · MobileDrawer
│   ├── hero/           HeroSection
│   ├── booking/        QuickBookingWidget · LeadCaptureSheet · BookingWizard
│   │   │               CategoryCarousel · PackageStrip · ServiceAccordion
│   │   └── config/     مُهيّئات الخدمات: capacity · units · area · simple ·
│   │                   choice · property
│   ├── services/       ServicesSection · ServiceCard · SmartDiscovery
│   ├── offers/         OffersSection · OfferCard · CountdownTimer
│   ├── packages/       PackagesSection · PackageCard
│   ├── reviews/        ReviewsSection · ReviewCard
│   ├── beforeAfter/    BeforeAfterSection · BeforeAfterSlider
│   ├── trust/          WhyDoctol · StatCounter · ExperienceTimeline
│   ├── blog/           BlogSection · BlogCard · ArticleSection · RichText
│   └── footer/         AppFooter · PaymentMethods
├── composables/        useBooking · useCarousel · useCountUp · useInteractions
│                       useResponsive · useScrollAnimation
├── data/               بيانات وهمية (services · serviceLandings · offers · packages ·
│                       reviews · articles · videos · legal · about · content)
├── router/             تعريف المسارات + سلوك التمرير
├── stores/             bookingStore · cartStore · servicesStore · userStore · uiStore
├── styles/             tokens.css · base.css · utilities.css
├── utils/              api.js · pricing.js · format.js · validate.js · motion.js
├── views/              Home · Services · ServiceDetails · ServiceLanding ·
│                       Booking · Offers · Packages · Blog · BlogArticle ·
│                       GiftCard · About · Contact · Complaints ·
│                       PrivacyPolicy · Terms · Account · NotFound
└── assets/brand/       اللوجو الرسمي (SVG متجه)
```

المسارات:

```
/                 الرئيسية           /gift-card          بطاقات الهدايا
/services         الخدمات            /about              من نحن
/services/:slug   تفاصيل الخدمة      /contact-us         تواصل معنا
/offers           العروض             /complaints         الشكاوى والمقترحات
/packages         الباقات            /privacy-policy     سياسة الخصوصية
/booking          الحجز              /terms-conditions   الشروط والأحكام
/account          حسابي              /blog               المدونة
                                     /blog/:slug         صفحة المقال

صفحات الخدمات (Landing Pages):
/services/rehabilitation          الخدمات التأهيلية
/services/furniture-cleaning      تنظيف الأثاث
/services/pools-tanks-cleaning    المسابح والخزانات
/services/mosque-cleaning         تنظيف المساجد
/services/car-cleaning            تنظيف السيارات
/services/offices-shops-cleaning  المكاتب والمحلات
/services/pest-control            مكافحة الحشرات
```

---

## نظام التصميم

كل الألوان والمسافات والحركة معرّفة كمتغيرات CSS في `src/styles/tokens.css`.
لا يستخدم أي مكوّن قيمة لونية مباشرة.

| الرمز | القيمة |
| --- | --- |
| `--dt-teal-500` | `#009FA3` — اللون الأساسي |
| `--dt-navy-700` | `#073B4C` |
| `--dt-gold-500` | `#F5C542` |
| `--dt-teal-50` | `#F1FAF9` |
| الخط | **Lama Sans** (400 / 500 / 600 / 700) — مستضاف ذاتياً في `public/fonts/lama-sans` |
| مدد الحركة | `--dt-dur-1` … `--dt-dur-5` (140ms → 700ms) |

### اللوجو

اللوجو الرسمي (رذاذ التنظيف) متجه SVG مضمّن داخل
[`LogoMark.vue`](src/components/header/LogoMark.vue) بدل `<img>`، حتى يرث اللون:
جسم البخاخ يتحول للأبيض على الخلفيات الداكنة بينما يبقى الرأس بلون العلامة.
اسم العلامة يبقى نصاً حقيقياً بخط Lama Sans — يظل في شجرة الوصولية وقابلاً
للبحث. نسخة الملف الأصلية محفوظة في `src/assets/brand/doctol-mark.svg`
و`public/favicon.svg`.

> مولّد الرسومات `gen:assets` **لا** يكتب اللوجو أو الأيقونة المفضلة، حتى لا
> تُستبدل أصول العلامة الحقيقية عند إعادة التوليد.

### الخط

**Lama Sans** هو خط العلامة المستخدم في doctol.com.sa. ملفاته TTF موضوعة في
`public/fonts/lama-sans/` ومعرّفة في [`src/styles/fonts.css`](src/styles/fonts.css)
بأربعة أوزان مع `font-display: swap`، ووزنا Regular وBold عليهما `preload` في
`index.html`. الخط ليس على Google Fonts، والاستضافة الذاتية تحذف جولة شبكة من
المسار الحرج.

> للحصول على حجم أصغر: حوّل الملفات إلى `woff2` (يقلّصها ~٧٠٪) وحدّث `src`
> في `fonts.css` — لم أُجرِ التحويل لعدم توفر أداة تحويل في البيئة الحالية.

### RTL

- `<html lang="ar" dir="rtl">`.
- كل التخطيطات تستخدم الخصائص المنطقية (`inset-inline-*`, `margin-inline-*`, `padding-block-*`).
- الأسهم والانتقالات تتبع اتجاه القراءة، وليست انعكاساً آلياً لتصميم LTR.
- صنفان للأرقام: `.num` لأرقام لاتينية صرفة (هاتف، رقم حجز، عدّاد)،
  و`.money` لمبلغ متبوع بكلمة «ريال» حتى لا ينعكس ترتيبهما.

---

## تدفق الحجز

ثلاث خطوات، مع شريط تقدّم ثابت وشريط سفلي يعرض الإجمالي وعدد العناصر:

```
شيت بيانات التواصل (اسم + جوال)
        ↓
١ · اختيار الخدمة   ← تصنيفات · باقات · أكورديون خدمات قابل للتهيئة
        ↓
٢ · الموقع والموعد  ← مدينة وحي وعنوان + يوم ووقت
        ↓
٣ · التأكيد والدفع  ← بياناتك · مراجعة · كود خصم · طريقة الدفع
        ↓
     تأكيد الحجز
```

شيت التواصل يظهر مرة واحدة؛ العميل العائد يتخطاه تلقائياً لأن بياناته محفوظة.
السلة **متعددة العناصر**: تقدر تضيف أكثر من خدمة وباقة في نفس الطلب.

### مُهيّئات الخدمات

كل خدمة تحمل واصف `config` يحدد أي مُهيّئ يُعرض وكيف تُحسب:

| النوع | الاستخدام | التسعير |
| --- | --- | --- |
| `capacity` | تنظيف الكنب | شريحة حسب عدد الأشخاص + ٣٥ ر.س لكل شخص بعد ١٢ |
| `units` | الستائر · المراتب | عدّاد لكل نوع + إضافات + مقاسات مخصصة بالمتر المربع |
| `area` | السجاد · الموكيت | سعر المتر المربع مع حد أدنى |
| `simple` | الكراسي | سعر للوحدة |
| `choice` | المجالس · المسابح · السيارات · الحشرات | اختيار واحد |
| `property` | التنظيف التأهيلي | الحالة → شريحة المساحة → عدد الغرف والمرافق |

الحساب كله في [`src/utils/pricing.js`](src/utils/pricing.js) — لا يحسب أي مكوّن
سعراً بنفسه، فلا يمكن أن يختلف رأس الأكورديون عن الشريط السفلي عن الملخص.

إضافة خدمة جديدة = إدخال بيانات في `src/data/services.js` فقط.

**النظافة التأهيلية** اختيار مفرد (عقار واحد لكل زيارة)، وبقية التصنيفات اختيار
متعدد. عند اختيار «بعد التشطيب» تتبدل شرائح المساحة وتظهر ملاحظات التشطيب
ومرفق الصورة/الفيديو والتنبيه الأحمر.

---

## صفحات الخدمات (Landing Pages)

سبع صفحات هبوط، كل واحدة على مسار مستقل بـ SEO مستقل. **مكوّن واحد**
([`ServiceLanding.vue`](src/views/ServiceLanding.vue)) يرسمها جميعاً، وكل المحتوى
يأتي من [`src/data/serviceLandings.js`](src/data/serviceLandings.js) — إضافة خدمة
جديدة = إدخال بيانات، بدون كتابة مكوّن.

أقسام كل صفحة بالترتيب:

```
Hero → شريط الثقة → المشكلة/الحل → الخدمات التفصيلية → لماذا دكتول
→ كيف تعمل الخدمة → قبل/بعد → ألبوم الفيديوهات → الأسئلة الشائعة
→ CTA نهائي → قد تهمك أيضاً → شريط حجز لاصق (جوال)
```

### تمايز بصري بدون تشتيت

كل صفحة تحمل صنف `sl sl--{accent}` يضبط متغيرات اللون والتدرّج والنقشة من
[`src/styles/landing.css`](src/styles/landing.css)، وتقرأها كل الأقسام. سبع
شخصيات بصرية داخل نظام تصميم واحد:

| الصفحة | الطابع |
| --- | --- |
| التأهيلية | كحلي إنشائي · قصة تحوّل |
| الأثاث | دافئ وناعم · نقشة واسعة |
| المسابح والخزانات | أزرق مائي هادئ |
| المساجد | أخضر راقٍ بلمسة ذهبية |
| السيارات | داكن وعالي التباين |
| المكاتب والمحلات | مؤسسي منظّم |
| مكافحة الحشرات | تقني بلمسة تحذير |

كما تتبادل الصفحات اتجاه قسم «المشكلة/الحل» حتى لا تُقرأ كنسخ من بعضها.

### الخدمات الفرعية كاملة

عدد البطاقات في كل صفحة مطابق للمطلوب بلا اختصار: التأهيلية ١٠ · الأثاث ١٠ ·
المسابح والخزانات ١٢ · المساجد ١١ · السيارات ١٠ · المكاتب والمحلات ١٩ ·
مكافحة الحشرات ١٢.

### الربط بنظام الحجز

لم يُنشأ نظام حجز جديد. كل زر «احجز الآن» يستدعي `open({ category, serviceId })`
فيفتح **تدفق الحجز الحالي** على التصنيف الصحيح ويحدّد الخدمة ويفتح مُهيّئها.
تُمرَّر المعرّفات كنصوص لا ككائنات، فلا يعتمد الزر على اكتمال تحميل الكتالوج.

### SEO

[`useSeo`](src/composables/useSeo.js) يضبط لكل صفحة: `title` و`description`
و`canonical` و Open Graph و Twitter، مع ثلاث بطاقات JSON-LD
(`Service` · `FAQPage` · `BreadcrumbList`). الوسوم تُعدَّل في مكانها بدل
إضافة نسخة ثانية — وإلا بقي وسم `index.html` هو الأول وهو ما يقرأه الزاحف —
وتُستعاد قيمها الأصلية عند مغادرة الصفحة.

---

## ألبوم الفيديوهات

قسم في الصفحة الرئيسية ([`VideoGallery`](src/components/video/VideoGallery.vue))
يعرض مقاطع كل الخدمات مع شرائح تصفية، ونسخة مصغّرة داخل كل صفحة خدمة.

> **المقاطع الحالية Placeholders.** لا توجد شهادات أو أسماء أو تقييمات مُختلقة:
> كل مدخل في [`src/data/videos.js`](src/data/videos.js) يصف ما سيعرضه المقطع فقط،
> و`src: null` يجعل المشغّل يعرض حالة «المقطع قيد الإضافة» بدل مشغّل معطّل.
> لنشر مقطع حقيقي: املأ `src` (و`customer` و`quote` و`rating` عند توفر الموافقة)
> — لا يحتاج أي تعديل في الكود.

المشغّل يدعم ملفات `<video>` والتضمين الخارجي، ويوقف التشغيل عند الإغلاق،
ولا يُحمّل أي بايت من الفيديو قبل فتح المقطع (`preload="none"` + poster).

---

## المدونة

`/blog` فهرس المقالات، و`/blog/:slug` صفحة المقال. كل المحتوى في
[`src/data/articles.js`](src/data/articles.js) — ثمانية مقالات بنصّها الكامل
موزّعة على الخدمات (الكنب، السجاد، الستائر، المراتب، السيارات، خزانات المياه،
فرش المساجد، مكافحة الحشرات).

بنية المقال: `sections[]` (عنوان + فقرات + قائمة أو تنبيه اختياري) ثم
`takeaways[]` و`faq[]` و`cta`. القوائم تدعم التشديد بصيغة `**نص**` فقط، ويُبنى
عبر [`RichText`](src/components/blog/RichText.vue) بأجزاء Vue لا بـ `v-html`.

- **نقطة النهاية:** `fetchArticles` تُرجع الحقول التشويقية فقط، و`fetchArticle(slug)`
  تُرجع الجسم الكامل — نفس التقسيم الذي سيفعله الـ API الحقيقي.
- **الربط بالحجز:** كل مقال يقود إلى خدمته داخل نظام الحجز القائم، إما بـ
  `cta.serviceId` مباشرة أو باشتقاق الهدف من `cta.landing`.
- **فهرس المحتوى الجانبي** يتتبّع القسم المرئي بـ `IntersectionObserver`، ويظهر
  من ‎1024px‎ فأعلى فقط لأن العمود الجانبي يلي النص في الـ DOM.
- **SEO:** لكل مقال `Article` + `BreadcrumbList` + `FAQPage` في JSON-LD.

> المؤلف في كل المقالات «فريق دكتول». لا أسماء كتّاب ولا إحصاءات منسوبة لجهات
> لم تُنشر فعلاً.

---

## الحركة

مكتبة [Motion](https://motion.dev) للتسلسل الافتتاحي في الـ Hero فقط؛ ما عدا ذلك
انتقالات CSS و`IntersectionObserver`:

- `v-reveal` — موجّه عام يظهر العناصر عند دخولها الشاشة (مراقب واحد للصفحة كاملة).
- `useCountUp` — عدّادات تبدأ عند الظهور.
- `useCarousel` — كاروسيل مبني على `scroll-snap` الأصلي + سحب بالمؤشر.
- كل الحركات تحترم `prefers-reduced-motion` عبر تصفير مدد الحركة في `tokens.css`.

---

## الربط بالـ API لاحقاً

كل قراءة أو كتابة تمر عبر `src/utils/api.js`، وهي حالياً تُرجع بيانات من `src/data/*`
مع تأخير مُحاكى. للربط بـ Laravel:

```js
const BASE = import.meta.env.VITE_API_BASE ?? '/api/v1'

const request = async (path, init) => {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) throw new ApiError(await res.text(), res.status)
  return res.json()
}

export const fetchServices = () => request('/services')
export const createBooking = (payload) =>
  request('/bookings', { method: 'POST', body: JSON.stringify(payload) })
```

المسارات المتوقعة: `GET /services`, `GET /services/{slug}`, `GET /categories`,
`GET /offers`, `GET /packages`, `GET /reviews`, `GET /articles`, `GET /cities`,
`GET /availability?date=`, `POST /bookings`, `POST /promo/validate`.

حمولة الحجز تُبنى في `bookingStore.submit()` بهذا الشكل:

```jsonc
{
  "reference": "DT-B3J45",
  "services": [
    { "serviceId": "mattress", "categoryId": "furniture", "kind": "units",
      "config": { "counts": { "single": 1, "double": 1 }, "addons": {}, "custom": [] },
      "price": 310, "summary": "2 قطع" }
  ],
  "packageIds": [],
  "promoCode": "CLEAN50",
  "pricing": { "subtotal": 310, "discount": 50, "vat": 39, "total": 299, "currency": "SAR" },
  "location": { "cityId": "jeddah", "district": "الصفا", "address": "…", "notes": "" },
  "schedule": { "date": "2026-08-13", "time": "12:00" },
  "customer": { "name": "…", "phone": "0551234567", "phoneE164": "+966551234567", "email": "" },
  "paymentMethod": "mada"
}
```

مرفقات التنظيف التأهيلي تُرسل كـ metadata فقط داخل الـ JSON؛ رفع الملفات نفسها
يتم عبر `multipart` منفصل عند الربط الفعلي.

---

## الصور

الرسومات في `src/assets/images` مولّدة بـ `tools/gen-assets.mjs` كبدائل
متسقة مع هوية العلامة. لاستبدالها بتصوير حقيقي: احتفظ بنفس أسماء الملفات ونسب
الأبعاد، أو غيّر حقل `image` في `src/data/*` ليشير إلى روابط الـ CDN.

أزواج «قبل / بعد» يجب أن تبقى متطابقة الزاوية والإطار وإلا فقد المنزلق معناه.

---

## الوصولية

- HTML دلالي، وعناوين متسلسلة، ورابط «تخطَّ إلى المحتوى».
- حلقات تركيز ظاهرة لمستخدمي لوحة المفاتيح فقط (`:focus-visible`).
- حصر التركيز داخل النوافذ المنبثقة، وإغلاق بـ Escape، وإعادة التركيز عند الإغلاق.
- منزلق «قبل/بعد» يعمل بلوحة المفاتيح (`role="slider"` + الأسهم).
- أهداف لمس لا تقل عن 44×44 بكسل.
- `aria-live` للتنبيهات وخطوات الحجز.

---

## ملاحظات

- الدفع **محاكاة واجهة فقط** — لا تُجمع بيانات بطاقات ولا تتم أي عملية خصم.
- أكواد خصم تجريبية: `DOCTOL10` · `CLEAN50` · `WELCOME`.
- الرقم `0500000000` يُرجع خطأ دفع لاختبار حالة الفشل.
- بيانات المستخدم تُحفظ في `localStorage` تحت `doctol:user:v1`.
- سعر المقاس المخصص للستائر مضبوط على **١٦ ر.س / م²** (يجعل ستارة ٣م × ٢٫٥م
  تعادل سعر ستارة الجدار). الرقم المعروض في التصميم لهذه الحالة تحديداً
  (٣٢٠ ر.س لأربع ستائر) لا يتطابق مع المدخلات الظاهرة فيه، فاعتُمد معدّل
  متّسق قابل للتعديل من `src/data/services.js`.
- أسعار «مكتب» و«محل تجاري» اعتُمدت ٣٤٩ ر.س كما في شاشة الجوال (شاشة سطح
  المكتب تعرض ٣٩٩ ر.س لصف مدمج).
