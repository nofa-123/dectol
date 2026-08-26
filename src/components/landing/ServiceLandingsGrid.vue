<script setup>
/**
 * The seven service families, each linking to its landing page.
 *
 * Distinct from `ServicesSection` (which sells individual bookable services):
 * this is the directory of service *areas*, and it is the main internal-linking
 * surface pointing crawlers and visitors at the landing pages.
 */
import SectionHeader from '@/components/common/SectionHeader.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { formatPrice } from '@/utils/format'
import { serviceLandings } from '@/data/serviceLandings'
import { useServicesStore } from '@/stores/servicesStore'
import { vReveal } from '@/composables/useScrollAnimation'

const catalogue = useServicesStore()

const iconFor = (landing) =>
  catalogue.categories.find((c) => c.id === landing.categoryId)?.icon ?? 'sparkle'
</script>

<template>
  <section id="service-areas" class="sla section">
    <div class="container container--wide">
      <SectionHeader
        eyebrow="مجالات خدماتنا"
        eyebrow-icon="grid"
        title="مجالات متعددة… وفريق واحد تثق فيه"
      >
        <template #action>
          <BaseButton variant="outline" icon-end="arrow-left" :to="{ name: 'services' }">
            كل الخدمات
          </BaseButton>
        </template>
      </SectionHeader>

      <ul class="sla__grid">
        <li
          v-for="(landing, index) in serviceLandings"
          :key="landing.slug"
          v-reveal="{ delay: Math.min(index, 5) * 70 }"
          :class="{ 'sla__cell--wide': index === 0 }"
        >
          <RouterLink
            class="sla__card sl"
            :class="[`sl--${landing.accent}`, { 'sla__card--wide': index === 0 }]"
            :to="{ name: 'service-landing', params: { landing: landing.slug } }"
          >
            <span class="sla__media">
              <img
                :src="landing.heroImage"
                :alt="landing.name"
                width="1200"
                height="750"
                loading="lazy"
                decoding="async"
              />
              <span class="sla__scrim" aria-hidden="true" />
              <span class="sla__icon"><DoctolIcon :name="iconFor(landing)" :size="22" /></span>
            </span>

            <span class="sla__body">
              <span class="sla__name">{{ landing.navLabel }}</span>
              <span class="sla__desc">{{ landing.headline }}</span>
              <span class="sla__foot">
                <span class="sla__price">يبدأ من {{ formatPrice(landing.priceFrom) }}</span>
                <span class="sla__cta">
                  اكتشف الخدمة
                  <DoctolIcon name="arrow-left" :size="15" />
                </span>
              </span>
            </span>
          </RouterLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.sla__grid {
  display: grid;
  gap: var(--dt-space-4);
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 270px), 1fr));
}

.sla__grid > li {
  min-width: 0;
}

.sla__card {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: var(--dt-radius-xl);
  overflow: hidden;
  background: var(--dt-surface);
  border: 1px solid var(--dt-line);
  box-shadow: var(--dt-shadow-sm);
  transition:
    transform var(--dt-dur-3) var(--dt-ease-out),
    box-shadow var(--dt-dur-3) var(--dt-ease-out),
    border-color var(--dt-dur-3) var(--dt-ease-out);
}

.sla__card:hover {
  transform: translateY(-6px);
  box-shadow: 0 22px 46px -24px color-mix(in srgb, var(--sl-accent) 60%, transparent);
  border-color: var(--sl-accent-line);
}

.sla__media {
  position: relative;
  display: block;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--sl-accent-soft);
}

.sla__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--dt-dur-5) var(--dt-ease-out);
}

.sla__card:hover .sla__media img {
  transform: scale(1.07);
}

.sla__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    color-mix(in srgb, var(--sl-accent-deep) 55%, transparent),
    transparent 55%
  );
}

.sla__icon {
  position: absolute;
  inset-block-end: var(--dt-space-3);
  inset-inline-start: var(--dt-space-3);
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: var(--dt-radius-md);
  background: rgb(255 255 255 / 0.92);
  color: var(--sl-accent-deep);
  box-shadow: var(--dt-shadow-sm);
  transition:
    background-color var(--dt-dur-3) var(--dt-ease-out),
    color var(--dt-dur-3) var(--dt-ease-out);
}

.sla__card:hover .sla__icon {
  background: var(--sl-accent);
  color: #fff;
}

.sla__body {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: var(--dt-space-4) var(--dt-space-5) var(--dt-space-5);
  flex: 1;
}

.sla__name {
  font-size: var(--dt-fs-h4);
  font-weight: var(--dt-fw-bold);
}

.sla__desc {
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
  line-height: var(--dt-lh-snug);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sla__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dt-space-3);
  flex-wrap: wrap;
  margin-block-start: auto;
  padding-block-start: var(--dt-space-3);
  border-block-start: 1px solid var(--dt-line);
}

.sla__price {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.sla__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
  color: var(--sl-accent-deep);
}

.sla__cta :deep(svg) {
  transition: transform var(--dt-dur-2) var(--dt-ease-out);
}

.sla__card:hover .sla__cta :deep(svg) {
  transform: translateX(-4px);
}

@media (min-width: 900px) {
  .sla__cell--wide {
    grid-column: span 2;
  }
  .sla__card--wide .sla__media {
    aspect-ratio: 21 / 9;
  }
  .sla__card--wide .sla__name {
    font-size: var(--dt-fs-h3);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sla__card,
  .sla__media img,
  .sla__icon {
    transition: none;
  }
  .sla__card:hover {
    transform: none;
  }
  .sla__card:hover .sla__media img {
    transform: none;
  }
}
</style>
