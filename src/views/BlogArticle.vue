<script setup>
/**
 * صفحة المقال.
 *
 * التخطيط عمودان على الشاشات الكبيرة: النص في العمود الرئيسي، وفهرس محتوى
 * لاصق يتتبّع القسم المرئي في العمود الجانبي. التتبّع يتم بـ IntersectionObserver
 * لا بحساب `scroll` في كل إطار.
 *
 * كل مقال يقود إلى الخدمة التي يتحدث عنها داخل نظام الحجز القائم — لا نموذج
 * حجز منفصل ولا رابط خارجي.
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import BlogCard from '@/components/blog/BlogCard.vue'
import ArticleSection from '@/components/blog/ArticleSection.vue'
import { fetchArticle } from '@/utils/api'
import { articleBySlug } from '@/data/articles'
import { landingBySlug } from '@/data/serviceLandings'
import { contactInfo } from '@/data/content'
import { breadcrumbSchema, faqSchema, useSeo } from '@/composables/useSeo'
import { useBooking } from '@/composables/useBooking'
import { useUiStore } from '@/stores/uiStore'
import { scrollBehavior } from '@/utils/motion'

const route = useRoute()
const router = useRouter()
const ui = useUiStore()
const { open } = useBooking()

const article = ref(null)
const loading = ref(true)
const activeSection = ref('')

let observer = null

async function load(slug) {
  loading.value = true
  article.value = null
  activeSection.value = ''
  try {
    article.value = await fetchArticle(slug)
  } catch {
    router.replace({ name: 'not-found' })
    return
  } finally {
    loading.value = false
  }
  activeSection.value = article.value?.sections?.[0]?.id ?? ''
  // Wait for the sections to exist in the DOM before observing them.
  requestAnimationFrame(() => requestAnimationFrame(observeSections))
}

function observeSections() {
  observer?.disconnect()
  const targets = (article.value?.sections ?? [])
    .map((s) => document.getElementById(s.id))
    .filter(Boolean)
  if (!targets.length) return

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
      if (visible) activeSection.value = visible.target.id
    },
    // The band sits just under the fixed header, so the "current" heading is
    // the one the reader is actually looking at, not the one far below.
    { rootMargin: '-96px 0px -70% 0px', threshold: 0 },
  )
  targets.forEach((el) => observer.observe(el))
}

onBeforeUnmount(() => observer?.disconnect())

watch(() => route.params.slug, load, { immediate: true })

/** المقالات ذات الصلة تُقرأ من البيانات مباشرة — عناوين فقط، بلا نص كامل. */
const related = computed(() =>
  (article.value?.related ?? []).map((slug) => articleBySlug(slug)).filter(Boolean),
)

const shareUrl = computed(() => window.location.href)

function jumpTo(id) {
  const el = document.getElementById(id)
  if (!el) return
  activeSection.value = id
  el.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    ui.toast.success('تم نسخ الرابط', 'صار جاهزاً للمشاركة')
  } catch {
    ui.toast.error('تعذّر نسخ الرابط', 'انسخه من شريط العنوان')
  }
}

/**
 * المقال يعرف الخدمة التي يتحدث عنها بأحد شكلين: معرّف خدمة مباشر، أو صفحة
 * خدمة يُقرأ منها هدف الحجز. الحالتان تدخلان نفس نظام الحجز القائم.
 */
function book() {
  const cta = article.value?.cta
  if (!cta) return
  const target = cta.landing ? landingBySlug(cta.landing)?.booking : null
  open({
    category: target?.category ?? null,
    serviceId: cta.serviceId ?? target?.service ?? null,
  })
}

useSeo(
  computed(() => {
    if (!article.value) return null
    const a = article.value
    const url = `${window.location.origin}/blog/${a.slug}`
    return {
      title: `${a.title} | مدونة دكتول`,
      description: a.excerpt,
      keywords: a.tags,
      image: a.image,
      type: 'article',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: a.title,
          description: a.excerpt,
          image: new URL(a.image, window.location.origin).href,
          datePublished: a.iso,
          inLanguage: 'ar',
          articleSection: a.category,
          keywords: (a.tags ?? []).join('، '),
          author: { '@type': 'Organization', name: a.author },
          publisher: { '@type': 'Organization', name: 'دكتول' },
          mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        },
        breadcrumbSchema([
          { name: 'الرئيسية', url: `${window.location.origin}/` },
          { name: 'المدونة', url: `${window.location.origin}/blog` },
          { name: a.title, url },
        ]),
        ...(a.faq?.length
          ? [faqSchema(a.faq.map((f) => ({ question: f.question, answer: f.answer })))]
          : []),
      ],
    }
  }),
)
</script>

