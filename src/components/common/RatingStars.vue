<script setup>
/**
 * Star rating. Renders a single accessible label plus a decorative star row
 * that supports fractional fills via a clip overlay.
 */
import { computed } from 'vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'

const props = defineProps({
  value: { type: Number, required: true },
  size: { type: Number, default: 18 },
  showValue: { type: Boolean, default: false },
})

const percent = computed(() => `${Math.min(100, Math.max(0, (props.value / 5) * 100))}%`)
</script>

<template>
  <span class="rating" :aria-label="`التقييم ${value} من 5`">
    <span class="rating__stars" aria-hidden="true">
      <span class="rating__layer rating__layer--empty">
        <DoctolIcon v-for="i in 5" :key="`e${i}`" name="star" :size="size" />
      </span>
      <span class="rating__layer rating__layer--full" :style="{ '--fill': percent }">
        <DoctolIcon v-for="i in 5" :key="`f${i}`" name="star" :size="size" />
      </span>
    </span>
    <span v-if="showValue" class="rating__value num">{{ value.toFixed(1) }}</span>
  </span>
</template>

<style scoped>
.rating {
  display: inline-flex;
  align-items: center;
  gap: var(--dt-space-2);
}

.rating__stars {
  position: relative;
  display: inline-block;
  line-height: 0;
}

.rating__layer {
  display: flex;
  gap: 2px;
}

.rating__layer--empty {
  color: var(--dt-line-strong);
}

.rating__layer--empty :deep(svg) {
  fill: currentColor;
}

.rating__layer--full {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 0;
  color: var(--dt-gold-500);
  overflow: hidden;
  /* RTL-safe partial fill: clip from the inline-start edge. */
  width: var(--fill);
}

.rating__layer--full :deep(svg) {
  fill: currentColor;
}

.rating__value {
  font-weight: var(--dt-fw-semibold);
  font-size: var(--dt-fs-sm);
  color: var(--dt-ink);
}
</style>
