<script setup>
/**
 * Trust strip that sits directly under the hero on phones — four compact cards
 * with an icon, a headline and one supporting line, matching the mobile design.
 *
 * Icons come from DoctolIcon rather than the PNG crops: the shapes are the same
 * and SVG stays sharp at 3× where a 78px bitmap would not.
 */
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { vReveal } from '@/composables/useScrollAnimation'

const ITEMS = [
  { icon: 'leaf', title: 'مواد آمنة وفعالة', text: 'لبيئة أكثر نظافة' },
  { icon: 'team', title: 'فريق متخصص', text: 'مدرب وموثوق' },
  { icon: 'home', title: 'خدمة في موقعك', text: 'فريق يصلك أينما كنت' },
  { icon: 'shield', title: 'ضمان 24 ساعة', text: 'راحة بالك تهمنا' },
]
</script>

<template>
  <section v-reveal class="ts" aria-label="لماذا تختار دكتول">
    <div class="container container--wide">
      <ul class="ts__grid">
        <li v-for="item in ITEMS" :key="item.title" class="ts__card">
          <span class="ts__icon">
            <DoctolIcon :name="item.icon" :size="26" />
          </span>
          <h3 class="ts__title">{{ item.title }}</h3>
          <p class="ts__text">{{ item.text }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.ts {
  padding-block: var(--dt-space-5);
}

/**
 * Two-up on the narrowest phones and four-up from 420px. The design shows four
 * across, but below that width each card would be under 80px — too tight for
 * "مواد آمنة وفعالة" to sit on two lines without breaking mid-word.
 */
.ts__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--dt-space-2);
  list-style: none;
  padding: 0;
  margin: 0;
}

.ts__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  text-align: center;
  min-width: 0;
  padding: var(--dt-space-4) var(--dt-space-2);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-surface);
  border: 1px solid var(--dt-line);
  box-shadow: var(--dt-shadow-xs);
}

.ts__icon {
  color: var(--dt-teal-600);
  line-height: 0;
}

.ts__title {
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-bold);
  line-height: var(--dt-lh-snug);
  text-wrap: balance;
}

.ts__text {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
  line-height: var(--dt-lh-snug);
  text-wrap: pretty;
}

@media (min-width: 420px) {
  .ts__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .ts__grid {
    gap: var(--dt-space-4);
  }
  .ts__card {
    padding: var(--dt-space-5) var(--dt-space-3);
  }
  .ts__title {
    font-size: var(--dt-fs-base);
  }
  .ts__text {
    font-size: var(--dt-fs-sm);
  }
}
</style>
