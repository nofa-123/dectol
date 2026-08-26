<script setup>
/** Price display with optional struck-through original and "starting from" note. */
import { computed } from 'vue'
import { formatPrice } from '@/utils/format'

const props = defineProps({
  value: { type: Number, required: true },
  oldValue: { type: Number, default: 0 },
  prefix: { type: String, default: '' },
  suffix: { type: String, default: '' },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
  light: { type: Boolean, default: false },
})

const main = computed(() => formatPrice(props.value, { withCurrency: false }))
const old = computed(() => (props.oldValue ? formatPrice(props.oldValue, { withCurrency: false }) : ''))
</script>

<template>
  <p class="price" :class="[`price--${size}`, { 'price--light': light }]">
    <span v-if="prefix" class="price__prefix">{{ prefix }}</span>
    <span class="price__group">
      <span class="price__value num">{{ main }}</span>
      <span class="price__currency">ريال</span>
    </span>
    <s v-if="old" class="price__old num">{{ old }}</s>
    <span v-if="suffix" class="price__suffix">{{ suffix }}</span>
  </p>
</template>

<style scoped>
.price {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.4rem;
  color: var(--dt-ink);
}

.price__group {
  display: inline-flex;
  align-items: baseline;
  gap: 0.3rem;
}

.price__value {
  font-weight: var(--dt-fw-bold);
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--dt-teal-600);
}

.price__currency {
  font-size: 0.72em;
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-muted);
}

.price__prefix,
.price__suffix {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
  font-weight: var(--dt-fw-medium);
}

.price__old {
  font-size: 0.62em;
  color: var(--dt-muted-soft);
  text-decoration-thickness: 1.5px;
}

.price--sm .price__value {
  font-size: 1.15rem;
}
.price--md .price__value {
  font-size: 1.6rem;
}
.price--lg .price__value {
  font-size: clamp(1.9rem, 1.5rem + 1.6vw, 2.6rem);
}

.price--light .price__value {
  color: #fff;
}
.price--light .price__currency,
.price--light .price__prefix,
.price--light .price__suffix {
  color: rgb(255 255 255 / 0.78);
}
.price--light .price__old {
  color: rgb(255 255 255 / 0.55);
}
</style>
