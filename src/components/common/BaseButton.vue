<script setup>
/**
 * The one button in the system.
 * Covers every interactive state the design language requires: default, hover,
 * focus-visible, pressed, loading, disabled and success. Renders as <button>,
 * <a> or <RouterLink> depending on the props, so a CTA never loses its
 * semantics just to keep its looks.
 */
import { computed, ref } from 'vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { useMagnetic, useRipple } from '@/composables/useInteractions'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'ghost', 'outline', 'gold', 'danger'].includes(v),
  },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
  to: { type: [String, Object], default: null },
  href: { type: String, default: null },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  success: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  icon: { type: String, default: '' },
  iconEnd: { type: String, default: '' },
  /** Adds the cursor-following lean used on hero and final CTAs. */
  magnetic: { type: Boolean, default: false },
  loadingText: { type: String, default: 'جاري المعالجة…' },
})

const emit = defineEmits(['click'])

const ripple = useRipple()
const magneticEl = useMagnetic()
const pressed = ref(false)

/** Template refs hand back a component instance for RouterLink, a node otherwise. */
function bindMagnetic(el) {
  magneticEl.value = el?.$el ?? el ?? null
}

const tag = computed(() => {
  if (props.to) return 'RouterLink'
  if (props.href) return 'a'
  return 'button'
})

const isInert = computed(() => props.disabled || props.loading)

const bindings = computed(() => {
  if (tag.value === 'RouterLink') return { to: props.to }
  if (tag.value === 'a') return { href: props.href, rel: 'noopener' }
  return { type: props.type, disabled: isInert.value }
})

function onPointerDown(event) {
  if (isInert.value) return
  pressed.value = true
  ripple(event)
}

function onClick(event) {
  if (isInert.value) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  emit('click', event)
}
</script>

<template>
  <component
    :is="tag"
    :ref="magnetic ? bindMagnetic : undefined"
    v-bind="bindings"
    class="btn"
    :class="[
      `btn--${variant}`,
      `btn--${size}`,
      {
        'btn--block': block,
        'btn--loading': loading,
        'btn--success': success,
        'btn--pressed': pressed,
        'btn--disabled': isInert,
      },
    ]"
    :aria-busy="loading || undefined"
    :aria-disabled="isInert || undefined"
    @pointerdown="onPointerDown"
    @pointerup="pressed = false"
    @pointerleave="pressed = false"
    @click="onClick"
  >
    <span class="btn__content">
      <DoctolIcon v-if="loading" name="spinner" :size="size === 'sm' ? 16 : 19" class="btn__icon" />
      <DoctolIcon
        v-else-if="success"
        name="check"
        :size="size === 'sm' ? 16 : 19"
        class="btn__icon btn__icon--pop"
      />
      <DoctolIcon
        v-else-if="icon"
        :name="icon"
        :size="size === 'sm' ? 16 : 19"
        class="btn__icon"
      />
      <span class="btn__label">
        <slot v-if="!loading" />
        <template v-else>{{ loadingText }}</template>
      </span>
      <DoctolIcon
        v-if="iconEnd && !loading"
        :name="iconEnd"
        :size="size === 'sm' ? 16 : 19"
        class="btn__icon btn__icon--end"
      />
    </span>
  </component>
</template>

<style scoped>
.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--dt-space-2);
  border-radius: var(--dt-radius-pill);
  font-weight: var(--dt-fw-semibold);
  font-family: inherit;
  line-height: 1;
  text-align: center;
  cursor: pointer;
  overflow: hidden;
  isolation: isolate;
  border: 1px solid transparent;
  transition:
    background-color var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out),
    border-color var(--dt-dur-2) var(--dt-ease-out),
    box-shadow var(--dt-dur-2) var(--dt-ease-out),
    transform var(--dt-dur-2) var(--dt-ease-spring);
  /* Minimum 44px touch target on every size. */
  min-height: 44px;
}

.btn__content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--dt-space-2);
}

.btn__label {
  white-space: nowrap;
}

/* ---------- sizes ---------- */
.btn--sm {
  padding: 0.55rem 1rem;
  font-size: var(--dt-fs-sm);
}
.btn--md {
  padding: 0.8rem 1.5rem;
  font-size: var(--dt-fs-body);
}
.btn--lg {
  padding: 1.05rem 2rem;
  font-size: var(--dt-fs-body-lg);
  min-height: 56px;
}

.btn--block {
  display: flex;
  width: 100%;
}

/* ---------- variants ---------- */
.btn--primary {
  background: var(--dt-grad-primary);
  color: var(--dt-on-primary);
  box-shadow: var(--dt-shadow-teal);
}
.btn--primary:hover:not(.btn--disabled) {
  box-shadow: 0 20px 40px -12px rgb(0 159 163 / 0.55);
  transform: translateY(-2px);
}

.btn--secondary {
  background: var(--dt-navy-700);
  color: #fff;
  box-shadow: var(--dt-shadow-md);
}
.btn--secondary:hover:not(.btn--disabled) {
  background: var(--dt-navy-600);
  transform: translateY(-2px);
}

.btn--outline {
  background: var(--dt-surface);
  color: var(--dt-teal-700);
  border-color: var(--dt-teal-200);
}
.btn--outline:hover:not(.btn--disabled) {
  background: var(--dt-teal-50);
  border-color: var(--dt-teal-400);
  transform: translateY(-2px);
}

.btn--ghost {
  background: transparent;
  color: var(--dt-ink-soft);
}
.btn--ghost:hover:not(.btn--disabled) {
  background: var(--dt-teal-50);
  color: var(--dt-teal-700);
}

.btn--gold {
  background: var(--dt-grad-gold);
  color: var(--dt-navy-800);
  box-shadow: 0 14px 30px -14px rgb(219 169 31 / 0.7);
}
.btn--gold:hover:not(.btn--disabled) {
  transform: translateY(-2px);
}

.btn--danger {
  background: var(--dt-danger);
  color: #fff;
}

/* ---------- states ---------- */
.btn--pressed:not(.btn--disabled) {
  transform: scale(0.97);
  transition-duration: var(--dt-dur-1);
}

.btn--disabled {
  cursor: not-allowed;
  opacity: 0.55;
  box-shadow: none;
  transform: none;
}

.btn--loading {
  cursor: progress;
  opacity: 0.9;
}

.btn--success {
  background: var(--dt-success);
  color: #fff;
  box-shadow: 0 14px 30px -14px rgb(18 160 106 / 0.6);
}

.btn__icon--end {
  /* Directional glyphs must follow reading order, not the DOM. */
  transition: transform var(--dt-dur-2) var(--dt-ease-out);
}
.btn:hover:not(.btn--disabled) .btn__icon--end {
  transform: translateX(-3px);
}

.btn__icon--pop {
  animation: btn-pop var(--dt-dur-3) var(--dt-ease-spring);
}

@keyframes btn-pop {
  from {
    transform: scale(0.4);
    opacity: 0;
  }
}

/* Ripple element injected by useRipple() */
.btn :deep(.dt-ripple) {
  position: absolute;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.28;
  pointer-events: none;
  z-index: -1;
  animation: dt-ripple 620ms var(--dt-ease-out) forwards;
}

@keyframes dt-ripple {
  from {
    transform: scale(0);
    opacity: 0.3;
  }
  to {
    transform: scale(1);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn,
  .btn__icon--end {
    transition: none;
  }
  .btn:hover:not(.btn--disabled) {
    transform: none;
  }
}
</style>
