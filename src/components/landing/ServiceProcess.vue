<script setup>
/** "كيف تعمل الخدمة؟" — numbered steps on a connector that fills on scroll. */
import { computed } from 'vue'
import SectionHeader from '@/components/common/SectionHeader.vue'
import { useInView, vReveal } from '@/composables/useScrollAnimation'

defineProps({
  steps: { type: Array, required: true },
})

const { target, isInView } = useInView({ threshold: 0.15 })
const lineStyle = computed(() => ({ '--line': isInView.value ? '100%' : '0%' }))
</script>

<template>
  <section ref="target" class="sp section section--mint" :style="lineStyle">
    <div class="container container--wide">
      <SectionHeader
        align="center"
        eyebrow="خطوات بسيطة"
        eyebrow-icon="list"
        title="كيف تعمل الخدمة؟"
        subtitle="من الطلب حتى التسليم — تعرف بالضبط ما الذي سيحدث."
      />

      <ol class="sp__list">
        <span class="sp__line" aria-hidden="true"><span class="sp__line-fill" /></span>

        <li
          v-for="(step, index) in steps"
          :key="step.title"
          v-reveal="{ delay: index * 110 }"
          class="sp__step"
        >
          <span class="sp__num num">{{ String(index + 1).padStart(2, '0') }}</span>
          <div class="sp__body">
            <h3>{{ step.title }}</h3>
            <p>{{ step.text }}</p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.sp__list {
  position: relative;
  display: grid;
  gap: var(--dt-space-5);
  grid-template-columns: 1fr;
}

/* Vertical on mobile, horizontal from tablet up. */
.sp__line {
  position: absolute;
  inset-block: 30px auto;
  inset-inline-start: 29px;
  width: 2px;
  height: calc(100% - 60px);
  background: var(--sl-accent-line);
  border-radius: var(--dt-radius-pill);
  overflow: hidden;
}

.sp__line-fill {
  display: block;
  width: 100%;
  height: var(--line, 0%);
  background: var(--sl-accent);
  transition: height 1.4s var(--dt-ease-out);
}

.sp__step {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: start;
  gap: var(--dt-space-4);
}

.sp__num {
  display: grid;
  place-items: center;
  width: 60px;
  height: 60px;
  flex: none;
  border-radius: var(--dt-radius-lg);
  background: var(--dt-surface);
  border: 2px solid var(--sl-accent-line);
  color: var(--sl-accent-deep);
  font-size: 1.15rem;
  font-weight: var(--dt-fw-bold);
  box-shadow: var(--dt-shadow-sm);
  z-index: 1;
  transition:
    background-color var(--dt-dur-3) var(--dt-ease-out),
    color var(--dt-dur-3) var(--dt-ease-out),
    transform var(--dt-dur-3) var(--dt-ease-spring);
}

.sp__step:hover .sp__num {
  background: var(--sl-accent);
  border-color: var(--sl-accent);
  color: #fff;
  transform: scale(1.06);
}

.sp__body h3 {
  font-size: var(--dt-fs-h4);
  margin-block-end: 0.25rem;
  padding-block-start: 0.5rem;
}

.sp__body p {
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
  line-height: var(--dt-lh-snug);
}

@media (min-width: 768px) {
  .sp__list {
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
  }
  .sp__line {
    inset-block-start: 30px;
    inset-inline: 10% 10%;
    width: auto;
    height: 2px;
  }
  .sp__line-fill {
    width: var(--line, 0%);
    height: 100%;
    transition: width 1.6s var(--dt-ease-out);
  }
  .sp__step {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
    gap: var(--dt-space-3);
  }
  .sp__body h3 {
    padding-block-start: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sp__line-fill {
    transition: none;
    width: 100%;
    height: 100%;
  }
  .sp__num {
    transition: none;
  }
  .sp__step:hover .sp__num {
    transform: none;
  }
}
</style>
