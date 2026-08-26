<script setup>
/** Offers carousel — drag, arrows and dots, no autoplay (prices deserve dwell time). */
import SectionHeader from '@/components/common/SectionHeader.vue'
import OfferCard from '@/components/offers/OfferCard.vue'
import CarouselControls from '@/components/common/CarouselControls.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useCarousel } from '@/composables/useCarousel'
import { useServicesStore } from '@/stores/servicesStore'
import { vReveal } from '@/composables/useScrollAnimation'

const catalogue = useServicesStore()
const { track, trackHandlers, activeIndex, canPrev, canNext, next, prev, scrollToIndex } =
  useCarousel()
</script>

<template>
  <section id="offers" class="section section--sunken">
    <div class="container container--wide">
      <SectionHeader
        eyebrow="عروض محدودة"
        eyebrow-icon="percent"
        title="عروض دكتول"
        subtitle="خصومات فعلية على الخدمات الأكثر طلباً — الكمية والمدة محدودة."
      >
        <template #action>
          <BaseButton variant="outline" icon-end="arrow-left" :to="{ name: 'offers' }">
            كل العروض
          </BaseButton>
        </template>
      </SectionHeader>

      <ul
        v-if="catalogue.offers.length"
        ref="track"
        v-reveal
        class="rail offers__rail"
        v-bind="trackHandlers"
      >
        <li v-for="offer in catalogue.offers" :key="offer.id" class="offers__item">
          <OfferCard :offer="offer" />
        </li>
      </ul>

      <CarouselControls
        class="offers__controls"
        :can-prev="canPrev"
        :can-next="canNext"
        :count="catalogue.offers.length"
        :active-index="activeIndex"
        @prev="prev"
        @next="next"
        @go="scrollToIndex"
      />
    </div>
  </section>
</template>

<style scoped>
.offers__item {
  width: min(88vw, 420px);
  display: flex;
}

.offers__item > * {
  width: 100%;
}

.offers__controls {
  margin-block-start: var(--dt-space-5);
}

@media (min-width: 1024px) {
  .offers__item {
    width: 420px;
  }
}
</style>
