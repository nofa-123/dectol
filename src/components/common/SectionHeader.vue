<script setup>
/** Shared section heading: eyebrow chip, title, subtitle and an optional action. */
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { vReveal } from '@/composables/useScrollAnimation'

defineProps({
  eyebrow: { type: String, default: '' },
  eyebrowIcon: { type: String, default: '' },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  align: { type: String, default: 'start', validator: (v) => ['start', 'center'].includes(v) },
  light: { type: Boolean, default: false },
})
</script>

<template>
  <header class="sh" :class="[`sh--${align}`, { 'sh--light': light }]">
    <div class="sh__text">
      <span v-if="eyebrow" v-reveal="'fade'" class="eyebrow sh__eyebrow">
        <DoctolIcon v-if="eyebrowIcon" :name="eyebrowIcon" :size="16" />
        {{ eyebrow }}
      </span>
      <h2 v-reveal="{ delay: 60 }" class="sh__title">{{ title }}</h2>
      <p v-if="subtitle" v-reveal="{ delay: 120 }" class="sh__subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.action" v-reveal="{ preset: 'start', delay: 160 }" class="sh__action">
      <slot name="action" />
    </div>
  </header>
</template>

<style scoped>
.sh {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--dt-space-6);
  margin-block-end: clamp(1.75rem, 1rem + 2vw, 3rem);
}

.sh__text {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
  max-width: 62ch;
}

.sh__title {
  font-size: var(--dt-fs-h2);
}

.sh__subtitle {
  color: var(--dt-muted);
  font-size: var(--dt-fs-body-lg);
  line-height: var(--dt-lh-snug);
}

.sh__eyebrow {
  align-self: flex-start;
}

.sh--center {
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.sh--center .sh__text {
  align-items: center;
}

.sh--light .sh__title {
  color: #fff;
}

.sh--light .sh__subtitle {
  color: rgb(255 255 255 / 0.78);
}

.sh--light .sh__eyebrow {
  background: rgb(255 255 255 / 0.14);
  border-color: rgb(255 255 255 / 0.25);
  color: #fff;
}

.sh__action {
  flex: none;
  padding-block-end: 0.35rem;
}

@media (max-width: 767px) {
  .sh {
    flex-direction: column;
    align-items: stretch;
  }
  .sh--center {
    align-items: center;
  }
  .sh__action {
    padding-block-end: 0;
  }
}
</style>
