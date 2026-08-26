<script setup>
/**
 * فهرس المدونة.
 *
 * كانت بطاقات المقالات على الصفحة الرئيسية تشير إلى `#slug` — رابط بلا وجهة —
 * وزر «عرض جميع المقالات» يعيدك إلى نفس القسم. هذه الصفحة هي الوجهة الحقيقية:
 * أحدث مقال بارز، ثم تصفية بالفئة وبحث حرّ فوري.
 */
import { computed, onMounted, ref } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import BlogCard from '@/components/blog/BlogCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import FinalCta from '@/components/common/FinalCta.vue'
import { articleCategories } from '@/data/articles'
import { useServicesStore } from '@/stores/servicesStore'
import { breadcrumbSchema, useSeo } from '@/composables/useSeo'
import { vReveal } from '@/composables/useScrollAnimation'

const catalogue = useServicesStore()

const activeCategory = ref('all')
const query = ref('')

onMounted(() => catalogue.ensureLoaded())

/** ترتيب تنازلي بالتاريخ — أحدث ما نُشر أولاً. */
const sorted = computed(() =>
  [...catalogue.articles].sort((a, b) => (a.iso < b.iso ? 1 : a.iso > b.iso ? -1 : 0)),
)

const featured = computed(() => sorted.value[0] ?? null)

/** الفئات المعروضة تقتصر على ما يوجد له مقال فعلاً، مع عدّاد لكل فئة. */
const categories = computed(() =>
  articleCategories
    .map((cat) => ({
      ...cat,
      count:
        cat.id === 'all'
          ? sorted.value.length
          : sorted.value.filter((a) => a.categoryId === cat.id).length,
    }))
    .filter((cat) => cat.count > 0),
)

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  return sorted.value.filter((article) => {
    if (activeCategory.value !== 'all' && article.categoryId !== activeCategory.value) return false
    if (!q) return true
    return [article.title, article.excerpt, article.category, ...(article.tags ?? [])]
      .join(' ')
      .toLowerCase()
      .includes(q)
  })
})

/** المقال البارز يظهر فوق الشبكة، فلا يتكرر داخلها إلا عند التصفية أو البحث. */
const filtering = computed(() => activeCategory.value !== 'all' || query.value.trim() !== '')
const grid = computed(() =>
  filtering.value ? results.value : results.value.filter((a) => a.id !== featured.value?.id),
)

function clearFilters() {
  activeCategory.value = 'all'
  query.value = ''
}

useSeo({
  title: 'مدونة دكتول | نصائح التنظيف والعناية بالمنزل',
  description:
    'مقالات عملية من فريق دكتول: العناية بالكنب والسجاد والستائر والمراتب، تنظيف خزانات المياه، مقصورة السيارة، فرش المساجد، والوقاية من الحشرات.',
  keywords: ['نصائح تنظيف', 'العناية بالكنب', 'تنظيف السجاد', 'مدونة دكتول', 'تنظيف المنزل'],
  type: 'website',
  jsonLd: [
    breadcrumbSchema([
      { name: 'الرئيسية', url: `${window.location.origin}/` },
      { name: 'المدونة', url: `${window.location.origin}/blog` },
    ]),
  ],
})
</script>

