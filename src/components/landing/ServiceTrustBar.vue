<script setup>
/** Quick-benefit strip sitting directly under the hero. */
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { vReveal } from '@/composables/useScrollAnimation'

defineProps({
  items: { type: Array, required: true },
})
</script>

<template>
  <section class="stb">
    <div class="container container--wide">
      <ul v-reveal="'scale'" class="stb__list">
        <li v-for="item in items" :key="item.label" class="stb__item">
          <span class="stb__icon"><DoctolIcon :name="item.icon" :size="20" /></span>
          {{ item.label }}
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.stb {
  position: relative;
  z-index: 2;
  margin-block-start: clamp(-1.5rem, -0.5rem - 2vw, -3rem);
}

.stb__list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr));
  gap: var(--dt-space-2);
  padding: var(--dt-space-4);
  border-radius: var(--dt-radius-xl);
  background: rgb(255 255 255 / 0.9);
  backdrop-filter: blur(18px) saturate(170%);
  -webkit-backdrop-filter: blur(18px) saturate(170%);
  border: 1px solid rgb(255 255 255 / 0.9);
  box-shadow: var(--dt-shadow-lg);
}

.stb__item {
  display: flex;
  align-items: center;
  gap: var(--dt-space-2);
  padding: 0.55rem 0.7rem;
  border-radius: var(--dt-radius-md);
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-medium);
  color: var(--dt-ink-soft);
  transition: background-color var(--dt-dur-2) var(--dt-ease-out);
}

.stb__item:hover {
  background: var(--sl-accent-soft);
}

.stb__icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex: none;
  border-radius: var(--dt-radius-sm);
  background: var(--sl-accent-soft);
  color: var(--sl-accent);
  transition:
    background-color var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out),
    transform var(--dt-dur-3) var(--dt-ease-spring);
}

.stb__item:hover .stb__icon {
  background: var(--sl-accent);
  color: #fff;
  transform: scale(1.06);
}

@media (prefers-reduced-motion: reduce) {
  .stb__icon {
    transition: none;
  }
  .stb__item:hover .stb__icon {
    transform: none;
  }
}
</style>
