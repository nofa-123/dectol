<script setup>
/**
 * Hero.
 *
 * Choreography (Motion One): background wash → image settle (1.04 → 1) →
 * headline rise → subcopy → CTAs → trust badges. Total ≈ 1.2s, every step
 * under 700ms, and the whole sequence is skipped for reduced-motion users so
 * the content is simply present.
 */
import { computed, onMounted, ref } from 'vue'
import { animate, stagger } from 'motion'
import BaseButton from '@/components/common/BaseButton.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import RatingStars from '@/components/common/RatingStars.vue'
import { useBooking } from '@/composables/useBooking'
import { useParallax } from '@/composables/useScrollAnimation'
import { prefersReducedMotion } from '@/utils/motion'
import { useServicesStore } from '@/stores/servicesStore'
import heroImage from '@/assets/images/hero-living-room.svg'
import heroPhoto from '@/assets/mockup/hero.webp'

const { startBlank } = useBooking()
const catalogue = useServicesStore()
const root = ref(null)
const { target: parallaxLayer } = useParallax(26)

/** Shown over the photo on phones, where the four-badge row doesn't fit. */
const HERO_CHECKS = ['فريق متخصص', 'مواد آمنة', 'نتائج تفوق توقعاتك']
const mobileTitle = computed(() => catalogue.homeHero.title || 'نظافة عميقة انعكس راحة')
const mobileChecks = computed(() => catalogue.homeHero.checks?.length ? catalogue.homeHero.checks.slice(0, 3) : HERO_CHECKS)
const primaryButtonText = computed(() => catalogue.homeHero.buttonText || 'احجز الآن')

const TRUST = [
  { icon: 'shield', label: 'ضمان 24 ساعة' },
  { icon: 'team', label: 'فريق متخصص' },
  { icon: 'leaf', label: 'مواد آمنة' },
  { icon: 'truck', label: 'خدمة في موقعك' },
]

