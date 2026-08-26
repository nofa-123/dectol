<script setup>
/**
 * Overlay primitive used for both dialogs and mobile bottom sheets.
 * Handles: scroll lock, focus trap, Escape, backdrop dismiss, swipe-to-close
 * on the sheet variant, and `aria-modal` semantics.
 */
import { nextTick, ref, watch } from 'vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { useFocusTrap } from '@/composables/useInteractions'
import { useUiStore } from '@/stores/uiStore'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  /** 'dialog' centres on all sizes; 'sheet' docks to the bottom on mobile. */
  variant: { type: String, default: 'sheet', validator: (v) => ['dialog', 'sheet'].includes(v) },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
  dismissable: { type: Boolean, default: true },
})

const emit = defineEmits(['close'])

const ui = useUiStore()
const panel = ref(null)
const dragOffset = ref(0)
const dragging = ref(false)

const { activate, deactivate } = useFocusTrap(panel, {
  onEscape: () => props.dismissable && emit('close'),
})

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      ui.registerOverlay()
      await nextTick()
      activate()
    } else {
      deactivate()
      ui.releaseOverlay()
      dragOffset.value = 0
    }
  },
)

function onBackdrop() {
  if (props.dismissable) emit('close')
}

/* ---------- swipe down to dismiss (sheet only) ---------- */
let startY = 0
let pointer = null

function onGrabStart(event) {
  if (props.variant !== 'sheet') return
  pointer = event.pointerId
  startY = event.clientY
  dragging.value = true
  event.currentTarget.setPointerCapture?.(pointer)
}

function onGrabMove(event) {
  if (!dragging.value || event.pointerId !== pointer) return
  dragOffset.value = Math.max(0, event.clientY - startY)
}

function onGrabEnd(event) {
  if (!dragging.value) return
  dragging.value = false
  event.currentTarget?.releasePointerCapture?.(pointer)
  if (dragOffset.value > 110 && props.dismissable) emit('close')
  else dragOffset.value = 0
  pointer = null
}
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div
        v-if="open"
        class="overlay"
        :class="[`overlay--${variant}`]"
        role="presentation"
        @click.self="onBackdrop"
      >
        <div
          ref="panel"
          class="panel"
          :class="[`panel--${size}`, { 'panel--dragging': dragging }]"
          :style="dragOffset ? { transform: `translateY(${dragOffset}px)` } : undefined"
          role="dialog"
          aria-modal="true"
          :aria-label="title || undefined"
          tabindex="-1"
        >
          <button
            v-if="variant === 'sheet'"
            class="panel__grab"
            type="button"
            aria-label="اسحب للإغلاق"
            @pointerdown="onGrabStart"
            @pointermove="onGrabMove"
            @pointerup="onGrabEnd"
            @pointercancel="onGrabEnd"
            @click="dismissable && $emit('close')"
          >
            <span class="panel__grab-bar" />
          </button>

          <header v-if="title || $slots.header" class="panel__header">
            <slot name="header">
              <div class="panel__titles">
                <h2 class="panel__title">{{ title }}</h2>
                <p v-if="subtitle" class="panel__subtitle">{{ subtitle }}</p>
              </div>
            </slot>
            <button
              v-if="dismissable"
              class="panel__close"
              type="button"
              aria-label="إغلاق"
              @click="$emit('close')"
            >
              <DoctolIcon name="close" :size="20" />
            </button>
          </header>

          <div class="panel__body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="panel__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: var(--dt-z-modal);
  display: flex;
  justify-content: center;
  background: rgb(4 30 40 / 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  padding: var(--dt-space-4);
}

.overlay--dialog {
  align-items: center;
}

.overlay--sheet {
  align-items: flex-end;
  padding: 0;
}

.panel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  background: var(--dt-surface);
  box-shadow: var(--dt-shadow-xl);
  max-height: min(92dvh, 900px);
  overflow: hidden;
}

.overlay--dialog .panel {
  border-radius: var(--dt-radius-xl);
}

.overlay--sheet .panel {
  border-radius: var(--dt-radius-2xl) var(--dt-radius-2xl) 0 0;
  padding-block-end: env(safe-area-inset-bottom, 0);
  transition: transform var(--dt-dur-3) var(--dt-ease-out);
}

.panel--dragging {
  transition: none;
}

.panel--sm {
  max-width: 440px;
}
.panel--md {
  max-width: 620px;
}
.panel--lg {
  max-width: 900px;
}

.panel__grab {
  display: flex;
  justify-content: center;
  padding: 0.7rem 0 0.3rem;
  touch-action: none;
  cursor: grab;
}

.panel__grab-bar {
  width: 46px;
  height: 5px;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-line-strong);
}

.panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--dt-space-4);
  padding: var(--dt-space-5) var(--dt-space-6) var(--dt-space-4);
  border-block-end: 1px solid var(--dt-line);
}

.panel__titles {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.panel__title {
  font-size: var(--dt-fs-h3);
}

.panel__subtitle {
  color: var(--dt-muted);
  font-size: var(--dt-fs-sm);
  line-height: var(--dt-lh-snug);
}

.panel__close {
  flex: none;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: var(--dt-radius-pill);
  color: var(--dt-muted);
  transition:
    background-color var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out);
}

.panel__close:hover {
  background: var(--dt-surface-sunken);
  color: var(--dt-ink);
}

.panel__body {
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: var(--dt-space-5) var(--dt-space-6);
  -webkit-overflow-scrolling: touch;
}

.panel__footer {
  padding: var(--dt-space-4) var(--dt-space-6);
  border-block-start: 1px solid var(--dt-line);
  background: var(--dt-surface);
}

/* ---------- transitions ---------- */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity var(--dt-dur-3) var(--dt-ease-out);
}

.overlay-enter-active .panel,
.overlay-leave-active .panel {
  transition:
    transform var(--dt-dur-4) var(--dt-ease-out),
    opacity var(--dt-dur-3) var(--dt-ease-out);
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.overlay--sheet.overlay-enter-from .panel,
.overlay--sheet.overlay-leave-to .panel {
  transform: translateY(100%);
}

.overlay--dialog.overlay-enter-from .panel,
.overlay--dialog.overlay-leave-to .panel {
  transform: translateY(18px) scale(0.97);
  opacity: 0;
}

@media (min-width: 768px) {
  .overlay--sheet {
    align-items: center;
    padding: var(--dt-space-6);
  }
  .overlay--sheet .panel {
    border-radius: var(--dt-radius-xl);
  }
  .overlay--sheet.overlay-enter-from .panel,
  .overlay--sheet.overlay-leave-to .panel {
    transform: translateY(18px) scale(0.97);
  }
  .panel__grab {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .overlay-enter-active .panel,
  .overlay-leave-active .panel {
    transition: opacity var(--dt-dur-2) linear;
    transform: none !important;
  }
}
</style>
