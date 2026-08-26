<script setup>
/**
 * One expandable service row.
 *
 * Header shows the live summary and price once configured, or the "starts
 * from" price when untouched. Expanding a row selects the service (with its
 * default configuration) so the price the customer sees is immediately real;
 * the indicator on the reading-start edge deselects it again.
 */
import { computed } from 'vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import CapacityConfig from '@/components/booking/config/CapacityConfig.vue'
import UnitsConfig from '@/components/booking/config/UnitsConfig.vue'
import AreaConfig from '@/components/booking/config/AreaConfig.vue'
import SimpleConfig from '@/components/booking/config/SimpleConfig.vue'
import ChoiceConfig from '@/components/booking/config/ChoiceConfig.vue'
import PropertyConfig from '@/components/booking/config/PropertyConfig.vue'
import { formatPrice } from '@/utils/format'
import { defaultConfig, priceFor } from '@/utils/pricing'

const CONFIGURATORS = {
  capacity: CapacityConfig,
  units: UnitsConfig,
  area: AreaConfig,
  simple: SimpleConfig,
  choice: ChoiceConfig,
  property: PropertyConfig,
}

const props = defineProps({
  service: { type: Object, required: true },
  open: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
  config: { type: Object, default: null },
  /** 'radio' for single-pick groups (rehab), 'check' for multi-pick. */
  indicator: { type: String, default: 'check', validator: (v) => ['radio', 'check'].includes(v) },
})

const emit = defineEmits(['toggle-open', 'toggle-select', 'update-config'])

const configurator = computed(() => CONFIGURATORS[props.service.config.kind])
const activeConfig = computed(() => props.config ?? defaultConfig(props.service))
const priced = computed(() => priceFor(props.service, activeConfig.value))

/** What the header shows on the reading-end side. */
const headline = computed(() => {
  if (props.selected && priced.value.valid) {
    return { summary: priced.value.summary, price: formatPrice(priced.value.total) }
  }
  return { summary: '', price: `يبدأ من ${formatPrice(props.service.startingPrice)}` }
})

const displayName = computed(() => props.service.shortName ?? props.service.name)
</script>

<template>
  <article class="sa" :class="{ 'sa--open': open, 'sa--selected': selected }">
    <div class="sa__header">
      <button
        type="button"
        class="sa__indicator"
        :class="`sa__indicator--${indicator}`"
        :role="indicator === 'radio' ? 'radio' : 'checkbox'"
        :aria-checked="selected"
        :aria-label="`${selected ? 'إلغاء اختيار' : 'اختيار'} ${displayName}`"
        @click="emit('toggle-select')"
      >
        <DoctolIcon v-if="selected" name="check" :size="13" :stroke="3" />
      </button>

      <button
        type="button"
        class="sa__main"
        :aria-expanded="open"
        @click="emit('toggle-open')"
      >
        <span class="sa__icon"><DoctolIcon :name="service.icon" :size="22" /></span>
        <span class="sa__name">{{ displayName }}</span>

        <span class="sa__meta">
          <span v-if="headline.summary" class="sa__summary">{{ headline.summary }}</span>
          <span v-if="headline.summary" class="sa__sep" aria-hidden="true">|</span>
          <span class="sa__price money" :class="{ 'sa__price--live': selected && priced.valid }">
            {{ headline.price }}
          </span>
        </span>

        <DoctolIcon
          name="chevron-down"
          :size="20"
          class="sa__chevron"
          :class="{ 'sa__chevron--open': open }"
        />
      </button>
    </div>

    <Transition name="sa-expand">
      <div v-if="open" class="sa__body">
        <component
          :is="configurator"
          :service="service"
          :config="activeConfig"
          @update="(patch) => emit('update-config', patch)"
        />
      </div>
    </Transition>
  </article>
</template>

<style scoped>
.sa {
  border: 1.5px solid var(--dt-line);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-surface);
  overflow: hidden;
  transition:
    border-color var(--dt-dur-2) var(--dt-ease-out),
    box-shadow var(--dt-dur-2) var(--dt-ease-out);
}

.sa:hover {
  border-color: var(--dt-teal-200);
}

.sa--selected {
  border-color: var(--dt-teal-400);
}

.sa--open {
  border-color: var(--dt-teal-500);
  box-shadow: var(--dt-shadow-md);
}

.sa__header {
  display: flex;
  align-items: stretch;
  gap: 0;
}

.sa__indicator {
  display: grid;
  place-items: center;
  flex: none;
  width: 52px;
  color: transparent;
}

.sa__indicator::before {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  border: 1.5px solid var(--dt-line-strong);
  transition:
    background-color var(--dt-dur-2) var(--dt-ease-out),
    border-color var(--dt-dur-2) var(--dt-ease-out);
}

.sa__indicator {
  position: relative;
}

.sa__indicator--radio::before {
  border-radius: var(--dt-radius-pill);
}

.sa__indicator--check::before {
  border-radius: var(--dt-radius-xs);
}

.sa--selected .sa__indicator::before {
  background: var(--dt-teal-500);
  border-color: var(--dt-teal-500);
}

.sa--selected .sa__indicator {
  color: #fff;
}

.sa__indicator :deep(svg) {
  position: relative;
  z-index: 1;
}

.sa__main {
  display: flex;
  align-items: center;
  gap: var(--dt-space-3);
  flex: 1;
  min-width: 0;
  min-height: 64px;
  padding: var(--dt-space-3) var(--dt-space-4) var(--dt-space-3) var(--dt-space-3);
  text-align: start;
}

.sa__icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex: none;
  border-radius: var(--dt-radius-sm);
  color: var(--dt-teal-600);
  transition:
    background-color var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out);
}

.sa--selected .sa__icon {
  background: var(--dt-teal-50);
}

.sa__name {
  font-weight: var(--dt-fw-semibold);
  font-size: var(--dt-fs-sm);
  white-space: nowrap;
}

.sa__meta {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 0.4rem;
  flex: 1;
  min-width: 0;
  font-size: var(--dt-fs-xs);
}

.sa__summary {
  color: var(--dt-ink-soft);
  font-weight: var(--dt-fw-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sa__sep {
  color: var(--dt-line-strong);
}

.sa__price {
  color: var(--dt-teal-600);
  font-weight: var(--dt-fw-semibold);
  white-space: nowrap;
}

.sa__price--live {
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-bold);
}

.sa__chevron {
  flex: none;
  color: var(--dt-muted);
  transition: transform var(--dt-dur-3) var(--dt-ease-out);
}

.sa__chevron--open {
  transform: rotate(180deg);
  color: var(--dt-teal-600);
}

.sa__body {
  padding: var(--dt-space-4);
  border-block-start: 1px solid var(--dt-line);
  background: var(--dt-grad-mint);
}

.sa-expand-enter-active,
.sa-expand-leave-active {
  transition:
    opacity var(--dt-dur-2) var(--dt-ease-out),
    transform var(--dt-dur-3) var(--dt-ease-out);
}

.sa-expand-enter-from,
.sa-expand-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 560px) {
  .sa__indicator {
    width: 44px;
  }
  .sa__main {
    flex-wrap: wrap;
    row-gap: 0.25rem;
    padding-inline-end: var(--dt-space-3);
  }
  .sa__meta {
    flex-basis: 100%;
    justify-content: flex-start;
    padding-inline-start: calc(40px + var(--dt-space-3));
  }
}
</style>
