<script setup>
/**
 * Prev/next buttons + dot indicators for the carousels.
 * In RTL "next" advances leftwards, so the chevrons are mirrored accordingly:
 * `chevron-left` sits on the *next* button.
 */
import DoctolIcon from '@/components/common/DoctolIcon.vue'

defineProps({
  canPrev: { type: Boolean, default: true },
  canNext: { type: Boolean, default: true },
  count: { type: Number, default: 0 },
  activeIndex: { type: Number, default: 0 },
  showDots: { type: Boolean, default: true },
  light: { type: Boolean, default: false },
})

defineEmits(['prev', 'next', 'go'])
</script>

<template>
  <div class="cc" :class="{ 'cc--light': light }">
    <div v-if="showDots && count > 1" class="cc__dots" role="tablist" aria-label="شرائح">
      <button
        v-for="i in count"
        :key="i"
        type="button"
        class="cc__dot"
        :class="{ 'cc__dot--active': i - 1 === activeIndex }"
        role="tab"
        :aria-selected="i - 1 === activeIndex"
        :aria-label="`الشريحة ${i}`"
        @click="$emit('go', i - 1)"
      />
    </div>

    <div class="cc__buttons">
      <button
        type="button"
        class="cc__btn"
        :disabled="!canPrev"
        aria-label="السابق"
        @click="$emit('prev')"
      >
        <DoctolIcon name="chevron-right" :size="20" :stroke="2" />
      </button>
      <button
        type="button"
        class="cc__btn"
        :disabled="!canNext"
        aria-label="التالي"
        @click="$emit('next')"
      >
        <DoctolIcon name="chevron-left" :size="20" :stroke="2" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.cc {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dt-space-4);
}

.cc__dots {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.cc__dot {
  width: 8px;
  height: 8px;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-line-strong);
  transition:
    width var(--dt-dur-3) var(--dt-ease-out),
    background-color var(--dt-dur-3) var(--dt-ease-out);
}

.cc__dot--active {
  width: 26px;
  background: var(--dt-teal-500);
}

.cc__buttons {
  display: flex;
  gap: var(--dt-space-2);
}

.cc__btn {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-surface);
  border: 1px solid var(--dt-line);
  color: var(--dt-navy-700);
  box-shadow: var(--dt-shadow-sm);
  transition:
    background-color var(--dt-dur-2) var(--dt-ease-out),
    border-color var(--dt-dur-2) var(--dt-ease-out),
    transform var(--dt-dur-2) var(--dt-ease-spring),
    opacity var(--dt-dur-2) var(--dt-ease-out);
}

.cc__btn:hover:not(:disabled) {
  background: var(--dt-teal-50);
  border-color: var(--dt-teal-300);
  transform: scale(1.06);
}

.cc__btn:active:not(:disabled) {
  transform: scale(0.95);
}

.cc__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cc--light .cc__btn {
  background: rgb(255 255 255 / 0.14);
  border-color: rgb(255 255 255 / 0.28);
  color: #fff;
  box-shadow: none;
}

.cc--light .cc__btn:hover:not(:disabled) {
  background: rgb(255 255 255 / 0.24);
}

.cc--light .cc__dot {
  background: rgb(255 255 255 / 0.35);
}

.cc--light .cc__dot--active {
  background: #fff;
}
</style>
