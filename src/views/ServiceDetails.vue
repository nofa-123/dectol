<script setup>
/** Single service page: pitch, inclusions, pricing table, related services. */
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import RatingStars from '@/components/common/RatingStars.vue'
import ServiceCard from '@/components/services/ServiceCard.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import FaqSection from '@/components/faq/FaqSection.vue'
import FinalCta from '@/components/common/FinalCta.vue'
import { formatPrice } from '@/utils/format'
import { priceTable } from '@/utils/pricing'
import { scrollBehavior } from '@/utils/motion'
import { useBooking } from '@/composables/useBooking'
import { useServicesStore } from '@/stores/servicesStore'
import { useUserStore } from '@/stores/userStore'
import { vReveal } from '@/composables/useScrollAnimation'

const route = useRoute()
const router = useRouter()
const catalogue = useServicesStore()
const user = useUserStore()
const { startWithService } = useBooking()

const service = computed(() => catalogue.serviceById(route.params.slug))
const rows = computed(() => (service.value ? priceTable(service.value) : []))
const mainRows = computed(() => rows.value.filter((r) => !r.addon))
const addonRows = computed(() => rows.value.filter((r) => r.addon))
const related = computed(() =>
  catalogue.services.filter((s) => s.id !== service.value?.id).slice(0, 3),
)

onMounted(async () => {
  await catalogue.ensureLoaded()
  await catalogue.loadService(route.params.slug)
  if (!service.value) router.replace({ name: 'not-found' })
})

watch(
  () => route.params.slug,
  async (slug) => {
    await catalogue.loadService(slug)
    window.scrollTo({ top: 0, behavior: scrollBehavior() })
  },
)
</script>

<template>
  <div v-if="!catalogue.isReady" class="container section">
    <SkeletonBlock height="320px" radius="var(--dt-radius-xl)" />
    <div style="margin-block-start: 2rem">
      <SkeletonBlock :lines="4" height="1rem" />
    </div>
  </div>

  <div v-else-if="service">
    <!-- hero -->
    <section class="sdv__hero">
      <div class="container container--wide sdv__hero-inner">
        <div class="sdv__copy">
          <nav class="sdv__crumbs" aria-label="مسار التصفح">
            <RouterLink :to="{ name: 'home' }">الرئيسية</RouterLink>
            <DoctolIcon name="chevron-left" :size="14" />
            <RouterLink :to="{ name: 'services' }">الخدمات</RouterLink>
            <DoctolIcon name="chevron-left" :size="14" />
            <span>{{ service.name }}</span>
          </nav>

          <span class="eyebrow">
            <DoctolIcon :name="service.icon" :size="16" />
            {{ service.tagline }}
          </span>

          <h1 class="sdv__title">{{ service.name }}</h1>
          <p class="sdv__desc">{{ service.description }}</p>

          <div class="sdv__meta">
            <span class="sdv__meta-item">
              <RatingStars :value="service.rating" :size="16" show-value />
              <small class="num">({{ service.reviewsCount }} تقييم)</small>
            </span>
            <span class="sdv__meta-item">
              <DoctolIcon name="clock" :size="17" />
              {{ service.duration }}
            </span>
            <span class="sdv__meta-item">
              <DoctolIcon name="shield" :size="17" />
              ضمان 24 ساعة
            </span>
          </div>

          <div class="sdv__cta">
            <div class="sdv__price">
              <span>{{ service.priceUnit }}</span>
              <strong class="num">{{ formatPrice(service.startingPrice, { withCurrency: false }) }}</strong>
              <span>ريال — {{ service.unitLabel }}</span>
            </div>
            <div class="sdv__cta-buttons">
              <BaseButton size="lg" icon-end="arrow-left" magnetic @click="startWithService(service)">
                احجز الآن
              </BaseButton>
              <BaseButton
                variant="outline"
                size="lg"
                :icon="user.isFavourite(service.id) ? 'check' : 'heart'"
                @click="user.toggleFavourite(service.id)"
              >
                {{ user.isFavourite(service.id) ? 'في المفضلة' : 'أضف للمفضلة' }}
              </BaseButton>
            </div>
          </div>
        </div>

        <figure v-reveal="'scale'" class="sdv__visual">
          <img
            :src="service.image"
            v-image-fallback="service.fallbackImage"
            :alt="service.name"
            width="800"
            height="600"
            fetchpriority="high"
            decoding="async"
          />
          <figcaption v-if="service.badge" class="sdv__flag">{{ service.badge }}</figcaption>
        </figure>
      </div>
    </section>

    <!-- includes + pricing -->
    <section class="section">
      <div class="container container--wide sdv__grid">
        <div v-reveal class="sdv__panel">
          <h2 class="sdv__panel-title">
            <DoctolIcon name="check-circle" :size="20" />
            الخدمة تشمل
          </h2>
          <ul class="sdv__includes">
            <li v-for="item in service.includes" :key="item">
              <DoctolIcon name="check" :size="15" :stroke="2.6" />
              {{ item }}
            </li>
          </ul>

          <div class="sdv__tags">
            <span v-for="tag in service.tags" :key="tag">{{ tag }}</span>
          </div>
        </div>

        <div v-reveal="{ delay: 100 }" class="sdv__panel">
          <h2 class="sdv__panel-title">
            <DoctolIcon name="card" :size="20" />
            الأسعار
          </h2>
          <table class="sdv__table">
            <caption class="visually-hidden">
              أسعار {{ service.name }} حسب الحجم
            </caption>
            <tbody>
              <tr v-for="row in mainRows" :key="row.label">
                <th scope="row">{{ row.label }}</th>
                <td class="money">{{ formatPrice(row.price) }}</td>
              </tr>
            </tbody>
          </table>

          <template v-if="addonRows.length">
            <h3 class="sdv__addons-title">إضافات اختيارية</h3>
            <ul class="sdv__addons">
              <li v-for="row in addonRows" :key="row.label">
                <span>{{ row.label }}</span>
                <span class="money">+ {{ formatPrice(row.price) }}</span>
              </li>
            </ul>
          </template>

          <p class="sdv__vat">الأسعار غير شاملة ضريبة القيمة المضافة (15٪).</p>
          <BaseButton block size="lg" icon="calendar-check" @click="startWithService(service)">
            احجز هذه الخدمة
          </BaseButton>
        </div>
      </div>
    </section>

    <!-- related -->
    <section class="section section--sunken">
      <div class="container container--wide">
        <h2 class="sdv__related-title">خدمات قد تهمك أيضاً</h2>
        <ul class="sdv__related">
          <li v-for="(item, index) in related" :key="item.id" v-reveal="{ delay: index * 80 }">
            <ServiceCard :service="item" />
          </li>
        </ul>
      </div>
    </section>

    <FaqSection />
    <FinalCta />
  </div>
