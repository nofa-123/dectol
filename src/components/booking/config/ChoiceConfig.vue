<script setup>
/** Single-choice configurator (majlis, pool, car, pest). */
import { computed, useId } from 'vue'
import OptionChip from '@/components/common/OptionChip.vue'
import { formatPrice } from '@/utils/format'

const props = defineProps({
  service: { type: Object, required: true },
  config: { type: Object, required: true },
})

const emit = defineEmits(['update'])

const uid = useId()
const c = computed(() => props.service.config)
</script>

<template>
  <fieldset class="choice">
    <legend class="choice__title">{{ c.title }}</legend>
    <div class="choice__grid">
      <OptionChip
        v-for="variant in c.variants"
        :key="variant.id"
        :name="`${uid}-variant`"
        :value="variant.id"
        :label="variant.label"
        :sublabel="variant.desc"
        :price="formatPrice(variant.price)"
        :selected="config.variantId === variant.id"
        @select="(id) => emit('update', { variantId: id })"
      />
    </div>
  </fieldset>
</template>

<style scoped>
.choice {
  border: 0;
  padding: 0;
  margin: 0;
}

.choice__title {
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-ink-soft);
  margin-block-end: var(--dt-space-3);
}

.choice__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr));
  gap: var(--dt-space-2);
}

.choice__grid :deep(.chip) {
  min-height: 82px;
}
</style>
