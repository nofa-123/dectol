<script setup>
/**
 * Selectable chip used for tiers, area bands, property condition and yes/no
 * questions. Renders as a real radio when given a `name`, so a group of chips
 * behaves like a radio group for keyboard and screen-reader users.
 */
import DoctolIcon from '@/components/common/DoctolIcon.vue'

defineProps({
  selected: { type: Boolean, default: false },
  label: { type: String, required: true },
  sublabel: { type: String, default: '' },
  price: { type: String, default: '' },
  icon: { type: String, default: '' },
  name: { type: String, default: '' },
  value: { type: [String, Number], default: '' },
  /** 'outline' for area bands, 'solid' for the yes/no answer. */
  tone: { type: String, default: 'outline', validator: (v) => ['outline', 'solid'].includes(v) },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['select'])
</script>

<template>
  <component
    :is="name ? 'label' : 'button'"
    class="chip"
    :class="[`chip--${tone}`, { 'chip--on': selected, 'chip--disabled': disabled }]"
    :type="name ? undefined : 'button'"
    :disabled="name ? undefined : disabled"
    @click="!name && !disabled && emit('select', value)"
  >
    <input
      v-if="name"
      type="radio"
      class="visually-hidden"
      :name="name"
      :value="value"
      :checked="selected"
      :disabled="disabled"
      @change="emit('select', value)"
    />

    <DoctolIcon v-if="icon" :name="icon" :size="19" class="chip__icon" />

    <span class="chip__text">
      <span class="chip__label">{{ label }}</span>
      <span v-if="sublabel" class="chip__sublabel">{{ sublabel }}</span>
      <span v-if="price" class="chip__price money">{{ price }}</span>
    </span>

    <span v-if="selected" class="chip__check" aria-hidden="true">
      <DoctolIcon name="check" :size="13" :stroke="3" />
    </span>
  </component>
</template>

<style scoped>
.chip {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--dt-space-2);
  min-height: 52px;
  padding: 0.6rem 1rem;
  border-radius: var(--dt-radius-md);
  border: 1.5px solid var(--dt-line);
  background: var(--dt-surface);
  color: var(--dt-ink-soft);
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-medium);
  text-align: center;
  cursor: pointer;
  transition:
    border-color var(--dt-dur-2) var(--dt-ease-out),
    background-color var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out),
    box-shadow var(--dt-dur-2) var(--dt-ease-out);
}

.chip:hover:not(.chip--disabled) {
  border-color: var(--dt-teal-300);
}

.chip:focus-within {
  outline: 3px solid var(--dt-focus-ring);
  outline-offset: 2px;
}

.chip__text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  line-height: 1.25;
}

.chip__label {
  font-weight: var(--dt-fw-semibold);
}

.chip__sublabel,
.chip__price {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
  font-weight: var(--dt-fw-regular);
}

.chip__icon {
  flex: none;
  color: var(--dt-teal-600);
}

.chip__check {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  flex: none;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-teal-500);
  color: #fff;
}

/* ---------- selected ---------- */
.chip--outline.chip--on {
  border-color: var(--dt-teal-500);
  background: var(--dt-teal-50);
  color: var(--dt-teal-800);
}

.chip--outline.chip--on .chip__sublabel,
.chip--outline.chip--on .chip__price {
  color: var(--dt-teal-700);
}

.chip--solid.chip--on {
  border-color: var(--dt-teal-700);
  background: var(--dt-teal-700);
  color: #fff;
}

.chip--solid.chip--on .chip__icon,
.chip--solid.chip--on .chip__sublabel,
.chip--solid.chip--on .chip__price {
  color: rgb(255 255 255 / 0.85);
}

.chip--solid.chip--on .chip__check {
  background: rgb(255 255 255 / 0.22);
}

.chip--disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
