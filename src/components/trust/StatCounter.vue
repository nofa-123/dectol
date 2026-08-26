<script setup>
/** One animated statistic. Counts up the first time it scrolls into view. */
import { computed } from 'vue'
import { useCountUp } from '@/composables/useCountUp'

const props = defineProps({
  stat: { type: Object, required: true },
})

const { el, displayed } = useCountUp(props.stat.value, {
  decimals: props.stat.decimals ?? 0,
  duration: 1700,
})

const formatted = computed(() => {
  const decimals = props.stat.decimals ?? 0
  return decimals
    ? displayed.value.toFixed(decimals)
    : Math.round(displayed.value).toLocaleString('en-US')
})
</script>

<template>
  <div ref="el" class="stat">
    <p class="stat__value">
      <span v-if="stat.prefix" class="stat__affix">{{ stat.prefix }}</span>
      <span class="num">{{ formatted }}</span>
      <span v-if="stat.suffix" class="stat__affix">{{ stat.suffix }}</span>
    </p>
    <p class="stat__label">{{ stat.label }}</p>
  </div>
</template>

<style scoped>
.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  text-align: center;
  padding-inline: var(--dt-space-2);
}

.stat__value {
  display: inline-flex;
  align-items: baseline;
  gap: 0.1rem;
  font-size: clamp(1.7rem, 1.3rem + 1.8vw, 2.6rem);
  font-weight: var(--dt-fw-bold);
  line-height: 1.1;
  color: #fff;
  letter-spacing: -0.02em;
}

.stat__affix {
  color: var(--dt-gold-500);
  font-size: 0.72em;
}

.stat__label {
  font-size: var(--dt-fs-sm);
  color: rgb(255 255 255 / 0.72);
}
</style>
