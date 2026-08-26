<script setup>
/**
 * Landing hero. Same choreography as the home hero (badge → headline →
 * subcopy → CTAs → trust) but tinted by the page accent and carrying a
 * breadcrumb for SEO and orientation.
 */
import { onMounted, ref } from 'vue'
import { animate, stagger } from 'motion'
import BaseButton from '@/components/common/BaseButton.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { formatPrice } from '@/utils/format'
import { prefersReducedMotion } from '@/utils/motion'
import { useParallax } from '@/composables/useScrollAnimation'

defineProps({
  landing: { type: Object, required: true },
})

const emit = defineEmits(['book'])

const root = ref(null)
const { target: parallaxLayer } = useParallax(22)

onMounted(() => {
  if (prefersReducedMotion() || !root.value) return
  const q = (sel) => root.value.querySelectorAll(sel)
  animate(q('[data-h="visual"]'), { opacity: [0, 1], scale: [1.04, 1] }, { duration: 0.85, ease: [0.22, 1, 0.36, 1] })
  animate(q('[data-h="line"]'), { opacity: [0, 1], y: [24, 0] }, { duration: 0.6, delay: stagger(0.08, { startDelay: 0.1 }), ease: [0.22, 1, 0.36, 1] })
  animate(q('[data-h="cta"]'), { opacity: [0, 1], y: [16, 0] }, { duration: 0.5, delay: stagger(0.08, { startDelay: 0.4 }), ease: [0.22, 1, 0.36, 1] })
  animate(q('[data-h="chip"]'), { opacity: [0, 1], scale: [0.94, 1] }, { duration: 0.42, delay: stagger(0.05, { startDelay: 0.55 }), ease: [0.34, 1.4, 0.64, 1] })
})
</script>

<template>
  <section ref="root" class="sh" aria-labelledby="sh-title">
    <div class="sh__bg sl-pattern" aria-hidden="true">
      <span class="sh__orb sh__orb--a" />
      <span class="sh__orb sh__orb--b" />
    </div>

    <div class="container container--wide sh__inner">
      <div class="sh__copy">
        <nav class="sh__crumbs" aria-label="مسار التصفح">
          <RouterLink :to="{ name: 'home' }">الرئيسية</RouterLink>
          <DoctolIcon name="chevron-left" :size="13" />
          <RouterLink :to="{ name: 'services' }">الخدمات</RouterLink>
          <DoctolIcon name="chevron-left" :size="13" />
          <span aria-current="page">{{ landing.name }}</span>
        </nav>

        <span data-h="line" class="sh__badge">
          <DoctolIcon name="sparkle" :size="15" />
          {{ landing.badge }}
        </span>

        <h1 id="sh-title" data-h="line" class="sh__title">{{ landing.headline }}</h1>
        <p data-h="line" class="sh__lead">{{ landing.subheadline }}</p>

        <div class="sh__actions">
          <BaseButton data-h="cta" size="lg" icon-end="arrow-left" magnetic @click="emit('book')">
            احجز الآن
          </BaseButton>
          <BaseButton data-h="cta" size="lg" variant="outline" icon="list" href="#details">
            تعرّف على الخدمة
          </BaseButton>
        </div>

        <p v-if="landing.priceFrom" data-h="cta" class="sh__price">
          <DoctolIcon name="tag" :size="16" />
          يبدأ من <strong class="money">{{ formatPrice(landing.priceFrom) }}</strong>
        </p>

        <ul class="sh__trust">
          <li v-for="item in landing.trust.slice(0, 3)" :key="item.label" data-h="chip">
            <DoctolIcon :name="item.icon" :size="16" />
            {{ item.label }}
          </li>
        </ul>
      </div>

      <div class="sh__visual-wrap">
        <div ref="parallaxLayer" class="sh__parallax">
          <figure data-h="visual" class="sh__visual">
            <img
              :src="landing.heroImage"
              :alt="landing.heroAlt"
              width="1200"
              height="750"
              fetchpriority="high"
              decoding="async"
            />
          </figure>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sh {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding-block: calc(var(--dt-header-h) + clamp(1.5rem, 1rem + 3vw, 3.5rem)) clamp(2.5rem, 2rem + 4vw, 5rem);
}

.sh__bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  background-color: transparent;
  background-image:
    linear-gradient(var(--sl-pattern-color) 1px, transparent 1px),
    linear-gradient(90deg, var(--sl-pattern-color) 1px, transparent 1px),
    var(--sl-hero);
  background-size: var(--sl-pattern-size) var(--sl-pattern-size), var(--sl-pattern-size) var(--sl-pattern-size), auto;
}

.sh__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
}

.sh__orb--a {
  inset-block-start: -18%;
  inset-inline-start: -10%;
  width: 44vw;
  height: 44vw;
  max-width: 560px;
  max-height: 560px;
  background: radial-gradient(circle, var(--sl-hero-orb), transparent 70%);
}

.sh__orb--b {
  inset-block-end: -22%;
  inset-inline-end: -8%;
  width: 34vw;
  height: 34vw;
  max-width: 440px;
  max-height: 440px;
  background: radial-gradient(circle, var(--sl-hero-orb), transparent 72%);
  opacity: 0.7;
}

.sh__inner {
  display: grid;
  gap: clamp(2rem, 1rem + 4vw, 3.5rem);
  align-items: center;
}

.sh__copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--dt-space-4);
}

.sh__crumbs {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.sh__crumbs a:hover {
  color: var(--sl-accent);
  text-decoration: underline;
}

.sh__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.9rem;
  border-radius: var(--dt-radius-pill);
  background: var(--sl-accent-soft);
  border: 1px solid var(--sl-accent-line);
  color: var(--sl-accent-deep);
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
}

.sh__badge :deep(svg) {
  color: var(--dt-gold-600);
}

.sh__title {
  font-size: var(--dt-fs-display);
  line-height: 1.15;
  letter-spacing: -0.025em;
  max-width: 18ch;
}

.sh__lead {
  font-size: var(--dt-fs-body-lg);
  color: var(--dt-ink-soft);
  max-width: 48ch;
}

.sh__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--dt-space-3);
}

.sh__price {
  display: inline-flex;
  align-items: baseline;
  gap: 0.4rem;
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
}

.sh__price :deep(svg) {
  align-self: center;
  color: var(--sl-accent);
}

.sh__price strong {
  font-size: 1.15rem;
  font-weight: var(--dt-fw-bold);
  color: var(--sl-accent-deep);
}

.sh__trust {
  display: flex;
  flex-wrap: wrap;
  gap: var(--dt-space-2) var(--dt-space-4);
  padding-block-start: var(--dt-space-2);
}

.sh__trust li {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-medium);
  color: var(--dt-ink-soft);
}

.sh__trust :deep(svg) {
  color: var(--sl-accent);
}

.sh__visual-wrap {
  min-width: 0;
}

.sh__parallax {
  will-change: transform;
}

.sh__visual {
  border-radius: var(--dt-radius-2xl);
  overflow: hidden;
  box-shadow: var(--dt-shadow-xl);
  border: 1px solid rgb(255 255 255 / 0.7);
  background: var(--sl-accent-soft);
}

.sh__visual img {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 10;
  object-fit: cover;
}

@media (min-width: 1024px) {
  .sh__inner {
    grid-template-columns: 1.05fr 1fr;
  }
}

@media (max-width: 767px) {
  .sh__actions {
    width: 100%;
  }
  .sh__actions > * {
    flex: 1 1 100%;
  }
}
</style>