<template>
  <div class="ba">
    <!-- ------------------------------- loading ------------------------------- -->
    <div v-if="loading" class="container container--wide ba__loading">
      <SkeletonBlock height="2.4rem" width="70%" />
      <SkeletonBlock height="1rem" width="45%" />
      <SkeletonBlock height="320px" radius="var(--dt-radius-2xl)" />
      <SkeletonBlock height="1rem" :lines="6" />
    </div>

    <template v-else-if="article">
      <!-- -------------------------------- hero -------------------------------- -->
      <header class="ba__hero">
        <div class="ba__hero-bg" aria-hidden="true"><span /></div>
        <div class="container container--wide ba__hero-inner">
          <nav class="ba__crumbs" aria-label="مسار التنقل">
            <RouterLink :to="{ name: 'home' }">الرئيسية</RouterLink>
            <DoctolIcon name="chevron-left" :size="14" />
            <RouterLink :to="{ name: 'blog' }">المدونة</RouterLink>
            <DoctolIcon name="chevron-left" :size="14" />
            <span aria-current="page">{{ article.category }}</span>
          </nav>

          <h1 class="ba__title">{{ article.title }}</h1>
          <p class="ba__excerpt">{{ article.excerpt }}</p>

          <ul class="ba__meta" role="list">
            <li><DoctolIcon name="user" :size="15" /> {{ article.author }}</li>
            <li>
              <DoctolIcon name="calendar" :size="15" />
              <time :datetime="article.iso">{{ article.date }}</time>
            </li>
            <li><DoctolIcon name="clock" :size="15" /> {{ article.readingTime }}</li>
          </ul>
        </div>
      </header>

      <!-- -------------------------------- body -------------------------------- -->
      <div class="container container--wide ba__layout">
        <main class="ba__main">
          <figure class="ba__cover">
            <img
              :src="article.image"
              v-image-fallback="article.fallbackImage"
              :alt="article.title"
              width="720"
              height="480"
            />
          </figure>

          <p class="ba__intro">{{ article.intro }}</p>

          <ArticleSection v-for="section in article.sections" :key="section.id" :section="section" />

          <!-- ----------------------------- takeaways ---------------------------- -->
          <aside v-if="article.takeaways?.length" class="ba__takeaways">
            <p class="ba__takeaways-title">
              <DoctolIcon name="list" :size="18" />
              خلاصة المقال
            </p>
            <ul role="list">
              <li v-for="(item, i) in article.takeaways" :key="i">
                <DoctolIcon name="check" :size="16" :stroke="2.6" />
                {{ item }}
              </li>
            </ul>
          </aside>

          <!-- -------------------------------- faq ------------------------------- -->
          <section v-if="article.faq?.length" class="ba__faq">
            <h2 class="ba__faq-title">أسئلة على هامش المقال</h2>
            <details v-for="(item, i) in article.faq" :key="i" class="ba__faq-item">
              <summary>
                {{ item.question }}
                <DoctolIcon name="chevron-down" :size="18" />
              </summary>
              <p>{{ item.answer }}</p>
            </details>
          </section>

          <!-- -------------------------------- cta ------------------------------- -->
          <section v-if="article.cta" class="ba__cta">
            <div>
              <h2 class="ba__cta-title">{{ article.cta.title }}</h2>
              <p class="ba__cta-text">{{ article.cta.text }}</p>
            </div>
            <div class="ba__cta-actions">
              <BaseButton icon="calendar-check" @click="book">احجز الآن</BaseButton>
              <BaseButton
                v-if="article.cta.landing"
                variant="outline"
                icon-end="arrow-left"
                :to="{ name: 'service-landing', params: { landing: article.cta.landing } }"
              >
                تفاصيل الخدمة
              </BaseButton>
            </div>
          </section>

          <!-- ------------------------------- share ------------------------------ -->
          <div class="ba__share">
            <span class="ba__share-label"><DoctolIcon name="share" :size="16" /> شارك المقال</span>
            <a
              class="ba__share-btn"
              :href="`https://wa.me/?text=${encodeURIComponent(article.title + ' — ' + shareUrl)}`"
              target="_blank"
              rel="noopener"
              aria-label="مشاركة عبر واتساب"
            >
              <DoctolIcon name="whatsapp" :size="18" />
            </a>
            <a
              class="ba__share-btn"
              :href="`https://x.com/intent/post?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(shareUrl)}`"
              target="_blank"
              rel="noopener"
              aria-label="مشاركة عبر إكس"
            >
              <DoctolIcon name="x" :size="16" />
            </a>
            <button type="button" class="ba__share-btn" aria-label="نسخ الرابط" @click="copyLink">
              <DoctolIcon name="list" :size="17" />
            </button>
          </div>
        </main>

        <!-- ------------------------------- sidebar ------------------------------ -->
        <aside class="ba__side">
          <div class="ba__side-inner">
            <nav v-if="article.sections?.length > 1" class="ba__toc" aria-label="محتويات المقال">
              <p class="ba__toc-title">في هذا المقال</p>
              <ol role="list">
                <li v-for="section in article.sections" :key="section.id">
                  <button
                    type="button"
                    :class="{ 'is-active': activeSection === section.id }"
                    @click="jumpTo(section.id)"
                  >
                    {{ section.heading }}
                  </button>
                </li>
              </ol>
            </nav>

            <div class="ba__help">
              <p class="ba__help-title">تفضّل تسأل مباشرة؟</p>
              <p class="ba__help-text">فريق دكتول يجاوبك ويحدد لك الخدمة المناسبة.</p>
              <BaseButton
                variant="outline"
                size="sm"
                icon="whatsapp"
                block
                :href="`https://wa.me/${contactInfo.whatsapp}`"
              >
                تواصل واتساب
              </BaseButton>
            </div>
          </div>
        </aside>
      </div>

      <!-- ------------------------------- related ------------------------------- -->
      <section v-if="related.length" class="section section--sunken">
        <div class="container container--wide">
          <h2 class="ba__related-title">اقرأ أيضاً</h2>
          <ul class="ba__related" role="list">
            <li v-for="item in related" :key="item.id">
              <BlogCard :article="item" />
            </li>
            <li class="ba__related-all">
              <RouterLink :to="{ name: 'blog' }">
                <DoctolIcon name="grid" :size="24" />
                <span>كل مقالات المدونة</span>
                <DoctolIcon name="arrow-left" :size="16" />
              </RouterLink>
            </li>
          </ul>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.ba__loading {
  display: grid;
  gap: var(--dt-space-5);
  padding-block: calc(var(--dt-header-h) + var(--dt-space-8)) var(--dt-space-12);
}

