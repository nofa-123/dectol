<script setup>
/** Interior-page banner. Sits under the fixed header and sets the page's tone. */
import DoctolIcon from '@/components/common/DoctolIcon.vue'

defineProps({
  eyebrow: { type: String, default: '' },
  eyebrowIcon: { type: String, default: '' },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <section class="ph">
    <div class="ph__bg" aria-hidden="true">
      <span class="ph__orb" />
      <span class="ph__grid" />
    </div>

    <div class="container container--wide ph__inner">
      <span v-if="eyebrow" class="eyebrow">
        <DoctolIcon v-if="eyebrowIcon" :name="eyebrowIcon" :size="16" />
        {{ eyebrow }}
      </span>
      <h1 class="ph__title">{{ title }}</h1>
      <p v-if="subtitle" class="ph__subtitle">{{ subtitle }}</p>
      <div v-if="$slots.default" class="ph__extra">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
.ph {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding-block: calc(var(--dt-header-h) + var(--dt-space-8)) var(--dt-space-10);
  background: var(--dt-grad-mint);
  border-block-end: 1px solid var(--dt-teal-100);
}

.ph__bg {
  position: absolute;
  inset: 0;
  z-index: -1;
}

.ph__orb {
  position: absolute;
  inset-block-start: -60%;
  inset-inline-start: -5%;
  width: 46vw;
  height: 46vw;
  max-width: 620px;
  max-height: 620px;
  border-radius: 50%;
  filter: blur(70px);
  background: radial-gradient(circle, rgb(0 159 163 / 0.2), transparent 68%);
}

.ph__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgb(7 59 76 / 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgb(7 59 76 / 0.03) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse 70% 80% at 50% 30%, #000 20%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse 70% 80% at 50% 30%, #000 20%, transparent 80%);
}

.ph__inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--dt-space-3);
}

.ph__title {
  font-size: var(--dt-fs-h1);
  letter-spacing: -0.025em;
}

.ph__subtitle {
  font-size: var(--dt-fs-body-lg);
  color: var(--dt-ink-soft);
  max-width: 60ch;
}

.ph__extra {
  margin-block-start: var(--dt-space-3);
}
</style>
