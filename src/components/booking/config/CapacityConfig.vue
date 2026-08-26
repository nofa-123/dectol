<script setup>
/**
 * Capacity configurator (sofa): pick a tier, then fine-tune the headcount.
 * Choosing a tier snaps the counter to that tier's seats; nudging the counter
 * past a tier boundary re-selects the matching tier, so the two controls can
 * never disagree.
 */
import { computed, useId } from 'vue'
import QuantityStepper from '@/components/common/QuantityStepper.vue'
import OptionChip from '@/components/common/OptionChip.vue'
import { formatPrice } from '@/utils/format'
import { tierForCount } from '@/utils/pricing'

const props = defineProps({
  service: { type: Object, required: true },
  config: { type: Object, required: true },
})

const emit = defineEmits(['update'])

const uid = useId()
const c = computed(() => props.service.config)
const activeTier = computed(() => tierForCount(props.service, props.config.count))

const setCount = (count) => emit('update', { count })
const pickTier = (tierId) => {
  const tier = c.value.tiers.find((t) => t.id === tierId)
  if (tier) emit('update', { count: tier.seats })
}
</script>

<template>
  <div class="cap">
    <div class="cap__grid">
      <fieldset class="cap__tiers">
        <legend class="cap__legend">{{ c.title }}</legend>
        <div class="cap__chips">
          <OptionChip
            v-for="tier in c.tiers"
            :key="tier.id"
            :name="`${uid}-tier`"
            :value="tier.id"
            :label="tier.label"
            :price="formatPrice(tier.price)"
            :selected="activeTier.id === tier.id"
            tone="solid"
            @select="pickTier"
          />
        </div>
      </fieldset>

      <div class="cap__counter">
        <span class="cap__legend">{{ c.counterLabel }}</span>
        <QuantityStepper
          :model-value="config.count"
          :min="1"
          :max="40"
          :label="c.counterLabel"
          @update:model-value="setCount"
        />
      </div>
    </div>

    <p v-if="c.extraNote" class="cap__extra">{{ c.extraNote }}</p>
    <p v-if="c.note" class="cap__note">{{ c.note }}</p>
  </div>
</template>

<style scoped>
.cap {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
}

.cap__grid {
  display: grid;
  gap: var(--dt-space-4);
  align-items: start;
}

.cap__tiers {
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
}

.cap__legend {
  display: block;
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
  font-weight: var(--dt-fw-medium);
  margin-block-end: var(--dt-space-2);
}

.cap__chips {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 130px), 1fr));
  gap: var(--dt-space-2);
}

.cap__counter {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.cap__extra {
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-teal-700);
}

.cap__note {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

@media (min-width: 560px) {
  .cap__grid {
    grid-template-columns: 1fr auto;
  }
  .cap__counter {
    align-items: center;
    padding-inline-start: var(--dt-space-4);
    border-inline-start: 1px solid var(--dt-line);
  }
}
</style>