/* --------------------------------- hero --------------------------------- */

.ba__hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding-block: calc(var(--dt-header-h) + var(--dt-space-8)) var(--dt-space-8);
  background: var(--dt-grad-mint);
  border-block-end: 1px solid var(--dt-teal-100);
}

.ba__hero-bg {
  position: absolute;
  inset: 0;
  z-index: -1;
}

.ba__hero-bg span {
  position: absolute;
  inset-block-start: -55%;
  inset-inline-end: -8%;
  inline-size: 42vw;
  block-size: 42vw;
  max-inline-size: 560px;
  max-block-size: 560px;
  border-radius: 50%;
  filter: blur(70px);
  background: radial-gradient(circle, rgb(0 159 163 / 0.18), transparent 68%);
}

.ba__hero-inner {
  max-inline-size: 820px;
}

.ba__crumbs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
  margin-block-end: var(--dt-space-4);
}

.ba__crumbs a {
  color: var(--dt-teal-700);
}

.ba__crumbs a:hover {
  text-decoration: underline;
}

.ba__title {
  font-size: var(--dt-fs-h1);
  line-height: var(--dt-lh-tight);
  color: var(--dt-navy-800);
}

.ba__excerpt {
  margin-block-start: var(--dt-space-3);
  font-size: var(--dt-fs-body-lg);
  line-height: 1.9;
  color: var(--dt-ink-soft);
}

