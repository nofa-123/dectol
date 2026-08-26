<script setup>
/**
 * Text / textarea / select field with label, hint, error and success states.
 * Wires `aria-invalid` + `aria-describedby` so screen readers announce the
 * validation message alongside the field.
 */
import { computed, useId } from 'vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  as: { type: String, default: 'input', validator: (v) => ['input', 'textarea', 'select'].includes(v) },
  placeholder: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  icon: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  autocomplete: { type: String, default: 'off' },
  inputmode: { type: String, default: undefined },
  maxlength: { type: [String, Number], default: undefined },
  rows: { type: Number, default: 3 },
  /** `[{ value, label }]` for the select variant. */
  options: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'blur'])

const uid = useId()
const describedBy = computed(() => {
  const ids = []
  if (props.error) ids.push(`${uid}-error`)
  else if (props.hint) ids.push(`${uid}-hint`)
  return ids.join(' ') || undefined
})

const isFilled = computed(() => String(props.modelValue ?? '').length > 0)

function onInput(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <div class="field" :class="{ 'field--error': error, 'field--disabled': disabled }">
    <label class="field__label" :for="uid">
      {{ label }}
      <span v-if="required" class="field__required" aria-hidden="true">*</span>
    </label>

    <div class="field__control">
      <DoctolIcon v-if="icon" :name="icon" :size="19" class="field__icon" />

      <select
        v-if="as === 'select'"
        :id="uid"
        class="field__input field__input--select"
        :class="{ 'field__input--with-icon': icon, 'field__input--placeholder': !isFilled }"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        @change="onInput"
        @blur="$emit('blur')"
      >
        <option value="" disabled>{{ placeholder || 'اختر…' }}</option>
        <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>

      <textarea
        v-else-if="as === 'textarea'"
        :id="uid"
        class="field__input field__input--area"
        :class="{ 'field__input--with-icon': icon }"
        :value="modelValue"
        :rows="rows"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :maxlength="maxlength"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        @input="onInput"
        @blur="$emit('blur')"
      />

      <input
        v-else
        :id="uid"
        class="field__input"
        :class="{ 'field__input--with-icon': icon }"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :maxlength="maxlength"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        @input="onInput"
        @blur="$emit('blur')"
      />

      <DoctolIcon
        v-if="as === 'select'"
        name="chevron-down"
        :size="18"
        class="field__chevron"
      />
    </div>

    <Transition name="field-msg">
      <p v-if="error" :id="`${uid}-error`" class="field__message field__message--error" role="alert">
        <DoctolIcon name="alert" :size="15" />
        {{ error }}
      </p>
      <p v-else-if="hint" :id="`${uid}-hint`" class="field__message">{{ hint }}</p>
    </Transition>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-2);
  min-width: 0;
}

.field__label {
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-ink-soft);
}

.field__required {
  color: var(--dt-danger);
}

.field__control {
  position: relative;
  display: flex;
  align-items: center;
}

.field__icon {
  position: absolute;
  inset-inline-start: var(--dt-space-4);
  color: var(--dt-muted-soft);
  pointer-events: none;
  transition: color var(--dt-dur-2) var(--dt-ease-out);
}

.field__chevron {
  position: absolute;
  inset-inline-end: var(--dt-space-4);
  color: var(--dt-muted);
  pointer-events: none;
}

.field__input {
  width: 100%;
  min-height: 52px;
  padding: 0.85rem var(--dt-space-4);
  border: 1.5px solid var(--dt-line);
  border-radius: var(--dt-radius-md);
  background: var(--dt-surface);
  color: var(--dt-ink);
  font-size: var(--dt-fs-body);
  transition:
    border-color var(--dt-dur-2) var(--dt-ease-out),
    box-shadow var(--dt-dur-2) var(--dt-ease-out),
    background-color var(--dt-dur-2) var(--dt-ease-out);
}

.field__input--with-icon {
  padding-inline-start: 3rem;
}

/**
 * Phone / reference fields hold bare digits, which the bidi algorithm already
 * renders in the right order inside an RTL form — no direction override is
 * needed. `tabular-nums` just stops the value jittering as digits change.
 */
.field__input[inputmode='numeric'] {
  font-variant-numeric: tabular-nums;
}

.field__input--select {
  appearance: none;
  padding-inline-end: 2.75rem;
  cursor: pointer;
}

.field__input--placeholder {
  color: var(--dt-muted-soft);
}

.field__input--area {
  min-height: auto;
  resize: vertical;
  line-height: var(--dt-lh-snug);
}

.field__input::placeholder {
  color: var(--dt-muted-soft);
}

.field__input:hover:not(:disabled) {
  border-color: var(--dt-line-strong);
}

.field__input:focus {
  outline: none;
  border-color: var(--dt-teal-400);
  box-shadow: 0 0 0 4px var(--dt-focus-ring);
  background: var(--dt-white);
}

.field__control:focus-within .field__icon {
  color: var(--dt-teal-500);
}

.field--error .field__input {
  border-color: var(--dt-danger);
  background: var(--dt-danger-soft);
}

.field--error .field__input:focus {
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--dt-danger) 22%, transparent);
}

.field--disabled .field__input {
  background: var(--dt-surface-sunken);
  color: var(--dt-muted);
  cursor: not-allowed;
}

.field__message {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
  line-height: var(--dt-lh-snug);
}

.field__message--error {
  color: var(--dt-danger);
  font-weight: var(--dt-fw-medium);
}

.field-msg-enter-active,
.field-msg-leave-active {
  transition:
    opacity var(--dt-dur-2) var(--dt-ease-out),
    transform var(--dt-dur-2) var(--dt-ease-out);
}

.field-msg-enter-from,
.field-msg-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