<template>
  <div>
    <PageHeader
      eyebrow="مدونة دكتول"
      eyebrow-icon="quote"
      title="نصائح تُطبّق اليوم، ونتيجة تدوم"
      subtitle="خلاصة ما نراه في البيوت والمنشآت كل يوم، مكتوبة بلغة عملية بلا مبالغات."
    />

    <section class="section section--tight">
      <div class="container container--wide">
        <!-- ------------------------------- filters ------------------------------ -->
        <div class="bl__bar">
          <ul class="bl__cats" role="list">
            <li v-for="cat in categories" :key="cat.id">
              <button
                type="button"
                class="bl__cat"
                :class="{ 'is-active': activeCategory === cat.id }"
                :aria-pressed="activeCategory === cat.id"
                @click="activeCategory = cat.id"
              >
                {{ cat.label }}
                <span class="bl__count num">{{ cat.count }}</span>
              </button>
            </li>
          </ul>

          <label class="bl__search">
            <DoctolIcon name="search" :size="18" />
            <span class="visually-hidden">ابحث في المقالات</span>
            <input v-model="query" type="search" placeholder="ابحث عن موضوع…" />
          </label>
        </div>

        <!-- ------------------------------ loading ------------------------------- -->
        <div v-if="catalogue.loading && !catalogue.articles.length" class="bl__grid">
          <SkeletonBlock v-for="i in 6" :key="i" height="320px" radius="var(--dt-radius-xl)" />
        </div>

        <template v-else>
          <!-- ----------------------------- featured ----------------------------- -->
          <article v-if="featured && !filtering" v-reveal class="bf">
            <RouterLink class="bf__link" :to="{ name: 'blog-article', params: { slug: featured.slug } }">
              <div class="bf__media">
                <img
                  :src="featured.image"
                  v-image-fallback="featured.fallbackImage"
                  :alt="featured.title"
                  width="720"
                  height="480"
                  decoding="async"
                />
              </div>
              <div class="bf__body">
                <span class="bf__badge">
                  <DoctolIcon name="sparkle" :size="14" />
                  أحدث مقال
                </span>
                <p class="bf__cat">{{ featured.category }}</p>
                <h2 class="bf__title">{{ featured.title }}</h2>
                <p class="bf__excerpt">{{ featured.excerpt }}</p>
                <p class="bf__meta">
                  <span><DoctolIcon name="clock" :size="14" /> {{ featured.readingTime }}</span>
                  <span><DoctolIcon name="calendar" :size="14" /> {{ featured.date }}</span>
                </p>
                <span class="bf__more">
                  اقرأ المقال
                  <DoctolIcon name="arrow-left" :size="16" />
                </span>
              </div>
            </RouterLink>
          </article>

          <!-- ------------------------------- grid ------------------------------- -->
          <p v-if="filtering" class="bl__resultline" role="status">
            <span class="num">{{ results.length }}</span>
            {{ results.length === 1 ? 'مقال مطابق' : 'مقالات مطابقة' }}
          </p>

          <ul v-if="grid.length" class="bl__grid" role="list">
            <li v-for="(article, index) in grid" :key="article.id" v-reveal="{ delay: index * 70 }">
              <BlogCard :article="article" />
            </li>
          </ul>

          <div v-else class="bl__empty">
            <DoctolIcon name="search" :size="30" />
            <p class="bl__empty-title">لا يوجد مقال بهذا الوصف</p>
            <p class="bl__empty-text">جرّب كلمة أعم، أو اعرض كل المقالات.</p>
            <BaseButton variant="outline" icon="refresh" @click="clearFilters">
              عرض كل المقالات
            </BaseButton>
          </div>
        </template>
      </div>
    </section>

    <FinalCta />
  </div>
</template>

<style scoped>
.bl__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--dt-space-4);
  margin-block-end: var(--dt-space-8);
}

.bl__cats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.bl__cat {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 1rem;
  border-radius: var(--dt-radius-pill);
  border: 1px solid var(--dt-line);
  background: var(--dt-surface);
  color: var(--dt-ink-soft);
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-medium);
  cursor: pointer;
  transition:
    background var(--dt-dur-2) var(--dt-ease-out),
    border-color var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out);
}

.bl__cat:hover {
  border-color: var(--dt-teal-300);
  color: var(--dt-teal-700);
}

.bl__cat.is-active {
  background: var(--dt-primary);
  border-color: var(--dt-primary);
  color: var(--dt-on-primary);
}

.bl__count {
  font-size: var(--dt-fs-xs);
  opacity: 0.75;
}

