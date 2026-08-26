<script setup>
/** "لماذا يختارنا عملاؤنا؟" — reasons grid on the accent band. */
import SectionHeader from '@/components/common/SectionHeader.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { vReveal } from '@/composables/useScrollAnimation'

defineProps({
  items: { type: Array, required: true },
})
</script>

<template>
  <section class="sw section">
    <div class="sw__bg sl-pattern" aria-hidden="true" />
    <div class="container container--wide">
      <SectionHeader
        align="center"
        light
        eyebrow="لماذا دكتول"
        eyebrow-icon="shield"
        title="لماذا يختارنا عملاؤنا؟"
        subtitle="ليست وعوداً — هذه المعايير التي نُقاس عليها في كل زيارة."
      />

      <ul class="sw__grid">
        <li
          v-for="(item, index) in items"
          :key="item.title"
          v-reveal="{ delay: Math.min(index, 5) * 80 }"
          class="sw__card"
        >
          <span class="sw__icon"><DoctolIcon :name="item.icon" :size="24" /></span>
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.sw {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: var(--sl-band);
}

.sw__bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  opacity: 0.4;
  --sl-pattern-color: rgb(255 255 255 / 0.06);
}

.sw__grid {
  display: grid;
  gap: var(--dt-space-4);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
}

.sw__card {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-2);
  padding: var(--dt-space-6) var(--dt-space-5);
  border-radius: var(--dt-radius-xl);
  background: rgb(255 255 255 / 0.08);
  border: 1px solid rgb(255 255 255 / 0.16);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #fff;
  transition:
    background-color var(--dt-dur-3) var(--dt-ease-out),
    transform var(--dt-dur-3) var(--dt-ease-out),
    border-color var(--dt-dur-3) var(--dt-ease-out);
}

.sw__card:hover {
  background: rgb(255 255 255 / 0.14);
  border-color: rgb(255 255 255 / 0.3);
  transform: translateY(-5px);
}

.sw__icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: var(--dt-radius-lg);
  background: rgb(255 255 255 / 0.14);
  color: #fff;
  margin-block-end: var(--dt-space-2);
  transition: background-color var(--dt-dur-3) var(--dt-ease-out);
}

.sw__card:hover .sw__icon {
  background: #fff;
  color: var(--sl-accent-deep);
}

.sw__card h3 {
  font-size: var(--dt-fs-h4);
}

.sw__card p {
  font-size: var(--dt-fs-sm);
  color: rgb(255 255 255 / 0.78);
  line-height: var(--dt-lh-snug);
}

@media (prefers-reduced-motion: reduce) {
  .sw__card,
  .sw__icon {
    transition: none;
  }
  .sw__card:hover {
    transform: none;
  }
}
</style>