.ba__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--dt-space-5);
  margin-block-start: var(--dt-space-5);
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
}

.ba__meta li {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.ba__meta :deep(svg) {
  color: var(--dt-teal-500);
}

/* -------------------------------- layout -------------------------------- */

.ba__layout {
  display: grid;
  gap: var(--dt-space-8);
  padding-block: var(--dt-space-10);
}

.ba__main {
  min-inline-size: 0;
  max-inline-size: 780px;
}

.ba__cover {
  border-radius: var(--dt-radius-2xl);
  overflow: hidden;
  border: 1px solid var(--dt-line);
  background: var(--dt-teal-50);
  margin-block-end: var(--dt-space-6);
}

.ba__cover img {
  display: block;
  inline-size: 100%;
  block-size: auto;
}

.ba__intro {
  font-size: 1.15rem;
  line-height: 2;
  color: var(--dt-navy-600);
  padding-inline-start: var(--dt-space-4);
  border-inline-start: 3px solid var(--dt-teal-300);
  margin-block-end: var(--dt-space-8);
}

/* ------------------------------ takeaways ------------------------------- */

.ba__takeaways {
  margin-block-start: var(--dt-space-10);
  padding: var(--dt-space-6);
  border-radius: var(--dt-radius-xl);
  background: var(--dt-navy-800);
  color: var(--dt-white);
}

.ba__takeaways-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: var(--dt-fw-bold);
  font-size: var(--dt-fs-h4);
  margin-block-end: var(--dt-space-4);
}

.ba__takeaways-title :deep(svg) {
  color: var(--dt-teal-300);
}

.ba__takeaways ul {
  display: grid;
  gap: 0.75rem;
}

.ba__takeaways li {
  display: flex;
  align-items: start;
  gap: 0.6rem;
  line-height: 1.8;
  color: rgb(255 255 255 / 0.88);
}

.ba__takeaways li :deep(svg) {
  flex: none;
  margin-block-start: 0.3rem;
  color: var(--dt-teal-300);
}

/* --------------------------------- faq ---------------------------------- */

.ba__faq {
  margin-block-start: var(--dt-space-10);
}

.ba__faq-title {
  font-size: var(--dt-fs-h3);
  color: var(--dt-navy-700);
  margin-block-end: var(--dt-space-4);
}

.ba__faq-item {
  border: 1px solid var(--dt-line);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-surface);
  padding: var(--dt-space-4) var(--dt-space-5);
}

.ba__faq-item + .ba__faq-item {
  margin-block-start: 0.75rem;
}

.ba__faq-item summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dt-space-4);
  cursor: pointer;
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-navy-700);
  list-style: none;
}

.ba__faq-item summary::-webkit-details-marker {
  display: none;
}

.ba__faq-item summary :deep(svg) {
  flex: none;
  color: var(--dt-teal-600);
  transition: transform var(--dt-dur-2) var(--dt-ease-out);
}

.ba__faq-item[open] summary :deep(svg) {
  transform: rotate(180deg);
}

.ba__faq-item p {
  margin-block-start: var(--dt-space-3);
  line-height: 1.9;
  color: var(--dt-ink-soft);
}

/* --------------------------------- cta ---------------------------------- */

.ba__cta {
  margin-block-start: var(--dt-space-10);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--dt-space-5);
  padding: var(--dt-space-6);
  border-radius: var(--dt-radius-2xl);
  background: var(--dt-grad-mint);
  border: 1px solid var(--dt-teal-100);
}

.ba__cta-title {
  font-size: var(--dt-fs-h4);
  color: var(--dt-navy-700);
}

.ba__cta-text {
  margin-block-start: 0.3rem;
  color: var(--dt-ink-soft);
}

.ba__cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

/* -------------------------------- share --------------------------------- */

.ba__share {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-block-start: var(--dt-space-8);
  padding-block-start: var(--dt-space-5);
  border-block-start: 1px solid var(--dt-line);
}

.ba__share-label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-inline-end: auto;
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
}