.bl__search {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-inline-size: min(100%, 260px);
  padding: 0.6rem 1rem;
  border-radius: var(--dt-radius-pill);
  border: 1px solid var(--dt-line);
  background: var(--dt-surface);
}

.bl__search:focus-within {
  border-color: var(--dt-teal-400);
  box-shadow: var(--dt-focus-ring);
}

.bl__search :deep(svg) {
  flex: none;
  color: var(--dt-muted);
}

.bl__search input {
  flex: 1;
  min-inline-size: 0;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  outline: none;
}

/* ------------------------------- featured ------------------------------- */

.bf {
  margin-block-end: var(--dt-space-8);
}

.bf__link {
  display: grid;
  grid-template-columns: 1fr;
  border-radius: var(--dt-radius-2xl);
  overflow: hidden;
  background: var(--dt-surface);
  border: 1px solid var(--dt-line);
  box-shadow: var(--dt-shadow-sm);
  transition:
    box-shadow var(--dt-dur-3) var(--dt-ease-out),
    border-color var(--dt-dur-3) var(--dt-ease-out);
}

.bf__link:hover {
  box-shadow: var(--dt-shadow-lg);
  border-color: var(--dt-teal-200);
}

.bf__media {
  aspect-ratio: 3 / 2;
  overflow: hidden;
  background: var(--dt-teal-50);
}

.bf__media img {
  inline-size: 100%;
  block-size: 100%;
  object-fit: cover;
  transition: transform var(--dt-dur-4) var(--dt-ease-out);
}

.bf__link:hover .bf__media img {
  transform: scale(1.03);
}

.bf__body {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 0.65rem;
  padding: var(--dt-space-6);
}

.bf__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.7rem;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-teal-50);
  color: var(--dt-teal-700);
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-bold);
}

.bf__cat {
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-bold);
  color: var(--dt-muted);
}

.bf__title {
  font-size: clamp(1.35rem, 1.1rem + 1.1vw, 1.9rem);
  line-height: 1.4;
  color: var(--dt-navy-700);
}

.bf__excerpt {
  color: var(--dt-ink-soft);
  line-height: 1.9;
}

.bf__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--dt-space-4);
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
}

.bf__meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.bf__more {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-block-start: 0.25rem;
  color: var(--dt-teal-700);
  font-weight: var(--dt-fw-bold);
}

.bf__link:hover .bf__more :deep(svg) {
  transform: translateX(4px);
}

.bf__more :deep(svg) {
  transition: transform var(--dt-dur-2) var(--dt-ease-out);
}

@media (min-width: 860px) {
  .bf__link {
    grid-template-columns: 1.05fr 1fr;
    align-items: stretch;
  }

  .bf__media {
    aspect-ratio: auto;
    block-size: 100%;
  }

  .bf__body {
    justify-content: center;
    padding: var(--dt-space-8);
  }
}

/* --------------------------------- grid --------------------------------- */

.bl__resultline {
  margin-block-end: var(--dt-space-5);
  color: var(--dt-muted);
  font-size: var(--dt-fs-sm);
}

.bl__grid {
  display: grid;
  gap: var(--dt-space-5);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 270px), 1fr));
}

.bl__grid > li {
  min-inline-size: 0;
}

.bl__empty {
  display: grid;
  justify-items: center;
  gap: 0.6rem;
  padding: var(--dt-space-12) var(--dt-space-5);
  border-radius: var(--dt-radius-xl);
  border: 1px dashed var(--dt-line-strong);
  background: var(--dt-surface);
  text-align: center;
}

.bl__empty :deep(svg) {
  color: var(--dt-teal-300);
}

.bl__empty-title {
  font-size: var(--dt-fs-h4);
  font-weight: var(--dt-fw-bold);
  color: var(--dt-navy-700);
}

.bl__empty-text {
  color: var(--dt-muted);
  margin-block-end: var(--dt-space-3);
}
</style>