onMounted(() => {
  if (prefersReducedMotion() || !root.value) return
  const q = (sel) => root.value.querySelectorAll(sel)

  animate(
    q('[data-hero="visual"]'),
    { opacity: [0, 1], scale: [1.04, 1] },
    { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  )
  animate(
    q('[data-hero="line"]'),
    { opacity: [0, 1], y: [26, 0] },
    { duration: 0.62, delay: stagger(0.09, { startDelay: 0.12 }), ease: [0.22, 1, 0.36, 1] },
  )
  animate(
    q('[data-hero="cta"]'),
    { opacity: [0, 1], y: [18, 0] },
    { duration: 0.5, delay: stagger(0.08, { startDelay: 0.42 }), ease: [0.22, 1, 0.36, 1] },
  )
  animate(
    q('[data-hero="badge"]'),
    { opacity: [0, 1], y: [12, 0], scale: [0.94, 1] },
    { duration: 0.45, delay: stagger(0.07, { startDelay: 0.6 }), ease: [0.34, 1.4, 0.64, 1] },
  )
  animate(
    q('[data-hero="float"]'),
    { opacity: [0, 1], scale: [0.9, 1] },
    { duration: 0.55, delay: stagger(0.12, { startDelay: 0.75 }), ease: [0.34, 1.4, 0.64, 1] },
  )
})
</script>

<template>
  <section ref="root" class="hero" aria-labelledby="hero-title">
    <!-- decorative background -->
    <div class="hero__bg" aria-hidden="true">
      <span class="hero__blob hero__blob--1" />
      <span class="hero__blob hero__blob--2" />
      <span class="hero__blob hero__blob--3" />
      <span class="hero__grid" />
    </div>

    <div class="hero__inner container container--wide">
      <div class="hero__copy">
        <span data-hero="line" class="eyebrow hero__eyebrow">
          <DoctolIcon name="sparkle" :size="16" />
          خدمات تنظيف احترافية في السعودية
        </span>

        <h1 id="hero-title" data-hero="line" class="hero__title">
          <span class="hero__title-mobile">
            {{ mobileTitle }}
          </span>
          <span class="hero__title-desktop">
            بيتك يستحق
            <span class="hero__title-accent">
              نظافة استثنائية
            </span>
          </span>
          <span class="hero__title-accent hero__underline-holder">
            <svg class="hero__underline" viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden="true">
              <path d="M2 9c60-7 130-9 296-4" />
            </svg>
          </span>
        </h1>

        <ul class="hero__checks" aria-label="لماذا دكتول">
          <li v-for="check in mobileChecks" :key="check">
            <DoctolIcon name="check-circle" :size="18" />
            {{ check }}
          </li>
        </ul>

        <p data-hero="line" class="hero__lead">
          احجز خدمة التنظيف التي تحتاجها، ونحن نهتم بالباقي — فريق متخصص يصلك بالمعدات كاملة، بسعر
          واضح من البداية.
        </p>

        <div class="hero__actions">
          <BaseButton data-hero="cta" size="lg" icon-end="arrow-left" magnetic @click="startBlank">
            {{ primaryButtonText }}
          </BaseButton>
          <BaseButton
            data-hero="cta"
            size="lg"
            variant="outline"
            icon="grid"
            :to="{ name: 'services' }"
          >
            استكشف خدماتنا
          </BaseButton>
        </div>

        <ul class="hero__trust">
          <li v-for="item in TRUST" :key="item.label" data-hero="badge" class="hero__trust-item">
            <DoctolIcon :name="item.icon" :size="17" />
            {{ item.label }}
          </li>
        </ul>
      </div>

      <div class="hero__visual-wrap">
        <div ref="parallaxLayer" class="hero__parallax">
          <figure data-hero="visual" class="hero__visual">
            <picture>
              <source media="(max-width: 767px)" :srcset="heroPhoto" />
              <img
                :src="heroImage"
                alt="غرفة معيشة سعودية نظيفة مع فني دكتول ومعدات تنظيف احترافية"
                width="1200"
                height="900"
                fetchpriority="high"
                decoding="async"
              />
            </picture>
            <span class="hero__visual-glow" aria-hidden="true" />
          </figure>

          <!-- floating proof cards -->
          <div data-hero="float" class="hero__float hero__float--rating">
            <RatingStars :value="4.9" :size="15" />
            <div class="hero__float-text">
              <strong class="num">4.9</strong>
              <span>من <span class="num">2,356</span> تقييم</span>
            </div>
          </div>

          <div data-hero="float" class="hero__float hero__float--guarantee">
            <span class="hero__float-icon"><DoctolIcon name="shield" :size="20" /></span>
            <div class="hero__float-text">
              <strong>ضمان 24 ساعة</strong>
              <span>نرجع ونصلحها مجاناً</span>
            </div>
          </div>

          <div data-hero="float" class="hero__float hero__float--slot">
            <span class="hero__float-pulse" aria-hidden="true" />
            <div class="hero__float-text">
              <strong>أقرب موعد اليوم</strong>
              <span>4:00 مساءً — متاح الآن</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <a class="hero__scroll" href="#discovery" aria-label="تصفح المزيد">
      <span class="hero__scroll-track"><span class="hero__scroll-dot" /></span>
    </a>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  padding-block: calc(var(--dt-header-h) + clamp(1.5rem, 1rem + 3vw, 4rem)) clamp(3rem, 2rem + 6vw, 7rem);
  overflow: hidden;
  isolation: isolate;
}

/* ---------- background ---------- */
.hero__bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(170deg, #f1faf9 0%, #ffffff 45%, #f7fbfb 100%);
}

.hero__blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.55;
  animation: dt-float 12s ease-in-out infinite;
}

.hero__blob--1 {
  inset-block-start: -12%;
  inset-inline-start: -8%;
  width: 46vw;
  height: 46vw;
  max-width: 620px;
  max-height: 620px;
  background: radial-gradient(circle, rgb(0 159 163 / 0.28), transparent 68%);
}

.hero__blob--2 {
  inset-block-end: -18%;
  inset-inline-end: -10%;
  width: 40vw;
  height: 40vw;
  max-width: 540px;
  max-height: 540px;
  background: radial-gradient(circle, rgb(245 197 66 / 0.24), transparent 68%);
  animation-delay: -4s;
}

.hero__blob--3 {
  inset-block-start: 32%;
  inset-inline-start: 42%;
  width: 26vw;
  height: 26vw;
  max-width: 360px;
  max-height: 360px;
  background: radial-gradient(circle, rgb(7 59 76 / 0.14), transparent 70%);
  animation-delay: -8s;
}

.hero__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgb(7 59 76 / 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgb(7 59 76 / 0.035) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, #000 30%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, #000 30%, transparent 75%);
}

