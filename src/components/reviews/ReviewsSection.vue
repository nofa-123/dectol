<script setup>
/**
 * Reviews: aggregate summary + an autoplaying, draggable testimonial rail.
 * Autoplay pauses on hover, on focus, while dragging, and when the tab is
 * hidden — handled inside useCarousel.
 */
import SectionHeader from '@/components/common/SectionHeader.vue'
import ReviewCard from '@/components/reviews/ReviewCard.vue'
import RatingStars from '@/components/common/RatingStars.vue'
import CarouselControls from '@/components/common/CarouselControls.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { useCarousel } from '@/composables/useCarousel'
import { useServicesStore } from '@/stores/servicesStore'
import { vReveal } from '@/composables/useScrollAnimation'

const catalogue = useServicesStore()
const { track, trackHandlers, activeIndex, canPrev, canNext, next, prev, scrollToIndex } =
  useCarousel({ autoplay: true, interval: 5600 })
</script>

<template>
  <section id="reviews" class="section section--mint">
    <div class="container container--wide">
      <SectionHeader
        align="center"
        eyebrow="آراء عملائنا"
        eyebrow-icon="quote"
        title="تجارب حقيقية من عملاء دكتول"
        subtitle="تقييمات موثّقة من Google، بدون تجميل ولا انتقاء."
      />

      <div v-if="catalogue.ratingSummary" v-reveal="'scale'" class="rv__summary">
        <div class="rv__summary-cell">
          <span class="rv__google">
            <svg viewBox="0 0 24 24" aria-hidden="true" class="rv__google-mark">
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.7-4.9H1.4v3.1A12 12 0 0 0 12 24Z"
              />
              <path fill="#FBBC05" d="M5.3 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l3.9-3.1Z" />
              <path
                fill="#EA4335"
                d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.7l3.9 3.1C6.3 6.9 8.9 4.8 12 4.8Z"
              />
            </svg>
            <span class="rv__google-text">
              <strong>Google Reviews</strong>
              <small><DoctolIcon name="check-circle" :size="13" /> تم التحقق منها</small>
            </span>
          </span>
        </div>

        <div class="rv__summary-cell rv__summary-cell--score">
          <span class="rv__score num">{{ catalogue.ratingSummary.average }}</span>
          <RatingStars :value="catalogue.ratingSummary.average" :size="20" />
          <span class="rv__score-of">من 5</span>
        </div>

        <div class="rv__summary-cell">
          <span class="rv__count">
            <DoctolIcon name="users" :size="26" />
            <strong class="num">+{{ catalogue.ratingSummary.total.toLocaleString('en-US') }}</strong>
            <small>تقييم</small>
          </span>
        </div>

        <ul class="rv__breakdown">
          <li v-for="row in catalogue.ratingSummary.breakdown" :key="row.stars">
            <span class="rv__bd-star">{{ row.stars }}<DoctolIcon name="star" :size="12" /></span>
            <span class="rv__bd-bar">
              <span
                class="rv__bd-fill"
                :style="{ width: `${(row.count / catalogue.ratingSummary.total) * 100}%` }"
              />
            </span>
            <span class="rv__bd-count num">{{ row.count }}</span>
          </li>
        </ul>
      </div>

      <ul ref="track" class="rail rv__rail" v-bind="trackHandlers">
        <li v-for="review in catalogue.reviews" :key="review.id" class="rv__item">
          <ReviewCard :review="review" />
        </li>
      </ul>

      <CarouselControls
        class="rv__controls"
        :can-prev="canPrev"
        :can-next="canNext"
        :count="catalogue.reviews.length"
        :active-index="activeIndex"
        @prev="prev"
        @next="next"
        @go="scrollToIndex"
      />
    </div>
  </section>
</template>

<style scoped>
.rv__summary {
  display: grid;
  gap: var(--dt-space-5);
  align-items: center;
  padding: var(--dt-space-5);
  margin-block-end: var(--dt-space-8);
  border-radius: var(--dt-radius-xl);
  background: var(--dt-surface);
  border: 1px solid var(--dt-line);
  box-shadow: var(--dt-shadow-sm);
}

.rv__summary-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  text-align: center;
}

.rv__google {
  display: flex;
  align-items: center;
  gap: var(--dt-space-3);
}

.rv__google-mark {
  width: 34px;
  height: 34px;
}

.rv__google-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.rv__google-text strong {
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-bold);
}

.rv__google-text small {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--dt-fs-xs);
  color: var(--dt-success);
}

.rv__score {
  font-size: clamp(2.4rem, 2rem + 1.6vw, 3.2rem);
  font-weight: var(--dt-fw-bold);
  line-height: 1;
  color: var(--dt-teal-600);
}

.rv__score-of {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.rv__count {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  color: var(--dt-teal-600);
}

.rv__count strong {
  font-size: 1.7rem;
  color: var(--dt-ink);
  line-height: 1.1;
}

.rv__count small {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.rv__breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}

.rv__breakdown li {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--dt-space-2);
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.rv__bd-star {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  color: var(--dt-gold-600);
  font-weight: var(--dt-fw-semibold);
}

.rv__bd-star :deep(svg) {
  fill: currentColor;
}

.rv__bd-bar {
  height: 6px;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-surface-sunken);
  overflow: hidden;
}

.rv__bd-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--dt-gold-500);
}

.rv__bd-count {
  min-width: 3.2em;
  text-align: start;
}

.rv__item {
  width: min(86vw, 380px);
  display: flex;
}

.rv__item > * {
  width: 100%;
}

.rv__controls {
  margin-block-start: var(--dt-space-5);
  justify-content: center;
  gap: var(--dt-space-6);
}

/**
 * On phones the summary matches the design's compact bar: Google, the score and
 * the review count sit three-across with hairline dividers, and the per-star
 * breakdown is dropped — five bar rows cost a lot of height for detail nobody
 * reads on a small screen. It comes back from tablet up.
 */
@media (max-width: 767px) {
  .rv__summary {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--dt-space-2);
    padding: var(--dt-space-4) var(--dt-space-2);
  }

  .rv__breakdown {
    display: none;
  }

  .rv__summary-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    min-width: 0;
  }

  .rv__summary-cell + .rv__summary-cell {
    border-inline-start: 1px solid var(--dt-line);
  }
}

@media (min-width: 768px) {
  .rv__summary {
    grid-template-columns: auto auto auto 1fr;
    padding: var(--dt-space-6);
  }
  .rv__summary-cell {
    padding-inline-end: var(--dt-space-6);
    border-inline-end: 1px solid var(--dt-line);
  }
  .rv__breakdown {
    padding-inline-start: var(--dt-space-4);
  }
}
</style>
