<script setup>
/**
 * "كيف نخدمك؟" — the four-step explainer from the mobile design.
 *
 * Steps read right-to-left (1 on the right) and are joined by dashed
 * connectors. The step icons ship as SVG from DoctolIcon rather than the PNG
 * crops in the mockup: same shapes, but sharp at any density and able to take
 * the brand colour, which flat PNGs at 90px would not survive on a 3× screen.
 */
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { vReveal } from '@/composables/useScrollAnimation'

const STEPS = [
  {
    icon: 'grid',
    title: 'اختر خدمتك',
    text: 'حدد الخدمة التي تحتاجها',
  },
  {
    icon: 'pin',
    title: 'أرسل تفاصيل طلبك',
    text: 'حدد الموقع والموعد والتفاصيل المطلوبة',
  },
  {
    icon: 'headset',
    title: 'نتواصل معك مباشرة',
    text: 'موظف دكتول يكمل معك الطلب وينسق المعاينة عند الحاجة',
  },
  {
    icon: 'truck',
    title: 'نؤكد الموعد ونصلك',
    text: 'بعد التأكيد، يصلك فريق دكتول في الموعد المحدد',
  },
]
</script>

<template>
  <section class="hws section" aria-labelledby="hws-title">
    <div class="container container--wide">
      <header class="hws__head">
        <h2 id="hws-title" class="hws__title">
          <DoctolIcon name="sparkle" :size="20" class="hws__spark" />
          كيف نخدمك؟
        </h2>
        <p class="hws__sub">
          احجز خدمتك بخطوات بسيطة
          <span class="hws__hl">ونتواصل معك مباشرة</span>
          لإكمال طلبك
        </p>
      </header>

      <ol class="hws__steps">
        <li v-for="(step, i) in STEPS" :key="step.title" v-reveal class="hws__step">
          <div class="hws__marker">
            <span class="hws__num">{{ i + 1 }}</span>
            <span class="hws__tile">
              <DoctolIcon :name="step.icon" :size="28" />
            </span>
          </div>
          <h3 class="hws__step-title">{{ step.title }}</h3>
          <p class="hws__step-text">{{ step.text }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.hws {
  background: var(--dt-surface);
}

.hws__head {
  text-align: center;
  margin-block-end: var(--dt-space-6);
}

.hws__title {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: var(--dt-fs-h2);
  font-weight: var(--dt-fw-bold);
}

.hws__spark {
  color: var(--dt-gold-500);
}

.hws__sub {
  margin-block-start: 0.4rem;
  color: var(--dt-muted);
  font-size: var(--dt-fs-sm);
  line-height: var(--dt-lh-relaxed);
}

.hws__hl {
  color: var(--dt-teal-600);
  font-weight: var(--dt-fw-semibold);
}

/**
 * Four across even on the narrowest phone — that's what the design shows, and
 * the dashed rail only reads as a sequence when every step is on one line.
 */
.hws__steps {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--dt-space-2);
  list-style: none;
  padding: 0;
  margin: 0;
}

.hws__step {
  position: relative;
  text-align: center;
  min-width: 0;
}

.hws__marker {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-block-end: 0.7rem;
}

.hws__num {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-teal-600);
  color: #fff;
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-bold);
  line-height: 1;
}

.hws__tile {
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 1;
  max-width: 74px;
  border-radius: var(--dt-radius-lg);
  background: var(--dt-surface);
  border: 1px solid var(--dt-line);
  box-shadow: var(--dt-shadow-sm);
  color: var(--dt-teal-600);
}

/**
 * Dashed connector between tiles. Drawn on each step except the last in reading
 * order — in RTL that means every step except the leftmost, so it hangs off the
 * inline-end (left) edge and stops at the neighbouring tile.
 */
.hws__step:not(:last-child) .hws__marker::after {
  content: '';
  position: absolute;
  inset-inline-end: calc(100% - 4px);
  inset-block-start: 52px;
  width: var(--dt-space-3);
  border-block-start: 2px dashed var(--dt-teal-300);
}

.hws__step-title {
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-bold);
  line-height: var(--dt-lh-snug);
}

.hws__step-text {
  margin-block-start: 0.25rem;
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
  line-height: var(--dt-lh-relaxed);
  text-wrap: pretty;
}

@media (min-width: 768px) {
  .hws__steps {
    gap: var(--dt-space-5);
  }
  .hws__tile {
    max-width: 92px;
  }
  .hws__step-title {
    font-size: var(--dt-fs-base);
  }
  .hws__step-text {
    font-size: var(--dt-fs-sm);
  }
  .hws__step:not(:last-child) .hws__marker::after {
    width: var(--dt-space-6);
    inset-block-start: 64px;
  }
}
</style>
