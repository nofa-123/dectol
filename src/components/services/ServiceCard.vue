<script setup>
/**
 * Service card. Whole card links to the detail page; the CTA inside it starts
 * a booking directly. Hover choreography: image scales, card lifts, the CTA
 * row slides up into view — all transform/opacity only.
 */
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import RatingStars from '@/components/common/RatingStars.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { formatPrice } from '@/utils/format'
import { useBooking } from '@/composables/useBooking'
import { useUserStore } from '@/stores/userStore'

const props = defineProps({
  service: { type: Object, required: true },
  featured: { type: Boolean, default: false },
})

const { startWithService } = useBooking()
const user = useUserStore()

function book() {
  startWithService(props.service)
}
</script>

<template>
  <article class="sc" :class="{ 'sc--featured': featured }">
    <RouterLink
      class="sc__link"
      :to="{ name: 'service-details', params: { slug: service.slug } }"
      :aria-label="`تفاصيل خدمة ${service.name}`"
    >
      <div class="sc__media">
        <img
          :src="service.image"
          v-image-fallback="service.fallbackImage"
          :alt="service.name"
          width="800"
          height="600"
          loading="lazy"
          decoding="async"
        />
        <span v-if="service.badge" class="sc__badge">{{ service.badge }}</span>
        <span class="sc__icon"><DoctolIcon :name="service.icon" :size="24" /></span>
      </div>

      <div class="sc__body">
        <div class="sc__titles">
          <h3 class="sc__name">{{ service.name }}</h3>
          <p class="sc__tagline">{{ service.tagline }}</p>
        </div>

        <p class="sc__summary">{{ service.summary }}</p>

        <ul class="sc__tags">
          <li v-for="tag in service.tags.slice(0, 3)" :key="tag">{{ tag }}</li>
        </ul>

        <div class="sc__meta">
          <RatingStars :value="service.rating" :size="14" />
          <span class="sc__reviews num">({{ service.reviewsCount }})</span>
          <span class="sc__duration">
            <DoctolIcon name="clock" :size="14" />
            {{ service.duration }}
          </span>
        </div>
      </div>
    </RouterLink>

    <footer class="sc__footer">
      <div class="sc__price">
        <span class="sc__price-label">{{ service.priceUnit }}</span>
        <strong class="sc__price-value num">{{
          formatPrice(service.startingPrice, { withCurrency: false })
        }}</strong>
        <span class="sc__price-currency">ريال</span>
        <span class="sc__price-unit">{{ service.unitLabel }}</span>
      </div>

      <div class="sc__actions">
        <button
          type="button"
          class="sc__fav"
          :class="{ 'sc__fav--on': user.isFavourite(service.id) }"
          :aria-label="user.isFavourite(service.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'"
          :aria-pressed="user.isFavourite(service.id)"
          @click="user.toggleFavourite(service.id)"
        >
          <DoctolIcon name="heart" :size="18" />
        </button>
        <BaseButton size="sm" icon-end="arrow-left" @click="book">احجز</BaseButton>
      </div>
    </footer>
  </article>
</template>

<style scoped>
.sc {
  display: flex;
  flex-direction: column;
  background: var(--dt-surface);
  border: 1px solid var(--dt-line);
  border-radius: var(--dt-radius-xl);
  overflow: hidden;
  box-shadow: var(--dt-shadow-sm);
  transition:
    transform var(--dt-dur-3) var(--dt-ease-out),
    box-shadow var(--dt-dur-3) var(--dt-ease-out),
    border-color var(--dt-dur-3) var(--dt-ease-out);
  height: 100%;
}

.sc:hover {
  transform: translateY(-6px);
  box-shadow: var(--dt-shadow-lg);
  border-color: var(--dt-teal-200);
}

.sc__link {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.sc__media {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--dt-teal-50);
}

.sc__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--dt-dur-5) var(--dt-ease-out);
}

.sc:hover .sc__media img {
  transform: scale(1.06);
}

.sc__badge {
  position: absolute;
  inset-block-start: var(--dt-space-3);
  inset-inline-start: var(--dt-space-3);
  padding: 0.3rem 0.75rem;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-grad-gold);
  color: var(--dt-navy-800);
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-bold);
  box-shadow: var(--dt-shadow-sm);
}

