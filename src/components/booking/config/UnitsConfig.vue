<script setup>
/**
 * Units configurator (curtains, mattresses).
 *
 * Three stacked blocks, each optional per service:
 *   1. countable unit types      (ستارة شباك / مرتبة مفردة …)
 *   2. an add-on group           (رؤوس الأسرّة)
 *   3. free-form custom sizes    (حجم مخصص — priced per m²)
 */
import { computed } from 'vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import QuantityStepper from '@/components/common/QuantityStepper.vue'
import { formatPrice } from '@/utils/format'

const props = defineProps({
  service: { type: Object, required: true },
  config: { type: Object, required: true },
})

const emit = defineEmits(['update'])

const c = computed(() => props.service.config)
const custom = computed(() => props.config.custom ?? [])

function setUnit(unitId, value) {
  emit('update', { counts: { ...props.config.counts, [unitId]: value } })
}

function setAddon(addonId, value) {
  emit('update', { addons: { ...props.config.addons, [addonId]: value } })
}

function toggleCustom() {
  const open = !props.config.customOpen
  // Opening the section for the first time seeds one editable row.
  const rows = open && !custom.value.length ? [{ ...c.value.custom.defaults }] : custom.value
  emit('update', { customOpen: open, custom: rows })
}

function addRow() {
  emit('update', { custom: [...custom.value, { ...c.value.custom.defaults }] })
}

function removeRow(index) {
  emit('update', { custom: custom.value.filter((_, i) => i !== index) })
}

function patchRow(index, patch) {
  emit('update', {
    custom: custom.value.map((row, i) => (i === index ? { ...row, ...patch } : row)),
  })
}

/** Dimensions accept one decimal; empty stays empty so the field can be cleared. */
function onDimension(index, key, raw) {
  const value = raw === '' ? '' : Math.max(0, Math.min(20, Number(raw)))
  patchRow(index, { [key]: value })
}
</script>

<template>
  <div class="units">
    <p class="units__title">{{ c.title }}</p>

    <!-- 1 · unit types -->
    <div class="units__group">
      <div v-for="unit in c.units" :key="unit.id" class="units__row">
        <span class="units__icon"><DoctolIcon :name="unit.icon" :size="22" /></span>
        <span class="units__text">
          <span class="units__name">{{ unit.name }}</span>
          <span class="units__desc">{{ unit.desc }}</span>
        </span>
        <span class="units__price">
          <strong class="money">{{ formatPrice(unit.price) }}</strong>
          <small>للوحدة</small>
        </span>
        <QuantityStepper
          :model-value="config.counts?.[unit.id] ?? 0"
          :min="0"
          :max="30"
          :label="unit.name"
          @update:model-value="(v) => setUnit(unit.id, v)"
        />
      </div>
    </div>

    <!-- 2 · add-ons -->
    <div v-if="c.addonGroup" class="units__group units__group--addons">
      <p class="units__addons-title">
        <DoctolIcon name="plus" :size="16" :stroke="2.4" />
        {{ c.addonGroup.title }}
      </p>
      <div v-for="addon in c.addonGroup.items" :key="addon.id" class="units__row">
        <span class="units__icon"><DoctolIcon :name="addon.icon" :size="22" /></span>
        <span class="units__text">
          <span class="units__name">{{ addon.name }}</span>
          <span class="units__desc">{{ addon.desc }}</span>
        </span>
        <span class="units__price">
          <strong class="money">{{ formatPrice(addon.price) }}</strong>
          <small>للوحدة</small>
        </span>
        <QuantityStepper
          :model-value="config.addons?.[addon.id] ?? 0"
          :min="0"
          :max="20"
          :label="addon.name"
          @update:model-value="(v) => setAddon(addon.id, v)"
        />
      </div>
    </div>

    <!-- 3 · custom sizes -->
    <div v-if="c.custom" class="units__group units__custom">
      <button
        type="button"
        class="units__custom-head"
        :aria-expanded="Boolean(config.customOpen)"
        @click="toggleCustom"
      >
        <span class="units__icon"><DoctolIcon :name="c.custom.icon" :size="22" /></span>
        <span class="units__text">
          <span class="units__name">{{ c.custom.title }}</span>
          <span class="units__desc">{{ c.custom.desc }}</span>
        </span>
        <DoctolIcon
          name="chevron-down"
          :size="20"
          class="units__chevron"
          :class="{ 'units__chevron--open': config.customOpen }"
        />
      </button>

      <Transition name="units-expand">
        <div v-if="config.customOpen" class="units__rows">
          <div v-for="(row, index) in custom" :key="index" class="units__custom-row">
            <button
              type="button"
              class="units__remove"
              :aria-label="`حذف المقاس ${index + 1}`"
              @click="removeRow(index)"
            >
              <DoctolIcon name="trash" :size="17" />
            </button>

            <label class="units__field">
              <span>العرض (متر)</span>
              <input
                type="number"
                inputmode="decimal"
                min="0"
                max="20"
                step="0.1"
                :value="row.width"
                @input="onDimension(index, 'width', $event.target.value)"
              />
            </label>

            <label class="units__field">
              <span>الارتفاع (متر)</span>
              <input
                type="number"
                inputmode="decimal"
                min="0"
                max="20"
                step="0.1"
                :value="row.height"
                @input="onDimension(index, 'height', $event.target.value)"
              />
            </label>

            <div class="units__field">
              <span>العدد</span>
              <QuantityStepper
                size="sm"
                :model-value="Number(row.count) || 0"
                :min="1"
                :max="20"
                label="عدد القطع"
                @update:model-value="(v) => patchRow(index, { count: v })"
              />
            </div>
          </div>

          <button type="button" class="units__add" @click="addRow">
            <DoctolIcon name="plus" :size="17" :stroke="2.4" />
            إضافة مقاس آخر
          </button>

          <p class="units__rate">
            يُحتسب المقاس المخصص بـ
            <strong class="money">{{ formatPrice(c.custom.pricePerSqm) }}</strong>
            للمتر المربع
          </p>
        </div>
      </Transition>
    </div>

    <p v-if="c.note" class="units__note">
      <DoctolIcon name="info" :size="16" />
      {{ c.note }}
    </p>
  </div>
