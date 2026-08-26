<script setup>
/**
 * Four-step journey with a connector line that draws itself as the section
 * scrolls through the viewport — the line literally shows progress.
 */
import { computed } from 'vue'
import SectionHeader from '@/components/common/SectionHeader.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useBooking } from '@/composables/useBooking'
import { useInView, vReveal } from '@/composables/useScrollAnimation'
import { useServicesStore } from '@/stores/servicesStore'

const catalogue = useServicesStore()
const { startBlank } = useBooking()
const { target, isInView } = useInView({ threshold: 0.2 })

const lineStyle = computed(() => ({ '--line': isInView.value ? '100%' : '0%' }))
</script>

<template>
  <section id="how" ref="target" class="section tl" :style="lineStyle">
    <div class="container container--wide">
      <SectionHeader
        align="center"
        eyebrow="تجربة دكتول"
        eyebrow-icon="sparkle"
        title="من الحجز إلى النظافة… كل شيء أسهل مع دكتول"
        subtitle="أربع خطوات فقط، وتتابع كل مرحلة أول بأول."
      />

      <ol class="tl__list">
        <span class="tl__line" aria-hidden="true"><span class="tl__line-fill" /></span>

        <li
          v-for="(step, index) in catalogue.experienceSteps"
          :key="step.id"
          v-reveal="{ delay: index * 130 }"
          class="tl__step"
        >
          <span class="tl__marker">
            <span class="tl__icon"><DoctolIcon :name="step.icon" :size="22" /></span>
            <span class="tl__number num">{{ step.number }}</span>
          </span>
          <h3 class="tl__title">{{ step.title }}</h3>
          <p class="tl__text">{{ step.text }}</p>
        </li>
      </ol>

      <div class="tl__cta">
        <BaseButton size="lg" icon-end="arrow-left" magnetic @click="startBlank">
          ابدأ حجزك الآن
        </BaseButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tl {
  background: var(--dt-surface);
}

.tl__list {
  position: relative;
  display: grid;
  gap: var(--dt-space-6);
  grid-template-columns: 1fr;
}

/* Connector: vertical on mobile, horizontal from the tablet breakpoint up. */
.tl__line {
  position: absolute;
  inset-block: 28px auto;
  inset-inline-start: 27px;
  width: 2px;
  height: calc(100% - 56px);
  background: var(--dt-line);
  border-radius: var(--dt-radius-pill);
  overflow: hidden;
}

.tl__line-fill {
  display: block;
  width: 100%;
  height: var(--line, 0%);
  background: var(--dt-grad-primary);
  transition: height 1.4s var(--dt-ease-out);
}

.tl__step {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-areas:
    'marker title'
    'marker text';
  column-gap: var(--dt-space-4);
  row-gap: 0.25rem;
}

.tl__marker {
  grid-area: marker;
  position: relative;
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: var(--dt-radius-lg);
  background: var(--dt-surface);
  border: 2px solid var(--dt-teal-200);
  color: var(--dt-teal-600);
  box-shadow: var(--dt-shadow-sm);
  transition:
    background-color var(--dt-dur-3) var(--dt-ease-out),
    color var(--dt-dur-3) var(--dt-ease-out),
    transform var(--dt-dur-3) var(--dt-ease-spring);
}

.tl__step:hover .tl__marker {
  background: var(--dt-grad-primary);
  color: #fff;
  transform: scale(1.06);
}

.tl__number {
  position: absolute;
  inset-block-start: -10px;
  inset-inline-end: -10px;
  padding: 0.1rem 0.4rem;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-navy-700);
  color: #fff;
  font-size: 0.62rem;
  font-weight: var(--dt-fw-bold);
}

.tl__title {
  grid-area: title;
  font-size: var(--dt-fs-h4);
  font-weight: var(--dt-fw-bold);
  align-self: center;
}

.tl__text {
  grid-area: text;
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
  line-height: var(--dt-lh-snug);
}

.tl__cta {
  display: flex;
  justify-content: center;
  margin-block-start: var(--dt-space-10);
}

@media (min-width: 768px) {
  .tl__list {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--dt-space-5);
  }

  .tl__line {
    inset-block-start: 28px;
    inset-inline: 12% 12%;
    width: auto;
    height: 2px;
  }

  .tl__line-fill {
    width: var(--line, 0%);
    height: 100%;
    transition: width 1.6s var(--dt-ease-out);
  }

  .tl__step {
    grid-template-columns: 1fr;
    grid-template-areas:
      'marker'
      'title'
      'text';
    justify-items: center;
    text-align: center;
    row-gap: var(--dt-space-3);
  }

  .tl__title {
    margin-block-start: var(--dt-space-2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tl__line-fill {
    transition: none;
    width: 100%;
    height: 100%;
  }
  .tl__marker {
    transition: none;
  }
  .tl__step:hover .tl__marker {
    transform: none;
  }
}
</style>
