<script setup>
/** Simple per-unit configurator (chairs): one counter, one rate. */
import { computed } from 'vue'
import QuantityStepper from '@/components/common/QuantityStepper.vue'
import { formatPrice } from '@/utils/format'

const props = defineProps({
  service: { type: Object, required: true },
  config: { type: Object, required: true },
})

const emit = defineEmits(['update'])

const c = computed(() => props.service.config)
</script>

<template>
  <div class="simple">
    <div class="simple__row">
      <span class="simple__text">
        <span class="simple__title">{{ c.title }}</span>
        <span class="simple__rate">
          <strong class="money">{{ formatPrice(c.price) }}</strong> للوحدة
        </span>
      </span>
      <QuantityStepper
        :model-value="config.count"
        :min="c.min ?? 1"
        :max="60"
        :label="c.title"
        :unit="c.unitNoun[1]"
        @update:model-value="(v) => emit('update', { count: v })"
      />
    </div>
    <p v-if="c.note" class="simple__note">{{ c.note }}</p>
  </div>
</template>

<style scoped>
.simple {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-2);
}

.simple__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dt-space-4);
  flex-wrap: wrap;
  padding: var(--dt-space-3) var(--dt-space-4);
  border: 1px solid var(--dt-line);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-surface);
}

.simple__text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.simple__title {
  font-weight: var(--dt-fw-semibold);
  font-size: var(--dt-fs-sm);
}

.simple__rate {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.simple__note {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}
</style>