</template>

<style scoped>
.units {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
}

.units__title {
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-ink-soft);
}

.units__group {
  border: 1px solid var(--dt-line);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-surface);
  overflow: hidden;
}

.units__row {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: var(--dt-space-3);
  padding: var(--dt-space-3) var(--dt-space-4);
}

.units__row + .units__row {
  border-block-start: 1px solid var(--dt-line);
}

.units__icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex: none;
  border-radius: var(--dt-radius-sm);
  color: var(--dt-teal-600);
}

.units__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.units__name {
  font-weight: var(--dt-fw-semibold);
  font-size: var(--dt-fs-sm);
}

.units__desc {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.units__price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.2;
}

.units__price strong {
  font-weight: var(--dt-fw-bold);
  font-size: var(--dt-fs-sm);
}

.units__price small {
  font-size: 0.66rem;
  color: var(--dt-muted);
}

/* ---------- add-ons ---------- */
.units__group--addons {
  background: var(--dt-surface-sunken);
}

.units__addons-title {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: var(--dt-space-3) var(--dt-space-4);
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-teal-700);
}

.units__group--addons .units__row {
  background: var(--dt-surface);
  border-block-start: 1px solid var(--dt-line);
}

/* ---------- custom sizes ---------- */
.units__custom-head {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--dt-space-3);
  width: 100%;
  padding: var(--dt-space-3) var(--dt-space-4);
  text-align: start;
}

.units__chevron {
  color: var(--dt-muted);
  transition: transform var(--dt-dur-3) var(--dt-ease-out);
}

.units__chevron--open {
  transform: rotate(180deg);
  color: var(--dt-teal-600);
}

.units__rows {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
  padding: 0 var(--dt-space-4) var(--dt-space-4);
}

.units__custom-row {
  display: grid;
  grid-template-columns: auto 1fr 1fr auto;
  align-items: end;
  gap: var(--dt-space-3);
  padding: var(--dt-space-3);
  border: 1px solid var(--dt-line);
  border-radius: var(--dt-radius-md);
  background: var(--dt-surface-sunken);
}

.units__remove {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: var(--dt-radius-sm);
  border: 1.5px solid var(--dt-danger-soft);
  background: var(--dt-surface);
  color: var(--dt-danger);
  transition:
    background-color var(--dt-dur-2) var(--dt-ease-out),
    border-color var(--dt-dur-2) var(--dt-ease-out);
}

.units__remove:hover {
  background: var(--dt-danger-soft);
  border-color: var(--dt-danger);
}

.units__field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}

.units__field > span {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
  text-align: center;
}

.units__field input {
  width: 100%;
  min-height: 44px;
  padding-inline: var(--dt-space-3);
  text-align: center;
  border: 1.5px solid var(--dt-line);
  border-radius: var(--dt-radius-sm);
  background: var(--dt-surface);
  font-variant-numeric: tabular-nums;
}

.units__field input:focus {
  outline: none;
  border-color: var(--dt-teal-400);
  box-shadow: 0 0 0 4px var(--dt-focus-ring);
}

.units__add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 48px;
  border: 1.5px dashed var(--dt-teal-300);
  border-radius: var(--dt-radius-md);
  color: var(--dt-teal-700);
  font-weight: var(--dt-fw-semibold);
  font-size: var(--dt-fs-sm);
  transition:
    background-color var(--dt-dur-2) var(--dt-ease-out),
    border-color var(--dt-dur-2) var(--dt-ease-out);
}

.units__add:hover {
  background: var(--dt-teal-50);
  border-color: var(--dt-teal-500);
}

.units__rate {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
  text-align: center;
}

.units__note {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: var(--dt-space-3) var(--dt-space-4);
  border-radius: var(--dt-radius-md);
  background: var(--dt-teal-50);
  font-size: var(--dt-fs-xs);
  color: var(--dt-teal-800);
}

.units__note :deep(svg) {
  flex: none;
  color: var(--dt-teal-600);
}

.units-expand-enter-active,
.units-expand-leave-active {
  transition:
    opacity var(--dt-dur-2) var(--dt-ease-out),
    transform var(--dt-dur-3) var(--dt-ease-out);
}

.units-expand-enter-from,
.units-expand-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 620px) {
  .units__row {
    grid-template-columns: auto 1fr auto;
    grid-template-areas:
      'icon text price'
      'qty qty qty';
    row-gap: var(--dt-space-3);
  }
  .units__icon {
    grid-area: icon;
  }
  .units__text {
    grid-area: text;
  }
  .units__price {
    grid-area: price;
  }
  .units__row :deep(.qty) {
    grid-area: qty;
    justify-self: stretch;
    justify-content: space-between;
  }
  .units__custom-row {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      'remove remove'
      'width height'
      'count count';
  }
  .units__remove {
    grid-area: remove;
    justify-self: start;
  }
  .units__custom-row .units__field:nth-of-type(1) {
    grid-area: width;
  }
  .units__custom-row .units__field:nth-of-type(2) {
    grid-area: height;
  }
  .units__custom-row .units__field:nth-of-type(3) {
    grid-area: count;
    align-items: center;
  }
}
</style>
