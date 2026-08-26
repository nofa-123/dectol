<script setup>
/**
 * Home services block.
 * Desktop: a grid with the most-booked service promoted to a wide feature card.
 * Mobile: a snap-scrolling rail, because a 7-item vertical stack buries the
 * rest of the page.
 */
import { computed } from 'vue'
import SectionHeader from '@/components/common/SectionHeader.vue'
import ServiceCard from '@/components/services/ServiceCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import CarouselControls from '@/components/common/CarouselControls.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import { useCarousel } from '@/composables/useCarousel'
import { useResponsive } from '@/composables/useResponsive'
import { useServicesStore } from '@/stores/servicesStore'
import { vReveal } from '@/composables/useScrollAnimation'

const catalogue = useServicesStore()
const { isMobile } = useResponsive()
const { track, trackHandlers, activeIndex, canPrev, canNext, next, prev, scrollToIndex } =
  useCarousel()

/** The home page shows the headline services; /services lists the full catalogue. */
const items = computed(() => catalogue.services.filter((s) => s.featured))
</script>

<template>
  <section id="services" class="section">
    <div class="container container--wide">
      <SectionHeader
        eyebrow="خدماتنا"
        eyebrow-icon="grid"
        :title="isMobile ? 'خدماتنا الرئيسية' : 'اختر الخدمة التي تحتاجها'"
        :subtitle="isMobile ? 'حلول تنظيف متكاملة تلبّي جميع احتياجاتك' : 'حلول تنظيف متكاملة ينفذها فريق مدرّب، بأسعار واضحة من أول خطوة.'"
      >
        <template #action>
          <BaseButton variant="outline" icon-end="arrow-left" :to="{ name: 'services' }">
            كل الخدمات
          </BaseButton>
        </template>
      </SectionHeader>

      <!-- loading -->
      <div v-if="!catalogue.isReady" class="services__grid">
        <div v-for="i in 4" :key="i" class="services__skeleton card-surface">
          <SkeletonBlock height="180px" radius="0" />
          <div class="services__skeleton-body">
            <SkeletonBlock height="1.1rem" width="60%" />
            <SkeletonBlock :lines="2" height="0.7rem" />
          </div>
        </div>
      </div>

      <!-- mobile rail -->
      <template v-else-if="isMobile">
        <ul ref="track" class="rail services__rail" v-bind="trackHandlers">
          <li v-for="service in items" :key="service.id" class="services__rail-item">
            <ServiceCard :service="service" />
          </li>
        </ul>
        <CarouselControls
          class="services__controls"
          :can-prev="canPrev"
          :can-next="canNext"
          :count="items.length"
          :active-index="activeIndex"
          @prev="prev"
          @next="next"
          @go="scrollToIndex"
        />
      </template>

      <!-- desktop grid -->
      <ul v-else class="services__grid">
        <li
          v-for="(service, index) in items"
          :key="service.id"
          v-reveal="{ delay: Math.min(index, 4) * 70 }"
          :class="{ 'services__cell--wide': index === 0 }"
        >
          <ServiceCard :service="service" :featured="index === 0" />
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.services__grid {
  display: grid;
  gap: var(--dt-space-5);
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  align-items: stretch;
}

.services__grid > li {
  min-width: 0;
}

.services__rail-item {
  width: min(84vw, 340px);
}

.services__controls {
  margin-block-start: var(--dt-space-5);
}

.services__skeleton {
  overflow: hidden;
}

.services__skeleton-body {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
  padding: var(--dt-space-5);
}

@media (min-width: 900px) {
  .services__cell--wide {
    grid-column: span 2;
  }
}
</style>
