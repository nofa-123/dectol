<script setup>
/** Promotional card: discount ribbon, live countdown, scarcity meter, CTA. */
import { computed } from 'vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import PriceTag from '@/components/common/PriceTag.vue'
import CountdownTimer from '@/components/offers/CountdownTimer.vue'
import { useBooking } from '@/composables/useBooking'

const props = defineProps({
  offer: { type: Object, required: true },
  wide: { type: Boolean, default: false },
})

const { startWithOffer } = useBooking()

/** Scarcity bar assumes a 40-slot campaign; the API would send the cap. */
const remainingPercent = computed(() => Math.min(100, (props.offer.remaining / 40) * 100))
</script>

<template>
  <article class="oc" :class="{ 'oc--wide': wide }">
    <div class="oc__media">
      <img
        :src="offer.image"
        v-image-fallback="offer.fallbackImage"
        :alt="offer.title"
        width="900"
        height="560"
        loading="lazy"
        decoding="async"
      />
      <span class="oc__ribbon">
        <strong>{{ offer.discountLabel }}</strong>
      </span>
    </div>

    <div class="oc__body">
      <div class="oc__head">
        <h3 class="oc__title">{{ offer.title }}</h3>
        <p class="oc__subtitle">{{ offer.subtitle }}</p>
      </div>

      <ul class="oc__highlights">
        <li v-for="item in offer.highlights" :key="item">
          <DoctolIcon name="check-circle" :size="15" />
          {{ item }}
        </li>
      </ul>

      <div class="oc__pricing">
        <PriceTag :value="offer.price" :old-value="offer.oldPrice" size="lg" />
        <CountdownTimer :ends-at="offer.endsAt" />
      </div>

      <div class="oc__scarcity">
        <div class="oc__bar" role="presentation">
          <span class="oc__bar-fill" :style="{ width: `${remainingPercent}%` }" />
        </div>
        <p class="oc__scarcity-text">
          بقي <strong class="num">{{ offer.remaining }}</strong> حجز على هذا السعر
        </p>
      </div>

      <BaseButton block size="lg" icon="calendar-check" @click="startWithOffer(offer)">
        احجز العرض
      </BaseButton>
    </div>
  </article>
</template>

<style scoped>
.oc {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--dt-surface);
  border: 1px solid var(--dt-line);
  border-radius: var(--dt-radius-xl);
  overflow: hidden;
  box-shadow: var(--dt-shadow-sm);
  transition:
    transform var(--dt-dur-3) var(--dt-ease-out),
    box-shadow var(--dt-dur-3) var(--dt-ease-out);
}

.oc:hover {
  transform: translateY(-5px);
  box-shadow: var(--dt-shadow-lg);
}

.oc__media {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--dt-teal-50);
}

.oc__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--dt-dur-5) var(--dt-ease-out);
}

.oc:hover .oc__media img {
  transform: scale(1.05);
}

.oc__ribbon {
  position: absolute;
  inset-block-start: var(--dt-space-4);
  inset-inline-start: 0;
  display: grid;
  place-items: center;
  padding: 0.5rem 1.1rem 0.5rem 0.9rem;
  border-start-end-radius: var(--dt-radius-md);
  border-end-end-radius: var(--dt-radius-md);
  background: var(--dt-grad-primary);
  color: #fff;
  font-size: var(--dt-fs-sm);
  box-shadow: var(--dt-shadow-md);
}

.oc__body {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-4);
  padding: var(--dt-space-5);
  flex: 1;
}

.oc__title {
  font-size: var(--dt-fs-h3);
}

.oc__subtitle {
  color: var(--dt-muted);
  font-size: var(--dt-fs-sm);
  margin-block-start: 0.2rem;
}

.oc__highlights {
  display: flex;
  flex-wrap: wrap;
  gap: var(--dt-space-2) var(--dt-space-4);
}

.oc__highlights li {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--dt-fs-xs);
  color: var(--dt-ink-soft);
}

.oc__highlights :deep(svg) {
  color: var(--dt-success);
}

.oc__pricing {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dt-space-3);
  flex-wrap: wrap;
}

.oc__scarcity {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-block-start: auto;
}

.oc__bar {
  height: 7px;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-surface-sunken);
  overflow: hidden;
}

.oc__bar-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--dt-grad-gold);
  transition: width var(--dt-dur-5) var(--dt-ease-out);
}

.oc__scarcity-text {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.oc__scarcity-text strong {
  color: var(--dt-warning);
}

@media (min-width: 900px) {
  .oc--wide {
    flex-direction: row;
  }
  .oc--wide .oc__media {
    flex: 0 0 46%;
    aspect-ratio: auto;
  }
  .oc--wide .oc__body {
    padding: var(--dt-space-6);
  }
}

@media (prefers-reduced-motion: reduce) {
  .oc,
  .oc__media img {
    transition: none;
  }
  .oc:hover {
    transform: none;
  }
  .oc:hover .oc__media img {
    transform: none;
  }
}
</style>