.ba__share-btn {
  display: grid;
  place-items: center;
  inline-size: 2.4rem;
  block-size: 2.4rem;
  border-radius: 50%;
  border: 1px solid var(--dt-line);
  background: var(--dt-surface);
  color: var(--dt-navy-600);
  cursor: pointer;
  transition:
    border-color var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out),
    transform var(--dt-dur-2) var(--dt-ease-out);
}

.ba__share-btn:hover {
  border-color: var(--dt-teal-300);
  color: var(--dt-teal-700);
  transform: translateY(-2px);
}

/* -------------------------------- sidebar ------------------------------- */

.ba__side {
  min-inline-size: 0;
}

.ba__side-inner {
  display: grid;
  gap: var(--dt-space-5);
}

/**
 * The sidebar follows the article in the DOM, so on a single-column layout the
 * table of contents would land *after* the text it indexes — useless. It is a
 * desktop affordance; below the two-column breakpoint only the help card stays.
 */
.ba__toc {
  display: none;
  padding: var(--dt-space-5);
  border-radius: var(--dt-radius-xl);
  border: 1px solid var(--dt-line);
  background: var(--dt-surface);
}

.ba__toc-title {
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-bold);
  color: var(--dt-muted);
  margin-block-end: var(--dt-space-3);
}

.ba__toc ol {
  display: grid;
  gap: 0.15rem;
  counter-reset: toc;
}

.ba__toc li {
  counter-increment: toc;
}

.ba__toc button {
  display: flex;
  align-items: start;
  gap: 0.55rem;
  inline-size: 100%;
  padding: 0.5rem 0.6rem;
  border: 0;
  border-radius: var(--dt-radius-md);
  background: none;
  font: inherit;
  font-size: var(--dt-fs-sm);
  line-height: 1.6;
  text-align: start;
  color: var(--dt-ink-soft);
  cursor: pointer;
  transition:
    background var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out);
}

.ba__toc button::before {
  content: counter(toc);
  flex: none;
  color: var(--dt-teal-400);
  font-variant-numeric: tabular-nums;
  font-weight: var(--dt-fw-bold);
}

.ba__toc button:hover {
  background: var(--dt-teal-50);
  color: var(--dt-navy-700);
}

.ba__toc button.is-active {
  background: var(--dt-teal-50);
  color: var(--dt-teal-800);
  font-weight: var(--dt-fw-semibold);
}

.ba__help {
  padding: var(--dt-space-5);
  border-radius: var(--dt-radius-xl);
  border: 1px dashed var(--dt-teal-200);
  background: var(--dt-teal-50);
}

.ba__help-title {
  font-weight: var(--dt-fw-bold);
  color: var(--dt-navy-700);
}

.ba__help-text {
  margin-block: 0.3rem var(--dt-space-4);
  font-size: var(--dt-fs-sm);
  line-height: 1.8;
  color: var(--dt-ink-soft);
}

/* -------------------------------- related ------------------------------- */

.ba__related-title {
  font-size: var(--dt-fs-h2);
  color: var(--dt-navy-700);
  margin-block-end: var(--dt-space-6);
}

.ba__related {
  display: grid;
  gap: var(--dt-space-5);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
}

.ba__related > li {
  min-inline-size: 0;
}

.ba__related-all a {
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 0.6rem;
  block-size: 100%;
  min-block-size: 200px;
  padding: var(--dt-space-6);
  border-radius: var(--dt-radius-xl);
  border: 1px dashed var(--dt-line-strong);
  background: var(--dt-surface);
  color: var(--dt-teal-700);
  font-weight: var(--dt-fw-bold);
  text-align: center;
  transition:
    border-color var(--dt-dur-2) var(--dt-ease-out),
    background var(--dt-dur-2) var(--dt-ease-out);
}

.ba__related-all a:hover {
  border-color: var(--dt-teal-300);
  background: var(--dt-teal-50);
}

/* ------------------------------ breakpoints ----------------------------- */

@media (min-width: 1024px) {
  .ba__layout {
    grid-template-columns: minmax(0, 1fr) 300px;
    align-items: start;
  }

  .ba__side-inner {
    position: sticky;
    inset-block-start: calc(var(--dt-header-h) + var(--dt-space-4));
  }

  .ba__toc {
    display: block;
  }
}
</style>