.sc__icon {
  position: absolute;
  inset-block-end: calc(var(--dt-space-4) * -1);
  inset-inline-end: var(--dt-space-4);
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: var(--dt-radius-md);
  background: var(--dt-surface);
  color: var(--dt-teal-600);
  box-shadow: var(--dt-shadow-md);
  transition:
    background-color var(--dt-dur-3) var(--dt-ease-out),
    color var(--dt-dur-3) var(--dt-ease-out),
    transform var(--dt-dur-3) var(--dt-ease-spring);
}

.sc:hover .sc__icon {
  background: var(--dt-grad-primary);
  color: #fff;
  transform: rotate(-6deg) scale(1.06);
}

.sc__body {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
  padding: calc(var(--dt-space-6) + 0.25rem) var(--dt-space-5) var(--dt-space-4);
  flex: 1;
}

.sc__name {
  font-size: var(--dt-fs-h4);
  font-weight: var(--dt-fw-bold);
}

.sc__tagline {
  font-size: var(--dt-fs-xs);
  color: var(--dt-teal-600);
  font-weight: var(--dt-fw-medium);
  margin-block-start: 0.15rem;
}

.sc__summary {
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
  line-height: var(--dt-lh-snug);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sc__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.sc__tags li {
  padding: 0.2rem 0.6rem;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-surface-sunken);
  color: var(--dt-ink-soft);
  font-size: 0.7rem;
  font-weight: var(--dt-fw-medium);
}

.sc__meta {
  display: flex;
  align-items: center;
  gap: var(--dt-space-2);
  flex-wrap: wrap;
  margin-block-start: auto;
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.sc__duration {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-inline-start: auto;
}

.sc__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dt-space-3);
  padding: var(--dt-space-4) var(--dt-space-5);
  border-block-start: 1px solid var(--dt-line);
  background: var(--dt-surface);
}

.sc__price {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.25rem;
  min-width: 0;
}

.sc__price-label {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
  width: 100%;
}

.sc__price-value {
  font-size: 1.4rem;
  font-weight: var(--dt-fw-bold);
  color: var(--dt-teal-600);
  line-height: 1;
}

.sc__price-currency {
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-muted);
}

.sc__price-unit {
  font-size: 0.68rem;
  color: var(--dt-muted-soft);
  width: 100%;
}

.sc__actions {
  display: flex;
  align-items: center;
  gap: var(--dt-space-2);
  flex: none;
}

.sc__fav {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: var(--dt-radius-pill);
  color: var(--dt-muted-soft);
  transition:
    color var(--dt-dur-2) var(--dt-ease-out),
    background-color var(--dt-dur-2) var(--dt-ease-out),
    transform var(--dt-dur-2) var(--dt-ease-spring);
}

.sc__fav:hover {
  background: var(--dt-danger-soft);
  color: var(--dt-danger);
}

.sc__fav--on {
  color: var(--dt-danger);
}

.sc__fav--on :deep(svg) {
  fill: currentColor;
}

.sc__fav--on:active {
  transform: scale(1.2);
}

/* ---------- featured variant ----------
   Spans two grid columns with a cinematic crop; the parent grid decides the
   span, the card only adapts its internal proportions. */
@media (min-width: 900px) {
  .sc--featured .sc__media {
    aspect-ratio: 21 / 9;
  }
  .sc--featured .sc__body {
    padding-inline: var(--dt-space-6);
  }
  .sc--featured .sc__name {
    font-size: var(--dt-fs-h3);
  }
  .sc--featured .sc__summary {
    -webkit-line-clamp: 3;
    line-clamp: 3;
    max-width: 60ch;
  }
  .sc--featured .sc__footer {
    padding-inline: var(--dt-space-6);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sc,
  .sc__media img,
  .sc__icon {
    transition: none;
  }
  .sc:hover {
    transform: none;
  }
  .sc:hover .sc__media img,
  .sc:hover .sc__icon {
    transform: none;
  }
}
</style>
