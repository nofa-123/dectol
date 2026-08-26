<script setup>
/** "قد تهمك أيضاً" — cross-links between landing pages. */
import { computed } from 'vue'
import SectionHeader from '@/components/common/SectionHeader.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { formatPrice } from '@/utils/format'
import { landingBySlug } from '@/data/serviceLandings'
import { vReveal } from '@/composables/useScrollAnimation'

const props = defineProps({
  slugs: { type: Array, required: true },
})

const items = computed(() => props.slugs.map(landingBySlug).filter(Boolean))
</script>

<template>
  <section v-if="items.length" class="rs section section--sunken">
    <div class="container container--wide">
      <SectionHeader eyebrow="استكشف أكثر" eyebrow-icon="grid" title="قد تهمك أيضاً" />

      <ul class="rs__grid">
        <li v-for="(item, index) in items" :key="item.slug" v-reveal="{ delay: index * 70 }">
          <RouterLink
            class="rs__card"
            :class="`sl sl--${item.accent}`"
            :to="{ name: 'service-landing', params: { landing: item.slug } }"
          >
            <span class="rs__media">
              <img
                :src="item.heroImage"
                :alt="item.name"
                width="1200"
                height="750"
                loading="lazy"
                decoding="async"
              />
            </span>
            <span class="rs__body">
              <span class="rs__name">{{ item.navLabel }}</span>
              <span class="rs__price">يبدأ من {{ formatPrice(item.priceFrom) }}</span>
              <span class="rs__cta">
                اكتشف الخدمة
                <DoctolIcon name="arrow-left" :size="15" />
              </span>
            </span>
          </RouterLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.rs__grid {
  display: grid;
  gap: var(--dt-space-4);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr));
}

.rs__grid > li {
  min-width: 0;
}

.rs__card {
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

.rs__card:hover {
  transform: translateY(-5px);
  box-shadow: var(--dt-shadow-lg);
  border-color: var(--sl-accent-line);
}

.rs__media {
  display: block;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--sl-accent-soft);
}

.rs__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--dt-dur-5) var(--dt-ease-out);
}

.rs__card:hover .rs__media img {
  transform: scale(1.06);
}

.rs__body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: var(--dt-space-4) var(--dt-space-5) var(--dt-space-5);
  flex: 1;
}

.rs__name {
  font-weight: var(--dt-fw-bold);
  font-size: var(--dt-fs-body);
}

.rs__price {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.rs__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-block-start: auto;
  padding-block-start: var(--dt-space-3);
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
  color: var(--sl-accent-deep);
}

.rs__cta :deep(svg) {
  transition: transform var(--dt-dur-2) var(--dt-ease-out);
}

.rs__card:hover .rs__cta :deep(svg) {
  transform: translateX(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .rs__card,
  .rs__media img {
    transition: none;
  }
  .rs__card:hover {
    transform: none;
  }
  .rs__card:hover .rs__media img {
    transform: none;
  }
}
</style>
