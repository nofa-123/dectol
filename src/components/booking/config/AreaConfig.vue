<script setup>
/** Area configurator (carpet, moquette): quick presets plus a free input. */
import { computed, useId } from 'vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import OptionChip from '@/components/common/OptionChip.vue'
import { formatPrice } from '@/utils/format'

const props = defineProps({
  service: { type: Object, required: true },
  config: { type: Object, required: true },
})

const emit = defineEmits(['update'])

const uid = useId()
const c = computed(() => props.service.config)
const area = computed(() => Number(props.config.area) || 0)
const belowMinimum = computed(() => area.value > 0 && area.value < c.value.minArea)

function setArea(value) {
  const next = value === '' ? '' : Math.max(0, Math.min(2000, Number(value)))
  emit('update', { area: next })
}
</script>

<template>
  <div class="area">
    <p class="area__title">{{ c.title }}</p>

    <div class="area__chips">
      <OptionChip
        v-for="preset in c.presets"
        :key="preset.id"
        :name="`${uid}-preset`"
        :value="preset.area"
        :label="preset.label"
        :price="formatPrice(Math.max(preset.area, c.minArea) * c.pricePerSqm)"
        :selected="area === preset.area"
        @select="setArea"
      />
    </div>

    <label class="area__input">
      <span class="area__input-label">أو أدخل المساحة بالمتر المربع</span>
      <span class="area__input-control">
        <input
          type="number"
          inputmode="decimal"
          min="0"
          max="2000"
          step="1"
          :value="config.area"
          :aria-describedby="`${uid}-rate`"
          @input="setArea($event.target.value)"
        />
        <span class="area__suffix">م²</span>
      </span>
    </label>

    <p :id="`${uid}-rate`" class="area__rate">
      السعر <strong class="money">{{ formatPrice(c.pricePerSqm) }}</strong> للمتر المربع
    </p>

    <p v-if="belowMinimum" class="area__min">
      <DoctolIcon name="info" :size="15" />
      يُحتسب الحد الأدنى {{ c.minArea }} م².
    </p>
    <p v-else-if="c.note" class="area__note">{{ c.note }}</p>
  </div>
</template>

<style scoped>
.area {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
}

.area__title {
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-ink-soft);
}

.area__chips {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 120px), 1fr));
  gap: var(--dt-space-2);
}

.area__input {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.area__input-label {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.area__input-control {
  display: flex;
  align-items: center;
  gap: var(--dt-space-2);
  padding-inline-end: var(--dt-space-4);
  border: 1.5px solid var(--dt-line);
  border-radius: var(--dt-radius-md);
  background: var(--dt-surface);
}

.area__input-control:focus-within {
  border-color: var(--dt-teal-400);
  box-shadow: 0 0 0 4px var(--dt-focus-ring);
}

.area__input-control input {
  flex: 1;
  min-width: 0;
  min-height: 50px;
  padding-inline: var(--dt-space-4);
  border: 0;
  outline: none;
  background: none;
  font-variant-numeric: tabular-nums;
  font-weight: var(--dt-fw-semibold);
}

.area__suffix {
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
  font-weight: var(--dt-fw-semibold);
}

.area__rate,
.area__note {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.area__min {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--dt-fs-xs);
  color: var(--dt-warning);
  font-weight: var(--dt-fw-medium);
}
</style>
