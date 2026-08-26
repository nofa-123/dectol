<script setup>
/**
 * Wizard step rail. Doubles as navigation: completed steps are clickable so a
 * user can go back and change an answer without losing their place.
 */
import DoctolIcon from '@/components/common/DoctolIcon.vue'

const props = defineProps({
  steps: { type: Array, required: true },
  current: { type: Number, required: true },
  completed: { type: Array, default: () => [] },
})

defineEmits(['navigate'])

const isDone = (step, index) => index < props.current && props.completed.includes(step.id)
</script>

<template>
  <nav class="steps" aria-label="مراحل الحجز">
    <div class="steps__track" aria-hidden="true">
      <span
        class="steps__fill"
        :style="{ '--progress': `${(current / (steps.length - 1)) * 100}%` }"
      />
    </div>
    <ol class="steps__list">
      <li v-for="(step, index) in steps" :key="step.id" class="steps__item">
        <button
          type="button"
          class="steps__button"
          :class="{
            'steps__button--active': index === current,
            'steps__button--done': isDone(step, index),
            'steps__button--locked': index > current,
          }"
          :aria-current="index === current ? 'step' : undefined"
          :disabled="index > current"
          @click="$emit('navigate', index)"
        >
          <span class="steps__dot">
            <DoctolIcon v-if="isDone(step, index)" name="check" :size="15" :stroke="2.4" />
            <span v-else class="steps__number num">{{ index + 1 }}</span>
          </span>
          <span class="steps__label">{{ step.label }}</span>
        </button>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.steps {
  position: relative;
  padding-block: var(--dt-space-2);
}

.steps__track {
  position: absolute;
  inset-block-start: 21px;
  inset-inline: 8%;
  height: 3px;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-line);
  overflow: hidden;
}

.steps__fill {
  display: block;
  height: 100%;
  width: var(--progress);
  background: var(--dt-grad-primary);
  border-radius: inherit;
  transition: width var(--dt-dur-4) var(--dt-ease-out);
}

.steps__list {
  position: relative;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
}

.steps__button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dt-space-2);
  width: 100%;
  padding-block: 0.25rem;
  color: var(--dt-muted-soft);
  cursor: pointer;
}

.steps__button:disabled {
  cursor: default;
}

.steps__dot {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-surface);
  border: 2px solid var(--dt-line);
  color: var(--dt-muted-soft);
  font-weight: var(--dt-fw-semibold);
  font-size: var(--dt-fs-sm);
  transition:
    background-color var(--dt-dur-3) var(--dt-ease-out),
    border-color var(--dt-dur-3) var(--dt-ease-out),
    color var(--dt-dur-3) var(--dt-ease-out),
    transform var(--dt-dur-3) var(--dt-ease-spring);
}

.steps__label {
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-medium);
  white-space: nowrap;
}

.steps__button--done .steps__dot {
  background: var(--dt-teal-500);
  border-color: var(--dt-teal-500);
  color: #fff;
}

.steps__button--done {
  color: var(--dt-teal-700);
}

.steps__button--done:hover .steps__dot {
  transform: scale(1.08);
}

.steps__button--active .steps__dot {
  background: var(--dt-surface);
  border-color: var(--dt-teal-500);
  color: var(--dt-teal-600);
  transform: scale(1.1);
  box-shadow: 0 0 0 5px var(--dt-teal-50);
}

.steps__button--active {
  color: var(--dt-ink);
}

.steps__button--active .steps__label {
  font-weight: var(--dt-fw-semibold);
}

@media (max-width: 640px) {
  .steps__label {
    display: none;
  }
  .steps__track {
    inset-block-start: 19px;
  }
  .steps__dot {
    width: 36px;
    height: 36px;
  }
}
</style>