/* ---------- layout ---------- */
.hero__inner {
  display: grid;
  gap: clamp(2rem, 1rem + 4vw, 4rem);
  align-items: center;
}

.hero__copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--dt-space-5);
  max-width: 40rem;
}

.hero__title {
  font-size: var(--dt-fs-display);
  line-height: 1.14;
  letter-spacing: -0.025em;
}

.hero__title-mobile { display: none; }
.hero__title-desktop { display: inline; }
.hero__underline-holder { position: static; }

.hero__title-accent {
  position: relative;
  display: inline-block;
  color: var(--dt-teal-600);
  white-space: nowrap;
}

.hero__underline {
  position: absolute;
  inset-inline: -2%;
  inset-block-end: -0.12em;
  width: 104%;
  height: 0.4em;
  fill: none;
  stroke: var(--dt-gold-500);
  stroke-width: 5;
  stroke-linecap: round;
  stroke-dasharray: 320;
  stroke-dashoffset: 320;
  animation: underline-draw 900ms var(--dt-ease-out) 800ms forwards;
}

.hero__lead {
  font-size: var(--dt-fs-body-lg);
  color: var(--dt-ink-soft);
  max-width: 46ch;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--dt-space-3);
}

.hero__trust {
  display: flex;
  flex-wrap: wrap;
  gap: var(--dt-space-2) var(--dt-space-4);
  padding-block-start: var(--dt-space-2);
}

.hero__trust-item {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-medium);
  color: var(--dt-ink-soft);
}

.hero__trust-item :deep(svg) {
  color: var(--dt-teal-500);
}

/* ---------- visual ---------- */
.hero__visual-wrap {
  position: relative;
  min-width: 0;
}

.hero__parallax {
  position: relative;
  will-change: transform;
}

.hero__visual {
  position: relative;
  border-radius: var(--dt-radius-2xl);
  overflow: hidden;
  box-shadow: var(--dt-shadow-xl);
  border: 1px solid rgb(255 255 255 / 0.7);
  background: var(--dt-teal-50);
}

.hero__visual img {
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.hero__visual-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(200deg, rgb(255 255 255 / 0.35), transparent 45%);
  pointer-events: none;
}

/* ---------- floating cards ---------- */
.hero__float {
  position: absolute;
  display: flex;
  align-items: center;
  gap: var(--dt-space-3);
  padding: 0.7rem 1rem;
  border-radius: var(--dt-radius-lg);
  background: rgb(255 255 255 / 0.9);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgb(255 255 255 / 0.85);
  box-shadow: var(--dt-shadow-lg);
  animation: dt-float 6s ease-in-out infinite;
}

.hero__float-text {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.hero__float-text strong {
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-bold);
}

.hero__float-text span {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.hero__float--rating {
  inset-block-start: 7%;
  inset-inline-start: -4%;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.3rem;
}

.hero__float--guarantee {
  inset-block-end: 14%;
  inset-inline-end: -5%;
  animation-delay: -2s;
}

.hero__float--slot {
  inset-block-end: -4%;
  inset-inline-start: 8%;
  animation-delay: -4s;
}

.hero__float-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: var(--dt-radius-sm);
  background: var(--dt-teal-50);
  color: var(--dt-teal-600);
}

.hero__float-pulse {
  position: relative;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--dt-success);
}

.hero__float-pulse::after {
  content: '';
  position: absolute;
  inset: -5px;
  border-radius: 50%;
  background: var(--dt-success);
  animation: dt-pulse-ring 2s var(--dt-ease-out) infinite;
}

/* ---------- scroll cue ---------- */
.hero__scroll {
  display: none;
  position: absolute;
  inset-block-end: 1.5rem;
  inset-inline-start: 50%;
  translate: 50% 0;
}

.hero__scroll-track {
  display: grid;
  justify-items: center;
  width: 26px;
  height: 42px;
  padding-block-start: 8px;
  border: 2px solid var(--dt-teal-300);
  border-radius: var(--dt-radius-pill);
}

.hero__scroll-dot {
  width: 4px;
  height: 8px;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-teal-500);
  animation: scroll-hint 1.8s var(--dt-ease-in-out) infinite;
}

/* ---------- keyframes ---------- */
@keyframes underline-draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes scroll-hint {
  0%,
  100% {
    transform: translateY(0);
    opacity: 1;
  }
  60% {
    transform: translateY(12px);
    opacity: 0.2;
  }
}

