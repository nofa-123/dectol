<script setup>
/** Closing conversion band, tinted by the page accent. */
import BaseButton from '@/components/common/BaseButton.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { contactInfo } from '@/data/content'
import { vReveal } from '@/composables/useScrollAnimation'

defineProps({
  landing: { type: Object, required: true },
})

defineEmits(['book'])
</script>

<template>
  <section class="sbc">
    <div class="sbc__bg sl-pattern" aria-hidden="true">
      <span class="sbc__orb" />
    </div>

    <div class="container container--wide sbc__inner">
      <div v-reveal="'start'" class="sbc__copy">
        <span class="sbc__eyebrow">
          <DoctolIcon name="sparkle" :size="16" />
          {{ landing.name }}
        </span>
        <h2 class="sbc__title">جاهز لتجربة خدمة دكتول؟</h2>
        <p class="sbc__text">احجز خدمتك الآن ودع فريقنا يهتم بالتفاصيل.</p>

        <div class="sbc__actions">
          <BaseButton size="lg" variant="gold" icon-end="arrow-left" magnetic @click="$emit('book')">
            احجز الآن
          </BaseButton>
          <BaseButton size="lg" variant="outline" icon="headset" :to="{ name: 'contact' }">
            تواصل معنا
          </BaseButton>
        </div>

        <a class="sbc__phone" :href="`tel:${contactInfo.phone}`">
          <DoctolIcon name="phone" :size="18" />
          <span>
            <small>أو اطلب عرض سعر على</small>
            <strong class="num">{{ contactInfo.phone }}</strong>
          </span>
        </a>
      </div>

      <figure v-reveal="'end'" class="sbc__visual">
        <img
          :src="landing.heroImage"
          :alt="landing.heroAlt"
          width="1200"
          height="750"
          loading="lazy"
          decoding="async"
        />
      </figure>
    </div>
  </section>
</template>

<style scoped>
.sbc {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding-block: var(--dt-section-y);
  background: var(--sl-band);
  color: #fff;
}

.sbc__bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  opacity: 0.45;
  --sl-pattern-color: rgb(255 255 255 / 0.06);
}

.sbc__orb {
  position: absolute;
  inset-block-start: -30%;
  inset-inline-end: -12%;
  width: 46vw;
  height: 46vw;
  max-width: 560px;
  max-height: 560px;
  border-radius: 50%;
  filter: blur(80px);
  background: radial-gradient(circle, rgb(255 255 255 / 0.22), transparent 70%);
}

.sbc__inner {
  display: grid;
  gap: clamp(2rem, 1rem + 4vw, 3.5rem);
  align-items: center;
}

.sbc__copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--dt-space-4);
}

.sbc__eyebrow {
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

.sbc__eyebrow :deep(svg) {
  color: var(--dt-gold-500);
}

.sbc__title {
  font-size: var(--dt-fs-h1);
  letter-spacing: -0.025em;
}

.sbc__text {
  font-size: var(--dt-fs-body-lg);
  color: rgb(255 255 255 / 0.82);
  max-width: 44ch;
}

.sbc__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--dt-space-3);
}

.sbc__phone {
  display: inline-flex;
  align-items: center;
  gap: var(--dt-space-3);
  padding: 0.6rem 1.1rem;
  border-radius: var(--dt-radius-pill);
  border: 1px solid rgb(255 255 255 / 0.24);
  transition: background-color var(--dt-dur-2) var(--dt-ease-out);
}

.sbc__phone:hover {
  background: rgb(255 255 255 / 0.12);
}

.sbc__phone span {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.sbc__phone small {
  font-size: var(--dt-fs-xs);
  color: rgb(255 255 255 / 0.7);
}

.sbc__phone strong {
  font-weight: var(--dt-fw-bold);
}

.sbc__visual img {
  width: 100%;
  border-radius: var(--dt-radius-2xl);
  box-shadow: var(--dt-shadow-xl);
  border: 1px solid rgb(255 255 255 / 0.18);
}

@media (min-width: 900px) {
  .sbc__inner {
    grid-template-columns: 1fr 0.85fr;
  }
}

@media (max-width: 767px) {
  .sbc__visual {
    display: none;
  }
  .sbc__actions {
    width: 100%;
  }
  .sbc__actions > * {
    flex: 1 1 100%;
  }
}
</style>
