<script setup>
/** Closing conversion band. */
import BaseButton from '@/components/common/BaseButton.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { useBooking } from '@/composables/useBooking'
import { contactInfo } from '@/data/content'
import { vReveal } from '@/composables/useScrollAnimation'
import ctaImage from '@/assets/mockup/cta-armchair.webp'

const { startBlank } = useBooking()
</script>

<template>
  <section class="cta">
    <div class="cta__bg" aria-hidden="true">
      <span class="cta__orb cta__orb--1" />
      <span class="cta__orb cta__orb--2" />
    </div>

    <div class="container container--wide cta__inner">
      <div v-reveal="'start'" class="cta__copy">
        <span class="cta__eyebrow">
          <DoctolIcon name="sparkle" :size="16" />
          جاهزون لخدمتك اليوم
        </span>
        <h2 class="cta__title">جاهز لبيت أنظف؟</h2>
        <p class="cta__text">
          احجز خدمتك الآن واترك الباقي على دكتول — فريق متخصص، مواد آمنة، وضمان 24 ساعة على كل خدمة.
        </p>

        <div class="cta__actions">
          <BaseButton size="lg" variant="gold" icon-end="arrow-left" magnetic @click="startBlank">
            احجز الآن
          </BaseButton>
          <a class="cta__phone" :href="`tel:${contactInfo.phone}`">
            <DoctolIcon name="phone" :size="19" />
            <span>
              <small>أو اتصل بنا</small>
              <strong class="num">{{ contactInfo.phone }}</strong>
            </span>
          </a>
        </div>

        <ul class="cta__perks">
          <li><DoctolIcon name="check-circle" :size="16" /> بدون رسوم زيارة</li>
          <li><DoctolIcon name="check-circle" :size="16" /> مواعيد في نفس اليوم</li>
          <li><DoctolIcon name="check-circle" :size="16" /> دفع آمن أو كاش</li>
        </ul>
      </div>

      <figure v-reveal="'end'" class="cta__visual">
        <img
          :src="ctaImage"
          alt="غرفة معيشة نظيفة بعد خدمة دكتول"
          width="270"
          height="175"
          loading="lazy"
          decoding="async"
        />
        <figcaption class="cta__badge">
          <span class="cta__badge-value">24</span>
          <span class="cta__badge-label">ساعة ضمان</span>
        </figcaption>
      </figure>
    </div>
  </section>
</template>

<style scoped>
.cta {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  padding-block: var(--dt-section-y);
  background: var(--dt-grad-deep);
  color: #fff;
}

.cta__bg {
  position: absolute;
  inset: 0;
  z-index: -1;
}

.cta__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
}

.cta__orb--1 {
  inset-block-start: -30%;
  inset-inline-end: -10%;
  width: 44vw;
  height: 44vw;
  max-width: 560px;
  max-height: 560px;
  background: radial-gradient(circle, rgb(0 159 163 / 0.55), transparent 70%);
}

.cta__orb--2 {
  inset-block-end: -35%;
  inset-inline-start: -8%;
  width: 38vw;
  height: 38vw;
  max-width: 480px;
  max-height: 480px;
  background: radial-gradient(circle, rgb(245 197 66 / 0.28), transparent 70%);
}

.cta__inner {
  display: grid;
  gap: clamp(2rem, 1rem + 4vw, 4rem);
  align-items: center;
}

.cta__copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--dt-space-4);
}

.cta__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.9rem;
  border-radius: var(--dt-radius-pill);
  background: rgb(255 255 255 / 0.14);
  border: 1px solid rgb(255 255 255 / 0.24);
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
}

.cta__eyebrow :deep(svg) {
  color: var(--dt-gold-500);
}

.cta__title {
  font-size: var(--dt-fs-h1);
  letter-spacing: -0.025em;
}

.cta__text {
  font-size: var(--dt-fs-body-lg);
  color: rgb(255 255 255 / 0.82);
  max-width: 46ch;
}

.cta__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--dt-space-4);
  margin-block-start: var(--dt-space-2);
}

.cta__phone {
  display: inline-flex;
  align-items: center;
  gap: var(--dt-space-3);
  padding: 0.6rem 1.1rem;
  border-radius: var(--dt-radius-pill);
  border: 1px solid rgb(255 255 255 / 0.24);
  transition: background-color var(--dt-dur-2) var(--dt-ease-out);
}

.cta__phone:hover {
  background: rgb(255 255 255 / 0.12);
}

.cta__phone span {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.cta__phone small {
  font-size: var(--dt-fs-xs);
  color: rgb(255 255 255 / 0.7);
}

.cta__phone strong {
  font-weight: var(--dt-fw-bold);
}

.cta__perks {
  display: flex;
  flex-wrap: wrap;
  gap: var(--dt-space-2) var(--dt-space-5);
  padding-block-start: var(--dt-space-2);
}

.cta__perks li {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--dt-fs-sm);
  color: rgb(255 255 255 / 0.8);
}

.cta__perks :deep(svg) {
  color: var(--dt-gold-500);
}

.cta__visual {
  position: relative;
}

.cta__visual img {
  width: 100%;
  border-radius: var(--dt-radius-2xl);
  box-shadow: var(--dt-shadow-xl);
  border: 1px solid rgb(255 255 255 / 0.18);
}

.cta__badge {
  position: absolute;
  inset-block-end: -18px;
  inset-inline-start: -12px;
  display: grid;
  place-items: center;
  width: 108px;
  height: 108px;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-surface);
  color: var(--dt-teal-700);
  box-shadow: var(--dt-shadow-xl);
  border: 5px solid var(--dt-teal-500);
  animation: dt-float 5.5s ease-in-out infinite;
}

.cta__badge-value {
  font-size: 2.1rem;
  font-weight: var(--dt-fw-bold);
  line-height: 1;
}

.cta__badge-label {
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-muted);
}

@media (min-width: 900px) {
  .cta__inner {
    grid-template-columns: 1fr 0.9fr;
  }
}

@media (max-width: 560px) {
  .cta__badge {
    width: 84px;
    height: 84px;
    inset-inline-start: -6px;
  }
  .cta__badge-value {
    font-size: 1.6rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cta__badge {
    animation: none;
  }
}
</style>