/* ---------- responsive ---------- */
/* The overlay checks belong to the phone layout only. */
.hero__checks {
  display: none;
}

/**
 * Phone hero, per the mobile design: the photograph becomes the backdrop and
 * the copy sits over it, rather than the two-column copy/illustration split
 * used from tablet up. A scrim on the inline-start edge keeps the headline
 * legible over the brightest part of the room.
 */
@media (max-width: 767px) {
  .hero__title-mobile {
    display: flex;
    flex-direction: column;
    gap: 0.05em;
  }
  .hero__title-desktop,
  .hero__underline-holder { display: none; }
  .hero {
    padding-block: 0;
  }

  .hero__inner {
    position: relative;
    display: block;
    padding: 0;
    min-height: 96vw;
    isolation: isolate;
  }

  .hero__visual-wrap,
  .hero__parallax,
  .hero__visual {
    position: absolute;
    inset: 0;
    margin: 0;
    z-index: 0;
  }

  .hero__visual picture,
  .hero__visual img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 30% center;
    border-radius: 0;
  }

  /**
   * Scrim: clear over the vacuum, opaque behind the text.
   *
   * It has to stay strong across the *whole* copy column (66% wide), not just
   * the right third — measured against the photo, the earlier falloff left the
   * far edge of the text sitting on the plant and hose at luminance 0. These
   * stops hold the darkest pixel under the text at ~153 and 95% of it above
   * 190, which carries the navy headline and the check list comfortably.
   */
  .hero__inner::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    background: linear-gradient(
      to left,
      rgb(255 255 255 / 0.95) 0%,
      rgb(255 255 255 / 0.9) 45%,
      rgb(255 255 255 / 0.6) 70%,
      rgb(255 255 255 / 0) 90%
    );
    pointer-events: none;
  }

  /**
   * The copy sits on the *right*, over the scrim. In RTL the inline start IS
   * the right edge, so this needs `flex-start` / `text-align: start` and an
   * auto margin on the inline END — the mirrored values push everything to the
   * left, on top of the vacuum, where the scrim gives no contrast.
   *
   * The top padding clears the fixed header, which overlays the hero.
   */
  .hero__copy {
    position: relative;
    z-index: 2;
    align-items: flex-start;
    text-align: start;
    gap: var(--dt-space-4);
    max-width: 66%;
    margin-inline-end: auto;
    padding: calc(var(--dt-header-h) + var(--dt-space-5)) var(--dt-gutter) var(--dt-space-8);
  }

  /* Full-width headline would collide with the vacuum; keep it in the scrim. */
  .hero__title {
    font-size: clamp(1.65rem, 1.1rem + 4.2vw, 2.3rem);
    line-height: var(--dt-lh-snug);
  }

  .hero__underline {
    display: none;
  }

  /* Not in the phone design — the badges reappear as their own card row. */
  .hero__eyebrow,
  .hero__lead,
  .hero__trust,
  .hero__float,
  .hero__visual-glow {
    display: none;
  }

  .hero__checks {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: var(--dt-fs-sm);
    font-weight: var(--dt-fw-semibold);
    color: var(--dt-navy-700);
  }

  .hero__checks li {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  .hero__checks :deep(svg) {
    color: var(--dt-teal-500);
    flex: none;
  }

  .hero__actions {
    width: auto;
  }
  .hero__actions > * {
    flex: 0 0 auto;
  }
  /* The design shows a single primary CTA on the photo. */
  .hero__actions > *:nth-child(2) {
    display: none;
  }

  .hero__float--rating {
    inset-block-start: 4%;
    inset-inline-start: 2%;
    padding: 0.5rem 0.7rem;
  }
  .hero__float--guarantee {
    inset-block-end: 8%;
    inset-inline-end: 2%;
    padding: 0.5rem 0.7rem;
  }
  .hero__float--slot {
    display: none;
  }
  .hero__title-accent {
    white-space: normal;
  }
}

@media (min-width: 1024px) {
  .hero__inner {
    grid-template-columns: 1.02fr 1fr;
  }
  .hero__scroll {
    display: block;
  }
}

@media (min-width: 1440px) {
  .hero__inner {
    grid-template-columns: 1fr 1.08fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero__blob,
  .hero__float,
  .hero__float-pulse::after,
  .hero__scroll-dot {
    animation: none;
  }
  .hero__underline {
    animation: none;
    stroke-dashoffset: 0;
  }
}
</style>
