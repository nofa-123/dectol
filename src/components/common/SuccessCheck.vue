<script setup>
/**
 * Animated confirmation mark: ring draws in, tick strokes on, halo pulses out.
 * Pure SVG + CSS so it costs nothing at runtime.
 */
defineProps({
  size: { type: Number, default: 120 },
})
</script>

<template>
  <div class="success" :style="{ '--s': `${size}px` }" role="img" aria-label="تم بنجاح">
    <span class="success__halo" />
    <span class="success__halo success__halo--delayed" />
    <svg class="success__svg" viewBox="0 0 120 120" aria-hidden="true">
      <circle class="success__ring" cx="60" cy="60" r="52" />
      <path class="success__tick" d="M38 62.5 53 77 84 45" />
    </svg>
  </div>
</template>

<style scoped>
.success {
  position: relative;
  width: var(--s);
  height: var(--s);
  display: grid;
  place-items: center;
}

.success__svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  position: relative;
  z-index: 1;
}

.success__ring {
  stroke: var(--dt-success);
  stroke-width: 6;
  stroke-dasharray: 327;
  stroke-dashoffset: 327;
  transform-origin: center;
  rotate: -90deg;
  animation: ring-draw 620ms var(--dt-ease-out) forwards;
}

.success__tick {
  stroke: var(--dt-success);
  stroke-width: 8;
  stroke-dasharray: 70;
  stroke-dashoffset: 70;
  animation: tick-draw 420ms var(--dt-ease-out) 480ms forwards;
}

.success__halo {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: var(--dt-success);
  opacity: 0;
  animation: dt-pulse-ring 2s var(--dt-ease-out) 700ms infinite;
}

.success__halo--delayed {
  animation-delay: 1.5s;
}

@keyframes ring-draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes tick-draw {
  to {
    stroke-dashoffset: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .success__ring,
  .success__tick {
    animation: none;
    stroke-dashoffset: 0;
  }
  .success__halo {
    display: none;
  }
}
</style>
