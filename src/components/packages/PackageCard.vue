<script setup>
/**
 * Package card. Selecting one expands it to reveal everything included —
 * bundles only sell once the customer can see what they're getting.
 */
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import PriceTag from '@/components/common/PriceTag.vue'
import { formatPrice } from '@/utils/format'
import { useBooking } from '@/composables/useBooking'
import { useServicesStore } from '@/stores/servicesStore'

defineProps({
  pkg: { type: Object, required: true },
  expanded: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle'])

const catalogue = useServicesStore()
const { startWithPackage } = useBooking()
</script>

<template>
  <article
    class="pc"
    :class="{ 'pc--expanded': expanded, 'pc--popular': pkg.popular }"
    :aria-expanded="expanded"
  >
    <span v-if="pkg.popular" class="pc__flag">الأكثر توفيراً</span>

    <button type="button" class="pc__toggle" @click="emit('toggle', pkg.id)">
      <span class="pc__media">
        <img
          :src="pkg.image"
          v-image-fallback="pkg.fallbackImage"
          :alt="pkg.name"
          width="900"
          height="560"
          loading="lazy"
          decoding="async"
        />
      </span>

      <span class="pc__head">
        <span class="pc__titles">
          <span class="pc__name">{{ pkg.name }}</span>
          <span class="pc__tagline">{{ pkg.tagline }}</span>
        </span>
        <DoctolIcon
          name="chevron-down"
          :size="20"
          class="pc__chevron"
          :class="{ 'pc__chevron--open': expanded }"
        />
      </span>
    </button>

    <div class="pc__pricing">
      <PriceTag :value="pkg.price" :old-value="pkg.oldPrice" size="md" />
      <span class="pc__saving">
        <DoctolIcon name="tag" :size="14" />
        وفّر {{ formatPrice(pkg.saving) }}
      </span>
    </div>

    <ul class="pc__items">
      <li v-for="item in pkg.items" :key="item.serviceId">
        <span class="pc__item-icon">
          <DoctolIcon :name="catalogue.serviceById(item.serviceId)?.icon ?? 'check'" :size="16" />
        </span>
        {{ item.label }}
      </li>
    </ul>

    <Transition name="pc-expand">
      <div v-if="expanded" class="pc__details">
        <p class="pc__duration">
          <DoctolIcon name="clock" :size="15" />
          {{ pkg.duration }}
        </p>
        <ul class="pc__perks">
          <li v-for="perk in pkg.perks" :key="perk">
            <DoctolIcon name="check-circle" :size="15" />
            {{ perk }}
          </li>
        </ul>
      </div>
    </Transition>

    <BaseButton
      class="pc__cta"
      block
      :variant="pkg.popular ? 'primary' : 'outline'"
      icon-end="arrow-left"
      @click="startWithPackage(pkg)"
    >
      احجز الباقة
    </BaseButton>
  </article>
</template>

<style scoped>
.pc {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-4);
  height: 100%;
  padding: var(--dt-space-5);
  background: var(--dt-surface);
  border: 1.5px solid var(--dt-line);
  border-radius: var(--dt-radius-xl);
  box-shadow: var(--dt-shadow-sm);
  transition:
    border-color var(--dt-dur-3) var(--dt-ease-out),
    box-shadow var(--dt-dur-3) var(--dt-ease-out),
    transform var(--dt-dur-3) var(--dt-ease-out);
}

.pc:hover {
  transform: translateY(-4px);
  box-shadow: var(--dt-shadow-lg);
}

.pc--expanded {
  border-color: var(--dt-teal-400);
  box-shadow: var(--dt-shadow-lg);
}

.pc--popular {
  border-color: var(--dt-teal-300);
  background: linear-gradient(180deg, var(--dt-teal-50) 0%, var(--dt-surface) 34%);
}

.pc__flag {
  position: absolute;
  inset-block-start: -12px;
  inset-inline-end: var(--dt-space-5);
  padding: 0.3rem 0.85rem;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-grad-gold);
  color: var(--dt-navy-800);
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-bold);
  box-shadow: var(--dt-shadow-sm);
}

.pc__toggle {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-4);
  text-align: start;
  width: 100%;
}

.pc__media {
  display: block;
  border-radius: var(--dt-radius-lg);
  overflow: hidden;
  background: var(--dt-teal-50);
}

/**
 * The ratio alone let the image grow with the column — on a two-column layout
 * it reached ~370px tall and dominated the card. Cap it so the name, price and
 * contents stay above the fold whatever the column width.
 */
.pc__media img {
  width: 100%;
  aspect-ratio: 16 / 9;
  max-height: 190px;
  object-fit: cover;
  transition: transform var(--dt-dur-5) var(--dt-ease-out);
}

.pc:hover .pc__media img {
  transform: scale(1.05);
}

.pc__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--dt-space-3);
}

.pc__titles {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.pc__name {
  font-size: var(--dt-fs-h4);
  font-weight: var(--dt-fw-bold);
}

.pc__tagline {
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
}

.pc__chevron {
  flex: none;
  color: var(--dt-muted-soft);
  transition: transform var(--dt-dur-3) var(--dt-ease-out);
}

.pc__chevron--open {
  transform: rotate(180deg);
  color: var(--dt-teal-600);
}

.pc__pricing {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dt-space-3);
  flex-wrap: wrap;
}

.pc__saving {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.7rem;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-success-soft);
  color: var(--dt-success);
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-semibold);
}

.pc__items {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-2);
}

.pc__items li {
  display: flex;
  align-items: center;
  gap: var(--dt-space-2);
  font-size: var(--dt-fs-sm);
  color: var(--dt-ink-soft);
}

.pc__item-icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: var(--dt-radius-xs);
  background: var(--dt-teal-50);
  color: var(--dt-teal-600);
  flex: none;
}

.pc__details {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
  padding: var(--dt-space-4);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-surface-sunken);
  overflow: hidden;
}

.pc__duration {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-navy-700);
}

.pc__perks {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.pc__perks li {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.pc__perks :deep(svg) {
  color: var(--dt-success);
  flex: none;
}

.pc__cta {
  margin-block-start: auto;
}

.pc-expand-enter-active,
.pc-expand-leave-active {
  transition:
    opacity var(--dt-dur-2) var(--dt-ease-out),
    transform var(--dt-dur-3) var(--dt-ease-out);
}

.pc-expand-enter-from,
.pc-expand-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (prefers-reduced-motion: reduce) {
  .pc,
  .pc__media img {
    transition: none;
  }
  .pc:hover {
    transform: none;
  }
  .pc:hover .pc__media img {
    transform: none;
  }
}
</style>
