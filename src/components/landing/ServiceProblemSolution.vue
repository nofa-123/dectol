<script setup>
/**
 * Problem → solution, side by side.
 * `flip` mirrors the image/text order so consecutive landings don't read the
 * same way; the page passes it based on its accent.
 */
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { vReveal } from '@/composables/useScrollAnimation'

defineProps({
  problem: { type: Object, required: true },
  solution: { type: Object, required: true },
  flip: { type: Boolean, default: false },
})
</script>

<template>
  <section class="ps section" :class="{ 'ps--flip': flip }">
    <div class="container container--wide ps__grid">
      <!-- problem -->
      <article v-reveal="'start'" class="ps__card ps__card--problem">
        <figure class="ps__media">
          <img
            :src="problem.image"
            :alt="`قبل الخدمة — ${problem.lead}`"
            width="1200"
            height="800"
            loading="lazy"
            decoding="async"
          />
          <figcaption class="ps__tag ps__tag--problem">{{ problem.title }}</figcaption>
        </figure>
        <div class="ps__body">
          <p class="ps__lead">{{ problem.lead }}</p>
          <ul class="ps__list ps__list--problem">
            <li v-for="point in problem.points" :key="point">
              <DoctolIcon name="close" :size="14" :stroke="2.6" />
              <span>{{ point }}</span>
            </li>
          </ul>
        </div>
      </article>

      <!-- arrow -->
      <div class="ps__arrow" aria-hidden="true">
        <DoctolIcon name="arrow-left" :size="26" />
      </div>

      <!-- solution -->
      <article v-reveal="'end'" class="ps__card ps__card--solution">
        <figure class="ps__media">
          <img
            :src="solution.image"
            :alt="`بعد الخدمة — ${solution.lead}`"
            width="1200"
            height="800"
            loading="lazy"
            decoding="async"
          />
          <figcaption class="ps__tag ps__tag--solution">{{ solution.title }}</figcaption>
        </figure>
        <div class="ps__body">
          <p class="ps__lead">{{ solution.lead }}</p>
          <ul class="ps__list ps__list--solution">
            <li v-for="point in solution.points" :key="point">
              <DoctolIcon name="check" :size="14" :stroke="2.6" />
              <span>{{ point }}</span>
            </li>
          </ul>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.ps__grid {
  display: grid;
  gap: var(--dt-space-5);
  align-items: stretch;
}

.ps__card {
  display: flex;
  flex-direction: column;
  border-radius: var(--dt-radius-xl);
  overflow: hidden;
  background: var(--dt-surface);
  border: 1px solid var(--dt-line);
  box-shadow: var(--dt-shadow-sm);
}

.ps__card--solution {
  border-color: var(--sl-accent-line);
  box-shadow: var(--dt-shadow-md);
}

.ps__media {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--dt-surface-sunken);
}

.ps__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ps__card--problem .ps__media img {
  filter: saturate(0.75);
}

.ps__tag {
  position: absolute;
  inset-block-start: var(--dt-space-4);
  inset-inline-start: var(--dt-space-4);
  padding: 0.3rem 0.85rem;
  border-radius: var(--dt-radius-pill);
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-bold);
  color: #fff;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.ps__tag--problem {
  background: rgb(11 31 39 / 0.78);
}

.ps__tag--solution {
  background: var(--sl-accent);
}

.ps__body {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-4);
  padding: var(--dt-space-5);
  flex: 1;
}

.ps__lead {
  font-size: var(--dt-fs-body-lg);
  font-weight: var(--dt-fw-semibold);
  line-height: var(--dt-lh-snug);
}

.ps__list {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
}

.ps__list li {
  display: flex;
  align-items: flex-start;
  gap: var(--dt-space-3);
  font-size: var(--dt-fs-sm);
  color: var(--dt-ink-soft);
  line-height: var(--dt-lh-snug);
}

.ps__list :deep(svg) {
  flex: none;
  margin-block-start: 0.15rem;
  padding: 3px;
  width: 22px;
  height: 22px;
  border-radius: var(--dt-radius-pill);
}

.ps__list--problem :deep(svg) {
  background: var(--dt-danger-soft);
  color: var(--dt-danger);
}

.ps__list--solution :deep(svg) {
  background: var(--sl-accent-soft);
  color: var(--sl-accent);
}

.ps__arrow {
  display: none;
  place-items: center;
  width: 56px;
  height: 56px;
  align-self: center;
  border-radius: var(--dt-radius-pill);
  background: var(--sl-accent);
  color: #fff;
  box-shadow: var(--dt-shadow-md);
}

@media (min-width: 900px) {
  .ps__grid {
    grid-template-columns: 1fr auto 1fr;
    gap: var(--dt-space-4);
  }
  .ps__arrow {
    display: grid;
  }
  /* Alternate which side the "after" lands on between pages. */
  .ps--flip .ps__card--problem {
    order: 3;
  }
  .ps--flip .ps__card--solution {
    order: 1;
  }
  .ps--flip .ps__arrow {
    order: 2;
    rotate: 180deg;
  }
}
</style>
