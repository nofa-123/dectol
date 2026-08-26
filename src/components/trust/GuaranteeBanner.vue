<script setup>
/**
 * "ضمان دكتول 24 ساعة" — reassurance band from the mobile design.
 *
 * The shield is the supplied artwork (it has gradients and sparkles that don't
 * reduce to a line icon); the three supporting points use DoctolIcon so they
 * stay crisp and inherit the brand colour.
 */
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { vReveal } from '@/composables/useScrollAnimation'
import shieldArt from '@/assets/mockup/badge-shield-24h.webp'

const POINTS = [
  { icon: 'refresh', label: 'نصلحها مجاناً' },
  { icon: 'user', label: 'فريق متخصص' },
  { icon: 'shield', label: 'ضمان الجودة' },
]
</script>

<template>
  <section v-reveal class="gb" aria-labelledby="gb-title">
    <div class="container container--wide">
      <div class="gb__card">
        <div class="gb__body">
          <h2 id="gb-title" class="gb__title">ضمان دكتول 24 ساعة</h2>
          <p class="gb__text">
            نضمن لك جودة الخدمة، ولو ما كنت راضي نرجع ونصلحها مجاناً خلال 24 ساعة.
          </p>

          <ul class="gb__points">
            <li v-for="point in POINTS" :key="point.label" class="gb__point">
              <DoctolIcon :name="point.icon" :size="22" />
              <span>{{ point.label }}</span>
            </li>
          </ul>
        </div>

        <img
          class="gb__shield"
          :src="shieldArt"
          alt=""
          width="230"
          height="240"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.gb {
  padding-block: var(--dt-space-6);
}

.gb__card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 34%;
  align-items: center;
  gap: var(--dt-space-3);
  padding: var(--dt-space-5);
  border-radius: var(--dt-radius-xl);
  background: var(--dt-teal-50, #eef7f6);
  border: 1px solid var(--dt-line);
}

.gb__title {
  font-size: var(--dt-fs-h4);
  font-weight: var(--dt-fw-bold);
}

.gb__text {
  margin-block-start: 0.4rem;
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
  line-height: var(--dt-lh-relaxed);
  text-wrap: pretty;
}

.gb__shield {
  width: 100%;
  max-width: 150px;
  justify-self: center;
}

/* Three points sit under the copy, divided by hairlines as in the design. */
.gb__points {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--dt-space-2);
  list-style: none;
  padding: 0;
  margin-block-start: var(--dt-space-5);
  grid-column: 1 / -1;
}

.gb__point {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  text-align: center;
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-navy-700, var(--dt-ink));
}

.gb__point + .gb__point {
  border-inline-end: 1px solid var(--dt-line);
}

/* The divider belongs between items, so it sits on the inline-end of all but
   the first — in RTL that puts a hairline to the left of each later item. */
.gb__point:first-child {
  border-inline-end: 1px solid var(--dt-line);
}

.gb__point:last-child {
  border-inline-end: 0;
}

.gb__point :deep(svg) {
  color: var(--dt-teal-600);
}

@media (min-width: 768px) {
  .gb__card {
    /* Shield stays on the left at every size, as on mobile. */
    grid-template-columns: minmax(0, 1fr) 190px;
    gap: var(--dt-space-6);
    padding: var(--dt-space-6) var(--dt-space-8);
  }
  .gb__shield {
    max-width: 190px;
  }
  .gb__points {
    grid-column: auto;
  }
  .gb__title {
    font-size: var(--dt-fs-h3);
  }
}
</style>