</template>

<style scoped>
.sdv__hero {
  padding-block: calc(var(--dt-header-h) + var(--dt-space-8)) var(--dt-space-10);
  background: var(--dt-grad-mint);
  border-block-end: 1px solid var(--dt-teal-100);
}

.sdv__hero-inner {
  display: grid;
  gap: clamp(2rem, 1rem + 4vw, 3.5rem);
  align-items: center;
}

.sdv__copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--dt-space-4);
}

.sdv__crumbs {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.sdv__crumbs a:hover {
  color: var(--dt-teal-600);
  text-decoration: underline;
}

.sdv__title {
  font-size: var(--dt-fs-h1);
}

.sdv__desc {
  color: var(--dt-ink-soft);
  line-height: var(--dt-lh-normal);
  max-width: 52ch;
}

.sdv__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--dt-space-2) var(--dt-space-5);
}

.sdv__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: var(--dt-fs-sm);
  color: var(--dt-ink-soft);
}

.sdv__meta-item :deep(svg) {
  color: var(--dt-teal-500);
}

.sdv__meta-item small {
  color: var(--dt-muted);
  font-size: var(--dt-fs-xs);
}

.sdv__cta {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
  width: 100%;
  padding-block-start: var(--dt-space-2);
}

.sdv__price {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
}

.sdv__price strong {
  font-size: 2rem;
  color: var(--dt-teal-600);
  font-weight: var(--dt-fw-bold);
}

.sdv__cta-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--dt-space-2);
}

.sdv__visual {
  position: relative;
}

.sdv__visual img {
  width: 100%;
  border-radius: var(--dt-radius-2xl);
  box-shadow: var(--dt-shadow-xl);
  border: 1px solid rgb(255 255 255 / 0.8);
}

.sdv__flag {
  position: absolute;
  inset-block-start: var(--dt-space-4);
  inset-inline-start: var(--dt-space-4);
  padding: 0.35rem 0.9rem;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-grad-gold);
  color: var(--dt-navy-800);
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-bold);
  box-shadow: var(--dt-shadow-md);
}

/* ---------- panels ---------- */
.sdv__grid {
  display: grid;
  gap: var(--dt-space-5);
  align-items: start;
}

.sdv__panel {
  padding: var(--dt-space-6);
  border-radius: var(--dt-radius-xl);
  background: var(--dt-surface);
  border: 1px solid var(--dt-line);
  box-shadow: var(--dt-shadow-sm);
}

.sdv__panel-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--dt-fs-h3);
  margin-block-end: var(--dt-space-4);
}

.sdv__panel-title :deep(svg) {
  color: var(--dt-teal-500);
}

.sdv__includes {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
}

.sdv__includes li {
  display: flex;
  align-items: flex-start;
  gap: var(--dt-space-2);
  font-size: var(--dt-fs-sm);
  color: var(--dt-ink-soft);
  line-height: var(--dt-lh-snug);
}

.sdv__includes :deep(svg) {
  flex: none;
  margin-block-start: 0.2rem;
  color: var(--dt-success);
}

.sdv__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-block-start: var(--dt-space-5);
  padding-block-start: var(--dt-space-4);
  border-block-start: 1px dashed var(--dt-line);
}

.sdv__tags span {
  padding: 0.25rem 0.7rem;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-teal-50);
  color: var(--dt-teal-700);
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-medium);
}

.sdv__table {
  width: 100%;
  border-collapse: collapse;
}

.sdv__table th,
.sdv__table td {
  padding: 0.75rem 0;
  text-align: start;
  font-size: var(--dt-fs-sm);
  border-block-end: 1px solid var(--dt-line);
}

.sdv__table th {
  font-weight: var(--dt-fw-medium);
  color: var(--dt-ink-soft);
}

.sdv__table td {
  text-align: end;
  font-weight: var(--dt-fw-bold);
  color: var(--dt-teal-600);
  white-space: nowrap;
}

.sdv__addons-title {
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
  margin-block: var(--dt-space-4) var(--dt-space-2);
}

.sdv__addons {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.sdv__addons li {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--dt-space-3);
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
}

.sdv__vat {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted-soft);
  margin-block: var(--dt-space-4);
}

/* ---------- related ---------- */
.sdv__related-title {
  font-size: var(--dt-fs-h2);
  margin-block-end: var(--dt-space-6);
}

.sdv__related {
  display: grid;
  gap: var(--dt-space-5);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 290px), 1fr));
}

.sdv__related > li {
  min-width: 0;
}

@media (min-width: 900px) {
  .sdv__hero-inner {
    grid-template-columns: 1.05fr 1fr;
  }
  .sdv__grid {
    grid-template-columns: 1.15fr 1fr;
  }
}
</style>
