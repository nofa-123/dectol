<script setup>
/**
 * Draggable before/after comparison.
 *
 * Built on Pointer Events so mouse, touch and pen all take the same path, with
 * pointer capture so the drag survives leaving the element. Also operable from
 * the keyboard: the handle is a slider role with arrow-key stepping.
 *
 * RTL note: the split is positioned with `inset-inline-start`, and the "after"
 * layer is clipped with `inset-inline-end`, so 0% always means "all before"
 * on the reading-start side regardless of direction.
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { useInView } from '@/composables/useScrollAnimation'
import { prefersReducedMotion } from '@/utils/motion'

const props = defineProps({
  before: { type: String, required: true },
  after: { type: String, required: true },
  beforeLabel: { type: String, default: 'قبل' },
  afterLabel: { type: String, default: 'بعد' },
  alt: { type: String, default: '' },
  /** Initial split, 0–100. */
  start: { type: Number, default: 55 },
})

const position = ref(props.start)
const dragging = ref(false)
const frame = ref(null)
const { target: viewTarget, isInView } = useInView({ threshold: 0.4 })

let pointerId = null
let hinted = false

/** Percentage from the container's inline-start edge. */
function positionFromEvent(event) {
  const el = frame.value
  if (!el) return position.value
  const rect = el.getBoundingClientRect()
  const rtl = getComputedStyle(el).direction === 'rtl'
  const raw = rtl ? rect.right - event.clientX : event.clientX - rect.left
  return Math.min(100, Math.max(0, (raw / rect.width) * 100))
}

function onPointerDown(event) {
  const el = frame.value
  if (!el) return
  pointerId = event.pointerId
  dragging.value = true
  el.setPointerCapture?.(pointerId)
  position.value = positionFromEvent(event)
  event.preventDefault()
}

function onPointerMove(event) {
  if (!dragging.value || event.pointerId !== pointerId) return
  position.value = positionFromEvent(event)
}

function onPointerUp(event) {
  if (!dragging.value) return
  dragging.value = false
  frame.value?.releasePointerCapture?.(pointerId)
  pointerId = null
}

function onKeydown(event) {
  const step = event.shiftKey ? 10 : 3
  // Arrow semantics follow the visual axis, mirrored for RTL.
  const rtl = frame.value && getComputedStyle(frame.value).direction === 'rtl'
  const forward = rtl ? 'ArrowLeft' : 'ArrowRight'
  const back = rtl ? 'ArrowRight' : 'ArrowLeft'

  if (event.key === forward) position.value = Math.min(100, position.value + step)
  else if (event.key === back) position.value = Math.max(0, position.value - step)
  else if (event.key === 'Home') position.value = 0
  else if (event.key === 'End') position.value = 100
  else return
  event.preventDefault()
}

/**
 * First time the slider scrolls into view it nudges itself once, which is the
 * only affordance that reliably teaches "this is draggable".
 */
watch(isInView, (visible) => {
  if (!visible || hinted) return
  hinted = true
  if (prefersReducedMotion()) return
  const from = position.value
  const start = performance.now()
  const duration = 1100
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration)
    // Ease out to 30%, then settle back — a "peek" gesture.
    const wave = Math.sin(t * Math.PI)
    position.value = from - wave * 18
    if (t < 1 && !dragging.value) requestAnimationFrame(tick)
    else if (!dragging.value) position.value = from
  }
  requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  pointerId = null
})

const splitStyle = computed(() => ({ '--pos': `${position.value}%` }))
</script>

<template>
  <div
    ref="viewTarget"
    class="ba"
    :class="{ 'ba--dragging': dragging }"
    :style="splitStyle"
  >
    <div
      ref="frame"
      class="ba__frame"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <img
        class="ba__img ba__img--before"
        :src="before"
        :alt="alt ? `${alt} — ${beforeLabel}` : beforeLabel"
        width="1200"
        height="800"
        loading="lazy"
        decoding="async"
        draggable="false"
      />

      <div class="ba__after">
        <img
          class="ba__img"
          :src="after"
          :alt="alt ? `${alt} — ${afterLabel}` : afterLabel"
          width="1200"
          height="800"
          loading="lazy"
          decoding="async"
          draggable="false"
        />
      </div>

      <span class="ba__tag ba__tag--before">{{ beforeLabel }}</span>
      <span class="ba__tag ba__tag--after">{{ afterLabel }}</span>

      <div class="ba__divider" aria-hidden="true" />

      <button
        type="button"
        class="ba__handle"
        role="slider"
        :aria-valuenow="Math.round(position)"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="اسحب لمقارنة قبل وبعد"
        @keydown="onKeydown"
      >
        <DoctolIcon name="drag" :size="20" :stroke="2.2" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.ba {
  --pos: 55%;
  width: 100%;
}

.ba__frame {
  position: relative;
  overflow: hidden;
  border-radius: var(--dt-radius-xl);
  background: var(--dt-teal-50);
  aspect-ratio: 3 / 2;
  touch-action: pan-y;
  cursor: ew-resize;
  user-select: none;
  -webkit-user-select: none;
  box-shadow: var(--dt-shadow-md);
}

.ba__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

/* The "after" layer is revealed from the inline-start edge up to --pos.
   clip-path is physical (top right bottom left), so each direction gets its
   own rule. RTL is the default because the app ships RTL-first. */
.ba__after {
  position: absolute;
  inset: 0;
  clip-path: inset(0 0 0 calc(100% - var(--pos)));
  will-change: clip-path;
}

:global([dir='ltr']) .ba__after {
  clip-path: inset(0 calc(100% - var(--pos)) 0 0);
}

.ba__divider {
  position: absolute;
  inset-block: 0;
  inset-inline-start: var(--pos);
  width: 3px;
  margin-inline-start: -1.5px;
  background: rgb(255 255 255 / 0.95);
  box-shadow: 0 0 14px rgb(7 59 76 / 0.35);
  pointer-events: none;
}

.ba__handle {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: var(--pos);
  translate: 50% -50%;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-surface);
  color: var(--dt-teal-600);
  box-shadow: var(--dt-shadow-lg);
  border: 2px solid var(--dt-white);
  cursor: grab;
  /* `translate` centres the handle on the split; `scale` stays free for hover
     feedback so the two never fight over the transform property. */
  transition: scale var(--dt-dur-2) var(--dt-ease-spring);
}

:global([dir='ltr']) .ba__handle {
  translate: -50% -50%;
}

.ba__handle:hover {
  scale: 1.08;
}

.ba--dragging .ba__handle {
  cursor: grabbing;
  scale: 0.95;
}

.ba__tag {
  position: absolute;
  inset-block-start: var(--dt-space-4);
  padding: 0.32rem 0.85rem;
  border-radius: var(--dt-radius-pill);
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-bold);
  pointer-events: none;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.ba__tag--before {
  inset-inline-end: var(--dt-space-4);
  background: rgb(11 31 39 / 0.72);
  color: #fff;
}

.ba__tag--after {
  inset-inline-start: var(--dt-space-4);
  background: rgb(0 159 163 / 0.9);
  color: #fff;
}

@media (prefers-reduced-motion: reduce) {
  .ba__handle {
    transition: none;
  }
}
</style>
