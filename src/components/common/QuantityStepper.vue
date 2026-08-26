<script setup>
/**
 * − N + control. Used by every configurator, so it owns the clamping rules and
 * the accessible semantics (spinbutton + live value) in one place.
 */
import { computed } from 'vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'

const props = defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 99 },
  step: { type: Number, default: 1 },
  label: { type: String, default: 'العدد' },
  /** Small caption under the value, e.g. "ستائر". */
  unit: { type: String, default: '' },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md'].includes(v) },
})

const emit = defineEmits(['update:modelValue'])

const canDecrease = computed(() => props.modelValue > props.min)
const canIncrease = computed(() => props.modelValue < props.max)

function bump(delta) {
  const next = Math.min(props.max, Math.max(props.min, props.modelValue + delta * props.step))
  if (next !== props.modelValue) emit('update:modelValue', next)
}

function onKeydown(event) {
  if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
    event.preventDefault()
    bump(1)
  } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
    event.preventDefault()
    bump(-1)
  }
}
</script>

<template>
  <div class="qty" :class="`qty--${size}`">
    <button
      type="button"
      class="qty__btn"
      :disabled="!canDecrease"
      :aria-label="`إنقاص ${label}`"
      @click="bump(-1)"
    >
      <DoctolIcon name="minus" :size="size === 'sm' ? 15 : 17" :stroke="2.4" />
    </button>

    <span
      class="qty__value"
      role="spinbutton"
      tabindex="0"
      :aria-label="label"
      :aria-valuenow="modelValue"
      :aria-valuemin="min"
      :aria-valuemax="max"
      @keydown="onKeydown"
    >
      <span class="qty__number num">{{ modelValue }}</span>
      <span v-if="unit" class="qty__unit">{{ unit }}</span>
    </span>

    <button
      type="button"
      class="qty__btn"
      :disabled="!canIncrease"
      :aria-label="`زيادة ${label}`"
      @click="bump(1)"
    >
      <DoctolIcon name="plus" :size="size === 'sm' ? 15 : 17" :stroke="2.4" />
    </button>
  </div>
</template>

<style scoped>
.qty {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: var(--dt-radius-md);
  background: var(--dt-surface);
  border: 1.5px solid var(--dt-line);
}

.qty__btn {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex: none;
  border-radius: var(--dt-radius-sm);
  background: var(--dt-teal-50);
  color: var(--dt-teal-600);
  transition:
    background-color var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out),
    transform var(--dt-dur-1) var(--dt-ease-out);
}

.qty__btn:hover:not(:disabled) {
  background: var(--dt-teal-500);
  color: #fff;
}

.qty__btn:active:not(:disabled) {
  transform: scale(0.92);
}

.qty__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: var(--dt-surface-sunken);
  color: var(--dt-muted-soft);
}

.qty__value {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  padding-inline: 0.25rem;
  line-height: 1.1;
  border-radius: var(--dt-radius-xs);
}

.qty__number {
  font-weight: var(--dt-fw-bold);
  font-size: 1.05rem;
}

.qty__unit {
  font-size: 0.66rem;
  color: var(--dt-muted);
}

.qty--sm .qty__btn {
  width: 34px;
  height: 34px;
}

.qty--sm .qty__value {
  min-width: 36px;
}

.qty--sm .qty__number {
  font-size: 0.95rem;
}

@media (prefers-reduced-motion: reduce) {
  .qty__btn {
    transition: none;
  }
  .qty__btn:active:not(:disabled) {
    transform: none;
  }
}
</style>
